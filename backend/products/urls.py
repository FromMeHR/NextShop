from django.urls import path
from .views import (
    ProductList,
    ProductDetail
)

app_name = 'products'

urlpatterns = [
    path('products/', ProductList.as_view(), name='product_list'),
    path('products/<int:pk>', ProductDetail.as_view(), name='product_detail'),
]