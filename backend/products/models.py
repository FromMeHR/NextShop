import random
from django.db import models
from slugify import slugify
from django.core.validators import FileExtensionValidator
from mptt.models import MPTTModel, TreeForeignKey


class Category(MPTTModel):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True, blank=True, null=True)
    image = models.ImageField(
        upload_to="categories_images/",
        validators=[FileExtensionValidator(allowed_extensions=["jpeg", "png", "jpg"])],
        blank=True,
        null=True
    )
    parent = TreeForeignKey("self", on_delete=models.CASCADE, null=True, blank=True, related_name="children")

    class MPTTMeta:
        pass

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["parent", "name"],
                name="unique_category_name_per_parent"
            ),
            models.CheckConstraint(
                check=models.Q(level__lte=2),
                name="max_level_2"
            )
        ]

    def __str__(self):
        return f"{self.name} (L{self.get_level()}{f" [{self.slug}]" if self.slug else ''})"


class ProductAttribute(MPTTModel):
    """
    level = 0 - category (pc)
    level = 1 - Повна назва атрибуту (Внутрішній накопичувач)
    level = 2 - Назва підатрибуту (Тип або Обсяг SSD або Бренд SSD)
    level = 3 - Назва підатрибуту з slug (SSD або 1024 ГБ або Kingston)
    """
    category = models.OneToOneField(
        Category,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="attributes",
        help_text="Категорія (pc, laptops і т.ін.), до якої відносяться атрибути"
    )
    name = models.TextField()
    slug = models.SlugField(max_length=100, blank=True, null=True)
    show_in_filters = models.BooleanField(
        default=False,
        help_text="Показувати у фільтрах"
    )
    show_in_product_details = models.BooleanField(
        default=False,
        help_text="Показувати у деталях товару"
    )
    show_in_short_info = models.BooleanField(
        default=False,
        help_text="Відображати в коротких характеристиках товару"
    )
    parent = TreeForeignKey("self", on_delete=models.CASCADE, null=True, blank=True, related_name="children")

    class MPTTMeta:
        pass

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=(
                    models.Q(level=0, category__isnull=False) |
                    models.Q(level__gt=0, category__isnull=True)
                ),
                name="category_only_on_level_0"
            ),
            models.CheckConstraint(
                check=(
                    (models.Q(show_in_filters=False) | models.Q(level=2)) &
                    (models.Q(show_in_product_details=False) | models.Q(level=2))
                ),
                name="show_in_filters_and_product_details_only_on_level_2"
            ),
            models.CheckConstraint(
                check=(
                    (models.Q(show_in_short_info=False) | models.Q(level__in=[1, 2]))
                ),
                name="show_in_short_info_only_on_level_1_or_2"
            ),
            models.CheckConstraint(
                check=(
                    models.Q(level=3, slug__isnull=False) |
                    models.Q(level__lt=3, slug__isnull=True)
                ),
                name="slug_only_on_level_3"
            ),
            models.UniqueConstraint(
                fields=["parent", "slug"],
                name="unique_attribute_slug_per_parent"
            ),
            models.CheckConstraint(
                check=models.Q(level__lte=3),
                name="max_level_3"
            )
        ]

    def __str__(self):
        category_label = f"[{self.category.slug}]" if self.category else ""
        level = self.get_level()
        parent_label = ""

        if level == 3 and self.parent_id:
            parent_name = getattr(self.parent, "name", "") 
            parent_label = f" | {parent_name}"
        return f"{category_label} {self.name} (L{level}{parent_label})"


class ProductVariantGroup(models.Model):
    internal_name = models.CharField(max_length=255, unique=True)
    public_name = models.CharField(max_length=200)

    def __str__(self):
        return self.internal_name


class ProductVariant(models.Model):
    group = models.ForeignKey(ProductVariantGroup, on_delete=models.CASCADE, related_name="variants")
    product = models.ForeignKey("Product", on_delete=models.CASCADE, related_name="variant_links")
    label = models.CharField(max_length=255)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]
        unique_together = ("group", "product")


class Product(models.Model):
    OUT_OF_STOCK = "out_of_stock"
    FEW_ITEMS_LEFT = "few_items_left"
    LOW_STOCK = "low_stock"
    IN_STOCK = "in_stock"

    code = models.CharField(max_length=50, unique=True, blank=True, null=True)
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True, null=True)
    image = models.ImageField(
        upload_to="products_images/",
        validators=[FileExtensionValidator(allowed_extensions=["jpeg", "png", "jpg"])],
    )
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    quantity = models.PositiveIntegerField(default=0)
    quantity_in_orders = models.PositiveIntegerField(default=0)
    weight = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    attributes = models.ManyToManyField(
        ProductAttribute, 
        limit_choices_to={"level": 3}, 
        related_name="products"
    )
    main_attribute = models.ForeignKey(
        ProductAttribute, 
        on_delete=models.SET_NULL, 
        null=True, 
        limit_choices_to={"level": 3},
    )
    variant_groups = models.ManyToManyField(
        ProductVariantGroup, 
        through=ProductVariant, 
        related_name="products",
        blank=True
    )

    class Meta:
        ordering = ["-id"]
        indexes = [
            models.Index(fields=["category", "price"]),
            models.Index(fields=["category", "name"]), 
        ]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.code:
            while True:
                random_code = str(random.randint(111111, 9999999))
                if not Product.objects.filter(code=random_code).exists():
                    self.code = random_code
                    break
        if not self.slug:
            base_slug = slugify(self.name)
            self.slug = base_slug
            num = 1
            while Product.objects.filter(slug=self.slug).exists():
                self.slug = f"{base_slug}-{num}"
                num += 1
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