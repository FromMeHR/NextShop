from django.urls import path
from .views import CartList, CartDetail, CartSyncView

app_name = "carts"

urlpatterns = [
    path("cart/summary/", CartList.as_view(), name="cart_list"),
    path("cart/update-item/<int:pk>/", CartDetail.as_view(), name="cart_detail"),
    path("cart/sync/", CartSyncView.as_view(), name="cart_sync"),
]