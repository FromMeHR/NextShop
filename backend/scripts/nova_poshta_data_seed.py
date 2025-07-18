import os
import sys
import django
import requests
from decouple import config

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "shop.settings")
django.setup()

from orders.models import NovaPoshtaCity, NovaPoshtaWarehouse, WarehouseType


API_URL = config("NOVA_POSHTA_API_URL")
API_KEY = config("NOVA_POSHTA_API_KEY")


def clear_database_tables():
    NovaPoshtaCity.objects.all().delete()
    NovaPoshtaWarehouse.objects.all().delete()

def fill_database_with_cities():
    response = requests.post(
        API_URL,
        json={
            "apiKey": API_KEY,
            "modelName": "AddressGeneral",
            "calledMethod": "getCities",
            "methodProperties": {},
        },
    )
    
    if response.status_code != 200 or not response.json().get("success"):
        raise Exception("Failed to fetch cities from Nova Poshta")

    cities = response.json().get("data", [])
    city_instances = []
    
    for city in cities:
        city_instances.append(
            NovaPoshtaCity(
                name_ukr=city.get("Description"),
                name_ru=city.get("DescriptionRu"),
                ref=city.get("Ref"),
                area=city.get("Area"),
                position=city.get("CityID"),
            )
        )
    NovaPoshtaCity.objects.bulk_create(city_instances)
    print(f"Added {len(city_instances)} cities.")

def fill_database_with_warehouses():
    warehouse_types = WarehouseType.objects.exclude(ref__isnull=True)
    
    for warehouse_type in warehouse_types:
        print(f"Fetching warehouses for type: {warehouse_type.name}")
        response = requests.post(
            API_URL,
            json={
                "apiKey": API_KEY,
                "modelName": "AddressGeneral",
                "calledMethod": "getWarehouses",
                "methodProperties": {"TypeOfWarehouseRef": warehouse_type.ref},
            },
        )
        
        if response.status_code != 200 or not response.json().get("success"):
            print(f"Failed to fetch warehouses for type: {warehouse_type.name}")
            continue

        warehouses = response.json().get("data", [])
        warehouse_instances = []
        
        for wh in warehouses:
            city_ref = wh.get("CityRef")
            city = NovaPoshtaCity.objects.filter(ref=city_ref).first()
            if not city:
                continue

            total_weight = float(wh.get("TotalMaxWeightAllowed") or 0)
            place_weight = float(wh.get("PlaceMaxWeightAllowed") or 0)
            max_weight = int(max(total_weight, place_weight))

            warehouse_instances.append(
                NovaPoshtaWarehouse(
                    name_ukr=wh.get("Description"),
                    name_ru=wh.get("DescriptionRu"),
                    ref=wh.get("Ref"),
                    type=warehouse_type,
                    city=city,
                    max_weight_allowed=max_weight,
                )
            )
        NovaPoshtaWarehouse.objects.bulk_create(warehouse_instances)
        print(f"Added {len(warehouse_instances)} warehouses for type: {warehouse_type.name}")


if __name__ == "__main__":
    clear_database_tables()
    fill_database_with_cities()
    fill_database_with_warehouses()