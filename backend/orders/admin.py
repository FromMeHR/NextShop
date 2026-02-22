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
    ]
)


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    autocomplete_fields = ["product"]
    extra = 0


@admin.register(NovaPoshtaCity)
class NovaPoshtaCityAdmin(admin.ModelAdmin):
    search_fields = ["name_ukr", "name_ru"]


@admin.register(NovaPoshtaWarehouse)
class NovaPoshtaWarehouseAdmin(admin.ModelAdmin):
    autocomplete_fields = ["city"]


@admin.register(NovaPoshtaStreet)
class NovaPoshtaStreetAdmin(admin.ModelAdmin):
    autocomplete_fields = ["city"]


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    search_fields = ["name"]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    search_fields = ["order_code"]
    list_display = ["order_code", "status", "total_price", "created_at"]
    autocomplete_fields = ["payment", "user"]
    inlines = [OrderItemInline]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    autocomplete_fields = ["product", "order"]