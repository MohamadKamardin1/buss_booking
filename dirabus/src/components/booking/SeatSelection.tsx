import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Bus, Seat } from '../../types';
import { apiService } from '../../services/api';

interface SeatSelectionProps {
  bus: Bus;
  onSeatsSelected: (seats: string[], totalPrice: number) => void;
}

export const SeatSelection: React.FC<SeatSelectionProps> = ({
  bus,
  onSeatsSelected,
}) => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengerTypes, setPassengerTypes] = useState<{ [seatId: string]: 'adult' | 'student' }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSeats();
  }, [bus.id]);

  const loadSeats = async () => {
    try {
      const response = await apiService.getBusSeats(bus.id);
      if (response.success) {
        setSeats(response.data);
      }
    } catch (error) {
      console.error('Failed to load seats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeatClick = (seatId: string) => {
    setSelectedSeats(prev => {
      const newSelection = prev.includes(seatId)
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId];

      // Default to adult passenger type
      if (!prev.includes(seatId)) {
        setPassengerTypes(prevTypes => ({
          ...prevTypes,
          [seatId]: 'adult',
        }));
      } else {
        setPassengerTypes(prevTypes => {
          const { [seatId]: removed, ...rest } = prevTypes;
          return rest;
        });
      }

      return newSelection;
    });
  };

  const handlePassengerTypeChange = (seatId: string, type: 'adult' | 'student') => {
    setPassengerTypes(prev => ({
      ...prev,
      [seatId]: type,
    }));
  };

  const calculateTotalPrice = () => {
    return selectedSeats.reduce((total, seatId) => {
      const passengerType = passengerTypes[seatId] || 'adult';
      const basePrice = bus.pricePerSeat;
      const price = passengerType === 'student' 
        ? basePrice * (1 - bus.studentDiscount / 100)
        : basePrice;
      return total + price;
    }, 0);
  };

  const handleConfirmSelection = () => {
    const totalPrice = calculateTotalPrice();
    onSeatsSelected(selectedSeats, totalPrice);
  };

  const getSeatStatus = (seat: Seat) => {
    if (!seat.isAvailable) return 'occupied';
    if (seat.isReserved) return 'reserved';
    if (selectedSeats.includes(seat.id)) return 'selected';
    return 'available';
  };

  const getSeatColor = (status: string) => {
    switch (status) {
      case 'occupied': return 'bg-red-500';
      case 'reserved': return 'bg-yellow-500';
      case 'selected': return 'bg-green-500';
      default: return 'bg-gray-200 hover:bg-gray-300';
    }
  };

  // Generate seat layout (2-2 configuration typical for buses)
  const seatRows = [];
  for (let i = 0; i < seats.length; i += 4) {
    seatRows.push(seats.slice(i, i + 4));
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">Loading seats...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Your Seats</CardTitle>
          <div className="text-sm text-muted-foreground">
            Bus: {bus.plateNumber} • {bus.availableSeats} seats available
          </div>
        </CardHeader>
        <CardContent>
          {/* Seat Legend */}
          <div className="flex flex-wrap gap-4 mb-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span>Reserved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Occupied</span>
            </div>
          </div>

          {/* Seat Layout */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-center mb-4 text-sm font-medium">Front</div>
            <div className="space-y-3">
              {seatRows.map((row, rowIndex) => (
                <div key={rowIndex} className="flex justify-center gap-2">
                  {row.slice(0, 2).map((seat) => (
                    <button
                      key={seat.id}
                      className={`w-8 h-8 rounded text-xs font-medium transition-colors ${getSeatColor(getSeatStatus(seat))}`}
                      onClick={() => handleSeatClick(seat.id)}
                      disabled={!seat.isAvailable || seat.isReserved}
                    >
                      {seat.seatNumber}
                    </button>
                  ))}
                  <div className="w-8"></div> {/* Aisle */}
                  {row.slice(2, 4).map((seat) => (
                    <button
                      key={seat.id}
                      className={`w-8 h-8 rounded text-xs font-medium transition-colors ${getSeatColor(getSeatStatus(seat))}`}
                      onClick={() => handleSeatClick(seat.id)}
                      disabled={!seat.isAvailable || seat.isReserved}
                    >
                      {seat.seatNumber}
                    </button>
                  ))}
                </div>
              ))}
            </div>
            <div className="text-center mt-4 text-sm font-medium">Back</div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Seats Summary */}
      {selectedSeats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Seats ({selectedSeats.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedSeats.map((seatId) => {
                const seat = seats.find(s => s.id === seatId);
                const passengerType = passengerTypes[seatId] || 'adult';
                const price = passengerType === 'student' 
                  ? bus.pricePerSeat * (1 - bus.studentDiscount / 100)
                  : bus.pricePerSeat;

                return (
                  <div key={seatId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">Seat {seat?.seatNumber}</span>
                      <div className="flex gap-2 mt-1">
                        <Button
                          size="sm"
                          variant={passengerType === 'adult' ? 'default' : 'outline'}
                          onClick={() => handlePassengerTypeChange(seatId, 'adult')}
                        >
                          Adult
                        </Button>
                        <Button
                          size="sm"
                          variant={passengerType === 'student' ? 'default' : 'outline'}
                          onClick={() => handlePassengerTypeChange(seatId, 'student')}
                        >
                          Student
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">TSh {price.toLocaleString()}</div>
                      {passengerType === 'student' && (
                        <div className="text-xs text-green-600">
                          {bus.studentDiscount}% discount
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              <Separator />

              <div className="flex justify-between items-center">
                <div className="font-medium">Total Amount:</div>
                <div className="text-lg font-bold">
                  TSh {calculateTotalPrice().toLocaleString()}
                </div>
              </div>

              <Button 
                onClick={handleConfirmSelection}
                className="w-full"
                disabled={selectedSeats.length === 0}
              >
                Continue to Booking Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};