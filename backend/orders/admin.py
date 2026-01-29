from django.contrib import admin

from .models import (
    DeliveryType,
    Operator,
    WarehouseType,
    NovaPoshtaCity,
    NovaPoshtaWarehouse,
    NovaPoshtaStreet,
    Payment,
    Order,
    OrderItem,
)


admin.site.register(
    [
        DeliveryType,
        Operator,
        WarehouseType,
        NovaPoshtaCity,
        NovaPoshtaWarehouse,
        NovaPoshtaStreet,
        Payment,
        Order,
        OrderItem,
    ]
)
