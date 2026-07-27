from collections import defaultdict
from mptt.utils import get_cached_trees
import django_filters
from django.core.cache import cache
from django.db.models import Count, Q, Case, When, Value, IntegerField
from django.contrib.postgres.aggregates import ArrayAgg
from rest_framework.generics import (
    ListAPIView,
    RetrieveAPIView,
)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import filters

from .utils import get_sitemap_params
from shop.pagination import ShopPagination
from .models import Product, Category, ProductAttribute
from orders.models import Order
from .filters import SearchProductFilter, ProductFilter
from .serializers import (
    CategorySerializer,
    ProductListSerializer,
    ProductDetailSerializer,
    CategoryListSerializer,
    ProductSitemapSerializer,
)


class SearchProductView(ListAPIView):
    serializer_class = ProductListSerializer
    pagination_class = ShopPagination
    filter_backends = [
        django_filters.rest_framework.DjangoFilterBackend,
        filters.OrderingFilter,
    ]
    filterset_class = SearchProductFilter
    ordering_fields = ["popularity", "price"]
    queryset = Product.objects.annotate(
        popularity=Count(
            "orderitem",
            filter=Q(
                orderitem__product_quantity__gt=0,
                orderitem__order__status__in=[
                    Order.PREPARING,
                    Order.SENT,
                    Order.RECEIVED,
                ],
            ),
            distinct=True,
        ),
        custom_order=Case(
            When(quantity__lte=0, then=Value(1)),
            default=Value(0),
            output_field=IntegerField(),
        ),
    ).select_related("category")

    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset)
        current_ordering = list(queryset.query.order_by)
        if not current_ordering:
            return queryset.order_by("custom_order", "-popularity", "id")
        return queryset.order_by("custom_order", *current_ordering, "id")

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        categories_queryset = (
            queryset.values(
                "category__id", 
                "category__name", 
                "category__slug"
            )
            .annotate(product_count=Count("id", distinct=True))
            .order_by("-product_count")
        )
        available_categories = [
            {
                "id": item["category__id"],
                "name": item["category__name"],
                "slug": item["category__slug"],
                "count": item["product_count"]
            }
            for item in categories_queryset
        ]

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response = self.get_paginated_response(serializer.data)
            response.data["available_categories"] = available_categories
            return response
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "results": serializer.data,
            "available_categories": available_categories
        })


class ProductDetail(RetrieveAPIView):
    serializer_class = ProductDetailSerializer
    lookup_field = "slug"
    queryset = Product.objects.all().select_related(
        "category", "main_attribute"
    ).prefetch_related("attributes", "variant_groups__variants__product")


class ProductFilterView(ListAPIView):
    serializer_class = ProductListSerializer
    pagination_class = ShopPagination
    filter_backends = [
        django_filters.rest_framework.DjangoFilterBackend,
        filters.OrderingFilter,
    ]
    ordering_fields = ["popularity", "price"]
    filterset_class = ProductFilter

    def get_queryset(self):
        category_slug = self.kwargs.get("category_slug")
        queryset = (
            Product.objects.annotate(
                popularity=Count(
                    "orderitem",
                    filter=Q(
                        orderitem__product_quantity__gt=0,
                        orderitem__order__status__in=[
                            Order.PREPARING,
                            Order.SENT,
                            Order.RECEIVED,
                        ],
                    ),
                    distinct=True,
                ),
                custom_order=Case(
                    When(quantity__lte=0, then=Value(1)),
                    default=Value(0),
                    output_field=IntegerField(),
                ),
            )
            .filter(category__slug=category_slug)
            .select_related("category")
        )
        return queryset

    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset)
        current_ordering = list(queryset.query.order_by)
        if not current_ordering:
            return queryset.order_by("custom_order", "-popularity", "id")
        return queryset.order_by("custom_order", *current_ordering, "id")


class CategoryListView(APIView):
    def get(self, request):
        categories = Category.objects.get_cached_trees()
        serializer = CategoryListSerializer(categories, many=True)
        return Response(serializer.data)


