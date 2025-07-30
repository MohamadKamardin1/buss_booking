from django.contrib.auth import authenticate, get_user_model
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission
from rest_framework.authtoken.models import Token
from rest_framework import status, generics, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from .models import Bus, Seat, Booking
from .serializers import UserRegisterSerializer, BusSerializer, BookingSerializer, UserAdminSerializer

User = get_user_model()

# views.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Booking
from .serializers import BookingSerializer

def has_role(user, roles):
    if not user.is_authenticated:
        return False
    # Using user.role directly from custom user model
    return user.role in roles


class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and getattr(user, 'role', None) == 'admin')


# ---------- Existing Views ----------

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response({'token': token.key}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({'token': token.key, 'user_id': user.id}, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class BusListCreateView(generics.ListCreateAPIView):
    queryset = Bus.objects.all()
    serializer_class = BusSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        if not has_role(user, ['conductor', 'admin']):
            raise PermissionDenied("Only conductors or admins can create buses.")
        # If you want, you can assign conductors explicitly or let serializer handle them
        # Since conductors is ManyToMany, you might accept list of conductors
        serializer.save()


class BusDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Bus.objects.all()
    serializer_class = BusSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        user = self.request.user
        bus = self.get_object()
        # Allow update if admin or user is one of the conductors assigned to bus
        if not has_role(user, ['admin']) and user not in bus.conductors.all():
            raise PermissionDenied("You do not have permission to update this bus.")
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if not has_role(user, ['admin']):
            raise PermissionDenied("Only admins can delete buses.")
        instance.delete()


class BookingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = BookingSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            booking = serializer.save()
            # Update seat as booked
            seat = booking.seat
            seat.is_booked = True
            seat.save()
            return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserBookingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        if request.user.id != user_id:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        bookings = Booking.objects.filter(user_id=user_id)
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)


# ---------- Admin Dashboard Views ----------

class AdminBusViewSet(viewsets.ModelViewSet):
    queryset = Bus.objects.all()
    serializer_class = BusSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]


class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserAdminSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]


class AdminBookingListView(generics.ListAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]



class UserBookingsViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Filter bookings where user ID matches the URL parameter
        user_id = self.kwargs.get('user_id')
        return Booking.objects.filter(user__id=user_id)
