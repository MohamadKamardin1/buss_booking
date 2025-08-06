import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { CheckCircle, Download, Share2, Calendar, MapPin, Users } from 'lucide-react';
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
  const handleDownloadReceipt = () => {
    // API Integration Point: Generate PDF receipt
    console.log('Download receipt:', booking.receiptId);
  };

  const handleShareReceipt = () => {
    // Share booking details
    if (navigator.share) {
      navigator.share({
        title: 'Bus Booking Receipt',
        text: `Booking confirmed! Trip from ${fromStation.name} to ${toStation.name}`,
        url: window.location.href,
      });
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
                <div className="font-medium">{fromStation.name}</div>
              </div>
              <div>
                <span className="text-muted-foreground">To:</span>
                <div className="font-medium">{toStation.name}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Bus:</span>
                <div className="font-medium">{bus.plateNumber}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Travel Date:</span>
                <div className="font-medium">
                  {new Date(booking.travelDate).toLocaleDateString()}
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
              {booking.passengerInfo.map((passenger, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{passenger.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {passenger.phone} • {passenger.email}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        Seat {booking.seats[index]}
                      </Badge>
                      <div className="text-sm mt-1">
                        {passenger.passengerType}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Payment Summary */}
          <div className="space-y-4">
            <h3 className="font-medium">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Seats ({booking.seats.length}):</span>
                <span>{booking.seats.join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-medium">TSh {booking.totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                  {booking.status}
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
            <Button onClick={handleDownloadReceipt} variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download Receipt
            </Button>
            <Button onClick={handleShareReceipt} variant="outline" className="flex-1">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button onClick={onNewBooking} className="flex-1">
              <Calendar className="h-4 w-4 mr-2" />
              Book Another Trip
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};