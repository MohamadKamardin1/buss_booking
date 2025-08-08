from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.db.models import Count
from .models import CustomUser, Route, Station, Bus, Seat, Booking


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    class Meta:
        model = CustomUser
        fields = ('username', 'password', 'role')

    def validate_role(self, value):
        if value == 'admin':
            raise serializers.ValidationError("Cannot register as admin.")
        return value

    def create(self, validated_data):
        user = CustomUser.objects.create(
            username=validated_data['username'],
            role=validated_data['role']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class StationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Station
        fields = ['id', 'name', 'latitude', 'longitude', 'order', 'route']


class RouteSerializer(serializers.ModelSerializer):
    stations = StationSerializer(many=True, read_only=True)

    class Meta:
        model = Route
        fields = ['id', 'name', 'start_location', 'end_location', 'distance', 'estimated_duration', 'stations']


class BusSerializer(serializers.ModelSerializer):
    available_seats = serializers.SerializerMethodField()

    class Meta:
        model = Bus
        fields = [
            'id',
            'plate_number',
            'route',
            'capacity',
            'available_seats',
            'price_per_seat',
            'student_discount',
            'departure_time',
            'arrival_time',
            'status',
        ]

    def get_available_seats(self, obj):
        travel_date = self.context.get('travel_date')
        if not travel_date:
            # No date provided, assume full capacity available
            return obj.capacity

        # Count the total number of seats booked for this bus and date where booking is confirmed
        booked_seats = obj.bookings.filter(travel_date=travel_date, status='confirmed').aggregate(
            total=Count('seats')
        )['total'] or 0

        return max(0, obj.capacity - booked_seats)


class SeatSerializer(serializers.ModelSerializer):
    seatNumber = serializers.CharField(source='seat_number')
    isAvailable = serializers.BooleanField(source='is_available')
    isReserved = serializers.BooleanField(source='is_reserved')

    class Meta:
        model = Seat
        fields = ['id', 'bus', 'seatNumber', 'isAvailable', 'isReserved']   

import uuid


class BookingSerializer(serializers.ModelSerializer):
    seats = serializers.PrimaryKeyRelatedField(queryset=Seat.objects.all(), many=True)

    class Meta:
        model = Booking
        fields = [
            'id',
            'user',
            'bus',
            'travel_date',
            'seats',
            'total_price',
            'passenger_info',
            'status',
            'booking_date',
            'receipt_id',
        ]
        read_only_fields = ['id', 'status', 'booking_date', 'receipt_id', 'user']

    def create(self, validated_data):
        seats = validated_data.pop('seats')
        passenger_info = validated_data.pop('passenger_info', [])
        user = self.context['request'].user
        validated_data['user'] = user

        # Add receipt ID
        validated_data['receipt_id'] = f"RCP-{uuid.uuid4().hex[:10].upper()}"

        # Combine passenger info with seat numbers
        combined_passenger_info = []
        for i, passenger in enumerate(passenger_info):
            # Defensive: passenger_info length should correspond to seats length
            seat = seats[i] if i < len(seats) else None
            if seat:
                combined = passenger.copy()
                combined['seatId'] = seat.id
                combined['seatNumber'] = seat.seat_number  # Add human-readable seat number
                combined_passenger_info.append(combined)
            else:
                combined_passenger_info.append(passenger)  
                # Or raise error if mismatch is critical

        validated_data['passenger_info'] = combined_passenger_info

        booking = Booking.objects.create(**validated_data)
        booking.seats.set(seats)
        booking.save()
        return booking

    def validate(self, attrs):
        bus = attrs.get('bus')
        seats = attrs.get('seats')
        travel_date = attrs.get('travel_date')

        for seat in seats:
            if seat.bus_id != bus.id:
                raise serializers.ValidationError(
                    f"Seat {seat.seat_number} does not belong to bus {bus.plate_number}"
                )

            if Booking.objects.filter(
                bus=bus, travel_date=travel_date, seats=seat, status='confirmed'
            ).exists():
                raise serializers.ValidationError(
                    f"Seat {seat.seat_number} is already booked for {travel_date}"
                )

        return attrs