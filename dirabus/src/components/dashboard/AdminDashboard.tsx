import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Bus, Route, Users, DollarSign, TrendingUp, Settings } from 'lucide-react';
import { apiService } from '../../services/api';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeBuses: 0,
    activeRoutes: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSystemStats();
  }, []);

  const loadSystemStats = async () => {
    try {
      const response = await apiService.getSystemStats();
      if (response.success) {
        setStats(response.data.stats);
        setChartData(response.data.chartData || []);
      }
    } catch (error) {
      console.error('Failed to load system stats:', error);
      // Mock data for demonstration
      setStats({
        totalUsers: 1250,
        totalBookings: 3420,
        totalRevenue: 12500000,
        activeBuses: 45,
        activeRoutes: 12,
      });
      setChartData([
        { month: 'Jan', bookings: 245, revenue: 980000 },
        { month: 'Feb', bookings: 312, revenue: 1250000 },
        { month: 'Mar', bookings: 389, revenue: 1560000 },
        { month: 'Apr', bookings: 298, revenue: 1190000 },
        { month: 'May', bookings: 445, revenue: 1780000 },
        { month: 'Jun', bookings: 567, revenue: 2270000 },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center">
              <Settings className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Admin Dashboard</h2>
              <p className="text-muted-foreground">
                System overview and management tools
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{stats.totalBookings.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Bookings</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  {(stats.totalRevenue / 1000000).toFixed(1)}M
                </div>
                <div className="text-sm text-muted-foreground">Revenue (TSh)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Bus className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{stats.activeBuses}</div>
                <div className="text-sm text-muted-foreground">Active Buses</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Route className="h-8 w-8 text-red-600" />
              <div>
                <div className="text-2xl font-bold">{stats.activeRoutes}</div>
                <div className="text-sm text-muted-foreground">Active Routes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
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

      {/* Management Tabs */}
      <Tabs defaultValue="routes" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="routes">Routes</TabsTrigger>
          <TabsTrigger value="buses">Buses</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="routes" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Route Management</CardTitle>
              <Button>Add New Route</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Mock route data */}
                {[
                  { id: 1, name: 'Bububu - Fuoni', stations: 8, status: 'active' },
                  { id: 2, name: 'Stone Town - Jambiani', stations: 12, status: 'active' },
                  { id: 3, name: 'Nungwi - Paje', stations: 15, status: 'inactive' },
                ].map((route) => (
                  <Card key={route.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{route.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {route.stations} stations
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={route.status === 'active' ? 'default' : 'secondary'}>
                            {route.status}
                          </Badge>
                          <Button size="sm" variant="outline">Edit</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="buses" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Bus Fleet Management</CardTitle>
              <Button>Add New Bus</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Mock bus data */}
                {[
                  { id: 1, plateNumber: 'T123ABC', capacity: 50, route: 'Bububu - Fuoni', status: 'active' },
                  { id: 2, plateNumber: 'T456DEF', capacity: 45, route: 'Stone Town - Jambiani', status: 'active' },
                  { id: 3, plateNumber: 'T789GHI', capacity: 50, route: 'Nungwi - Paje', status: 'maintenance' },
                ].map((bus) => (
                  <Card key={bus.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{bus.plateNumber}</h4>
                          <p className="text-sm text-muted-foreground">
                            {bus.capacity} seats • {bus.route}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            bus.status === 'active' ? 'default' : 
                            bus.status === 'maintenance' ? 'secondary' : 'outline'
                          }>
                            {bus.status}
                          </Badge>
                          <Button size="sm" variant="outline">Edit</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  User management interface will be implemented here
                </p>
                <p className="text-sm text-muted-foreground">
                  Features: View users, manage roles, ban/unban users, user statistics
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>System Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  Detailed reporting system will be implemented here
                </p>
                <p className="text-sm text-muted-foreground">
                  Features: Revenue reports, booking analytics, user behavior, route performance
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};