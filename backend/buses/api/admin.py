from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import CustomUser, Route, Station, Bus, Seat, Booking

@admin.register(CustomUser)
class CustomUserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Role info', {'fields': ('role',)}),
    )
    list_display = ('username', 'email', 'role', 'is_staff', 'is_superuser')
    list_filter = ('role',)
    search_fields = ('username', 'email')

@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ('name', 'start_location', 'end_location', 'distance', 'estimated_duration')
    list_filter = ('start_location', 'end_location')
    search_fields = ('name', 'start_location', 'end_location')
    ordering = ('name',)

@admin.register(Station)
class StationAdmin(admin.ModelAdmin):
    list_display = ('name', 'latitude', 'longitude', 'order', 'route')
    list_filter = ('route',)
    search_fields = ('name', 'route__name')
    ordering = ('route', 'order')

@admin.register(Bus)
class BusAdmin(admin.ModelAdmin):
    list_display = ('plate_number', 'route', 'capacity', 'price_per_seat', 'student_discount', 'departure_time', 'arrival_time', 'status')
    list_filter = ('route', 'status')
    search_fields = ('plate_number',)
    ordering = ('plate_number',)

@admin.register(Seat)
class SeatAdmin(admin.ModelAdmin):
    list_display = ('seat_number', 'bus', 'is_available', 'is_reserved')
    list_filter = ('bus', 'is_available', 'is_reserved')
    search_fields = ('seat_number', 'bus__plate_number')
    ordering = ('bus', 'seat_number')

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('receipt_id', 'user', 'bus', 'travel_date', 'total_price', 'status', 'booking_date')
    list_filter = ('bus', 'travel_date', 'status')
    search_fields = ('user__username', 'receipt_id', 'bus__plate_number')
    ordering = ('-booking_date',)
