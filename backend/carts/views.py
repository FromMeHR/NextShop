from django.shortcuts import get_object_or_404
from django.utils.crypto import get_random_string
from django.http import Http404
from django.utils import timezone
from django.db import transaction
from datetime import timedelta
from rest_framework.generics import (
    ListCreateAPIView, 
    RetrieveUpdateDestroyAPIView
)
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
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
        except (ValueError, TypeError):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        if not product.quantity > 0:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        response = Response()
        if not cart_code or not Cart.objects.filter(cart_code=cart_code).exists():
            cart_code = get_random_string(72)
            response.set_cookie(
                "cart_code",
                cart_code,
                httponly=True,
                expires=timezone.now() + timedelta(days=30),
            )

        cart, created = Cart.objects.get_or_create(cart_code=cart_code)
        cart_item, item_created = CartItem.objects.get_or_create(cart=cart, product_id=product_id)

        if request.user.is_authenticated and not cart.user:
            Cart.objects.filter(user=request.user).exclude(id=cart.id).delete()
            cart.user = request.user
            cart.save()

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
            except (ValueError, TypeError):
                pass

    def perform_destroy(self, instance):
        instance.delete()


class CartSyncView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        current_cart_code = request.COOKIES.get("cart_code")
        current_cart = Cart.objects.filter(cart_code=current_cart_code, user__isnull=True).first()
        user_cart = Cart.objects.filter(user=user).first()
        final_cart_code = None
        response = Response()

        if user_cart:
            if current_cart and current_cart.cart_items.exists():
                with transaction.atomic():
                    user_cart.cart_items.all().delete()
                    for item in current_cart.cart_items.all():
                        CartItem.objects.create(
                            cart=user_cart, 
                            product=item.product, 
                            quantity=item.quantity
                        )
                    current_cart.delete()
            final_cart_code = user_cart.cart_code
        else:
            if current_cart:
                current_cart.user = user
                current_cart.save()
                final_cart_code = current_cart.cart_code
            else:
                cart_code = get_random_string(72)
                Cart.objects.create(user=user, cart_code=cart_code)
                final_cart_code = cart_code

        response.set_cookie(
            "cart_code",
            final_cart_code,
            httponly=True,
            expires=timezone.now() + timedelta(days=30),
        )
        cart = (
            Cart.objects.filter(user=user, cart_code=final_cart_code)
            .prefetch_related("cart_items__product")
            .first()
        )
        response.data = CartSerializer(cart).data
        return response

    def delete(self, request, *args, **kwargs):
        cart_code = get_random_string(72)
        Cart.objects.create(cart_code=cart_code)
        response = Response()
        response.set_cookie(
            "cart_code",
            cart_code,
            httponly=True,
            expires=timezone.now() + timedelta(days=30),
        )
        return response