import { Route, Station, Bus, Seat, Booking, ApiResponse } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

// Mock data for development when backend is not available
const mockRoutes: Route[] = [
  {
    id: 'route-1',
    name: 'Bububu - Fuoni Express',
    startLocation: 'Bububu',
    endLocation: 'Fuoni',
    distance: 15.5,
    estimatedDuration: 45,
    stations: []
  },
  {
    id: 'route-2',
    name: 'Stone Town - Jambiani',
    startLocation: 'Stone Town',
    endLocation: 'Jambiani',
    distance: 32.0,
    estimatedDuration: 75,
    stations: []
  },
];

const mockStations: Station[] = [
  { id: 'station-1', name: 'Bububu Terminal', routeId: 'route-1', latitude: -6.1659, longitude: 39.2026, order: 1 },
  { id: 'station-2', name: 'Mahonda', routeId: 'route-1', latitude: -6.1559, longitude: 39.2126, order: 2 },
  { id: 'station-3', name: 'Chukwani', routeId: 'route-1', latitude: -6.1459, longitude: 39.2226, order: 3 },
  { id: 'station-4', name: 'Fuoni Market', routeId: 'route-1', latitude: -6.1359, longitude: 39.2326, order: 4 },
];

const mockBuses: Bus[] = [
  {
    id: 'bus-1',
    plateNumber: 'T123ABC',
    routeId: 'route-1',
    capacity: 50,
    availableSeats: 25,
    pricePerSeat: 5000,
    studentDiscount: 20,
    departureTime: '08:00',
    arrivalTime: '08:45',
    status: 'active',
  },
  {
    id: 'bus-2',
    plateNumber: 'T456DEF',
    routeId: 'route-1',
    capacity: 45,
    availableSeats: 12,
    pricePerSeat: 4500,
    studentDiscount: 15,
    departureTime: '10:30',
    arrivalTime: '11:15',
    status: 'active',
  },
];

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = localStorage.getItem('token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.log(`API request to ${endpoint} failed, using mock data:`, error);
      // Return mock data based on endpoint
      return this.getMockResponse<T>(endpoint, options.method || 'GET');
    }
  }

  private getMockResponse<T>(endpoint: string, method: string): ApiResponse<T> {
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.generateMockData<T>(endpoint, method));
      }, 500);
    }) as any;
  }

  private generateMockData<T>(endpoint: string, method: string): ApiResponse<T> {
    console.log(`Generating mock data for ${method} ${endpoint}`);
    
    if (endpoint === '/routes') {
      return { success: true, data: mockRoutes as T, message: 'Mock routes loaded' };
    }
    
    if (endpoint.includes('/routes/') && endpoint.includes('/stations')) {
      const routeId = endpoint.split('/')[2];
      const stations = mockStations.filter(s => s.routeId === routeId);
      return { success: true, data: stations as T, message: 'Mock stations loaded' };
    }
    
    if (endpoint.includes('/buses/route/')) {
      const routeId = endpoint.split('/')[3].split('?')[0];
      const buses = mockBuses.filter(b => b.routeId === routeId);
      return { success: true, data: buses as T, message: 'Mock buses loaded' };
    }
    
    if (endpoint.includes('/buses/') && endpoint.includes('/seats')) {
      const busId = endpoint.split('/')[2];
      const seats: Seat[] = [];
      for (let i = 1; i <= 50; i++) {
        seats.push({
          id: `seat-${i}`,
          busId,
          seatNumber: i.toString(),
          isAvailable: Math.random() > 0.3, // 70% available
          isReserved: false,
        });
      }
      return { success: true, data: seats as T, message: 'Mock seats loaded' };
    }
    
    if (endpoint === '/bookings' && method === 'POST') {
      const mockBooking: Booking = {
        id: 'booking-' + Date.now(),
        userId: 'user-1',
        busId: 'bus-1',
        fromStationId: 'station-1',
        toStationId: 'station-4',
        seats: ['1', '2'],
        totalPrice: 10000,
        passengerInfo: [
          { name: 'John Doe', phone: '+255123456789', email: 'john@example.com', passengerType: 'adult' }
        ],
        status: 'confirmed',
        bookingDate: new Date().toISOString(),
        travelDate: new Date().toISOString(),
        receiptId: 'RCP-' + Date.now(),
      };
      return { success: true, data: mockBooking as T, message: 'Mock booking created' };
    }

    if (endpoint.includes('/users/') && endpoint.includes('/bookings')) {
      return { success: true, data: [] as T, message: 'No bookings found' };
    }

    if (endpoint === '/admin/stats') {
      const mockStats = {
        stats: {
          totalUsers: 1250,
          totalBookings: 3420,
          totalRevenue: 12500000,
          activeBuses: 45,
          activeRoutes: 12,
        },
        chartData: [
          { month: 'Jan', bookings: 245, revenue: 980000 },
          { month: 'Feb', bookings: 312, revenue: 1250000 },
          { month: 'Mar', bookings: 389, revenue: 1560000 },
          { month: 'Apr', bookings: 298, revenue: 1190000 },
          { month: 'May', bookings: 445, revenue: 1780000 },
          { month: 'Jun', bookings: 567, revenue: 2270000 },
        ]
      };
      return { success: true, data: mockStats as T, message: 'Mock stats loaded' };
    }

    // Default empty response
    return { success: true, data: [] as T, message: 'Mock data not available for this endpoint' };
  }

  // Route Management APIs
  async getRoutes(): Promise<ApiResponse<Route[]>> {
    return this.request<Route[]>('/routes');
  }

  async getRoute(id: string): Promise<ApiResponse<Route>> {
    return this.request<Route>(`/routes/${id}`);
  }

  async getStationsByRoute(routeId: string): Promise<ApiResponse<Station[]>> {
    return this.request<Station[]>(`/routes/${routeId}/stations`);
  }

  // Bus Management APIs
  async getBusesByRoute(routeId: string, date: string): Promise<ApiResponse<Bus[]>> {
    return this.request<Bus[]>(`/buses/route/${routeId}?date=${date}`);
  }

  async getBus(id: string): Promise<ApiResponse<Bus>> {
    return this.request<Bus>(`/buses/${id}`);
  }

  async updateBusLocation(busId: string, location: { latitude: number; longitude: number }): Promise<ApiResponse<any>> {
    return this.request<any>(`/buses/${busId}/location`, {
      method: 'PUT',
      body: JSON.stringify(location),
    });
  }

  // Seat Management APIs
  async getBusSeats(busId: string): Promise<ApiResponse<Seat[]>> {
    return this.request<Seat[]>(`/buses/${busId}/seats`);
  }

  async reserveSeats(busId: string, seatIds: string[]): Promise<ApiResponse<any>> {
    return this.request<any>(`/buses/${busId}/seats/reserve`, {
      method: 'POST',
      body: JSON.stringify({ seatIds }),
    });
  }

  // Booking APIs
  async createBooking(bookingData: Partial<Booking>): Promise<ApiResponse<Booking>> {
    return this.request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getUserBookings(userId: string): Promise<ApiResponse<Booking[]>> {
    return this.request<Booking[]>(`/users/${userId}/bookings`);
  }

  async getBooking(id: string): Promise<ApiResponse<Booking>> {
    return this.request<Booking>(`/bookings/${id}`);
  }

  async cancelBooking(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/bookings/${id}/cancel`, {
      method: 'PUT',
    });
  }

  // Conductor APIs
  async getAllBookings(): Promise<ApiResponse<Booking[]>> {
    return this.request<Booking[]>('/conductor/bookings');
  }

  async updateBookingStatus(bookingId: string, status: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/conductor/bookings/${bookingId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Admin APIs
  async createRoute(routeData: Partial<Route>): Promise<ApiResponse<Route>> {
    return this.request<Route>('/admin/routes', {
      method: 'POST',
      body: JSON.stringify(routeData),
    });
  }

  async createBus(busData: Partial<Bus>): Promise<ApiResponse<Bus>> {
    return this.request<Bus>('/admin/buses', {
      method: 'POST',
      body: JSON.stringify(busData),
    });
  }

  async getSystemStats(): Promise<ApiResponse<any>> {
    return this.request<any>('/admin/stats');
  }
}

export const apiService = new ApiService();