from django.db.models import Q
from django_filters import filters
from django_filters import FilterSet

from .models import ProductAttribute


class SearchProductFilter(FilterSet):
    name = filters.CharFilter(method="filter_by_name", required=True)

    def filter_by_name(self, queryset, name, value):
        query = value.strip()
        if not query or len(query) < 2:
            return queryset.none()

        keywords = [word for word in query.split() if len(word) > 1]
        if not keywords:
            return queryset.none()
        q_objects = Q()
        for token in keywords:
            q_objects |= Q(name__icontains=token)
        return queryset.filter(q_objects)


class ProductFilter(FilterSet):
    attributes = filters.CharFilter(method="filter_by_attributes")
    price = filters.CharFilter(method="filter_by_price")
    name = filters.CharFilter(method="filter_by_name")

    def filter_by_attributes(self, queryset, name, value):
        if not value:
            return queryset

        slugs = [s.strip() for s in value.split(",") if s.strip()]
        category_slug = self.request.parser_context["kwargs"].get("category_slug")

        attr_data = ProductAttribute.objects.filter(
            parent__parent__parent__category__slug=category_slug,
            slug__in=slugs, 
            level=3
        ).values_list("id", "parent_id")
        if not attr_data:
            return queryset.none()

        groups = {}
        for attr_id, parent_id in attr_data:
            groups.setdefault(parent_id, []).append(attr_id)

        for attr_ids in groups.values():
            queryset = queryset.filter(attributes__id__in=attr_ids)
        return queryset.distinct()

    def filter_by_price(self, queryset, name, value):
        if not value or "-" not in value:
            return queryset

        try:
            parts = value.split("-", 1)
            if len(parts) != 2:
                return queryset

            min_str, max_str = parts[0].strip(), parts[1].strip()
            if not min_str or not max_str:
                return queryset
            min_p = float(min_str)
            max_p = float(max_str)

            if min_p > max_p:
                return queryset
            return queryset.filter(price__gte=min_p, price__lte=max_p)
        except (ValueError, TypeError, IndexError):
            return queryset

    def filter_by_name(self, queryset, name, value):
        query = value.strip()
        if not query or len(query) < 2:
            return queryset.none()

        keywords = [word for word in query.split() if len(word) > 1]
        if not keywords:
            return queryset.none()
        q_objects = Q()
        for token in keywords:
            q_objects |= Q(name__icontains=token)
        return queryset.filter(q_objects)