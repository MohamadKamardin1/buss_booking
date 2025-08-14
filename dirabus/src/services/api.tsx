import { Route, Station, Bus, Seat, Booking, ApiResponse } from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

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
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          // ignore json parsing error
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return { success: true, data, message: 'OK' };
    } catch (error: any) {
      // Forward the error without fallback
      return { success: false, data: null as any, message: error.message || 'API request failed' };
    }
  }

  // ================== AUTHENTICATION ====================

  async login(username: string, password: string): Promise<ApiResponse<{ access: string; refresh: string; role: string; username: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, data: null, message: errorData.detail || 'Login failed' };
      }

      const data = await response.json();

      // Save tokens and user info
      localStorage.setItem('token', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      localStorage.setItem('username', data.username);
      localStorage.setItem('userRole', data.role);

      return { success: true, data, message: 'Login successful' };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || 'Network error during login' };
    }
  }

  async register(username: string, password: string, role: 'conductor' | 'passenger'): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, data: null, message: errorData.message || 'Registration failed' };
      }

      const data = await response.json();
      return { success: true, data, message: 'Registration successful' };
    } catch (error: any) {
      return { success: false, data: null, message: error.message || 'Network error during registration' };
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
  }

  getCurrentUser() {
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('userRole');
    return username && role ? { username, role } : null;
  }

  // ================= REST OF YOUR API METHODS =================

  async getRoutes(): Promise<ApiResponse<Route[]>> {
    return this.request<Route[]>('/routes');
  }

  async getRoute(id: string): Promise<ApiResponse<Route>> {
    return this.request<Route>(`/routes/${id}`);
  }

  async getStationsByRoute(routeId: string): Promise<ApiResponse<Station[]>> {
    return this.request<Station[]>(`/routes/${routeId}/stations`);
  }

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

  async getBusSeats(busId: string): Promise<ApiResponse<Seat[]>> {
    return this.request<Seat[]>(`/buses/${busId}/seats`);
  }

  async reserveSeats(busId: string, seatIds: string[]): Promise<ApiResponse<any>> {
    return this.request<any>(`/buses/${busId}/seats/reserve`, {
      method: 'POST',
      body: JSON.stringify({ seatIds }),
    });
  }

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

  async getAllBookings(): Promise<ApiResponse<Booking[]>> {
    return this.request<Booking[]>('/conductor/bookings');
  }

  async updateBookingStatus(bookingId: string, status: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/conductor/bookings/${bookingId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

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
