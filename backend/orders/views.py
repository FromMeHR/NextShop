from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q

from .models import NovaPoshtaCity, NovaPoshtaWarehouse, WarehouseType, NovaPoshtaStreet
from .serializers import (
    NovaPoshtaCitySerializer,
    WarehouseTypeSerializer,
    NovaPoshtaWarehouseSerializer,
    NovaPoshtaStreetSerializer
)


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

        serializer = WarehouseTypeSerializer(warehouse_types, many=True)
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