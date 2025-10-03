from django.urls import path
from .views import (
    ProductList,
    ProductDetail,
    SearchProductView,
    ProductSitemapView
)

app_name = "products"

urlpatterns = [
    path("search/", SearchProductView.as_view(), name="search_product"),
    path("products/", ProductList.as_view(), name="product_list"),
    path("products/<slug:slug>/", ProductDetail.as_view(), name="product_detail"),
    path("products-sitemap/", ProductSitemapView.as_view(), name="product_sitemap"),
]