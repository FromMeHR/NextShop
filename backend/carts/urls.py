from django.urls import path
from .views import CartList

app_name = "carts"

urlpatterns = [
    path("cart/", CartList.as_view(), name="cart_list"),
]