import os
import sys
import django
import json
import requests
import hashlib
import base64
from decouple import config

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "shop.settings")
django.setup()


EASYPAY_API_URL = config("EASYPAY_API_URL")
EASYPAY_PARTNER_KEY = config("EASYPAY_PARTNER_KEY")
EASYPAY_SERVICE_KEY = config("EASYPAY_SERVICE_KEY")
EASYPAY_SECRET_KEY = config("EASYPAY_SECRET_KEY")
EASYPAY_LOCALE = config("EASYPAY_LOCALE")

ORDER_ID = "g55gtphbE2j9r4hj8GbES3V4EzH3Zp0Cgv5j"
TRANSACTION_ID = "1552496576"
AMOUNT = "0.50"


def create_session():
    headers = {
        "Content-Type": "application/json",
        "PartnerKey": EASYPAY_PARTNER_KEY,
        "locale": EASYPAY_LOCALE
    }

    response = requests.post(
        f"{EASYPAY_API_URL}/api/system/createApp", 
        headers=headers, 
        timeout=30
    )
    data = response.json()
    return data.get("appId"), data.get("pageId")

def generate_sign(payload):
    json_body = json.dumps(payload, separators=(",", ":"))
    sign_raw = (EASYPAY_SECRET_KEY + json_body).encode("utf-8")
    return base64.b64encode(hashlib.sha256(sign_raw).digest()).decode()

def cancel_order(app_id, page_id):
    payload = {
        "serviceKey": EASYPAY_SERVICE_KEY,
        "orderId": ORDER_ID,
        "transactionId": TRANSACTION_ID,
        "amount": AMOUNT
    }

    headers = {
        "Content-Type": "application/json",
        "PartnerKey": EASYPAY_PARTNER_KEY,
        "AppId": app_id,
        "PageId": page_id,
        "locale": EASYPAY_LOCALE,
        "Sign": generate_sign(payload),
    }

    response = requests.post(
        f"{EASYPAY_API_URL}/api/merchant/cancelOrder",
        headers=headers,
        data=json.dumps(payload, separators=(",", ":")),
        timeout=30
    )
    print("Response:", json.dumps(response.json(), indent=4, ensure_ascii=False))


if __name__ == "__main__":
    app_id, page_id = create_session()
    cancel_order(app_id, page_id)