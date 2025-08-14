import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, TrendingUp, DollarSign, Bus, Route, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Booking {
  id: string;
  receipt_id: string;
  travelDate: string;  // ISO string
  bookingDate: string; // ISO string
  status: string;
  seats: string[];
  passengerInfo: any[];
  totalPrice: number;
  user: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
  };
}

interface AdminStatsData {
  totalUsers: number;
  totalBookings: number;
  totalSpent: number;
  activeBuses: number;
  activeRoutes: number;
  chartData: { month: string; bookings: number; revenue: number }[];
  allBookings: Booking[];
}

export const AdminDashboard: React.FC = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<AdminStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Authentication required');
      setIsLoading(false);
      return;
    }

    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('http://127.0.0.1:8000/api/admin/stats/', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Error fetching admin stats: ${res.status} - ${text}`);
        }

        const json = await res.json();

        if (!json.success) {
          throw new Error(json.message || 'Failed to load admin stats');
        }

        setStats(json.data);
      } catch (err: any) {
        setError(err.message || 'Error loading data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'completed': return 'outline';
      default: return 'secondary';
    }
  };

  if (isLoading) return <div className="text-center py-16">Loading admin dashboard...</div>;
  if (error) return <div className="text-center text-red-600 py-16">Error: {error}</div>;
  if (!stats) return <div className="text-center py-16">No data available</div>;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingBookings = stats.allBookings.filter(b => {
    const travelDate = new Date(b.travelDate);
    travelDate.setHours(0,0,0,0);
    return travelDate >= today && b.status !== 'cancelled';
  });

  const pastBookings = stats.allBookings.filter(b => {
    const travelDate = new Date(b.travelDate);
    travelDate.setHours(0,0,0,0);
    return travelDate < today || b.status === 'completed';
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 flex items-center gap-4">
          <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center">
            <Settings className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Admin Dashboard</h2>
            <p className="text-muted-foreground">System overview and management tools</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold">{stats.totalBookings.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Bookings</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-purple-600" />
            <div>
              <div className="text-2xl font-bold">
                {(stats.totalSpent / 1_000).toFixed(1)} <br />Thousand
              </div>
              <div className="text-sm text-muted-foreground">Total Spent (TSh)</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Bus className="h-8 w-8 text-orange-600" />
            <div>
              <div className="text-2xl font-bold">{stats.activeBuses}</div>
              <div className="text-sm text-muted-foreground">Active Buses</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Route className="h-8 w-8 text-red-600" />
            <div>
              <div className="text-2xl font-bold">{stats.activeRoutes}</div>
              <div className="text-sm text-muted-foreground">Active Routes</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="bookings" fill="#3b82f6" name="Bookings" />
                <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Revenue (TSh)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming ({upcomingBookings.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({pastBookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {upcomingBookings.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No upcoming bookings</p>
          ) : (
            upcomingBookings.map((b) => (
              <Card key={b.id} className="mb-4 hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold">
                        Booking #{b.receipt_id} by {b.user.username}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Travel Date: {new Date(b.travelDate).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant={getStatusColor(b.status)}>{b.status}</Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Seats:</span>
                      <div>{b.seats.join(', ')}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Passengers:</span>
                      <div>{b.passengerInfo.length}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Amount:</span>
                      <div>{b.totalPrice.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Booked:</span>
                      <div>{new Date(b.bookingDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {pastBookings.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No past bookings</p>
          ) : (
            pastBookings.map((b) => (
              <Card key={b.id} className="mb-4">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold">
                        Booking #{b.receipt_id} by {b.user.username}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Travel Date: {new Date(b.travelDate).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant={getStatusColor(b.status)}>{b.status}</Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Seats:</span>
                      <div>{b.seats.join(', ')}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Passengers:</span>
                      <div>{b.passengerInfo.length}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Amount:</span>
                      <div>{b.totalPrice.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Booked:</span>
                      <div>{new Date(b.bookingDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
