from django.shortcuts import get_object_or_404
from rest_framework.generics import ListCreateAPIView
from rest_framework.response import Response
from rest_framework import status

from .models import Cart, CartItem
from products.models import Product
from .serializers import CartSerializer


class CartList(ListCreateAPIView):
    serializer_class = CartSerializer

    def get_queryset(self):
        cart_code = self.request.query_params.get("cart_code")
        return Cart.objects.filter(cart_code=cart_code)

    def create(self, request, *args, **kwargs):
        cart_code = request.data.get("cart_code")
        product_id = request.data.get("product_id")

        product = get_object_or_404(Product, id=product_id)
        if not product.quantity > 0:
            return Response({"error": "Product is out of stock"}, status=status.HTTP_400_BAD_REQUEST)

        cart, created = Cart.objects.get_or_create(cart_code=cart_code)
        cart_item, item_created = CartItem.objects.get_or_create(cart=cart, product_id=product_id)

        if item_created:
            cart_item.quantity = 1
            cart_item.save()
        return Response(CartSerializer(cart).data, status=status.HTTP_201_CREATED)
