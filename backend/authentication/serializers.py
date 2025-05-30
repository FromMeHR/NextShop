from collections import defaultdict
from djoser.conf import settings as djoser_settings
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from djoser.serializers import (
    UserCreatePasswordRetypeSerializer,
    UserSerializer,
    TokenCreateSerializer,
)
from rest_framework import serializers

from validation.validate_password import (
    validate_password_long,
    validate_password_include_symbols,
)

User = get_user_model()


class UserRegistrationSerializer(UserCreatePasswordRetypeSerializer):
    email = serializers.EmailField(
        write_only=True,
    )
    password = serializers.CharField(
        write_only=True, style={"input_type": "password"},
    )
    
    class Meta(UserCreatePasswordRetypeSerializer.Meta):
        model = User
        fields = ("email", "name", "surname", "password")
    
    def validate(self, attrs):
        custom_errors = defaultdict(list)
        self.fields.pop("re_password", None)
        re_password = attrs.pop("re_password")
        email = attrs.get("email").lower()
        password = attrs.get("password")
        if User.objects.filter(email=email).exists():
            custom_errors["email"].append("This email is already registered.")
        else:
            attrs["email"] = email
        try:
            validate_password_long(password)
        except ValidationError as error:
            custom_errors["password"].append(error.message)
        try:
            validate_password_include_symbols(password)
        except ValidationError as error:
            custom_errors["password"].append(error.message)
        if password != re_password:
            custom_errors["password"].append("Passwords do not match.")
        if custom_errors:
            raise serializers.ValidationError(custom_errors)
        return attrs
    
    def create(self, validated_data):
        user = User.objects.create(**validated_data)
        user.set_password(validated_data["password"])
        user.save()
        return user


class UserListSerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        model = User
        fields = (
            "id", 
            "email", 
            "name", 
            "surname", 
            "date_of_birth", 
            "phone",
            "is_staff",
            "is_superuser",
        )


class CustomTokenCreateSerializer(TokenCreateSerializer):
    def validate(self, attrs):
        email = attrs.get(djoser_settings.LOGIN_FIELD)
        new_attr = {"email": email, "password": attrs.get("password")}
        return super().validate(new_attr)