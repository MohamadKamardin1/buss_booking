import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Bus, Route, Station } from '../../types';
import { apiService } from '../../services/api';

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

  useEffect(() => {
    searchBuses();
  }, [selectedRoute, selectedDate]);

  const searchBuses = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getBusesByRoute(selectedRoute.id, selectedDate);
      if (response.success) {
        setBuses(response.data);
      }
    } catch (error) {
      console.error('Failed to search buses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculatePrice = (bus: Bus, passengerType: 'adult' | 'student' = 'adult') => {
    const basePrice = bus.pricePerSeat;
    return passengerType === 'student' 
      ? basePrice * (1 - bus.studentDiscount / 100)
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

            <Button onClick={searchBuses} disabled={isLoading} className="w-full">
              {isLoading ? 'Searching...' : 'Search Buses'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bus Results */}
      <div className="space-y-4">
        {buses.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {isLoading ? 'Searching for buses...' : 'No buses found for selected route and date.'}
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
                    <h4 className="font-medium">Bus {bus.plateNumber}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(bus.departureTime)} - {formatTime(bus.arrivalTime)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {bus.availableSeats}/{bus.capacity} seats available
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
                        ({bus.studentDiscount}% off)
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => onBusSelect(bus)}
                    disabled={bus.availableSeats === 0}
                  >
                    {bus.availableSeats === 0 ? 'Fully Booked' : 'Select Bus'}
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