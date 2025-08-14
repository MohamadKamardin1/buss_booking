import React, { useState, useEffect } from 'react';
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
  const [currentView, setCurrentView] = useState<string>('booking');

  // Auto-select dashboard based on user role after login
  useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'admin':
          setCurrentView('admin');
          break;
        case 'conductor':
          setCurrentView('conductor');
          break;
        default:
          setCurrentView('dashboard'); // Regular user default dashboard
      }
    } else {
      setCurrentView('booking'); // Default view if not logged in
    }
  }, [user]);

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
      <main className="flex-1 p-6 overflow-auto">{renderCurrentView()}</main>
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
        // Your existing API specifications and documentation here
      */}
    </AuthProvider>
  );
}
