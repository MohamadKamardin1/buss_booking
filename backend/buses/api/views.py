from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404
from datetime import datetime, date
from django.utils.timezone import now
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth

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
    permission_classes = [permissions.AllowAny]
    queryset = Route.objects.all()
    serializer_class = RouteSerializer


class StationListByRouteAPIView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = StationSerializer

    def get_queryset(self):
        route_id = self.kwargs['route_id']
        return Station.objects.filter(route_id=route_id).order_by('order')


class BusListByRouteAPIView(APIView):
    """
    Returns active buses for a given route and date.
    Query param: ?date=YYYY-MM-DD
    """
    permission_classes = [permissions.AllowAny]

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
    permission_classes = [permissions.AllowAny]
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


class UserBookingsAPIView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True,
            "data": serializer.data,
        })


class AdminStatsAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        today = date.today()

        # Total Users count
        total_users = CustomUser.objects.count()

        # Total bookings count
        total_bookings = Booking.objects.count()

        # Total spent on all confirmed bookings
        total_spent_agg = Booking.objects.filter(status='confirmed').aggregate(total_spent=Sum('total_price'))
        total_spent = total_spent_agg.get('total_spent') or 0

        # Active buses count
        active_buses = Bus.objects.filter(status='active').count()

        # Active routes count
        active_routes = Route.objects.count()

        # Monthly stats for bookings count and revenue over last 6 months
        last_6_months = now().date().replace(day=1)
        monthly_stats_query = (
            Booking.objects
            .filter(booking_date__gte=last_6_months)
            .annotate(month=TruncMonth('booking_date'))
            .values('month')
            .annotate(
                bookings=Count('id'),
                revenue=Sum('total_price')
            )
            .order_by('month')
        )
        # Format chart data
        chart_data = []
        for stat in monthly_stats_query:
            chart_data.append({
                'month': stat['month'].strftime('%b'),
                'bookings': stat['bookings'],
                'revenue': stat['revenue'] or 0,
            })

        # All bookings, latest first, serialized
        all_bookings = Booking.objects.all().order_by('-travel_date')
        serializer = BookingSerializer(all_bookings, many=True)

        data = {
            'totalUsers': total_users,
            'totalBookings': total_bookings,
            'totalSpent': float(total_spent),
            'activeBuses': active_buses,
            'activeRoutes': active_routes,
            'chartData': chart_data,
            'allBookings': serializer.data,
        }

        return Response({
            'success': True,
            'data': data,
        })


# ----- Conductor Dashboard Views -----


class ConductorBusesAPIView(generics.ListAPIView):
    """
    Returns active buses assigned to the authenticated conductor
    """
    serializer_class = BusSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role != 'conductor':
            return Bus.objects.none()
        return Bus.objects.filter(conductor=user, status='active')


class ConductorBookingsAPIView(generics.ListAPIView):
    """
    Returns bookings for buses assigned to the authenticated conductor
    """
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role != 'conductor':
            return Booking.objects.none()
        bus_ids = Bus.objects.filter(conductor=user).values_list('id', flat=True)
        return Booking.objects.filter(bus_id__in=bus_ids).order_by('-travel_date')


class UpdateBusLocationAPIView(APIView):
    """
    Updates the GPS location (latitude, longitude) of a bus assigned to the authenticated conductor
    Expects JSON body: { "latitude": float, "longitude": float }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, bus_id):
        user = request.user
        bus = get_object_or_404(Bus, id=bus_id, conductor=user)
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')

        if latitude is None or longitude is None:
            return Response({"detail": "latitude and longitude are required."},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            bus.latitude = float(latitude)
            bus.longitude = float(longitude)
            bus.save()
        except ValueError:
            return Response({"detail": "Invalid latitude or longitude."},
                            status=status.HTTP_400_BAD_REQUEST)

        return Response({"success": True, "message": "Location updated."})


class UpdateBookingStatusAPIView(APIView):
    """
    Updates the status of a booking assigned to the authenticated conductor's bus.
    Expects JSON body: { "status": "pending" | "confirmed" | "cancelled" | "completed" }
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, booking_id):
        user = request.user
        # Ensure booking belongs to a bus operated by this conductor
        bus_ids = Bus.objects.filter(conductor=user).values_list('id', flat=True)
        booking = get_object_or_404(Booking, id=booking_id, bus_id__in=bus_ids)

        status_value = request.data.get('status')
        allowed_statuses = ['pending', 'confirmed', 'cancelled', 'completed']
        if status_value not in allowed_statuses:
            return Response({"detail": f"Invalid status value. Allowed: {allowed_statuses}"},
                            status=status.HTTP_400_BAD_REQUEST)

        booking.status = status_value
        booking.save()
        return Response({"success": True, "message": "Booking status updated."})
