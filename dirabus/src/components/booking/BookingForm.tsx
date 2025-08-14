import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Bus, Station, Booking } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

interface PassengerInfoInput {
  name: string;
  phone: string;
  email: string;
  type: 'adult' | 'student'; // matches backend expected key "type"
}

interface BookingFormProps {
  bus: Bus;
  fromStation: Station;
  toStation: Station;
  selectedSeats: (string | number)[];
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
  const { token, user } = useAuth();

  // Initialize passenger info state for each selected seat
  const [passengerInfo, setPassengerInfo] = useState<PassengerInfoInput[]>(
    selectedSeats.map(() => ({
      name: '',
      phone: '',
      email: '',
      type: 'adult',
    }))
  );

  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keep passengerInfo array in sync with selectedSeats length (optional)
  useEffect(() => {
    setPassengerInfo(
      selectedSeats.map((_, i) => passengerInfo[i] || {
        name: '',
        phone: '',
        email: '',
        type: 'adult',
      })
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSeats]);

  const handlePassengerInfoChange = (
    index: number,
    field: keyof PassengerInfoInput,
    value: string
  ) => {
    setPassengerInfo((prev) =>
      prev.map((info, i) => (i === index ? { ...info, [field]: value } : info))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !user) {
      toast.error('You must be logged in to make a booking.');
      return;
    }

    // Validate all passenger info fields are filled
    const isValid = passengerInfo.every(
      (info) =>
        info.name.trim() !== '' &&
        info.phone.trim() !== '' &&
        info.email.trim() !== '' &&
        (info.type === 'adult' || info.type === 'student')
    );

    if (!isValid) {
      toast.error('Please fill in all passenger information fields correctly.');
      return;
    }

    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Backend expects travel_date as "YYYY-MM-DD"
      const travelDateStr = new Date().toISOString().split('T')[0];

      // Construct payload matching backend's BookingSerializer expectations
      const payload = {
        bus: bus.id,
        travel_date: travelDateStr,
        seats: selectedSeats,
        total_price: totalPrice,
        passenger_info: passengerInfo,
        // Include special_requests ONLY if your backend supports this field.
        // Remove/comment out if not supported and causes validation error.
        special_requests: specialRequests.trim() || null,
        // Do NOT send user or status fields — set by backend.
      };

      console.log('[BookingForm] Booking payload:', payload);

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,

      };
      console.log('Sending booking request with token:', token);
      console.log('[BookingForm] Request headers:', headers);

      function decodeToken(token: string) {
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          return JSON.parse(jsonPayload);
        } catch {
          return null;
        }
      }




      const decoded = decodeToken(token);
      console.log('Decoded JWT:', decoded); // Check exp and user_id claims
      const now = Math.floor(Date.now() / 1000);
      if (decoded?.exp && now > decoded.exp) {
        console.warn('Token has expired');
      }

      const response = await fetch('http://127.0.0.1:8000/api/bookings/', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! Status: ${response.status}`;
        try {
          const errorData = await response.json();
          console.error('Backend validation errors:', errorData);
          // Extract detailed error message for user if possible
          if (typeof errorData === 'object') {
            if (errorData.detail) errorMessage = errorData.detail;
            else if (errorData.message) errorMessage = errorData.message;
            else {
              // Aggregate field errors if available
              errorMessage = Object.entries(errorData)
                .map(([field, msgs]) =>
                  Array.isArray(msgs) ? `${field}: ${msgs.join(', ')}` : `${field}: ${msgs}`
                )
                .join(' | ');
            }
          }
        } catch {
          // ignore json parse error
        }
        toast.error(errorMessage);
        setIsSubmitting(false);
        return;
      }

      const booking: Booking = await response.json();
      toast.success('Booking created successfully!');
      onBookingComplete(booking);
    } catch (error) {
      console.error('[BookingForm] Booking submission error:', error);
      toast.error('An unexpected error occurred. Please try again.');
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
              <span>
                {fromStation.name} → {toStation.name}
              </span>
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
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
                        variant={info.type === 'adult' ? 'default' : 'outline'}
                        onClick={() => handlePassengerInfoChange(index, 'type', 'adult')}
                      >
                        Adult
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={info.type === 'student' ? 'default' : 'outline'}
                        onClick={() => handlePassengerInfoChange(index, 'type', 'student')}
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
              <Button type="submit" className="w-full" disabled={isSubmitting} size="lg">
                {isSubmitting
                  ? 'Processing Booking...'
                  : `Confirm Booking - TSh ${totalPrice.toLocaleString()}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
