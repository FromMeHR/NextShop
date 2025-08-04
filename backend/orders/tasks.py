from celery import shared_task
from celery.exceptions import SoftTimeLimitExceeded
from datetime import timedelta
from django.utils import timezone
from django.db import transaction
from django.db.models import Q

from orders.models import Order, Payment
from products.models import Product


@shared_task(soft_time_limit=300, time_limit=330)
def check_expired_orders():
    try:
        with transaction.atomic():
            now = timezone.now()
            easypay_grace = now - timedelta(minutes=10)
            expired_orders = (
                Order.objects
                .select_related("payment")
                .prefetch_related("order_items__product")
                .select_for_update(of=("self", "payment"))
                .exclude(payment=None).exclude(order_items=None)
                .filter(status=Order.AWAITING_PAYMENT)
                .filter(
                    (
                        Q(payment__name=Payment.EASYPAY, payment__expires_at__lt=easypay_grace)
                    ) |
                    (
                        ~Q(payment__name=Payment.EASYPAY) & Q(payment__expires_at__lt=now)
                    )
                )
                .filter(
                    ~Q(payment__status=Payment.SUCCESS),
                    ~Q(payment__status=Payment.PROCESSING)
                )
            )

            for order in expired_orders:
                product_ids = [item.product.id for item in order.order_items.all() if item.product]
                products = {
                    product.id: product for product in Product.objects
                    .prefetch_related("categories")
                    .select_for_update()
                    .filter(id__in=product_ids)
                }

                for item in order.order_items.all():
                    product = products.get(item.product.id)
                    product.quantity_in_orders = max(product.quantity_in_orders - item.quantity, 0)
                    product.save()

                order.status = Order.PAYMENT_DECLINED
                order.save()

                payment = order.payment
                payment.status = Payment.EXPIRED
                payment.save()
    except SoftTimeLimitExceeded:
        pass