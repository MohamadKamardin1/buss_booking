import React, { useState, useEffect } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  MapPin, Users, Bus, Navigation, CheckCircle, Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';

// TypeScript interfaces matching backend fields (snake_case)
interface Booking {
  id: string;
  receipt_id: string;
  passenger_info: any[];
  seats: string[];
  status: string;
  travel_date: string;
  booking_date: string;
  total_price: number;
}

interface BusType {
  id: string;
  plate_number: string;
  latitude?: number;
  longitude?: number;
}

export const ConductorDashboard: React.FC = () => {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [buses, setBuses] = useState<BusType[]>([]);
  const [selectedBus, setSelectedBus] = useState<BusType | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number }>({ latitude: 0, longitude: 0 });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Helper: Compare two dates ignoring time
  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  useEffect(() => {
    if (!token) {
      console.warn('[ConductorDashboard] No token found, user might not be logged in.');
      setError('You must be logged in.');
      setIsLoading(false);
      return;
    }
    console.log('[ConductorDashboard] Loading buses and bookings for conductor...');
    loadBusesForConductor();
    loadBookings();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          console.log('[ConductorDashboard] Geolocation position fetched:', pos.coords);
          setCurrentLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (err) => {
          console.error('[ConductorDashboard] Failed to fetch geolocation:', err);
          toast.error('Unable to fetch location');
        }
      );
    } else {
      console.warn('[ConductorDashboard] Geolocation is not supported by this browser.');
    }
  }, [token]);

  // Updated fetch to handle raw array response for buses
  const loadBusesForConductor = async () => {
    if (!token) {
      console.error('[ConductorDashboard] No token available for loadBusesForConductor');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/conductor/buses/', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('[ConductorDashboard] Conductor buses API response status:', response.status);
      if (!response.ok) {
        const msg = `Failed to load buses: ${response.status}`;
        setError(msg);
        setBuses([]);
        console.error('[ConductorDashboard]', msg);
        return;
      }

      const data = await response.json();
      console.debug('[ConductorDashboard] Conductor buses API response JSON:', data);

      if (Array.isArray(data)) {
        setBuses(data);
        if (data.length > 0) {
          setSelectedBus(data[0]);

          const b = data[0];
          if (b.latitude !== undefined && b.longitude !== undefined) {
            setCurrentLocation({ latitude: b.latitude, longitude: b.longitude });
            console.log('[ConductorDashboard] Initial bus location set from backend:', b.latitude, b.longitude);
          }
        }
        setError(null);
      } else if (data.success) {
        setBuses(data.data);
        if (data.data.length > 0) {
          setSelectedBus(data.data[0]);

          const b = data.data[0];
          if (b.latitude !== undefined && b.longitude !== undefined) {
            setCurrentLocation({ latitude: b.latitude, longitude: b.longitude });
          }
        }
        setError(null);
      } else {
        const msg = data.message || 'Failed to load buses.';
        setError(msg);
        setBuses([]);
        console.error('[ConductorDashboard]', msg);
      }
    } catch (err: any) {
      console.error('[ConductorDashboard] Error loading buses:', err);
      setError(err.message || 'Failed to load buses.');
      setBuses([]);
    }
  };

  // Updated fetch to handle raw array response for bookings
  const loadBookings = async () => {
    if (!token) {
      console.error('[ConductorDashboard] No token available for loadBookings');
      setError('You must be logged in.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/conductor/bookings/', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('[ConductorDashboard] Conductor bookings API response status:', response.status);

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to load bookings: ${response.status} - ${text}`);
      }

      const data = await response.json();
      console.debug('[ConductorDashboard] Conductor bookings API response JSON:', data);

      if (Array.isArray(data)) {
        setBookings(data);
        setError(null);
      } else if (data.success) {
        setBookings(data.data);
        setError(null);
      } else {
        const msg = data.message || 'Failed to load bookings';
        setError(msg);
        setBookings([]);
        console.error('[ConductorDashboard]', msg);
      }
    } catch (err: any) {
      console.error('[ConductorDashboard] Error loading bookings:', err);
      setError(err.message || 'Error loading bookings');
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateBusLocation = async () => {
    if (!selectedBus) {
      toast.error('Please select a bus first');
      return;
    }
    console.log(`[ConductorDashboard] Updating location for bus ${selectedBus.id}`, currentLocation);

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/buses/${selectedBus.id}/location/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentLocation),
      });

      console.log('[ConductorDashboard] Update bus location response status:', response.status);

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to update location: ${text}`);
      }

      const data = await response.json();
      console.debug('[ConductorDashboard] Update bus location response JSON:', data);

      if (data.success) {
        toast.success('Bus location updated successfully');
        // Refresh bus list to reflect updates
        loadBusesForConductor();
      } else {
        toast.error(data.message || 'Failed to update bus location');
      }
    } catch (error) {
      console.error('[ConductorDashboard] Error updating bus location:', error);
      toast.error('Failed to update bus location');
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    console.log(`[ConductorDashboard] Updating booking ${bookingId} status to ${status}`);

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/bookings/${bookingId}/status/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      console.log('[ConductorDashboard] Update booking status response status:', response.status);

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to update booking status: ${text}`);
      }

      const data = await response.json();
      console.debug('[ConductorDashboard] Update booking status response JSON:', data);

      if (data.success) {
        toast.success('Booking status updated');
        loadBookings();
      } else {
        toast.error(data.message || 'Failed to update booking status');
      }
    } catch (error) {
      console.error('[ConductorDashboard] Error updating booking status:', error);
      toast.error('Failed to update booking status');
    }
  };

  // Filters with safe checks
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayBookings = bookings.filter((b) => {
    if (!b.travel_date) {
      console.warn('[ConductorDashboard] Booking missing travel_date:', b);
      return false;
    }
    const travelDate = new Date(b.travel_date);
    if (isNaN(travelDate.getTime())) {
      console.warn('[ConductorDashboard] Invalid travel_date format:', b.travel_date, b);
      return false;
    }
    return isSameDay(travelDate, today);
  });
  console.log('[ConductorDashboard] Filtered todayBookings count:', todayBookings.length);

  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  console.log('[ConductorDashboard] Filtered pendingBookings count:', pendingBookings.length);

  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
  console.log('[ConductorDashboard] Filtered confirmedBookings count:', confirmedBookings.length);

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
              <p className="text-muted-foreground">Manage bus operations and passenger bookings</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Clock className="h-8 w-8 text-orange-600" />
            <div>
              <div className="text-2xl font-bold">{todayBookings.length}</div>
              <div className="text-sm text-muted-foreground">Today's Bookings</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold">{pendingBookings.length}</div>
              <div className="text-sm text-muted-foreground">Pending Bookings</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold">{confirmedBookings.length}</div>
              <div className="text-sm text-muted-foreground">Confirmed Bookings</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <MapPin className="h-8 w-8 text-purple-600" />
            <div>
              <div className="text-2xl font-bold">
                {currentLocation.latitude !== 0 && currentLocation.longitude !== 0 ? 'Active' : 'Inactive'}
              </div>
              <div className="text-sm text-muted-foreground">Location Tracking</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bookings">Manage Bookings</TabsTrigger>
          <TabsTrigger value="location">Update Location</TabsTrigger>
          <TabsTrigger value="capacity">Manage Capacity</TabsTrigger>
        </TabsList>

        {/* Bookings Tab */}
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
                            <div className="font-medium mb-1">Booking #{booking.receipt_id}</div>
                            <div className="text-sm text-muted-foreground">
                              {booking.passenger_info.length} passenger(s) • Seats: {booking.seats.join(', ')}
                            </div>
                          </div>
                          <Badge
                            variant={
                              booking.status === 'confirmed'
                                ? 'default'
                                : booking.status === 'pending'
                                  ? 'secondary'
                                  : 'outline'
                            }
                          >
                            {booking.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                          <div>
                            <Label className="text-muted-foreground">Primary Contact:</Label>
                            <div className="font-medium">{booking.passenger_info[0]?.name || 'N/A'}</div>
                            <div className="text-xs">{booking.passenger_info[0]?.phone || 'N/A'}</div>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Amount:</Label>
                            <div className="font-medium">TSh {booking.total_price.toLocaleString()}</div>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Booked:</Label>
                            <div className="font-medium">{new Date(booking.booking_date).toLocaleDateString()}</div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        {booking.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => updateBookingStatus(booking.id, 'confirmed')}>
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
                          <Button size="sm" onClick={() => updateBookingStatus(booking.id, 'completed')}>
                            Mark as Completed
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              {error && <p className="text-red-600 mt-4 text-center">{error}</p>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Location Update Tab */}
        <TabsContent value="location" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Update Bus Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="mb-4">
                <Label>Select Bus</Label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={selectedBus?.id || ''}
                  onChange={(e) => {
                    const bus = buses.find((b) => b.id.toString() === e.target.value);
                    setSelectedBus(bus || null);
                    if (bus && bus.latitude !== undefined && bus.longitude !== undefined) {
                      setCurrentLocation({ latitude: bus.latitude, longitude: bus.longitude });
                      console.log('[ConductorDashboard] Bus selection changed, location set:', bus.latitude, bus.longitude);
                    }
                  }}
                >
                  <option value="" disabled>
                    Select a bus
                  </option>
                  {buses.map((bus) => (
                    <option key={bus.id} value={bus.id}>
                      {bus.plate_number}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Latitude</Label>
                  <Input
                    value={currentLocation.latitude}
                    onChange={(e) =>
                      setCurrentLocation((prev) => ({
                        ...prev,
                        latitude: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="Enter latitude"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Longitude</Label>
                  <Input
                    value={currentLocation.longitude}
                    onChange={(e) =>
                      setCurrentLocation((prev) => ({
                        ...prev,
                        longitude: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="Enter longitude"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          setCurrentLocation({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                          });
                          toast.success('Location detected successfully');
                          console.log('[ConductorDashboard] Geolocation updated location:', position.coords);
                        },
                        (err) => {
                          toast.error('Failed to detect location');
                          console.error('[ConductorDashboard] Geolocation error:', err);
                        },
                      );
                    } else {
                      toast.error('Geolocation not supported');
                      console.warn('[ConductorDashboard] Geolocation not supported');
                    }
                  }}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Get Current Location
                </Button>
                <Button onClick={updateBusLocation} disabled={!selectedBus}>
                  Update Bus Location
                </Button>
              </div>

              {error && <p className="text-red-600 mt-4">{error}</p>}

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Current Location</h4>
                <p className="text-sm text-muted-foreground">
                  Lat: {currentLocation.latitude?.toFixed(6)}, Lng: {currentLocation.longitude?.toFixed(6)}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Capacity Tab Placeholder */}
        <TabsContent value="capacity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage Bus Capacity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">Capacity management features will be available here</p>
                <p className="text-sm text-muted-foreground">
                  API Integration Point: Update available seats, manage bus status
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
