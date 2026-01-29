from django.db.models import Q, Case, When, Value, IntegerField
from django_filters import filters
from django_filters import FilterSet


class SearchCityFilter(FilterSet):
    name = filters.CharFilter(method="filter_by_name")

    def filter_by_name(self, queryset, name, value):
        query = value.strip()
        if not query or len(query) < 2:
            return queryset.none()

        keywords = [word for word in query.split() if len(word) > 1]
        if not keywords:
            return queryset.none()
        q_objects = Q()
        for token in keywords:
            q_objects |= (Q(name_ukr__icontains=token) | Q(name_ru__icontains=token))
        return queryset.filter(q_objects).annotate(
            relevance=Case(
                When(Q(name_ukr__istartswith=query) | Q(name_ru__istartswith=query), then=Value(10)),
                When(Q(name_ukr__icontains=query) | Q(name_ru__icontains=query), then=Value(5)),
                default=Value(1),
                output_field=IntegerField(),
            )
        ).order_by("-relevance", "position")[:50]