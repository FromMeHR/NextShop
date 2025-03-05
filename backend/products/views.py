from rest_framework.generics import (
    ListAPIView,
    RetrieveAPIView,
)

from .models import Product
from .serializers import ProductSerializer


class ProductList(ListAPIView):
    serializer_class = ProductSerializer
    queryset = (
        Product.objects.all()
        .prefetch_related('categories')
    )
    

class ProductDetail(RetrieveAPIView):
    serializer_class = ProductSerializer
    queryset = (
        Product.objects.all()
        .prefetch_related('categories')
    )