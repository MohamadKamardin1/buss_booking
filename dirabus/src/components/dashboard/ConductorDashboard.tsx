import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { MapPin, Users, Bus, Navigation, CheckCircle, Clock } from 'lucide-react';
import { Booking, Bus as BusType } from '../../types';
import { apiService } from '../../services/api';
import { toast } from 'sonner';


export const ConductorDashboard: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentLocation, setCurrentLocation] = useState({ latitude: 0, longitude: 0 });
  const [selectedBus, setSelectedBus] = useState<BusType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBookings();
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      });
    }
  }, []);

  const loadBookings = async () => {
    try {
      const response = await apiService.getAllBookings();
      if (response.success) {
        setBookings(response.data);
      }
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateBusLocation = async () => {
    if (!selectedBus) {
      toast.error('Please select a bus first');
      return;
    }

    try {
      const response = await apiService.updateBusLocation(selectedBus.id, currentLocation);
      if (response.success) {
        toast.success('Bus location updated successfully');
      }
    } catch (error) {
      toast.error('Failed to update bus location');
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const response = await apiService.updateBookingStatus(bookingId, status);
      if (response.success) {
        toast.success('Booking status updated');
        loadBookings(); // Reload bookings
      }
    } catch (error) {
      toast.error('Failed to update booking status');
    }
  };

  const todayBookings = bookings.filter(b => 
    new Date(b.travelDate).toDateString() === new Date().toDateString()
  );

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center">
              <Bus className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Conductor Dashboard</h2>
              <p className="text-muted-foreground">
                Manage bus operations and passenger bookings
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{todayBookings.length}</div>
                <div className="text-sm text-muted-foreground">Today's Bookings</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{pendingBookings.length}</div>
                <div className="text-sm text-muted-foreground">Pending Bookings</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{confirmedBookings.length}</div>
                <div className="text-sm text-muted-foreground">Confirmed Bookings</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <MapPin className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  {currentLocation.latitude ? 'Active' : 'Inactive'}
                </div>
                <div className="text-sm text-muted-foreground">Location Tracking</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bookings">Manage Bookings</TabsTrigger>
          <TabsTrigger value="location">Update Location</TabsTrigger>
          <TabsTrigger value="capacity">Manage Capacity</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading bookings...</div>
              ) : todayBookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No bookings for today</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayBookings.map((booking) => (
                    <Card key={booking.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="font-medium mb-1">
                              Booking #{booking.receiptId}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {booking.passengerInfo.length} passenger(s) • Seats: {booking.seats.join(', ')}
                            </div>
                          </div>
                          <Badge variant={
                            booking.status === 'confirmed' ? 'default' :
                            booking.status === 'pending' ? 'secondary' : 'outline'
                          }>
                            {booking.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                          <div>
                            <span className="text-muted-foreground">Primary Contact:</span>
                            <div className="font-medium">{booking.passengerInfo[0]?.name}</div>
                            <div className="text-xs">{booking.passengerInfo[0]?.phone}</div>
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

                        {booking.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                            >
                              Confirm Booking
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                            >
                              Cancel Booking
                            </Button>
                          </div>
                        )}

                        {booking.status === 'confirmed' && (
                          <Button 
                            size="sm" 
                            onClick={() => updateBookingStatus(booking.id, 'completed')}
                          >
                            Mark as Completed
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Update Bus Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Latitude</Label>
                  <Input 
                    value={currentLocation.latitude} 
                    onChange={(e) => setCurrentLocation(prev => ({
                      ...prev,
                      latitude: parseFloat(e.target.value) || 0
                    }))}
                    placeholder="Enter latitude"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Longitude</Label>
                  <Input 
                    value={currentLocation.longitude}
                    onChange={(e) => setCurrentLocation(prev => ({
                      ...prev,
                      longitude: parseFloat(e.target.value) || 0
                    }))}
                    placeholder="Enter longitude"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition((position) => {
                        setCurrentLocation({
                          latitude: position.coords.latitude,
                          longitude: position.coords.longitude,
                        });
                        toast.success('Location detected successfully');
                      });
                    }
                  }}
                  variant="outline"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Get Current Location
                </Button>
                <Button onClick={updateBusLocation}>
                  Update Bus Location
                </Button>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Current Location</h4>
                <p className="text-sm text-muted-foreground">
                  Lat: {currentLocation.latitude.toFixed(6)}, 
                  Lng: {currentLocation.longitude.toFixed(6)}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capacity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage Bus Capacity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    Capacity management features will be available here
                  </p>
                  <p className="text-sm text-muted-foreground">
                    API Integration Point: Update available seats, manage bus status
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};