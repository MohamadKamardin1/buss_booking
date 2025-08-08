from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from datetime import datetime

from .models import CustomUser, Route, Station, Bus, Seat, Booking
from .serializers import (
    RegisterSerializer, LoginSerializer, RouteSerializer, StationSerializer,
    BusSerializer, SeatSerializer, BookingSerializer
)


class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer


class LoginView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        user = authenticate(username=username, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'role': user.role,
                'username': user.username,
            })
        return Response({"detail": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)


class RouteListAPIView(generics.ListAPIView):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer


class StationListByRouteAPIView(generics.ListAPIView):
    serializer_class = StationSerializer

    def get_queryset(self):
        route_id = self.kwargs['route_id']
        return Station.objects.filter(route_id=route_id).order_by('order')


class BusListByRouteAPIView(APIView):
    """
    Returns active buses for a given route and date.
    Query param: ?date=YYYY-MM-DD
    """
    def get(self, request, route_id):
        date_str = request.query_params.get('date')
        if not date_str:
            return Response({'detail': 'Date query parameter is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            travel_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'detail': 'Invalid date format, should be YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)

        buses = Bus.objects.filter(route_id=route_id, status='active')
        serializer = BusSerializer(buses, many=True, context={'travel_date': travel_date})
        return Response(serializer.data)


class SeatListByBusAPIView(generics.ListAPIView):
    serializer_class = SeatSerializer

    def get_queryset(self):
        bus_id = self.kwargs['bus_id']
        return Seat.objects.filter(bus_id=bus_id).order_by('seat_number')


class BookingCreateAPIView(generics.CreateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class BookingReceiptView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, receipt_id):
        booking = get_object_or_404(Booking, receipt_id=receipt_id, user=request.user)
        serializer = BookingSerializer(booking)
        # Optionally generate PDF and return as response, or just JSON here
        return Response(serializer.data)