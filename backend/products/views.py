from rest_framework.generics import (
    ListAPIView,
    RetrieveAPIView,
)

from .models import Product
from .serializers import (
    ProductListSerializer,
    ProductDetailSerializer,
)


class ProductList(ListAPIView):
    serializer_class = ProductListSerializer
    queryset = (
        Product.objects.all()
        .prefetch_related('categories')
    )
    

class ProductDetail(RetrieveAPIView):
    serializer_class = ProductDetailSerializer
    lookup_field = 'slug'
    queryset = (
        Product.objects.all()
        .prefetch_related('categories')
    )