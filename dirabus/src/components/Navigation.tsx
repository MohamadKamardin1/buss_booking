import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Menu, Bus, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const { user, logout } = useAuth();

  const getMenuItems = () => {
    if (!user) return [];

    const baseItems = [
      { id: 'booking', label: 'Book a Trip', icon: Bus },
      { id: 'dashboard', label: 'My Dashboard', icon: User },
    ];

    if (user.role === 'conductor') {
      return [
        { id: 'conductor', label: 'Conductor Dashboard', icon: Settings },
        ...baseItems,
      ];
    }

    if (user.role === 'admin') {
      return [
        { id: 'admin', label: 'Admin Dashboard', icon: Settings },
        { id: 'conductor', label: 'Conductor Tools', icon: Settings },
        ...baseItems,
      ];
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  const NavigationMenu = () => (
    <div className="space-y-2">
      {menuItems.map((item) => (
        <Button
          key={item.id}
          variant={currentView === item.id ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => onViewChange(item.id)}
        >
          <item.icon className="h-4 w-4 mr-2" />
          {item.label}
        </Button>
      ))}
      <hr className="my-4" />
      <Button
        variant="ghost"
        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
        onClick={logout}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen p-4">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Bus className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">DiraBus</h1>
          </div>
          <p className="text-sm text-muted-foreground">Bus Booking System</p>
        </div>

        {user && (
          <div className="mb-6 p-3 bg-gray-50 rounded-lg">
            <div className="font-medium">{user.firstName} {user.lastName}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
            <Badge variant="outline" className="mt-2">
              {user.role}
            </Badge>
          </div>
        )}

        <NavigationMenu />
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Bus className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">ZanziBus</h1>
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="py-4">
                {user && (
                  <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium">{user.firstName} {user.lastName}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                    <Badge variant="outline" className="mt-2">
                      {user.role}
                    </Badge>
                  </div>
                )}
                <NavigationMenu />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
};