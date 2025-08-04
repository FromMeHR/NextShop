from rest_framework import serializers

from .models import (
    DeliveryType,
    WarehouseType,
    NovaPoshtaCity,
    NovaPoshtaWarehouse,
    NovaPoshtaStreet,
    Payment,
    Order,
    OrderItem,
)


class DeliveryTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryType
        fields = ["id", "name"]


class WarehouseTypeSerializer(serializers.ModelSerializer):
    delivery_type = DeliveryTypeSerializer()
    min_delivery_price = serializers.ReadOnlyField(source="operator.min_delivery_price")
    image = serializers.SerializerMethodField()

    class Meta:
        model = WarehouseType
        fields = [
            "id",
            "name",
            "ref",
            "delivery_type",
            "operator",
            "min_delivery_price",
            "image",
        ]
    
    def get_image(self, obj):
        request = self.context.get("request")
        img = obj.image
        if img and hasattr(img, 'url'):
            return request.build_absolute_uri(img.url) if request else img.url
        return None


class NovaPoshtaCitySerializer(serializers.ModelSerializer):
    class Meta:
        model = NovaPoshtaCity
        fields = ["id", "name_ukr", "ref"]


class NovaPoshtaWarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = NovaPoshtaWarehouse
        fields = ["id", "name_ukr", "ref", "max_weight_allowed"]


class NovaPoshtaStreetSerializer(serializers.ModelSerializer):
    class Meta:
        model = NovaPoshtaStreet
        fields = ["id", "name", "ref"]


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ["id", "name", "expires_at", "forward_url", "status"]


class OrderItemSerializer(serializers.ModelSerializer):
    product_id = serializers.ReadOnlyField(source="product.id")
    product_name = serializers.ReadOnlyField(source="product.name")
    product_slug = serializers.ReadOnlyField(source="product.slug")
    product_price = serializers.ReadOnlyField(source="product.price")
    product_stock_status = serializers.ReadOnlyField(source="product.stock_status")
    product_weight = serializers.ReadOnlyField(source="product.weight")
    product_image = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product_id",
            "product_name",
            "product_slug",
            "product_price",
            "product_stock_status",
            "product_weight",
            "product_image",
            "quantity",
        ]

    def get_product_image(self, obj):
        request = self.context.get("request")
        img = obj.product.image
        if img and hasattr(img, 'url'):
            return request.build_absolute_uri(img.url) if request else img.url
        return None


class OrderDetailSerializer(serializers.ModelSerializer):
    delivery_warehouse_type = WarehouseTypeSerializer()
    payment = PaymentSerializer()
    items = OrderItemSerializer(many=True, source="order_items", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "order_code",
            "status",
            "payment",
            "delivery_user_name",
            "delivery_user_surname",
            "delivery_user_phone",
            "delivery_user_email",
            "delivery_warehouse_type",
            "delivery_city",
            "delivery_warehouse",
            "delivery_street",
            "delivery_house",
            "delivery_apartment",
            "delivery_notes",
            "created_at",
            "total_price",
            "total_quantity",
            "total_weight",
            "items",
        ]