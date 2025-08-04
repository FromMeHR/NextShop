from django.db import models
from django.utils.text import slugify
from django.core.validators import FileExtensionValidator


class Category(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    OUT_OF_STOCK = "out_of_stock"
    FEW_ITEMS_LEFT = "few_items_left"
    LOW_STOCK = "low_stock"
    IN_STOCK = "in_stock"
    
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True, blank=True, null=True)
    image = models.ImageField(
        upload_to="products_images/",
        validators=[FileExtensionValidator(allowed_extensions=["jpeg", "png", "jpg"])],
    )
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    quantity = models.PositiveIntegerField(default=0)
    quantity_in_orders = models.PositiveIntegerField(default=0)
    weight = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    categories = models.ManyToManyField("Category")

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
            unique_slug = self.slug
            num = 1
            if Product.objects.filter(slug=unique_slug).exists():
                unique_slug = f"{self.slug}-{num}"
                num += 1
            self.slug = unique_slug
        super().save(*args, **kwargs)

    @property
    def stock_status(self):
        if self.quantity == 0:
            return Product.OUT_OF_STOCK
        elif self.quantity < 10:
            return Product.FEW_ITEMS_LEFT
        elif self.quantity < 20:
            return Product.LOW_STOCK
        return Product.IN_STOCK