import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

interface Bus {
  id: number;
  plateNumber: string;
  availableSeats: number;
  pricePerSeat: number;
  studentDiscount: number;
}

interface Seat {
  id: string;
  seatNumber: string;
  isAvailable: boolean;
  isReserved: boolean;
}

interface SeatSelectionProps {
  bus: Bus;
  onSeatsSelected: (seats: string[], totalPrice: number) => void;
}

export const SeatSelection: React.FC<SeatSelectionProps> = ({ bus, onSeatsSelected }) => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengerTypes, setPassengerTypes] = useState<{ [seatId: string]: 'adult' | 'student' }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = 'http://127.0.0.1:8000/api';

  useEffect(() => {
    if (bus.id) {
      loadSeats();
      setSelectedSeats([]);  // Reset selection on bus change
      setPassengerTypes({});
    }
  }, [bus.id]);

  const loadSeats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/buses/${bus.id}/seats/`);
      if (!response.ok) throw new Error(`Failed to fetch seats: ${response.statusText}`);
      const data: Seat[] = await response.json();
      setSeats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load seats.');
      setSeats([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeatClick = (seatId: string) => {
    setSelectedSeats(prevSelected => {
      let newSelection;
      if (prevSelected.includes(seatId)) {
        newSelection = prevSelected.filter(id => id !== seatId);
        setPassengerTypes(prev => {
          const { [seatId]: removed, ...rest } = prev;
          return rest;
        });
      } else {
        newSelection = [...prevSelected, seatId];
        setPassengerTypes(prev => ({ ...prev, [seatId]: 'adult' }));
      }
      return newSelection;
    });
  };

  const handlePassengerTypeChange = (seatId: string, type: 'adult' | 'student') => {
    setPassengerTypes(prev => ({ ...prev, [seatId]: type }));
  };

  const totalPrice = useMemo(() => {
    const basePrice = bus.pricePerSeat ?? 0;
    const discount = bus.studentDiscount ?? 0;

    return selectedSeats.reduce((sum, seatId) => {
      const passengerType = passengerTypes[seatId] || 'adult';
      const price = passengerType === 'student'
        ? basePrice * (1 - discount / 100)
        : basePrice;
      return sum + price;
    }, 0);
  }, [selectedSeats, passengerTypes, bus.pricePerSeat, bus.studentDiscount]);

  const handleConfirmSelection = () => {
    onSeatsSelected(selectedSeats, totalPrice);
  };

  const getSeatStatus = (seat: Seat): 'occupied' | 'reserved' | 'selected' | 'available' => {
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

  // Break seats into rows of 4 (2 left + aisle + 2 right)
  const seatRows: Seat[][] = [];
  for (let i = 0; i < seats.length; i += 4) {
    seatRows.push(seats.slice(i, i + 4));
  }

  if (isLoading) return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-8">Loading seats...</div>
      </CardContent>
    </Card>
  );

  if (error) return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-8 text-red-600">{error}</div>
      </CardContent>
    </Card>
  );

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
              <div className="w-4 h-4 bg-gray-200 rounded" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded" />
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded" />
              <span>Reserved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded" />
              <span>Occupied</span>
            </div>
          </div>

          {/* Seat Layout */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-center mb-4 text-sm font-medium">Front</div>
            <div className="space-y-3">
              {seatRows.map((row, rowIndex) => (
                <div key={rowIndex} className="flex justify-center gap-2">
                  {/* Left seats (0,1) */}
                  {row.slice(0, 2).map(seat => (
                    <button
                      key={seat.id}
                      type="button"
                      title={`Seat ${seat.seatNumber}`}
                      className={`w-8 h-8 rounded text-xs font-medium transition-colors ${getSeatColor(getSeatStatus(seat))}`}
                      disabled={!seat.isAvailable || seat.isReserved}
                      onClick={() => handleSeatClick(seat.id)}
                    >
                      {seat.seatNumber}
                    </button>
                  ))}

                  <div className="w-8" /> {/* aisle */}

                  {/* Right seats (2,3) */}
                  {row.slice(2, 4).map(seat => (
                    <button
                      key={seat.id}
                      type="button"
                      title={`Seat ${seat.seatNumber}`}
                      className={`w-8 h-8 rounded text-xs font-medium transition-colors ${getSeatColor(getSeatStatus(seat))}`}
                      disabled={!seat.isAvailable || seat.isReserved}
                      onClick={() => handleSeatClick(seat.id)}
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
              {selectedSeats.map(seatId => {
                const seat = seats.find(s => s.id === seatId);
                const passengerType = passengerTypes[seatId] || 'adult';

                const basePrice = bus.pricePerSeat ?? 0;
                const studentDiscount = bus.studentDiscount ?? 0;

                const price = passengerType === 'student'
                  ? basePrice * (1 - studentDiscount / 100)
                  : basePrice;

                const formattedPrice = (typeof price === 'number' && !isNaN(price))
                  ? price.toLocaleString()
                  : '0';

                return (
                  <div key={seatId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">Seat {seat?.seatNumber ?? seatId}</span>
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
                      <div className="font-medium">TSh {formattedPrice}</div>
                      {passengerType === 'student' && (
                        <div className="text-xs text-green-600">{studentDiscount}% discount</div>
                      )}
                    </div>
                  </div>
                );
              })}
              <Separator />
              <div className="flex justify-between items-center">
                <div className="font-medium">Total Amount:</div>
                <div className="text-lg font-bold">TSh {totalPrice.toLocaleString()}</div>
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
