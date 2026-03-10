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
from validation.sanitize_data import SanitizeSerializerMixin


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


class OrderCreateSerializer(SanitizeSerializerMixin, serializers.Serializer):
    surname = serializers.CharField(max_length=50)
    name = serializers.CharField(max_length=50)
    email = serializers.EmailField()
    formatted_number = serializers.CharField(max_length=30)
    selected_city_ref = serializers.CharField()
    selected_warehouse_type_id = serializers.IntegerField()
    selected_payment_method = serializers.ChoiceField(choices=Payment.NAME_CHOICES)

    selected_warehouse_ref = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    selected_street_ref = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    house = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    apartment = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    comment = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def validate(self, data):
        if not data.get("selected_warehouse_ref") and not data.get("selected_street_ref"):
            raise serializers.ValidationError("Не вказано відділення або адресу.")
        if data.get("selected_street_ref"):
            if not data.get("house") or not data.get("apartment"):
                raise serializers.ValidationError("Не вказано номер будинку або квартири.")
        return data

    def to_internal_value(self, data):
        internal_value = super().to_internal_value(data)
        return self.sanitize_fields(
            internal_value, 
            ["surname", "name", "formatted_number", "house", "comment"]
        )


class OrderItemSerializer(serializers.ModelSerializer):
    product_code = serializers.ReadOnlyField(source="product.code")
    product_slug = serializers.ReadOnlyField(source="product.slug")
    product_image = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product_code",
            "product_slug",
            "product_image",
            "product_name",
            "product_price",
            "product_weight",
            "product_quantity",
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
            "sent_at",
            "total_price",
            "total_quantity",
            "total_weight",
            "items",
        ]