from rest_framework import serializers

from .models import (
    DeliveryType,
    WarehouseType,
    NovaPoshtaCity,
    NovaPoshtaWarehouse,
    NovaPoshtaStreet
)


class DeliveryTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryType
        fields = ["id", "name"]


class WarehouseTypeSerializer(serializers.ModelSerializer):
    delivery_type = DeliveryTypeSerializer()

    class Meta:
        model = WarehouseType
        fields = ["id", "name", "ref", "delivery_type", "operator", "image"]


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