import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Clock, MapPin, Users } from 'lucide-react';

interface Route {
  id: number;
  name: string;
  start_location: string;
  end_location: string;
  distance: number;
  estimated_duration: number;
}

interface Station {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  order: number;
  route: number;
}

interface Bus {
  id: number;
  plate_number: string;
  route: number;
  capacity: number;
  available_seats: number;
  price_per_seat: number;
  student_discount: number;
  departure_time: string; // time string, e.g. "08:00:00"
  arrival_time: string;   // time string, e.g. "08:45:00"
  status: 'active' | 'inactive';
}

interface BusSearchProps {
  selectedRoute: Route;
  fromStation: Station;
  toStation: Station;
  onBusSelect: (bus: Bus) => void;
}

export const BusSearch: React.FC<BusSearchProps> = ({
  selectedRoute,
  fromStation,
  toStation,
  onBusSelect,
}) => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // API base URL
  const API_BASE_URL = 'http://127.0.0.1:8000/api';

  // Fetch buses by route and date
  const searchBuses = async () => {
    if (!selectedRoute?.id) return; // no route selected

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/buses/route/${selectedRoute.id}/?date=${selectedDate}`
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        setErrorMessage(
          errData?.detail || `Failed to fetch buses (HTTP ${response.status})`
        );
        setBuses([]);
      } else {
        // The API returns an array of Bus objects
        const data: Bus[] = await response.json();
        setBuses(data);
      }
    } catch (error) {
      setErrorMessage('Network error while fetching buses');
      setBuses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedRoute) {
      searchBuses();
    } else {
      setBuses([]);
    }
  }, [selectedRoute, selectedDate]);

  // Format time string "HH:mm:ss" -> localized time string e.g. "08:00 AM"
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hours, minutes, seconds] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds || '0'));
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate ticket price based on passenger type
  const calculatePrice = (
    bus: Bus,
    passengerType: 'adult' | 'student' = 'adult'
  ) => {
    const basePrice = bus.price_per_seat;
    return passengerType === 'student'
      ? basePrice * (1 - bus.student_discount / 100)
      : basePrice;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Search Buses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Route Summary */}
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">Selected Route</span>
              </div>
              <p className="text-sm">
                {fromStation.name} → {toStation.name}
              </p>
              <p className="text-xs text-muted-foreground">
                Route: {selectedRoute.name}
              </p>
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <Label htmlFor="travelDate">Travel Date</Label>
              <Input
                id="travelDate"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <Button
              onClick={searchBuses}
              disabled={isLoading || !selectedRoute}
              className="w-full"
            >
              {isLoading ? 'Searching...' : 'Search Buses'}
            </Button>

            {errorMessage && (
              <p className="text-red-600 mt-2 text-center">{errorMessage}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bus Results */}
      <div className="space-y-4">
        {isLoading && buses.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Searching for buses...</p>
              </div>
            </CardContent>
          </Card>
        ) : buses.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No buses found for selected route and date.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          buses.map((bus) => (
            <Card key={bus.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-medium">Bus {bus.plate_number}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(bus.departure_time)} - {formatTime(bus.arrival_time)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {bus.available_seats}/{bus.capacity} seats available
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={bus.status === 'active' ? 'default' : 'secondary'}>
                      {bus.status}
                    </Badge>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="text-sm">
                      <span className="font-medium">Adult: </span>
                      TSh {calculatePrice(bus, 'adult').toLocaleString()}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Student: </span>
                      TSh {calculatePrice(bus, 'student').toLocaleString()}
                      <span className="text-xs text-green-600 ml-1">
                        ({bus.student_discount}% off)
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => onBusSelect(bus)}
                    disabled={bus.available_seats === 0}
                  >
                    {bus.available_seats === 0 ? 'Fully Booked' : 'Select Bus'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
