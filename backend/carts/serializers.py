from rest_framework import serializers

from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    product_id = serializers.ReadOnlyField(source="product.id")
    product_name = serializers.ReadOnlyField(source="product.name")
    product_slug = serializers.ReadOnlyField(source="product.slug")
    product_price = serializers.ReadOnlyField(source="product.price")
    product_quantity = serializers.ReadOnlyField(source="product.quantity")
    product_weight = serializers.ReadOnlyField(source="product.weight")
    product_image = serializers.ReadOnlyField(source="product.image.url")
    
    class Meta:
        model = CartItem
        fields = ["id", "product_id", "product_name", "product_slug", "product_price", 
                  "product_quantity", "product_weight", "product_image", "quantity"]


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, source="cart_items", read_only=True)

    class Meta:
        model = Cart
        fields = ["id", "items"]