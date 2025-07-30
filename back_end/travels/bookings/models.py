from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings


class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('conductor', 'Conductor'),
        ('passenger', 'Passenger'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='passenger')

    def __str__(self):
        return self.username


class Bus(models.Model):
    bus_name = models.CharField(max_length=100)
    number = models.CharField(max_length=20, unique=True)
    origin = models.CharField(max_length=50)
    destination = models.CharField(max_length=50)
    features = models.TextField(blank=True)
    start_time = models.TimeField()
    reach_time = models.TimeField()
    no_of_seats = models.PositiveBigIntegerField()
    price = models.DecimalField(max_digits=8, decimal_places=2)

    # Fields for conductor updates
    current_location = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Current location e.g., Km 12 on highway X"
    )
    route_info = models.TextField(
        blank=True,
        null=True,
        help_text="Optional route info or notes"
    )

    # ManyToMany for multiple conductors - use your custom user model here
    conductors = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        limit_choices_to={'role': 'conductor'},
        blank=True,
        related_name='buses',
        help_text="Conductors assigned to this bus"
    )

    def __str__(self):
        return f"{self.bus_name} {self.number}"


class Seat(models.Model):
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name='seats')
    seat_number = models.CharField(max_length=10)
    is_booked = models.BooleanField(default=False)

    class Meta:
        unique_together = ('bus', 'seat_number')

    def __str__(self):
        return f"{self.bus.number} - Seat {self.seat_number}"


class Booking(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE)
    seat = models.ForeignKey(Seat, on_delete=models.CASCADE)
    booking_time = models.DateTimeField(auto_now_add=True)
    trip_date = models.DateField(help_text="Date of the trip for booking")

    def __str__(self):
        return (f"{self.user.username} - Bus {self.bus.bus_name} "
                f"{self.bus.start_time} to {self.bus.reach_time} - Seat {self.seat.seat_number} on {self.trip_date}")

    @property
    def price(self):
        return self.bus.price

    @property
    def origin(self):
        return self.bus.origin

    @property
    def destination(self):
        return self.bus.destination


class BusLocationUpdate(models.Model):
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name='location_updates')
    location = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

    conductor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        limit_choices_to={'role': 'conductor'},
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    def __str__(self):
        return f"{self.bus.number} at {self.location} on {self.timestamp}"
