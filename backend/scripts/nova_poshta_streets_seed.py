import os
import sys
import django
import requests
from requests.exceptions import ReadTimeout, ConnectionError, RequestException
from decouple import config
from time import sleep

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "shop.settings")
django.setup()

from orders.models import NovaPoshtaCity, NovaPoshtaStreet


API_URL = config("NOVA_POSHTA_API_URL")
API_KEY = config("NOVA_POSHTA_API_KEY")


def clear_database_tables():
    NovaPoshtaStreet.objects.all().delete()

def fetch_streets_for_city(city, retries=5):
    for attempt in range(retries):
        try:
            response = requests.post(
                API_URL,
                json={
                    "apiKey": API_KEY,
                    "modelName": "AddressGeneral",
                    "calledMethod": "getStreet",
                    "methodProperties": {
                        "CityRef": city.ref,
                        "Limit": "200000"
                    }
                },
                timeout=30
            )
            if response.status_code == 200 and response.json().get("success"):
                return response.json().get("data", [])
            else:
                print(f"Unsuccessful response for: {city.name_ukr}")
                return []
        except (ReadTimeout, ConnectionError) as e:
            print(f"Attempt {attempt + 1}/{retries} — timeout for: {city.name_ukr}")
            sleep(2)
        except RequestException as e:
            print(f"Request error for: {city.name_ukr}: {e}")
            break
    return []

def fill_database_with_streets():
    cities = NovaPoshtaCity.objects.all().order_by("position")
    total = cities.count()
    counter = 0

    for city in cities:
        counter += 1
        print(f"{counter}/{total} Fetching streets for: {city.name_ukr}")
        streets_data = fetch_streets_for_city(city)
        street_instances = []

        for s in streets_data:
            full_name = f"{s.get('StreetsType', '').strip()} {s.get('Description', '').strip()}".strip()
            street_instances.append(
                NovaPoshtaStreet(
                    name=full_name,
                    ref=s.get("Ref"),
                    city=city
                )
            )
        if street_instances:
            NovaPoshtaStreet.objects.bulk_create(street_instances)
            print(f"Added {len(street_instances)} streets for: {city.name_ukr}")
        else:
            print(f"No streets found for: {city.name_ukr}")


if __name__ == "__main__":
    clear_database_tables()
    fill_database_with_streets()