from django.db import models
from django.core.validators import FileExtensionValidator


class DeliveryType(models.Model):
    name = models.CharField()

    def __str__(self):
        return self.name


class Operator(models.Model):
    name = models.CharField()

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