from rest_framework.generics import (
    ListAPIView,
    RetrieveAPIView,
)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import django_filters
from rest_framework import filters
from django.db.models import Case, When, Value, IntegerField

from shop.pagination import ShopPagination
from .models import Product
from .filters import ProductFilter
from .serializers import (
    ProductListSerializer,
    ProductDetailSerializer,
    ProductSitemapSerializer
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