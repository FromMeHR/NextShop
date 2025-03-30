from django.shortcuts import get_object_or_404
from django.utils.crypto import get_random_string
from django.http import Http404
from datetime import timedelta
from django.utils import timezone
from rest_framework.generics import (
    ListCreateAPIView, 
    RetrieveUpdateDestroyAPIView
)
from rest_framework.response import Response
from rest_framework import status

from .models import Cart, CartItem
from products.models import Product
from .serializers import (
    CartSerializer, 
    CartItemSerializer
)


class CartList(ListCreateAPIView):
    serializer_class = CartSerializer

    def get_queryset(self):
        cart_code = self.request.COOKIES.get("cart_code")
        return Cart.objects.filter(cart_code=cart_code).prefetch_related(
            "cart_items__product"
        )

    def create(self, request, *args, **kwargs):
        cart_code = request.COOKIES.get("cart_code")
        product_id = request.data.get("product_id")
        try:
            product = get_object_or_404(Product, id=int(product_id))
        except ValueError:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        if not product.quantity > 0:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        response = Response()
        if not cart_code or not Cart.objects.filter(cart_code=cart_code).exists():
            cart_code = get_random_string(128)
            response.set_cookie(
                "cart_code",
                cart_code,
                httponly=True,
                expires=timezone.now() + timedelta(days=30)
            )

        cart, created = Cart.objects.get_or_create(cart_code=cart_code)
        cart_item, item_created = CartItem.objects.get_or_create(cart=cart, product_id=product_id)

        if item_created:
            cart_item.quantity = 1
            cart_item.save()

        response.data = CartSerializer(cart).data
        response.status_code = status.HTTP_201_CREATED if item_created else status.HTTP_200_OK
        return response


class CartDetail(RetrieveUpdateDestroyAPIView):
    queryset = CartItem.objects.all()
    serializer_class = CartItemSerializer
    
    def get_object(self):
        cart_code = self.request.COOKIES.get("cart_code")
        obj = get_object_or_404(CartItem, id=self.kwargs.get("pk"))
        if obj.cart.cart_code != cart_code:
            raise Http404
        return obj

    def perform_update(self, serializer):
        new_quantity = self.request.data.get("quantity")
        
        if new_quantity and new_quantity != serializer.instance.quantity:
            try:
                new_quantity = int(new_quantity)
                if new_quantity >= 1:
                    serializer.instance.quantity = new_quantity
                    serializer.save()
            except ValueError:
                pass

    def perform_destroy(self, instance):
        instance.delete()