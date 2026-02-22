from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html
from mptt.admin import DraggableMPTTAdmin

from .models import (
    Category,
    ProductVariantGroup,
    ProductVariant,
    ProductAttribute,
    Product
)


@admin.register(Category)
class CategoryAdmin(DraggableMPTTAdmin):
    mptt_level_indent = 20
    prepopulated_fields = {"slug": ("name",)}
    list_display = (
        "tree_actions",
        "indented_title",
        "add_child_link",
    )

    list_display_links = (
        "indented_title",
    )

    def get_changeform_initial_data(self, request):
        initial = super().get_changeform_initial_data(request)
        parent_id = request.GET.get("parent")
        if parent_id:
            initial["parent"] = parent_id
        return initial

    def add_child_link(self, obj):
        if obj.level >= 2:
            return "-"
        url = (
            reverse("admin:products_category_add")
            + f"?parent={obj.id}"
        )
        return format_html(
            '<a href="{}">✚ Додати дочірню</a>',
            url
        )
    add_child_link.short_description = "Дія"


@admin.register(ProductAttribute)
class ProductAttributeAdmin(DraggableMPTTAdmin):
    mptt_level_indent = 20
    prepopulated_fields = {"slug": ("name",)}
    list_display=(
        "tree_actions",
        "indented_title",
        "add_child_link",
    )
    list_display_links=(
        "indented_title",
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related("category", "parent")
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "parent":
            kwargs["queryset"] = ProductAttribute.objects.select_related("category", "parent")
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def get_changeform_initial_data(self, request):
        initial = super().get_changeform_initial_data(request)
        parent_id = request.GET.get("parent")
        if parent_id:
            initial["parent"] = parent_id
        return initial

    def add_child_link(self, obj):
        if obj.level >= 3:
            return "-"
        url = (
            reverse("admin:products_productattribute_add")
            + f"?parent={obj.id}"
        )
        return format_html(
            '<a href="{}">✚ Додати дочірній</a>',
            url
        )
    add_child_link.short_description = "Дія"


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    autocomplete_fields = ["product"]
    extra = 1


@admin.register(ProductVariantGroup)
class ProductVariantGroupAdmin(admin.ModelAdmin):
    inlines = [ProductVariantInline]


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    search_fields = ["name", "code"]
    list_display = ["id", "name"]
    list_display_links = ["id", "name"]
    filter_horizontal = ["attributes"]
    prepopulated_fields = {"slug": ("name",)}

    def formfield_for_manytomany(self, db_field, request, **kwargs):
        if db_field.name == "attributes":
            category_id = (
                request.POST.get("category")
                or request.GET.get("category")
            )

            if not category_id and request.resolver_match.kwargs.get("object_id"):
                product = Product.objects.filter(
                    pk=request.resolver_match.kwargs["object_id"]
                ).first()
                category_id = product.category_id if product else None
            if category_id:
                kwargs["queryset"] = ProductAttribute.objects.filter(
                    level=3,
                    parent__parent__parent__category_id=category_id
                ).select_related("category", "parent")
            else:
                kwargs["queryset"] = ProductAttribute.objects.none()
        return super().formfield_for_manytomany(db_field, request, **kwargs)

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "main_attribute":
            category_id = (
                request.POST.get("category")
                or request.GET.get("category")
            )

            if not category_id and request.resolver_match.kwargs.get("object_id"):
                product = Product.objects.filter(
                    pk=request.resolver_match.kwargs["object_id"]
                ).first()
                category_id = product.category_id if product else None
            if category_id:
                kwargs["queryset"] = ProductAttribute.objects.filter(
                    level=3,
                    parent__parent__parent__category_id=category_id
                ).select_related("parent")
            else:
                kwargs["queryset"] = ProductAttribute.objects.none()
        return super().formfield_for_foreignkey(db_field, request, **kwargs)