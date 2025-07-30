from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView,
    LoginView,
    BusListCreateView,
    UserBookingView,
    BookingView,
    BusDetailView,
    AdminBusViewSet,
    AdminUserViewSet,
    AdminBookingListView,
)
from .views import UserBookingsViewSet


# DRF router for admin viewsets (CRUD)
router = DefaultRouter()
router.register(r'admin/buses', AdminBusViewSet, basename='admin-buses')
router.register(r'admin/users', AdminUserViewSet, basename='admin-users')
router.register(r'user/(?P<user_id>\d+)/bookings', UserBookingsViewSet, basename='user-bookings')
urlpatterns = [
    # Bus endpoints for regular users
    path('buses/', BusListCreateView.as_view(), name='bus-list-create'),
    path('buses/<int:pk>/', BusDetailView.as_view(), name='bus-detail'),

    # Authentication
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),

    # Booking endpoints for users
    path('users/<int:user_id>/bookings/', UserBookingView.as_view(), name='user-bookings'),
    path('bookings/', BookingView.as_view(), name='booking-create'),

    # Admin specific bookings list view
    path('admin/bookings/', AdminBookingListView.as_view(), name='admin-bookings'),

    # Include all admin viewset routes
    path('', include(router.urls)),
]
