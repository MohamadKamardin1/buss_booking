import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Info, User, Shield, Settings } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demo Credentials Card */}
        <Card className="order-2 lg:order-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Demo Credentials
            </CardTitle>
            <CardDescription>
              Use these test accounts to explore different user roles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Regular User</span>
                </div>
                <div className="text-sm text-blue-700">
                  <div>Email: user@example.com</div>
                  <div>Password: any password</div>
                  <div className="text-xs mt-1">Book tickets, view bookings</div>
                </div>
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">Conductor</span>
                </div>
                <div className="text-sm text-green-700">
                  <div>Email: conductor@example.com</div>
                  <div>Password: any password</div>
                  <div className="text-xs mt-1">Manage bookings, update bus location</div>
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-purple-800">Administrator</span>
                </div>
                <div className="text-sm text-purple-700">
                  <div>Email: admin@example.com</div>
                  <div>Password: any password</div>
                  <div className="text-xs mt-1">Full system management</div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <div className="text-sm text-yellow-800">
                <strong>Note:</strong> This is a frontend demo with mock data. 
                The system is ready for Django backend integration.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Login/Register Form */}
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