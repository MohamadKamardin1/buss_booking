
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'user' | 'conductor' | 'admin';
  createdAt: string;
}

export interface Route {
  id: string;
  name: string;
  startLocation: string;
  endLocation: string;
  distance: number;
  estimatedDuration: number;
  stations: Station[];
}

export interface Station {
  id: string;
  name: string;
  routeId: string;
  latitude: number;
  longitude: number;
  order: number;
}

export interface Bus {
  id: string;
  plateNumber: string;
  routeId: string;
  capacity: number;
  availableSeats: number;
  pricePerSeat: number;
  studentDiscount: number;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  departureTime: string;
  arrivalTime: string;
  status: 'active' | 'maintenance' | 'inactive';
}

export interface Seat {
  id: string;
  busId: string;
  seatNumber: string;
  isAvailable: boolean;
  isReserved: boolean;
  passengerType?: 'adult' | 'student';
}

export interface Booking {
  id: string;
  userId: string;
  busId: string;
  fromStationId: string;
  toStationId: string;
  seats: string[];
  totalPrice: number;
  passengerInfo: {
    name: string;
    phone: string;
    email: string;
    passengerType: 'adult' | 'student';
  }[];
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  bookingDate: string;
  travelDate: string;
  receiptId: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors?: string[];
}
