from django.urls import path
from .views import (
    SearchCityView,
    WarehouseTypeListView,
    WarehouseListView,
    StreetListView,
    CreateOrderView,
    MonobankPaymentStatusView,
    OrderDetailView
)

app_name = "orders"

urlpatterns = [
    path("search-city/", SearchCityView.as_view(), name="search_city"),
    path("warehouse-types/", WarehouseTypeListView.as_view(), name="warehouse_type_list"),
    path("warehouses/", WarehouseListView.as_view(), name="warehouse_list"),
    path("streets/", StreetListView.as_view(), name="street_list"),
    path("create-order/", CreateOrderView.as_view(), name="create_order"),
    path("order/<str:order_code>/", OrderDetailView.as_view(), name="order_detail"),
    path("monobank/payment-status/", MonobankPaymentStatusView.as_view(), name="monobank_payment_status"),
]