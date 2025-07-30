from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Bus, Seat, Booking
from rest_framework import serializers
from .models import Booking 
User = get_user_model()

# User registration serializer with role assignment
class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=User._meta.get_field('role').choices, write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role']

    def create(self, validated_data):
        role = validated_data.pop('role')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=role  # Set role directly on user model
        )
        return user


# Serialize Seat
class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = ['id', 'seat_number', 'is_booked']


# Summary serializer for Bus inside other serializers
class BusSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Bus
        fields = ['bus_name', 'number', 'origin', 'destination']


# Serializer for User to display conductors
class ConductorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']


# Full Bus serializer with many conductors
class BusSerializer(serializers.ModelSerializer):
    seats = SeatSerializer(many=True, read_only=True)

    # ManyToMany conductors - read as list of usernames, write as list of user IDs
    conductors = ConductorSerializer(many=True, read_only=True)
    conductor_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.filter(role='conductor'),
        source='conductors',
        write_only=True,
        required=False,
        allow_empty=True,
    )

    class Meta:
        model = Bus
        fields = [
            'id',
            'bus_name',
            'number',
            'origin',
            'destination',
            'features',
            'start_time',
            'reach_time',
            'no_of_seats',
            'price',
            'current_location',
            'route_info',
            'conductors',
            'conductor_ids',
            'seats',
        ]

    def update(self, instance, validated_data):
        # Handle conductors update explicitly
        conductors = validated_data.pop('conductors', None)
        if conductors is not None:
            instance.conductors.set(conductors)
        return super().update(instance, validated_data)

    def create(self, validated_data):
        conductors = validated_data.pop('conductors', [])
        bus = super().create(validated_data)
        bus.conductors.set(conductors)
        return bus


# Booking serializer
class BookingSerializer(serializers.ModelSerializer):
    bus = BusSummarySerializer(read_only=True)
    seat = SeatSerializer(read_only=True)
    user = serializers.StringRelatedField(read_only=True)
    price = serializers.DecimalField(max_digits=8, decimal_places=2, source='bus.price', read_only=True)
    origin = serializers.CharField(source='bus.origin', read_only=True)
    destination = serializers.CharField(source='bus.destination', read_only=True)

    seat_id = serializers.PrimaryKeyRelatedField(queryset=Seat.objects.all(), write_only=True, source='seat')
    bus_id = serializers.PrimaryKeyRelatedField(queryset=Bus.objects.all(), write_only=True, source='bus')
    trip_date = serializers.DateField()

    class Meta:
        model = Booking
        fields = [
            'id', 'user', 'bus', 'bus_id', 'seat', 'seat_id', 'booking_time', 'trip_date',
            'price', 'origin', 'destination'
        ]
        read_only_fields = ['user', 'booking_time', 'bus', 'seat', 'price', 'origin', 'destination']

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user

        seat = validated_data.get('seat')
        bus = validated_data.get('bus')

        if seat.bus != bus:
            raise serializers.ValidationError("Selected seat does not belong to the selected bus.")

        existing_booking = Booking.objects.filter(seat=seat, trip_date=validated_data['trip_date']).exists()
        if existing_booking:
            raise serializers.ValidationError("This seat is already booked for the selected date.")

        booking = Booking.objects.create(**validated_data)
        return booking


class UserAdminSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=User._meta.get_field('role').choices)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']

    def update(self, instance, validated_data):
        role = validated_data.pop('role', None)
        instance = super().update(instance, validated_data)
        if role is not None:
            instance.role = role
            instance.save()
        return instance


# serializers.py


class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = '__all__'  # or list the fields you want
