from django.urls import path
from .views import (
    SearchCityView,
    WarehouseTypeListView,
    WarehouseListView,
    StreetListView,
)

app_name = "orders"

urlpatterns = [
    path("search-city/", SearchCityView.as_view(), name="search_city"),
    path("warehouse-types/", WarehouseTypeListView.as_view(), name="warehouse_type_list"),
    path("warehouses/", WarehouseListView.as_view(), name="warehouse_list"),
    path("streets/", StreetListView.as_view(), name="street_list"),
]