from django_filters import filters
from django_filters import FilterSet


class ProductFilter(FilterSet):
    name = filters.CharFilter(method="filter_by_name")
    
    def filter_by_name(self, queryset, name, value):
        if value and len(value.strip()) > 1:
            return queryset.filter(name__icontains=value.strip())
        else:
            return queryset.none()