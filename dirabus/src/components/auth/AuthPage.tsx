import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from '../ui/card';
import { Info, Link, MapPin, Users } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleMode = () => setIsLogin(!isLogin);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Welcome & Info Section */}
        <Card className="order-2 lg:order-1 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-primary">
              <Users className="h-6 w-6" />
              Welcome to the Zanzibar Bus Booking System
            </CardTitle>
            <CardDescription className="mt-1">
              Simplify your travel with easy bus ticket bookings, track your trips, and manage your journeys all in one place.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <section>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-secondary">
                <Info className="h-5 w-5" /> How It Works
              </h3>
              <p className="text-gray-700">
                Book bus tickets quickly and securely. Choose your route, select seats, manage your bookings, and stay updated on trips.
              </p>
            </section>

            <section>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-secondary">
                <MapPin className="h-5 w-5" /> Key Features
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Real-time bus location tracking by conductors</li>
                <li>Easy booking management from your dashboard</li>
                <li>Secure authentication for users, conductors, and admins</li>
                <li>Instant booking confirmation and printable receipts</li>
              </ul>
            </section>

            <section>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-secondary">
                <Link className="h-5 w-5" /> Helpful Links
              </h3>
              <ul className="space-y-1 text-blue-700 underline cursor-pointer">
                <li>
                  <a href="/help" target="_blank" rel="noopener noreferrer">
                    How to Book Tickets
                  </a>
                </li>
                <li>
                  <a href="/faq" target="_blank" rel="noopener noreferrer">
                    Frequently Asked Questions
                  </a>
                </li>
                <li>
                  <a href="/contact" target="_blank" rel="noopener noreferrer">
                    Contact Support
                  </a>
                </li>
              </ul>
            </section>
          </CardContent>
        </Card>

        {/* Login/Register Form Section */}
        <div className="order-1 lg:order-2">
          {isLogin ? (
            <LoginForm onToggleMode={toggleMode} />
          ) : (
            <RegisterForm onToggleMode={toggleMode} />
          )}
        </div>
      </div>
    </div>
  );
};
