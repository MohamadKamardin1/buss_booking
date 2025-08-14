import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Calendar, MapPin, CreditCard, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Booking {
  id: string;
  receipt_id: string;
  travelDate: string;    // ISO string
  bookingDate: string;   // ISO string
  status: string;        // e.g. confirmed, cancelled, completed
  seats: string[];       // seat numbers
  passengerInfo: any[];  // passenger details
  totalPrice: number;    // total price in TSh
}

export const UserDashboard: React.FC = () => {
  const { user, token } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load bookings from API
  useEffect(() => {
    if (!user || !token) {
      setError('User is not authenticated');
      setIsLoading(false);
      return;
    }

    const loadUserBookings = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('http://127.0.0.1:8000/api/user/bookings/', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Error loading bookings: ${response.status} - ${text}`);
        }

        const data = await response.json();

        if (data.success) {
          setBookings(data.data || []);
        } else {
          setError(data.message || 'Failed to load bookings');
        }
      } catch (err: any) {
        setError(err.message || 'Network or server error');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserBookings();
  }, [user, token]);

  // Normalize current date to midnight for accurate date comparisons
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter upcoming bookings: travelDate >= today AND NOT cancelled
  const upcomingBookings = bookings.filter((b) => {
    const travelDate = new Date(b.travelDate);
    travelDate.setHours(0, 0, 0, 0);
    return travelDate >= today && b.status !== 'cancelled';
  });

  // Filter past bookings: travelDate < today OR completed status
  const pastBookings = bookings.filter((b) => {
    const travelDate = new Date(b.travelDate);
    travelDate.setHours(0, 0, 0, 0);
    return travelDate < today || b.status === 'completed';
  });

  // Calculate total spent: sum totalPrice of non-cancelled bookings
  const totalSpent = bookings.reduce((acc, b) => {
    if (b.status !== 'cancelled') {
      return acc + (Number(b.totalPrice) || 0);
    }
    return acc;
  }, 0);

  // Status color helper for badges
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      case 'completed':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  // Placeholder handlers — replace with real navigation/actions
  const handleBookFirstTrip = () => {
    console.log('Navigate to booking page');
  };
  const handleViewDetails = (bookingId: string) => {
    console.log('View details for booking:', bookingId);
  };
  const handleCancelBooking = (bookingId: string) => {
    console.log('Cancel booking:', bookingId);
  };
  const handleViewReceipt = (bookingId: string) => {
    console.log('View receipt for booking:', bookingId);
  };
  const handleBookAgain = (bookingId: string) => {
    console.log('Book again based on booking:', bookingId);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                Welcome back, {user?.firstName || user?.username || 'User'}!
              </h2>
              <p className="text-muted-foreground">
                Manage your bus bookings and travel history
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold">{upcomingBookings.length}</div>
              <div className="text-sm text-muted-foreground">Upcoming Trips</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <MapPin className="h-8 w-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold">{bookings.length}</div>
              <div className="text-sm text-muted-foreground">Total Bookings</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-purple-600" />
            <div>
              <div className="text-2xl font-bold">{totalSpent.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Spent (TSh)</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>My Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming">Upcoming ({upcomingBookings.length})</TabsTrigger>
              <TabsTrigger value="past">Past ({pastBookings.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="mt-6">
              {isLoading ? (
                <div className="text-center py-8">Loading bookings...</div>
              ) : upcomingBookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No upcoming bookings</p>
                  <Button onClick={handleBookFirstTrip}>Book Your First Trip</Button>
                </div>
              ) : (
                upcomingBookings.map((booking) => (
                  <Card key={booking.id} className="hover:shadow-md transition-shadow mb-4">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="font-medium mb-1">Booking #{booking.receipt_id}</div>
                          <div className="text-sm text-muted-foreground">
                            Travel Date: {new Date(booking.travelDate).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge variant={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Seats:</span>
                          <div className="font-medium">{booking.seats.join(', ')}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Passengers:</span>
                          <div className="font-medium">{booking.passengerInfo?.length || 0}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Amount:</span>
                          <div className="font-medium">
                            TSh {booking.totalPrice?.toLocaleString() || 0}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Booked:</span>
                          <div className="font-medium">{new Date(booking.bookingDate).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" onClick={() => handleViewDetails(booking.id)}>
                          View Details
                        </Button>
                        {booking.status === 'confirmed' && (
                          <Button size="sm" variant="outline" onClick={() => handleCancelBooking(booking.id)}>
                            Cancel Booking
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="past" className="mt-6">
              {isLoading ? (
                <div className="text-center py-8">Loading bookings...</div>
              ) : pastBookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No past bookings</p>
                </div>
              ) : (
                pastBookings.map((booking) => (
                  <Card key={booking.id} className="mb-4">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="font-medium mb-1">Booking #{booking.receipt_id}</div>
                          <div className="text-sm text-muted-foreground">
                            Travel Date: {new Date(booking.travelDate).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge variant={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Seats:</span>
                          <div className="font-medium">{booking.seats.join(', ')}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Passengers:</span>
                          <div className="font-medium">{booking.passengerInfo?.length || 0}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Amount:</span>
                          <div className="font-medium">
                            TSh {booking.totalPrice?.toLocaleString() || 0}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Booked:</span>
                          <div className="font-medium">{new Date(booking.bookingDate).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" onClick={() => handleViewReceipt(booking.id)}>
                          View Receipt
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleBookAgain(booking.id)}>
                          Book Again
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Display error if any */}
      {error && (
        <div className="text-center text-red-600 font-medium">{error}</div>
      )}
    </div>
  );
};
