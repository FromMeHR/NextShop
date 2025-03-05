from rest_framework import serializers
from .models import (
    Category,
    Product
)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class ProductSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "slug",
            "image",
            "description",
            "price",
            "categories",
        )