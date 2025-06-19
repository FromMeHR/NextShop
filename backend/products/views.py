from rest_framework.generics import (
    ListAPIView,
    RetrieveAPIView,
)
import django_filters
from rest_framework import filters
from django.db.models import Case, When, Value, IntegerField

from shop.pagination import ShopPagination
from .models import Product
from .filters import ProductFilter
from .serializers import (
    ProductListSerializer,
    ProductDetailSerializer,
)


class ProductList(ListAPIView):
    serializer_class = ProductListSerializer
    pagination_class = ShopPagination
    queryset = (
        Product.objects.annotate(
            custom_order=Case(
                When(quantity=0, then=Value(1)),
                default=Value(0),
                output_field=IntegerField(),
            )
        )
        .order_by("custom_order", "id")
        .prefetch_related("categories")
    )
    

class ProductDetail(RetrieveAPIView):
    serializer_class = ProductDetailSerializer
    lookup_field = "slug"
    queryset = (
        Product.objects.all()
        .prefetch_related("categories")
    )
    

class SearchProductView(ListAPIView):
    queryset = (
        Product.objects.annotate(
            custom_order=Case(
                When(quantity=0, then=Value(1)),
                default=Value(0),
                output_field=IntegerField(),
            )
        )
        .order_by("custom_order", "id")
        .prefetch_related("categories")
    )

    serializer_class = ProductListSerializer
    pagination_class = ShopPagination
    filter_backends = [
        django_filters.rest_framework.DjangoFilterBackend,
        filters.OrderingFilter,
    ]
    filterset_class = ProductFilter
    ordering_fields = ["custom_order"]