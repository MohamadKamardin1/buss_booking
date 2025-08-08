import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import {
  CheckCircle,
  Download,
  Share2,
  Calendar,
  MapPin,
  Users,
} from 'lucide-react';
import { Booking, Bus, Station } from '../../types';

interface BookingReceiptProps {
  booking: Booking;
  bus: Bus;
  fromStation: Station;
  toStation: Station;
  onNewBooking: () => void;
}

export const BookingReceipt: React.FC<BookingReceiptProps> = ({
  booking,
  bus,
  fromStation,
  toStation,
  onNewBooking,
}) => {
  const handleDownloadReceipt = async () => {
    // Example download implementation
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/bookings/${booking.receiptId}/receipt/`); 
      if (!response.ok) throw new Error('Failed to download receipt');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Receipt_${booking.receiptId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert('Unable to download receipt');
    }
  };

  const handleShareReceipt = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Bus Booking Receipt',
          text: `Booking confirmed! Trip from ${fromStation.name} to ${toStation.name}`,
          url: window.location.href,
        })
        .catch(console.error);
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => alert('Booking URL copied to clipboard!'))
        .catch(() => alert('Unable to access clipboard'));
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">
              Booking Confirmed!
            </h2>
            <p className="text-green-700">
              Your bus ticket has been successfully booked.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Booking Receipt</span>
            <Badge variant="default">#{booking.receiptId}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Trip Details */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Trip Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">From:</span>
                <div className="font-medium">{fromStation?.name || 'N/A'}</div>
              </div>
              <div>
                <span className="text-muted-foreground">To:</span>
                <div className="font-medium">{toStation?.name || 'N/A'}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Bus:</span>
                <div className="font-medium">{bus?.plateNumber || 'N/A'}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Travel Date:</span>
                <div className="font-medium">
                  {booking.travelDate
                    ? new Date(booking.travelDate).toLocaleDateString()
                    : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Passenger Details */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Passenger Details
            </h3>
            <div className="space-y-3">
              {booking.passengerInfo && booking.passengerInfo.length > 0 ? (
                booking.passengerInfo.map((passenger, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{passenger.name || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">
                          {passenger.phone || '-'} • {passenger.email || '-'}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">
                          Seat {passenger.seatNumber || passenger.seatId || 'N/A'}
                        </Badge>
                        <div className="text-sm mt-1">
                          {passenger.passengerType || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No passenger information available.</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Payment Summary */}
          <div className="space-y-4">
            <h3 className="font-medium">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Seats ({booking.seats?.length ?? 0}):</span>
                <span>{booking.seats?.length ? booking.seats.join(', ') : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-medium">
                  {typeof booking.totalPrice === 'number'
                    ? `TSh ${booking.totalPrice.toLocaleString()}`
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <Badge
                  variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                >
                  {booking.status || 'N/A'}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Important Information */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <h4 className="font-medium text-foreground">Important Information:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Please arrive at the station 15 minutes before departure</li>
              <li>Carry a valid ID for verification</li>
              <li>Show this receipt to the conductor when boarding</li>
              <li>For cancellations, contact customer service</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleDownloadReceipt}
              variant="outline"
              className="flex-1"
              aria-label="Download Booking Receipt"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Receipt
            </Button>
            <Button
              onClick={handleShareReceipt}
              variant="outline"
              className="flex-1"
              aria-label="Share Booking Receipt"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button onClick={onNewBooking} className="flex-1" aria-label="Book Another Trip">
              <Calendar className="h-4 w-4 mr-2" />
              Book Another Trip
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
