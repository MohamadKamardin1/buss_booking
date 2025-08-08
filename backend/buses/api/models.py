from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('conductor', 'Conductor'),
        ('passenger', 'Passenger'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='passenger')

    def __str__(self):
        return self.username


class Route(models.Model):
    name = models.CharField(max_length=200)
    start_location = models.CharField(max_length=100)
    end_location = models.CharField(max_length=100)
    distance = models.FloatField(help_text='Distance in km')
    estimated_duration = models.PositiveIntegerField(help_text='Estimated duration in minutes')

    def __str__(self):
        return self.name


class Station(models.Model):
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='stations')
    name = models.CharField(max_length=100)
    latitude = models.FloatField()
    longitude = models.FloatField()
    order = models.PositiveIntegerField(help_text='Order of station in route')

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.name} ({self.route.name})"


class Bus(models.Model):
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    )

    plate_number = models.CharField(max_length=20, unique=True)
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='buses')
    capacity = models.PositiveIntegerField()
    price_per_seat = models.DecimalField(max_digits=10, decimal_places=2)
    student_discount = models.PositiveIntegerField(
        default=0, help_text='Discount in percent for students'
    )
    departure_time = models.TimeField()
    arrival_time = models.TimeField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')

    def __str__(self):
        return f"{self.plate_number} ({self.route.name})"


class Seat(models.Model):
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name='seats')
    seat_number = models.CharField(max_length=10)
    # Status flags for quick checks (but actual availability should be validated on booking)
    is_available = models.BooleanField(default=True)
    is_reserved = models.BooleanField(default=False)

    def __str__(self):
        return f"Seat {self.seat_number} on Bus {self.bus.plate_number}"


class Booking(models.Model):
    STATUS_CHOICES = [
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='bookings')
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name='bookings')
    travel_date = models.DateField()
    seats = models.ManyToManyField(Seat)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    passenger_info = models.JSONField(
        default=dict,  # Add default to avoid migration issues and non-null errors
        help_text='List of passenger info dicts with seatId, name, phone, email, passengerType'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='confirmed')
    booking_date = models.DateTimeField(auto_now_add=True)  # no default here; set at migration prompt
    receipt_id = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return f"Booking {self.receipt_id} by {self.user.username}"