class CategoryFiltersView(APIView):
    def get(self, request, category_slug):
        cache_key = f"filters_data_{category_slug}"
        cached_data = cache.get(cache_key)
        if not cached_data:
            root_attr = ProductAttribute.objects.filter(
                category__slug=category_slug, level=0
            ).select_related("category").first()
            if not root_attr:
                return Response(status=status.HTTP_404_NOT_FOUND)

            cat_id = root_attr.category_id
            all_nodes = list(root_attr.get_descendants().values(
                "id", "name", "slug", "parent_id", "level", "show_in_filters"
            ))

            groups = [n for n in all_nodes if n["level"] == 2 and n["show_in_filters"]]
            children_map = defaultdict(list)
            slug_to_id_map = {}
            for n in all_nodes:
                if n["level"] == 3:
                    children_map[n["parent_id"]].append(n)
                    slug_to_id_map[n["slug"]] = (n["id"], n["parent_id"])

            products = list(
                Product.objects.filter(category_id=cat_id)
                .values_list("id", "price").order_by("id")
            )
            if not products:
                bit_data = ({}, 0, 0, 0, {}, [])
            else:
                id_to_bit = {p[0]: i for i, p in enumerate(products)}
                prices = [float(p[1]) for p in products]

                links = Product.attributes.through.objects.filter(
                    product__category_id=cat_id
                ).values("productattribute_id").annotate(
                    p_ids=ArrayAgg("product_id")
                )
                attr_masks = {}
                for item in links:
                    mask = 0
                    for p_id in item["p_ids"]:
                        bit_pos = id_to_bit.get(p_id)
                        if bit_pos is not None:
                            mask |= (1 << bit_pos)
                    if mask:
                        attr_masks[item["productattribute_id"]] = mask

                full_mask = (1 << len(products)) - 1
                bit_data = (attr_masks, full_mask, min(prices), max(prices), id_to_bit, prices)
            cached_data = {
                "cat_id": cat_id,
                "category_json": CategorySerializer(root_attr.category).data,
                "groups": groups,
                "children_map": dict(children_map),
                "slug_to_id": slug_to_id_map,
                "bit_data": bit_data
            }
            cache.set(cache_key, cached_data, 600)
        attr_masks, full_mask, g_min, g_max, id_to_bit, prices = cached_data["bit_data"]

        price_query = request.GET.get("price", "")
        name_query = request.GET.get("name", "").strip()

        base_filter_mask = full_mask
        if price_query and "-" in price_query:
            try:
                parts = price_query.split("-")
                min_str, max_str = parts[0].strip(), parts[1].strip()
                if min_str and max_str:
                    p_min, p_max = float(min_str), float(max_str)
                    if p_min <= p_max:
                        for i in range(len(prices)):
                            if not (p_min <= prices[i] <= p_max):
                                base_filter_mask &= ~(1 << i)
            except (ValueError, TypeError, IndexError):
                pass

        if name_query and len(name_query) > 1:
            keywords = [word for word in name_query.split() if len(word) > 1]
            if keywords:
                q_objects = Q()
                for token in keywords:
                    q_objects |= Q(name__icontains=token)
                name_match_ids = Product.objects.filter(
                    q_objects, category_id=cached_data["cat_id"]
                ).values_list("id", flat=True)
                name_mask = 0
                for p_id in name_match_ids:
                    if p_id in id_to_bit:
                        name_mask |= (1 << id_to_bit[p_id])
                base_filter_mask &= name_mask

        selected_slugs_list = [s.strip() for s in request.GET.get("attributes", "").split(",") if s.strip()]
        selected_slugs_set = set(selected_slugs_list)

        selected_by_group = defaultdict(int)
        for s in selected_slugs_list:
            if s in cached_data["slug_to_id"]:
                aid, pid = cached_data["slug_to_id"][s]
                selected_by_group[pid] |= attr_masks.get(aid, 0)

        def get_intersected_mask(exclude_group_id=None):
            result = base_filter_mask
            for group_id, group_mask in selected_by_group.items():
                if group_id != exclude_group_id:
                    result &= group_mask
            return result

        total_count = get_intersected_mask().bit_count()

        final_filters_json = []
        for group in cached_data["groups"]:
            gid = group["id"]
            context_mask = get_intersected_mask(exclude_group_id=gid)

            group_children_json = []
            for child in cached_data["children_map"].get(gid, []):
                child_id = child["id"]
                child_mask = attr_masks.get(child_id, 0)
                if child_mask == 0: continue

                count = (child_mask & context_mask).bit_count()
                is_additive = (gid in selected_by_group) and not (child["slug"] in selected_slugs_set)

                group_children_json.append({
                    "id": child_id,
                    "name": child["name"],
                    "slug": child["slug"],
                    "quantity": count,
                    "is_additive": is_additive
                })
            if group_children_json:
                final_filters_json.append({
                    "id": gid,
                    "name": group["name"],
                    "children": group_children_json
                })
        return Response({
            "category": cached_data["category_json"],
            "filters": final_filters_json,
            "price_range": {"min": g_min, "max": g_max},
            "total_count": total_count,
        })


class ProductSitemapView(APIView):
    def get(self, request):
        start, end = get_sitemap_params(request)
        if start is None:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        products = Product.objects.only("slug", "updated_at").order_by("id")[start:end]
        serializer = ProductSitemapSerializer(products, many=True)
        return Response(serializer.data)


class CategorySitemapView(APIView):
    def get(self, request):
        start, end = get_sitemap_params(request)
        if start is None:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        queryset = Category.objects.all().order_by("tree_id", "lft")
        cached_tree = get_cached_trees(queryset)
        data = []
        def traverse(nodes, current_path_slugs):
            for node in nodes:
                if not node.slug:
                    continue
                new_path = current_path_slugs + [node.slug]
                children = getattr(node, "_cached_children", [])
                if children:
                    data.append({
                        "full_slug": "/".join(new_path),
                        "updated_at": node.updated_at
                    })
                    traverse(children, new_path)
                else:
                    pass
        traverse(cached_tree, [])
        return Response(data[start:end])


class CategoryFiltersSitemapView(APIView):
    def get(self, request):
        start, end = get_sitemap_params(request)
        if start is None:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        roots = (
            ProductAttribute.objects.filter(level=0)
            .select_related("category")
            .only("tree_id", "category__slug", "category__updated_at")
        )

        tree_to_cat_info = {}
        unique_categories = {}
        for root in roots:
            if root.category and root.category.slug:
                tree_to_cat_info[root.tree_id] = {
                    "slug": root.category.slug,
                    "updated_at": root.category.updated_at
                }
                unique_categories[root.category.slug] = root.category.updated_at

        all_entries = []
        for cat_slug in sorted(unique_categories.keys()):
            all_entries.append({
                "category_slug": cat_slug,
                "filter_slug": None,
                "updated_at": unique_categories[cat_slug]
            })

        attrs = ProductAttribute.objects.filter(
            level=3,
            parent__show_in_filters=True,
            products__isnull=False
        ).only("slug", "tree_id", "updated_at").order_by("id").distinct()
        for attr in attrs:
            cat_info = tree_to_cat_info.get(attr.tree_id)
            if cat_info:
                all_entries.append({
                    "category_slug": cat_info["slug"],
                    "filter_slug": attr.slug,
                    "updated_at": attr.updated_at
                })
        return Response(all_entries[start:end])