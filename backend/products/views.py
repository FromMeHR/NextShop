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

from shop.pagination import ShopPagination
from .models import Product, Category, ProductAttribute
from orders.models import Order
from .filters import SearchProductFilter, ProductFilter
from .serializers import (
    CategorySerializer,
    ProductListSerializer,
    ProductDetailSerializer,
    CategoryListSerializer,
    CategoryFiltersSerializer,
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
        search_query = self.request.query_params.get("name", "").strip()
        if search_query:
            queryset = queryset.annotate(
                relevance=Case(
                    When(name__icontains=search_query, then=Value(10)),
                    default=Value(1),
                    output_field=IntegerField(),
                )
            )
            search_ordering = ["-relevance"]
        else:
            search_ordering = []

        current_ordering = list(queryset.query.order_by)
        if not current_ordering:
            return queryset.order_by("custom_order", *search_ordering, "-popularity", "id")
        return queryset.order_by("custom_order", *current_ordering, *search_ordering, "id")
    
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
        search_query = self.request.query_params.get("name", "").strip()
        if search_query:
            queryset = queryset.annotate(
                relevance=Case(
                    When(name__icontains=search_query, then=Value(10)),
                    default=Value(1),
                    output_field=IntegerField(),
                )
            )
            search_ordering = ["-relevance"]
        else:
            search_ordering = []

        current_ordering = list(queryset.query.order_by)
        if not current_ordering:
            return queryset.order_by("custom_order", *search_ordering, "-popularity", "id")
        return queryset.order_by("custom_order", *current_ordering, *search_ordering, "id")


class CategoryListView(APIView):
    def get(self, request):
        categories = Category.objects.get_cached_trees()
        serializer = CategoryListSerializer(categories, many=True)
        return Response(serializer.data)


class CategoryFiltersView(APIView):
    def get(self, request, category_slug):
        root_attr = ProductAttribute.objects.filter(
            category__slug=category_slug, level=0
        ).select_related("category").first()
        if not root_attr:
            return Response(status=status.HTTP_404_NOT_FOUND)

        price_query = request.GET.get("price", "")
        attributes_query = request.GET.get("attributes", "")
        name_query = request.GET.get("name", "").strip()
        min_p_req, max_p_req = None, None
        if price_query and "-" in price_query:
            try:
                parts = price_query.split("-", 1)
                if len(parts) == 2:
                    min_str, max_str = parts[0].strip(), parts[1].strip()
                    if min_str and max_str:
                        min_val, max_val = float(min_str), float(max_str)
                        if min_val > max_val:
                            pass
                        else:
                            min_p_req, max_p_req = min_val, max_val
            except (ValueError, TypeError, IndexError):
                pass

        cache_key = f"filters_data_{category_slug}"
        cached_data = cache.get(cache_key)
        if cached_data:
            attr_to_products, all_product_ids, product_prices, global_min, global_max = cached_data
        else:
            product_data = list(Product.objects.filter(
                category_id=root_attr.category_id
            ).values_list("id", "price"))
            product_prices = {}
            global_min, global_max = 0, 0
            if product_data: 
                product_prices = {p_id: float(p_price) for p_id, p_price in product_data}
                all_values = product_prices.values()
                global_min = min(all_values)
                global_max = max(all_values)

            attr_stats = Product.attributes.through.objects.filter(
                product__category_id=root_attr.category_id
            ).values("productattribute_id").annotate(
                p_ids=ArrayAgg("product_id")
            )
            attr_to_products = {}
            all_product_ids = set()
            for item in attr_stats:
                p_ids_list = item["p_ids"]
                attr_id = item["productattribute_id"]

                p_set = set(p_ids_list)
                attr_to_products[attr_id] = p_set
                all_product_ids.update(p_set)
            cached_data = (attr_to_products, all_product_ids, product_prices, global_min, global_max)
            cache.set(cache_key, cached_data, 600)

        ids_passing_name = all_product_ids.copy()
        if name_query and len(name_query) > 1:
            keywords = [word for word in name_query.split() if len(word) > 1]
            if keywords:
                q_objects = Q()
                for token in keywords:
                    q_objects |= Q(name__icontains=token)
                matching_ids = set(Product.objects.filter(
                    q_objects,
                    category_id=root_attr.category_id
                ).values_list("id", flat=True))
                ids_passing_name &= matching_ids
            else:
                ids_passing_name = set()

        ids_passing_price = set()
        current_base_ids = ids_passing_name
        if min_p_req is None and max_p_req is None:
            ids_passing_price = current_base_ids
        else:
            for p_id in current_base_ids:
                p_price = product_prices.get(p_id)
                if p_price is not None:
                    if (min_p_req is None or p_price >= min_p_req) and \
                       (max_p_req is None or p_price <= max_p_req):
                        ids_passing_price.add(p_id)

        all_l3_data = ProductAttribute.objects.filter(
            tree_id=root_attr.tree_id, level=3
        ).values("id", "slug", "parent_id")
        attr_lookup = {item["slug"]: item for item in all_l3_data}

        selected_slugs = [s.strip() for s in attributes_query.split(",") if s.strip()]
        selected_by_group = defaultdict(set)
        for s in selected_slugs:
            if s in attr_lookup:
                item = attr_lookup[s]
                selected_by_group[item["parent_id"]].add(item["id"])

        group_prods_cache = {}
        for g_id, attr_ids in selected_by_group.items():
            combined_prods = set()
            for a_id in attr_ids:
                combined_prods.update(attr_to_products.get(a_id, set()))
            group_prods_cache[g_id] = combined_prods

        def get_intersected_ids(exclude_group_id=None):
            result = ids_passing_price.copy()
            for g_id, prod_set in group_prods_cache.items():
                if g_id != exclude_group_id:
                    result &= prod_set
            return result

        final_filtered_ids = get_intersected_ids()
        total_filtered_count = len(final_filtered_ids)

        queryset = root_attr.get_descendants(include_self=True)
        get_cached_trees(queryset)

        filter_groups_data = []
        for node in queryset:
            if node.level == 2 and node.show_in_filters:
                children = node.get_children()
                is_group_active = node.id in selected_by_group

                context_ids = get_intersected_ids(exclude_group_id=node.id)

                valid_children = []
                for child in children:
                    if child.id in attr_to_products:
                        child_product_ids = attr_to_products.get(child.id, set())
                        count = len(child_product_ids & context_ids)

                        is_selected = child.slug in selected_slugs
                        child.quantity = count
                        child.is_additive = is_group_active and not is_selected

                        valid_children.append(child)
                if valid_children:
                    node._cached_children = valid_children
                    filter_groups_data.append(node)
        return Response({
            "category": CategorySerializer(root_attr.category).data,
            "filters": CategoryFiltersSerializer(filter_groups_data, many=True).data,
            "price_range": {
                "min": global_min,
                "max": global_max
            },
            "total_count": total_filtered_count,
        })


class ProductSitemapView(APIView):
    def get(self, request):
        try:
            start = max(int(request.query_params.get("start", 0)), 0)
            end = int(request.query_params.get("end"))
        except (ValueError, TypeError):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        products = Product.objects.only("slug").order_by("id")[start:end]
        serializer = ProductSitemapSerializer(products, many=True)
        return Response(serializer.data)