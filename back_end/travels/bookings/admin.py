from django.contrib import admin
from .models import Bus, Seat, Booking
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth import get_user_model

CustomUser = get_user_model()

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    # Optionally customize fields to display in admin list or forms
    fieldsets = UserAdmin.fieldsets + (
        ('Role Info', {'fields': ('role',)}),  # Add your role field here
    )
    list_display = ['username', 'email', 'role', 'is_staff', 'is_superuser']
    list_filter = ['role', 'is_staff', 'is_superuser', 'is_active']


class BusAdmin(admin.ModelAdmin):
    list_display = ('bus_name', 'number', 'origin', 'destination', 'start_time', 'reach_time', 'no_of_seats', 'price')

class SeatAdmin(admin.ModelAdmin):
    list_display = ('seat_number', 'bus', 'is_booked')

class BookingAdmin(admin.ModelAdmin):
    list_display = ('user', 'bus', 'seat', 'booking_time', 'origin','price')

admin.site.register(Bus, BusAdmin)
admin.site.register(Seat, SeatAdmin)
admin.site.register(Booking, BookingAdmin)
