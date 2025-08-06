import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Calendar, MapPin, Clock, CreditCard, User, Settings } from 'lucide-react';
import { Booking } from '../../types';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserBookings();
    }
  }, [user]);

  const loadUserBookings = async () => {
    try {
      if (user) {
        const response = await apiService.getUserBookings(user.id);
        if (response.success) {
          setBookings(response.data);
        }
      }
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'completed': return 'outline';
      default: return 'secondary';
    }
  };

  const upcomingBookings = bookings.filter(b => 
    new Date(b.travelDate) >= new Date() && b.status !== 'cancelled'
  );
  
  const pastBookings = bookings.filter(b => 
    new Date(b.travelDate) < new Date() || b.status === 'completed'
  );

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
                Welcome back, {user?.firstName}!
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
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{upcomingBookings.length}</div>
                <div className="text-sm text-muted-foreground">Upcoming Trips</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <MapPin className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{bookings.length}</div>
                <div className="text-sm text-muted-foreground">Total Bookings</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  {bookings.reduce((sum, b) => sum + b.totalPrice, 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Spent (TSh)</div>
              </div>
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
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingBookings.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past ({pastBookings.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="mt-6">
              {isLoading ? (
                <div className="text-center py-8">Loading bookings...</div>
              ) : upcomingBookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No upcoming bookings</p>
                  <Button>Book Your First Trip</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <Card key={booking.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="font-medium mb-1">
                              {/* You would need to resolve station names from IDs */}
                              Booking #{booking.receiptId}
                            </div>
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
                            <div className="font-medium">{booking.passengerInfo.length}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Amount:</span>
                            <div className="font-medium">TSh {booking.totalPrice.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Booked:</span>
                            <div className="font-medium">
                              {new Date(booking.bookingDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                          {booking.status === 'confirmed' && (
                            <Button size="sm" variant="outline">
                              Cancel Booking
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past" className="mt-6">
              {pastBookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No past bookings</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pastBookings.map((booking) => (
                    <Card key={booking.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="font-medium mb-1">
                              Booking #{booking.receiptId}
                            </div>
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
                            <div className="font-medium">{booking.passengerInfo.length}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Amount:</span>
                            <div className="font-medium">TSh {booking.totalPrice.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Booked:</span>
                            <div className="font-medium">
                              {new Date(booking.bookingDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline">
                            View Receipt
                          </Button>
                          <Button size="sm" variant="outline">
                            Book Again
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};