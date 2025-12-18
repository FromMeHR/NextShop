import requests
import json
import base64
import hashlib
from ipware import get_client_ip
from decouple import config
from datetime import timedelta
from pytz import timezone as tz
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from django.db import transaction
from django.db.models import Q
from django.utils.crypto import get_random_string
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ValidationError
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import (
    NovaPoshtaCity,
    NovaPoshtaWarehouse,
    WarehouseType,
    NovaPoshtaStreet,
    Payment,
    Order, 
    OrderItem
)
from carts.models import Cart, CartItem
from products.models import Product
from .serializers import (
    NovaPoshtaCitySerializer,
    WarehouseTypeSerializer,
    NovaPoshtaWarehouseSerializer,
    NovaPoshtaStreetSerializer,
    OrderDetailSerializer
)
from shop.throttling import CreateOrderThrottle


class SearchCityView(ListAPIView):
    queryset = NovaPoshtaCity.objects.all().order_by("position")
    serializer_class = NovaPoshtaCitySerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        search_query = self.request.query_params.get("name")
        if search_query and len(search_query) > 1:
            queryset = queryset.filter(
                Q(name_ukr__icontains=search_query) | 
                Q(name_ru__icontains=search_query)
            )
            return queryset[:50]


class WarehouseTypeListView(APIView):
    def get(self, request):
        city_ref = request.query_params.get("city_ref")
        if not city_ref:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        city = NovaPoshtaCity.objects.filter(ref=city_ref).exists()
        if not city:
            return Response(status=status.HTTP_404_NOT_FOUND)

        warehouses = NovaPoshtaWarehouse.objects.filter(city__ref=city_ref)
        warehouse_type_ids = warehouses.values_list(
            "type_id", flat=True
        ).distinct()
        warehouse_types = WarehouseType.objects.filter(
            id__in=warehouse_type_ids
        ).order_by("id")
        if NovaPoshtaStreet.objects.filter(city__ref=city_ref).exists():
            courier_type = WarehouseType.objects.filter(
                delivery_type_id=2, operator_id=1
            )
            warehouse_types = warehouse_types | courier_type

        serializer = WarehouseTypeSerializer(warehouse_types, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class WarehouseListView(APIView):
    def get(self, request):
        city_ref = request.query_params.get("city_ref")
        warehouse_type_ref = request.query_params.get("warehouse_type_ref")
        if not city_ref or not warehouse_type_ref:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        city = NovaPoshtaCity.objects.filter(ref=city_ref).first()
        warehouse_type = WarehouseType.objects.filter(
            ref=warehouse_type_ref
        ).first()
        if not city or not warehouse_type:
            return Response(status=status.HTTP_404_NOT_FOUND)

        warehouses = NovaPoshtaWarehouse.objects.filter(
            city=city, type=warehouse_type
        ).order_by("name_ukr")

        serializer = NovaPoshtaWarehouseSerializer(warehouses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class StreetListView(APIView):
    def get(self, request):
        city_ref = request.query_params.get("city_ref")
        if not city_ref:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        city = NovaPoshtaCity.objects.filter(ref=city_ref).first()
        if not city:
            return Response(status=status.HTTP_404_NOT_FOUND)

        streets = NovaPoshtaStreet.objects.filter(city=city)
        serializer = NovaPoshtaStreetSerializer(streets, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CreateOrderView(APIView):
    throttle_classes = [CreateOrderThrottle]

    def post(self, request):
        data = request.data
        required_fields = [
            "surname", "name", "email", "formatted_number",
            "selected_city_ref", "selected_warehouse_type_id", "selected_payment_method"
        ]
        for field in required_fields:
            if not data.get(field):
                return Response(status=status.HTTP_400_BAD_REQUEST)

        if not data.get("selected_warehouse_ref") and not data.get("selected_street_ref"):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        if data.get("selected_street_ref"):
            if not data.get("house") or not data.get("apartment"):
                return Response(status=status.HTTP_400_BAD_REQUEST)

        if data.get("selected_payment_method") not in [
            Payment.EASYPAY, Payment.PLATA_BY_MONO
        ]:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            city = get_object_or_404(NovaPoshtaCity, ref=data.get("selected_city_ref"))
            try:
                warehouse_type = get_object_or_404(WarehouseType, id=int(data.get("selected_warehouse_type_id")))
            except (ValueError, TypeError):
                return Response(status=status.HTTP_400_BAD_REQUEST)
            if data.get("selected_warehouse_ref"):
                warehouse = get_object_or_404(NovaPoshtaWarehouse, ref=data.get("selected_warehouse_ref"))
            if data.get("selected_street_ref"):
                street = get_object_or_404(NovaPoshtaStreet, ref=data.get("selected_street_ref"))

            cart_code = request.COOKIES.get("cart_code")
            if not cart_code:
                raise ValidationError("")

            cart = Cart.objects.filter(cart_code=cart_code).first()
            if not cart:
                raise ValidationError("")

            cart_items = CartItem.objects.filter(cart=cart)
            if not cart_items.exists():
                raise ValidationError("")

            apartment_str = data.get("apartment")
            if apartment_str:
                if not data.get("apartment").isdigit():
                    raise ValidationError("")
                apartment = int(apartment_str)
            else:
                apartment = None

            order = Order.objects.create(
                order_code=get_random_string(36),
                secret_key=get_random_string(36),
                user=request.user if request.user.is_authenticated else None,
                delivery_user_name=data.get("name"),
                delivery_user_surname=data.get("surname"),
                delivery_user_email=data.get("email"),
                delivery_user_phone=data.get("formatted_number"),
                delivery_city=city.name_ukr,
                delivery_warehouse_type=warehouse_type,
                delivery_warehouse=warehouse.name_ukr if data.get("selected_warehouse_ref") else None,
                delivery_street=street.name if data.get("selected_street_ref") else None,
                delivery_house=data.get("house"),
                delivery_apartment=apartment,
                delivery_notes=data.get("comment"),
            )

            total_price, total_quantity, total_weight = 0, 0, 0

            product_ids = [item.product.id for item in cart_items if item.product]
            products = {
                product.id: product for product in Product.objects
                .prefetch_related("categories")
                .select_for_update()
                .filter(id__in=product_ids)
            }

            for item in cart_items:
                product = products.get(item.product.id)
                if item.quantity > product.quantity:
                    raise ValidationError(
                        f"Товар «{product.name}» недоступний у потрібній кількості."
                    )
                if product.quantity_in_orders + item.quantity > product.quantity:
                    raise ValidationError(
                        f"Товар «{product.name}» замовляється багатьма користувачами. Спробуйте пізніше."
                    )
                OrderItem.objects.create(order=order, product=product, quantity=item.quantity)
                product.quantity_in_orders += item.quantity
                product.save()

                total_price += product.price * item.quantity
                total_quantity += item.quantity
                total_weight += product.weight * item.quantity

            order.total_price = total_price
            order.total_quantity = total_quantity
            order.total_weight = total_weight

            redirect_url = (
                f"http://{config("ALLOWED_ENV_HOST")}/profile/user-info" 
                if request.user.is_authenticated 
                else f"http://{config("ALLOWED_ENV_HOST")}/order/{order.order_code}"
            )
            host = (
                config("NGROK_BACKEND_HOST")
                if config("NGROK_BACKEND_HOST")
                else config("ALLOWED_ENV_HOST")
            )

            if data.get("selected_payment_method") == Payment.PLATA_BY_MONO:
                monobank_token = config("MONOBANK_TOKEN")
                monobank_url = config("MONOBANK_API_URL")

                basket_order = []
                for item in cart_items:
                    product = item.product
                    price_uah_cents = int(product.price * 100)
                    total = price_uah_cents * item.quantity
                    img = product.image
                    if img and hasattr(img, 'url') and request and config("DEBUG", cast=bool) == False:
                        icon = request.build_absolute_uri(img.url)
                    elif img and hasattr(img, 'url') and config("NGROK_BACKEND_HOST"):
                        icon = f"https://{config("NGROK_BACKEND_HOST")}{img.url}"
                    else:
                        icon = None
                    basket_order.append({
                        "name": product.name,
                        "qty": item.quantity,
                        "sum": price_uah_cents,
                        "total": total,
                        "icon": icon,
                        "code": str(product.id),
                        "header": product.name,
                    })

                web_hook_url = f"https://{host}/api/monobank/payment-status/?secret_key={order.secret_key}"

                payload = {
                    "amount": int(order.total_price * 100), # копійки
                    "ccy": 980,
                    "merchantPaymInfo": {
                        "reference": str(order.order_code),
                        "destination": f"Оплата за замовлення №{order.id} від {order.created_at.strftime("%d.%m.%Y")}",
                        "comment": f"Оплата за замовлення №{order.id} від {order.created_at.strftime("%d.%m.%Y")}",
                        "basketOrder": basket_order,
                    },
                    "redirectUrl": redirect_url,
                    "webHookUrl": web_hook_url,
                    "validity": 600,
                    "paymentType": None,
                    "agentFeePercent": 0,
                    "displayType": None,
                }

                headers = {
                    "Content-Type": "application/json",
                    "X-Token": monobank_token
                }

                try:
                    response = requests.post(
                        f"{monobank_url}/api/merchant/invoice/create", 
                        json=payload,
                        headers=headers,
                        timeout=30,
                    )
                    result = response.json()
                except Exception:
                    raise ValidationError("Помилка створення рахунку Monobank. Спробуйте пізніше.")

                if response.status_code != 200 or not result.get("invoiceId") or not result.get("pageUrl"):
                    raise ValidationError("Помилка ініціалізації рахунку Monobank. Спробуйте пізніше.")

                payment = Payment.objects.create(
                    name=Payment.PLATA_BY_MONO,
                    forward_url=result.get("pageUrl"),
                    status=Payment.CREATED,
                    expires_at=order.created_at + timedelta(minutes=10),
                )
                order.payment = payment
                order.save()
            elif data.get("selected_payment_method") == Payment.EASYPAY:
                easypay_url = config("EASYPAY_API_URL")
                easypay_partner_key = config("EASYPAY_PARTNER_KEY")
                easypay_service_key = config("EASYPAY_SERVICE_KEY")
                easypay_secret_key = config("EASYPAY_SECRET_KEY")
                easypay_locale = config("EASYPAY_LOCALE")

                create_app_headers = {
                    "Content-Type": "application/json",
                    "PartnerKey": easypay_partner_key,
                    "locale": easypay_locale,
                }

                try:
                    app_resp = requests.post(
                        f"{easypay_url}/api/system/createApp",
                        headers=create_app_headers,
                        timeout=30
                    )
                    app_data = app_resp.json()
                except Exception:
                    raise ValidationError("Помилка створення сесії Easypay. Спробуйте пізніше.")

                app_id = app_data.get("appId")
                page_id = app_data.get("pageId")

                if not app_id or not page_id:
                    raise ValidationError("Помилка ініціалізації EasyPay. Спробуйте пізніше.")

                notify_url = f"https://{host}/api/easypay/payment-status/?secret_key={order.secret_key}"
                expire_date = (order.created_at + timedelta(minutes=10)).isoformat()

                order_payload = {
                    "order": {
                        "serviceKey": easypay_service_key,
                        "orderId": str(order.order_code),
                        "description": f"Оплата за замовлення №{order.id} від {order.created_at.strftime("%d.%m.%Y")}",
                        "amount": float(round(order.total_price, 2)),
                        "additionalItems": {
                            "PayerEmail": data.get("email"),
                            "Merchant.UrlNotify": notify_url,
                        },
                        "expire": expire_date,
                        "isOneTimePay": True,
                        "allowedInstruments": ["Card", "GooglePay", "ApplePay"],
                    },
                    "urls": {
                        "success": redirect_url,
                        "failed": redirect_url,
                    }
                }

                json_body = json.dumps(order_payload, separators=(",", ":"))
                sign_raw = (easypay_secret_key + json_body).encode("utf-8")
                sign = base64.b64encode(hashlib.sha256(sign_raw).digest()).decode()

                create_order_headers = {
                    "Content-Type": "application/json",
                    "AppId": app_id,
                    "PageId": page_id,
                    "PartnerKey": easypay_partner_key,
                    "locale": easypay_locale,
                    "Sign": sign,
                }

                try:
                    resp = requests.post(
                        f"{easypay_url}/api/merchant/createOrder",
                        headers=create_order_headers,
                        data=json_body,
                        timeout=30,
                    )
                    result = resp.json()
                except Exception:
                    raise ValidationError("Помилка створення рахунку EasyPay. Спробуйте пізніше.")

                if resp.status_code != 200 or not result.get("forwardUrl"):
                    raise ValidationError("Помилка ініціалізації рахунку EasyPay. Спробуйте пізніше.")

                payment = Payment.objects.create(
                    name=Payment.EASYPAY,
                    forward_url=result.get("forwardUrl"),
                    status=Payment.CREATED,
                    expires_at=order.created_at + timedelta(minutes=10),
                )
                order.payment = payment
                order.save()
            else:
                raise ValidationError("Невірний спосіб оплати.")

            cart.delete()
            cart_code = get_random_string(72)
            Cart.objects.create(cart_code=cart_code)
            response = Response(
                {"forward_url": payment.forward_url, "redirect_url": redirect_url},
                status=status.HTTP_201_CREATED,
            )
            response.set_cookie(
                "cart_code",
                cart_code,
                httponly=True,
                expires=timezone.now() + timedelta(days=30),
            )
            return response


class MonobankPaymentStatusView(APIView):
    def post(self, request):
        data = request.data
        secret_key = request.query_params.get("secret_key")

        if not secret_key or not data.get("reference"):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            order = get_object_or_404(
                Order.objects
                .select_related("payment")
                .prefetch_related("order_items__product")
                .select_for_update(of=("self", "payment"))
                .exclude(payment=None).exclude(order_items=None),
                order_code=data.get("reference")
            )

            if order.secret_key != secret_key:
                raise ValidationError("")

            payment = order.payment
            product_ids = [item.product.id for item in order.order_items.all() if item.product]
            products = {
                product.id: product for product in Product.objects
                .prefetch_related("categories")
                .select_for_update()
                .filter(id__in=product_ids)
            }

            new_status = data.get("status")
            modified_date_str = data.get("modifiedDate")
            new_modified = parse_datetime(modified_date_str).astimezone(tz("UTC")) if modified_date_str else None

            if payment.modified_date and new_modified and payment.modified_date >= new_modified:
                return Response("Outdated webhook ignored", status=status.HTTP_200_OK)

            if new_status == Payment.REVERSED and payment.status == Payment.SUCCESS:
                for item in order.order_items.all():
                    product = products.get(item.product.id)
                    product.quantity = product.quantity + item.quantity
                    product.save()
                order.status = Order.DECLINED
                order.save()
                payment.status = Payment.REVERSED
                payment.modified_date = new_modified
                payment.save()
                return Response(status=status.HTTP_200_OK)

            if payment.status in [Payment.SUCCESS, Payment.REVERSED]:
                return Response("Payment already processed", status=status.HTTP_200_OK)

            if new_status == Payment.SUCCESS:
                for item in order.order_items.all():
                    product = products.get(item.product.id)
                    if order.status != Order.PAYMENT_DECLINED:
                        product.quantity_in_orders = max(product.quantity_in_orders - item.quantity, 0)
                    product.quantity = max(product.quantity - item.quantity, 0)
                    product.save()
                order.status = Order.PREPARING
                order.save()

            payment.status = new_status
            payment.modified_date = new_modified
            payment.payment_method = data.get("paymentInfo", {}).get("paymentMethod")
            payment.payment_system = data.get("paymentInfo", {}).get("paymentSystem")
            payment.transaction_id = data.get("paymentInfo", {}).get("tranId")
            payment.error_code = data.get("errCode")
            payment.error_text = data.get("failureReason")
            payment.save()
        return Response(status=status.HTTP_200_OK)


class EasyPayPaymentStatusView(APIView):
    def post(self, request):
        ip, _ = get_client_ip(request)
        if ip != config("EASYPAY_IP"):
            return Response("Invalid IP", status=status.HTTP_403_FORBIDDEN)

        try:
            raw_body = request.body.decode("utf-8")
            data = request.data
        except Exception:
            return Response("Invalid body", status=status.HTTP_400_BAD_REQUEST)

        easypay_secret_key = config("EASYPAY_SECRET_KEY")
        sign_raw = (easypay_secret_key + raw_body).encode("utf-8")
        expected_sign = base64.b64encode(hashlib.sha256(sign_raw).digest()).decode()

        provided_sign = request.headers.get("Sign")
        if not provided_sign or expected_sign != provided_sign:
            return Response("Invalid signature", status=status.HTTP_403_FORBIDDEN)

        secret_key = request.query_params.get("secret_key")
        if not secret_key or not data.get("MerchantOrderId"):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            order = get_object_or_404(
                Order.objects
                .select_related("payment")
                .prefetch_related("order_items__product")
                .select_for_update(of=("self", "payment"))
                .exclude(payment=None).exclude(order_items=None),
                order_code=data.get("MerchantOrderId")
            )

            if order.secret_key != secret_key:
                raise ValidationError("")

            payment = order.payment
            product_ids = [item.product.id for item in order.order_items.all() if item.product]
            products = {
                product.id: product for product in Product.objects
                .prefetch_related("categories")
                .select_for_update()
                .filter(id__in=product_ids)
            }

            new_status = data.get("TransactionStatus")
            modified_str = data.get("DateTime")
            new_modified = parse_datetime(modified_str).astimezone(tz("UTC")) if modified_str else None

            if payment.modified_date and new_modified and payment.modified_date >= new_modified:
                return Response("Outdated notification", status=status.HTTP_200_OK)

            if data.get("OperationType") != "Payment":
                if data.get("OperationType") == "Refund" and payment.status == Payment.SUCCESS:
                    for item in order.order_items.all():
                        product = products.get(item.product.id)
                        product.quantity = product.quantity + item.quantity
                        product.save()
                    order.status = Order.DECLINED
                    order.save()
                    payment.status = Payment.REVERSED
                    payment.modified_date = new_modified
                    payment.save()
                    return Response(status=status.HTTP_200_OK)
                raise ValidationError("")

            if payment.status in [Payment.SUCCESS, Payment.REVERSED]:
                return Response("Payment already processed", status=status.HTTP_200_OK)

            if new_status == "Accepted":
                for item in order.order_items.all():
                    product = products.get(item.product.id)
                    if order.status != Order.PAYMENT_DECLINED:
                        product.quantity_in_orders = max(product.quantity_in_orders - item.quantity, 0)
                    product.quantity = max(product.quantity - item.quantity, 0)
                    product.save()
                order.status = Order.PREPARING
                order.save()

            payment.status = Payment.SUCCESS if new_status == "Accepted" else Payment.FAILURE
            payment.modified_date = new_modified
            payment.payment_system = data.get("AdditionalItems", {}).get("Card.BrandType", "").lower()
            payment.transaction_id = str(data.get("TransactionId"))
            payment.error_code = data.get("AdditionalItems", {}).get("ErrorCode")
            payment.error_text = data.get("AdditionalItems", {}).get("ErrorMessage")
            payment.save()
        return Response(status=status.HTTP_200_OK)


class OrderDetailView(RetrieveAPIView):
    def get(self, request, order_code):
        if not order_code:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        order = get_object_or_404(Order.objects.select_related("payment"), order_code=order_code)
        serializer = OrderDetailSerializer(order, context={"request": request})
        return Response(serializer.data)