from django.urls import path
from .views import CartList, CartDetail

app_name = "carts"

urlpatterns = [
    path("cart/summary/", CartList.as_view(), name="cart_list"),
    path("cart/update-item/<int:pk>/", CartDetail.as_view(), name="cart_detail"),
]