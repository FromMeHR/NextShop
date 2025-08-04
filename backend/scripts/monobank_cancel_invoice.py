import os
import sys
import django
import json
import requests
from decouple import config

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "shop.settings")
django.setup()

MONOBANK_API_URL = config("MONOBANK_API_URL")
MONOBANK_TOKEN = config("MONOBANK_TOKEN")

INVOICE_ID = "4578075H2g3Xaa1qa9ha"

def cancel_invoice():
    payload = {
        "invoiceId": INVOICE_ID,
    }

    headers = {
        "Content-Type": "application/json",
        "X-Token": MONOBANK_TOKEN,
    }

    response = requests.post(
        f"{MONOBANK_API_URL}/api/merchant/invoice/cancel", 
        headers=headers, 
        json=payload, 
        timeout=30
    )
    print("Response:", json.dumps(response.json(), indent=4, ensure_ascii=False))

if __name__ == "__main__":
    cancel_invoice()