import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Bus, Station, Booking } from '../../types';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
interface BookingFormProps {
  bus: Bus;
  fromStation: Station;
  toStation: Station;
  selectedSeats: string[];
  totalPrice: number;
  onBookingComplete: (booking: Booking) => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  bus,
  fromStation,
  toStation,
  selectedSeats,
  totalPrice,
  onBookingComplete,
}) => {
  const { user } = useAuth();
  const [passengerInfo, setPassengerInfo] = useState(
    selectedSeats.map(() => ({
      name: '',
      phone: '',
      email: '',
      passengerType: 'adult' as 'adult' | 'student',
    }))
  );
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePassengerInfoChange = (index: number, field: string, value: string) => {
    setPassengerInfo(prev => 
      prev.map((info, i) => 
        i === index ? { ...info, [field]: value } : info
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passenger info
    const isValid = passengerInfo.every(info => 
      info.name.trim() && info.phone.trim() && info.email.trim()
    );

    if (!isValid) {
      toast.error('Please fill in all passenger information');
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingData = {
        userId: user?.id,
        busId: bus.id,
        fromStationId: fromStation.id,
        toStationId: toStation.id,
        seats: selectedSeats,
        totalPrice,
        passengerInfo,
        specialRequests,
        travelDate: new Date().toISOString(), // This should come from the search
        status: 'pending' as const,
      };

      const response = await apiService.createBooking(bookingData);
      
      if (response.success) {
        toast.success('Booking created successfully!');
        onBookingComplete(response.data);
      } else {
        toast.error('Failed to create booking. Please try again.');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Booking Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Route:</span>
              <span>{fromStation.name} → {toStation.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Bus:</span>
              <span>{bus.plateNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Seats:</span>
              <span>{selectedSeats.length} selected</span>
            </div>
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Total Amount:</span>
              <span>TSh {totalPrice.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Passenger Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {passengerInfo.map((info, index) => (
              <div key={index} className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Passenger {index + 1}</h4>
                  <Badge variant="outline">Seat {selectedSeats[index]}</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`name-${index}`}>Full Name *</Label>
                    <Input
                      id={`name-${index}`}
                      placeholder="Enter full name"
                      value={info.name}
                      onChange={(e) => handlePassengerInfoChange(index, 'name', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`phone-${index}`}>Phone Number *</Label>
                    <Input
                      id={`phone-${index}`}
                      type="tel"
                      placeholder="+255 xxx xxx xxx"
                      value={info.phone}
                      onChange={(e) => handlePassengerInfoChange(index, 'phone', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`email-${index}`}>Email Address *</Label>
                    <Input
                      id={`email-${index}`}
                      type="email"
                      placeholder="email@example.com"
                      value={info.email}
                      onChange={(e) => handlePassengerInfoChange(index, 'email', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Passenger Type</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={info.passengerType === 'adult' ? 'default' : 'outline'}
                        onClick={() => handlePassengerInfoChange(index, 'passengerType', 'adult')}
                      >
                        Adult
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={info.passengerType === 'student' ? 'default' : 'outline'}
                        onClick={() => handlePassengerInfoChange(index, 'passengerType', 'student')}
                      >
                        Student
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="space-y-2">
              <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
              <Textarea
                id="specialRequests"
                placeholder="Any special requirements or requests..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={3}
              />
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
                size="lg"
              >
                {isSubmitting ? 'Processing Booking...' : `Confirm Booking - TSh ${totalPrice.toLocaleString()}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};