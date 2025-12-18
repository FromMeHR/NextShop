from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    UserViewSet,
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView
)

app_name = "authentication"

router = DefaultRouter()
router.register("users", UserViewSet)

urlpatterns = [
    path("auth/", include(router.urls)),
    path("auth/jwt/create/", TokenObtainPairView.as_view(), name="jwt_create"),
    path("auth/jwt/refresh/", TokenRefreshView.as_view(), name="jwt_refresh"),
    path("auth/jwt/logout/", TokenBlacklistView.as_view(), name="jwt_blacklist"),
]