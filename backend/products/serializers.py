from rest_framework import serializers
from mptt.utils import get_cached_trees

from .models import (
    Category,
    ProductVariantGroup,
    ProductVariant,
    Product,
    ProductAttribute
)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class AttributeValueSerializer(serializers.ModelSerializer):
    quantity = serializers.IntegerField(read_only=True)
    is_additive = serializers.BooleanField(read_only=True)

    class Meta:
        model = ProductAttribute
        fields = ("id", "name", "slug", "quantity", "is_additive")


class CategoryListSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ("id", "name", "slug", "image", "children")

    def get_children(self, obj):
        return CategoryListSerializer(getattr(obj, "_cached_children", []), many=True).data

    def get_image(self, obj):
        request = self.context.get("request")
        img = obj.image
        if img and hasattr(img, "url"):
            return request.build_absolute_uri(img.url) if request else img.url
        return None


class CategoryFiltersSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = ProductAttribute
        fields = ("id", "name", "children")

    def get_children(self, obj):
        return AttributeValueSerializer(getattr(obj, "_cached_children", []), many=True).data


class ProductAttributesSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = ProductAttribute
        fields = ("id", "name", "slug", "show_in_filters", "show_in_short_info", "children")

    def get_children(self, obj):
        return ProductAttributesSerializer(getattr(obj, "_cached_children", []), many=True).data

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.level != 3:
            data.pop("slug", None)
        if instance.level != 2:
            data.pop("show_in_filters", None)
        if instance.level not in [1, 2]:
            data.pop("show_in_short_info", None)
        if instance.level == 3:
            data.pop("children", None)
        return data


class ProductListSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Product
        fields = (
            "code",
            "name",
            "slug",
            "image",
            "description",
            "price",
            "stock_status",
            "weight",
            "category",
        )

    def get_image(self, obj):
        request = self.context.get("request")
        img = obj.image
        if img and hasattr(img, "url"):
            return request.build_absolute_uri(img.url) if request else img.url
        return None


class ProductVariantLinkSerializer(serializers.ModelSerializer):
    slug = serializers.ReadOnlyField(source="product.slug")
    price = serializers.ReadOnlyField(source="product.price")
    is_active = serializers.SerializerMethodField()

    class Meta:
        model = ProductVariant
        fields = ["id", "slug", "label", "price", "is_active"]

    def get_is_active(self, obj):
        current_product_id = self.context.get("current_product_id")
        return obj.product_id == current_product_id


class ProductGroupSerializer(serializers.ModelSerializer):
    name = serializers.ReadOnlyField(source="public_name")
    items = ProductVariantLinkSerializer(source="variants", many=True)

    class Meta:
        model = ProductVariantGroup
        fields = ["id", "name", "items"]


class ProductDetailSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    quantity = serializers.SerializerMethodField()
    category = CategorySerializer(read_only=True)
    attributes = serializers.SerializerMethodField()
    main_attribute = AttributeValueSerializer(read_only=True)
    similar_products = serializers.SerializerMethodField()
    variant_data = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "code",
            "name",
            "slug",
            "image",
            "description",
            "price",
            "stock_status",
            "quantity",
            "category",
            "attributes",
            "main_attribute",
            "variant_data",
            "similar_products",
        )

    def get_image(self, obj):
        request = self.context.get("request")
        img = obj.image
        if img and hasattr(img, "url"):
            return request.build_absolute_uri(img.url) if request else img.url
        return None

    def get_quantity(self, obj):
        return obj.quantity if obj.quantity < 10 else None

    def get_attributes(self, obj):
        assigned_attrs_ids = [a.id for a in obj.attributes.all()]
        if not assigned_attrs_ids:
            return []

        first_attr = obj.attributes.all().first()
        if not first_attr:
            return []
        full_tree = ProductAttribute.objects.filter(
            tree_id=first_attr.tree_id
        )
        get_cached_trees(full_tree)

        allowed_l2_ids = {node.id for node in full_tree if node.level == 2 and node.show_in_product_details}
        final_ids = set()
        for node in full_tree:
            if node.level == 3 and node.id in assigned_attrs_ids:
                parent = node.parent
                if parent and parent.id in allowed_l2_ids:
                    final_ids.add(node.id)
                    final_ids.add(parent.id)
                    if parent.parent_id:
                        final_ids.add(parent.parent_id)

        filtered_queryset = [n for n in full_tree if n.id in final_ids]
        if not filtered_queryset:
            return []
        get_cached_trees(filtered_queryset)
        root_nodes = [node for node in filtered_queryset if node.level == 1]
        return ProductAttributesSerializer(root_nodes, many=True).data

    def get_variant_data(self, obj):
        return ProductGroupSerializer(
            obj.variant_groups.all(), 
            many=True, 
            context={"current_product_id": obj.id}
        ).data

    def get_similar_products(self, obj):
        products = (
            Product.objects
            .filter(category=obj.category, quantity__gt=0)
            .exclude(id=obj.id)
            .select_related("category")
            .order_by("-id")[:30]
        )
        serializer = ProductListSerializer(products, many=True, context=self.context)
        return serializer.data


class ProductSitemapSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["slug"]