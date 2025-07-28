from django.db import models
from django.core.validators import FileExtensionValidator

from authentication.models import CustomUser
from products.models import Product


class DeliveryType(models.Model):
    name = models.CharField()

    def __str__(self):
        return self.name


class Operator(models.Model):
    name = models.CharField()
    min_delivery_price = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.name


class WarehouseType(models.Model):
    name = models.CharField()
    ref = models.CharField(null=True, blank=True)
    delivery_type = models.ForeignKey(DeliveryType, on_delete=models.SET_NULL, null=True)
    operator = models.ForeignKey(Operator, on_delete=models.SET_NULL, null=True)
    image = models.FileField(
        upload_to="warehouse_images/",
        validators=[FileExtensionValidator(allowed_extensions=["svg"])],
        blank=True,
        null=True,
    )

    def __str__(self):
        return self.name


class NovaPoshtaCity(models.Model):
    name_ukr = models.CharField()
    name_ru = models.CharField()
    ref = models.CharField()
    area = models.CharField()
    position = models.PositiveIntegerField()

    def __str__(self):
        return self.name_ukr


class NovaPoshtaWarehouse(models.Model):
    name_ukr = models.CharField()
    name_ru = models.CharField()
    ref = models.CharField()
    type = models.ForeignKey(WarehouseType, on_delete=models.SET_NULL, null=True)
    city = models.ForeignKey(NovaPoshtaCity, on_delete=models.SET_NULL, null=True)
    max_weight_allowed = models.PositiveIntegerField()

    def __str__(self):
        return self.name_ukr


class NovaPoshtaStreet(models.Model):
    name = models.CharField()
    ref = models.CharField()
    city = models.ForeignKey(NovaPoshtaCity, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.name


class Payment(models.Model):
    EASYPAY = "easypay"
    PLATA_BY_MONO = "plata_by_mono"
    NAME_CHOICES = [
        (EASYPAY, "EasyPay"),
        (PLATA_BY_MONO, "plata by mono"),
    ]

    CREATED = "created"
    PROCESSING = "processing"
    HOLD = "hold"
    SUCCESS = "success"
    FAILURE = "failure"
    REVERSED = "reversed"
    EXPIRED = "expired"
    STATUS_CHOICES = [
        (CREATED, "Created"),
        (PROCESSING, "Processing"),
        (HOLD, "Hold"),
        (SUCCESS, "Success"),
        (FAILURE, "Failure"),
        (REVERSED, "Reversed"),
        (EXPIRED, "Expired"),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ("pan", "PAN"),
        ("apple", "Apple Pay"),
        ("google", "Google Pay"),
        ("monobank", "Monobank"),
        ("wallet", "Wallet"),
        ("direct", "Direct"),
    ]
    
    PAYMENT_SYSTEM_CHOICES = [
        ("visa", "Visa"),
        ("mastercard", "MasterCard"),
    ]
    
    name = models.CharField(choices=NAME_CHOICES, blank=True, null=True)
    expires_at = models.DateTimeField()
    invoice_id = models.CharField()
    forward_url = models.CharField()
    status = models.CharField(choices=STATUS_CHOICES, blank=True, null=True)
    payment_method = models.CharField(choices=PAYMENT_METHOD_CHOICES, blank=True, null=True)
    payment_system = models.CharField(choices=PAYMENT_SYSTEM_CHOICES, blank=True, null=True)
    modified_date = models.DateTimeField(blank=True, null=True)
    error_code = models.PositiveSmallIntegerField(blank=True, null=True)
    error_text = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.forward_url


class Order(models.Model):
    AWAITING_PAYMENT = "awaiting_payment"
    PAYMENT_CONFIRMED = "payment_confirmed"
    PAYMENT_DECLINED = "payment_declined"
    PREPARING = "preparing"
    SENT = "sent"
    DELIVERED = "delivered"
    RECEIVED = "received"
    RETURNED = "returned"
    DECLINED = "declined"
    STATUS_CHOICES = [
        (AWAITING_PAYMENT, "Awaiting Payment"),
        (PAYMENT_CONFIRMED, "Payment Confirmed"),
        (PAYMENT_DECLINED, "Payment Declined"),
        (PREPARING, "Preparing"),
        (SENT, "Sent"),
        (DELIVERED, "Delivered"),
        (RECEIVED, "Received"),
        (RETURNED, "Returned"),
        (DECLINED, "Declined"),
    ]
    
    order_code = models.CharField(max_length=36, unique=True, blank=True, null=True)
    status = models.CharField(choices=STATUS_CHOICES, default=AWAITING_PAYMENT)
    payment = models.ForeignKey(Payment, on_delete=models.SET_NULL, null=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_quantity = models.PositiveIntegerField(default=0)
    total_weight = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, blank=True, null=True)
    delivery_user_name = models.CharField(max_length=50)
    delivery_user_surname = models.CharField(max_length=50)
    delivery_user_phone = models.CharField(max_length=30)
    delivery_user_email = models.EmailField()
    delivery_warehouse_type = models.ForeignKey(WarehouseType, on_delete=models.SET_NULL, null=True)
    delivery_city = models.CharField()
    delivery_warehouse = models.CharField(blank=True, null=True)
    delivery_street = models.CharField(blank=True, null=True)
    delivery_house = models.CharField(blank=True, null=True)
    delivery_apartment = models.PositiveIntegerField(blank=True, null=True)
    delivery_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.order_code


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name="order_items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.product.name} - {self.quantity}"