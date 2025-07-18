from rest_framework import serializers

from .models import (
    Category,
    Product
)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class ProductListSerializer(serializers.ModelSerializer):
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
            "quantity",
            "weight",
            "categories",
        )


class ProductDetailSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True)
    similar_products = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "slug",
            "image",
            "description",
            "price",
            "quantity",
            "categories",
            "similar_products",
        )

    def get_similar_products(self, obj):
        products = (
            Product.objects.filter(categories__in=obj.categories.all())
            .filter(quantity__gt=0)
            .exclude(id=obj.id)
            .prefetch_related("categories")
        )
        serializer = ProductListSerializer(products, many=True, context=self.context)
        return serializer.data[:30]