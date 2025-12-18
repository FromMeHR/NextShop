from django.contrib.auth import login, get_user_model
from djoser.views import UserViewSet as BaseUserViewSet
from shop.settings import DEBUG
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.views import (
    TokenObtainPairView as BaseTokenObtainPairView,
    TokenRefreshView as BaseTokenRefreshView,
)

from shop.throttling import (
    UserRegisterThrottle,
    UserResendActivationThrottle,
    UserResetPasswordThrottle,
    TokenObtainThrottle,
    TokenRefreshThrottle,
)

User = get_user_model()


class UserViewSet(BaseUserViewSet):
    def get_throttles(self):
        if self.action == "create":
            self.throttle_classes = [UserRegisterThrottle]
        elif self.action == "resend_activation":
            self.throttle_classes = [UserResendActivationThrottle]
        elif self.action == "reset_password":
            self.throttle_classes = [UserResetPasswordThrottle]
        return super().get_throttles()


class TokenObtainPairView(BaseTokenObtainPairView):
    throttle_classes = [TokenObtainThrottle]
    
    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        password = request.data.get("password")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return super().post(request, *args, **kwargs)

        if not user.is_active and user.check_password(password):
            return Response(
                {"email_not_verified": "E-mail verification required"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        response = super().post(request, *args, **kwargs)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.user

        login(request, user)

        access_token = response.data.get("access")
        refresh_token = response.data.get("refresh")

        if access_token:
            response.set_cookie(
                "access_token",
                access_token,
                httponly=True,
                secure=not DEBUG,
                samesite="Strict",
                max_age=300
            )
        if refresh_token:
            response.set_cookie(
                "refresh_token",
                refresh_token,
                httponly=True,
                secure=not DEBUG,
                samesite="Strict",
                max_age=60 * 60 * 24,
                path="/api/auth/jwt/refresh/"
            )
        return response


class TokenRefreshView(BaseTokenRefreshView):
    throttle_classes = [TokenRefreshThrottle]

    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh_token")
        if not refresh_token:
            return Response({"detail": "Refresh token not provided."}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = self.get_serializer(data={"refresh": refresh_token})
        try:
            serializer.is_valid(raise_exception=True)
        except Exception:
            return Response({"detail": "Invalid token."}, status=status.HTTP_401_UNAUTHORIZED)

        access_token = serializer.validated_data.get("access")
        new_refresh_token = serializer.validated_data.get("refresh")

        response = Response(status=status.HTTP_200_OK)
        response.set_cookie(
            "access_token",
            access_token,
            httponly=True,
            secure=not DEBUG,
            samesite="Strict",
            max_age=300
        )
        if new_refresh_token:
            response.set_cookie(
                "refresh_token",
                new_refresh_token,
                httponly=True,
                secure=not DEBUG,
                samesite="Strict",
                max_age=60 * 60 * 24,
                path="/api/auth/jwt/refresh/"
            )
        return response


class TokenBlacklistView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.COOKIES.get("refresh_token")
            token = RefreshToken(refresh_token)
            token.blacklist()
            response = Response(status=status.HTTP_200_OK)
            response.delete_cookie("access_token")
            response.delete_cookie("refresh_token", path="/api/auth/jwt/refresh/")
            return response
        except TokenError:
            return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)
        except KeyError:
            return Response({"detail": "Refresh token not provided."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({"detail": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)