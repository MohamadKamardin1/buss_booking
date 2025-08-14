from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    RouteListAPIView,
    StationListByRouteAPIView,
    BusListByRouteAPIView,
    SeatListByBusAPIView,
    BookingCreateAPIView,
    BookingReceiptView,
    UserBookingsAPIView,
    AdminStatsAPIView,
    ConductorBusesAPIView,
    ConductorBookingsAPIView,
    UpdateBusLocationAPIView,
    UpdateBookingStatusAPIView,

)

urlpatterns = [
    # Authentication
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),

    # Routes & Stations
    path('routes/', RouteListAPIView.as_view(), name='route-list'),
    path('routes/<int:route_id>/stations/', StationListByRouteAPIView.as_view(), name='station-list-by-route'),

    # Buses & Seats
    path('buses/route/<int:route_id>/', BusListByRouteAPIView.as_view(), name='bus-list-by-route'),
    path('buses/<int:bus_id>/seats/', SeatListByBusAPIView.as_view(), name='seat-list-by-bus'),

    # Bookings
    path('bookings/', BookingCreateAPIView.as_view(), name='booking-create'),
    path('user/bookings/', UserBookingsAPIView.as_view(), name='user-bookings'),


    path('bookings/<str:receipt_id>/receipt/', BookingReceiptView.as_view(), name='booking-receipt'),
    path('admin/stats/', AdminStatsAPIView.as_view(), name='admin-stats'),




    path('conductor/buses/', ConductorBusesAPIView.as_view(), name='conductor-buses'),
    path('conductor/bookings/', ConductorBookingsAPIView.as_view(), name='conductor-bookings'),
    path('buses/<int:bus_id>/location/', UpdateBusLocationAPIView.as_view(), name='update-bus-location'),
    path('bookings/<int:booking_id>/status/', UpdateBookingStatusAPIView.as_view(), name='update-booking-status'),

]

