from django.urls import path
from .views import (
    ProductDetail,
    SearchProductView,
    CategoryListView,
    CategoryFiltersView,
    ProductFilterView,
    ProductSitemapView
)

app_name = "products"

urlpatterns = [
    path("search/", SearchProductView.as_view(), name="search_product"),
    path("products/<slug:slug>/", ProductDetail.as_view(), name="product_detail"),
    path("products/filter/<slug:category_slug>/", ProductFilterView.as_view(), name="product_filter"),
    path("categories/", CategoryListView.as_view(), name="category_list"),
    path("categories/<slug:category_slug>/filters/", CategoryFiltersView.as_view(), name="category_filters"),
    path("products-sitemap/", ProductSitemapView.as_view(), name="product_sitemap"),
]