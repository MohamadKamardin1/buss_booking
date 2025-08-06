import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { InteractiveMap } from './map/InteractiveMap';
import { BusSearch } from './booking/BusSearch';
import { SeatSelection } from './booking/SeatSelection';
import { BookingForm } from './booking/BookingForm';
import { BookingReceipt } from './booking/BookingReceipt';
import { Route, Station, Bus, Booking } from '../types';

interface BookingStep {
  id: string;
  title: string;
  description: string;
}

const BOOKING_STEPS: BookingStep[] = [
  { id: 'route', title: 'Select Route', description: 'Choose your route and stations' },
  { id: 'bus', title: 'Choose Bus', description: 'Select from available buses' },
  { id: 'seats', title: 'Select Seats', description: 'Pick your preferred seats' },
  { id: 'details', title: 'Booking Details', description: 'Enter passenger information' },
  { id: 'receipt', title: 'Receipt', description: 'Your booking confirmation' },
];

export const BookingFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [fromStation, setFromStation] = useState<Station | null>(null);
  const [toStation, setToStation] = useState<Station | null>(null);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(null);

  const handleRouteSelect = (route: Route) => {
    setSelectedRoute(route);
  };

  const handleStationSelect = (from: Station, to: Station) => {
    setFromStation(from);
    setToStation(to);
    setCurrentStep(1); // Move to bus selection
  };

  const handleBusSelect = (bus: Bus) => {
    setSelectedBus(bus);
    setCurrentStep(2); // Move to seat selection
  };

  const handleSeatsSelected = (seats: string[], price: number) => {
    setSelectedSeats(seats);
    setTotalPrice(price);
    setCurrentStep(3); // Move to booking details
  };

  const handleBookingComplete = (booking: Booking) => {
    setCompletedBooking(booking);
    setCurrentStep(4); // Move to receipt
  };

  const handleNewBooking = () => {
    // Reset all state
    setCurrentStep(0);
    setSelectedRoute(null);
    setFromStation(null);
    setToStation(null);
    setSelectedBus(null);
    setSelectedSeats([]);
    setTotalPrice(0);
    setCompletedBooking(null);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return selectedRoute && fromStation && toStation;
      case 1: return selectedBus;
      case 2: return selectedSeats.length > 0;
      case 3: return false; // Handled by form submission
      default: return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < BOOKING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            {BOOKING_STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`flex-1 text-center ${
                  index < BOOKING_STEPS.length - 1 ? 'border-r border-gray-200' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-sm font-medium ${
                    index === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : index < currentStep
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {index + 1}
                </div>
                <div className="text-sm font-medium">{step.title}</div>
                <div className="text-xs text-muted-foreground">{step.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <div className="min-h-[600px]">
        {currentStep === 0 && (
          <InteractiveMap
            onRouteSelect={handleRouteSelect}
            onStationSelect={handleStationSelect}
            selectedRoute={selectedRoute}
          />
        )}

        {currentStep === 1 && selectedRoute && fromStation && toStation && (
          <BusSearch
            selectedRoute={selectedRoute}
            fromStation={fromStation}
            toStation={toStation}
            onBusSelect={handleBusSelect}
          />
        )}

        {currentStep === 2 && selectedBus && (
          <SeatSelection
            bus={selectedBus}
            onSeatsSelected={handleSeatsSelected}
          />
        )}

        {currentStep === 3 && selectedBus && fromStation && toStation && (
          <BookingForm
            bus={selectedBus}
            fromStation={fromStation}
            toStation={toStation}
            selectedSeats={selectedSeats}
            totalPrice={totalPrice}
            onBookingComplete={handleBookingComplete}
          />
        )}

        {currentStep === 4 && completedBooking && selectedBus && fromStation && toStation && (
          <BookingReceipt
            booking={completedBooking}
            bus={selectedBus}
            fromStation={fromStation}
            toStation={toStation}
            onNewBooking={handleNewBooking}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      {currentStep < 4 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentStep < 3 && (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};