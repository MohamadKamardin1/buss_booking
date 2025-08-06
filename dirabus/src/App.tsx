import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthPage } from './components/auth/AuthPage';
import { Navigation } from './components/Navigation';
import { BookingFlow } from './components/BookingFlow';
import { UserDashboard } from './components/dashboard/UserDashboard';
import { ConductorDashboard } from './components/dashboard/ConductorDashboard';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { Toaster } from './components/ui/sonner';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState('booking');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'booking':
        return <BookingFlow />;
      case 'dashboard':
        return <UserDashboard />;
      case 'conductor':
        return <ConductorDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <BookingFlow />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1 p-6 overflow-auto">
        {renderCurrentView()}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster position="top-right" />
      
      {/* API Integration Documentation - Hidden Comment */}
      {/*
        
        DJANGO BACKEND API SPECIFICATIONS
        ================================
        
        Base URL: http://localhost:8000/api
        
        Authentication APIs:
        - POST /auth/login
          Body: { email, password }
          Returns: { success, data: { user, token }, message }
        
        - POST /auth/register
          Body: { firstName, lastName, email, phone, password, role }
          Returns: { success, data: { user, token }, message }
        
        Route Management APIs:
        - GET /routes
          Returns: { success, data: Route[], message }
        
        - GET /routes/{id}
          Returns: { success, data: Route, message }
        
        - GET /routes/{routeId}/stations
          Returns: { success, data: Station[], message }
        
        - POST /admin/routes (Admin only)
          Body: { name, startLocation, endLocation, distance, estimatedDuration }
          Returns: { success, data: Route, message }
        
        Bus Management APIs:
        - GET /buses/route/{routeId}?date={date}
          Returns: { success, data: Bus[], message }
        
        - GET /buses/{id}
          Returns: { success, data: Bus, message }
        
        - PUT /buses/{busId}/location (Conductor only)
          Body: { latitude, longitude }
          Returns: { success, message }
        
        - POST /admin/buses (Admin only)
          Body: { plateNumber, routeId, capacity, pricePerSeat, studentDiscount }
          Returns: { success, data: Bus, message }
        
        Seat Management APIs:
        - GET /buses/{busId}/seats
          Returns: { success, data: Seat[], message }
        
        - POST /buses/{busId}/seats/reserve
          Body: { seatIds: string[] }
          Returns: { success, message }
        
        Booking APIs:
        - POST /bookings
          Body: { userId, busId, fromStationId, toStationId, seats, totalPrice, passengerInfo, specialRequests, travelDate }
          Returns: { success, data: Booking, message }
        
        - GET /users/{userId}/bookings
          Returns: { success, data: Booking[], message }
        
        - GET /bookings/{id}
          Returns: { success, data: Booking, message }
        
        - PUT /bookings/{id}/cancel
          Returns: { success, message }
        
        Conductor APIs:
        - GET /conductor/bookings
          Returns: { success, data: Booking[], message }
        
        - PUT /conductor/bookings/{bookingId}/status
          Body: { status }
          Returns: { success, message }
        
        Admin APIs:
        - GET /admin/stats
          Returns: { success, data: { stats, chartData }, message }
        
        Database Models Required:
        
        User Model:
        - id (UUID)
        - email (unique)
        - firstName
        - lastName
        - phone
        - passwordHash
        - role (user/conductor/admin)
        - createdAt
        - updatedAt
        
        Route Model:
        - id (UUID)
        - name
        - startLocation
        - endLocation
        - distance
        - estimatedDuration
        - createdAt
        - updatedAt
        
        Station Model:
        - id (UUID)
        - name
        - routeId (FK)
        - latitude
        - longitude
        - order
        - createdAt
        
        Bus Model:
        - id (UUID)
        - plateNumber (unique)
        - routeId (FK)
        - capacity
        - pricePerSeat
        - studentDiscount (percentage)
        - currentLatitude
        - currentLongitude
        - status (active/maintenance/inactive)
        - createdAt
        - updatedAt
        
        Seat Model:
        - id (UUID)
        - busId (FK)
        - seatNumber
        - isAvailable
        - isReserved
        - createdAt
        
        Booking Model:
        - id (UUID)
        - userId (FK)
        - busId (FK)
        - fromStationId (FK)
        - toStationId (FK)
        - seats (JSON array)
        - totalPrice
        - passengerInfo (JSON array)
        - specialRequests
        - status (pending/confirmed/cancelled/completed)
        - bookingDate
        - travelDate
        - receiptId
        - createdAt
        - updatedAt
        
        Map Integration:
        - Use Google Maps JavaScript API or Mapbox for interactive maps
        - Store station coordinates in database
        - Implement real-time bus tracking with WebSockets
        - Add route visualization on map
        
        Payment Integration:
        - Integrate with local payment gateways (M-Pesa, Tigo Pesa, etc.)
        - Implement payment status tracking
        - Generate receipts with payment confirmation
        
        Additional Features to Implement:
        - SMS notifications for booking confirmations
        - Email notifications
        - Push notifications for mobile app
        - QR code generation for tickets
        - Real-time seat availability updates
        - Bus delay notifications
        - Customer feedback system
        - Loyalty points system
        
      */}
    </AuthProvider>
  );
}