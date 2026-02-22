from django.contrib import admin

from .models import Cart, CartItem


class CartItemInline(admin.TabularInline):
    model = CartItem
    autocomplete_fields = ["product"]
    extra = 0


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    search_fields = ["cart_code"]
    autocomplete_fields = ["user"]
    inlines = [CartItemInline]


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    autocomplete_fields = ["product", "cart"]