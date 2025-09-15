// Shared types for the beauty salon booking app

export interface Service {
  id: number;
  name: string;
  description: string;
  category: ServiceCategory;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  created_at: string;
}

export type ServiceCategory = 
  | 'Manicure'
  | 'Pedicure'
  | 'Podology'
  | 'Facial'
  | 'Eyebrows'
  | 'Permanent Makeup'
  | 'Other';

export interface ServicesResponse {
  services: Service[];
  servicesByCategory: Record<ServiceCategory | 'Other', Service[]>;
}

export interface CreateServiceRequest {
  name: string;
  description?: string;
  category?: ServiceCategory;
  duration_minutes: number;
  price: number;
}

export interface Booking {
  id: number;
  service_id: number;
  user_id?: string;
  date: string;
  time: string;
  status: BookingStatus;
  notes?: string;
  created_at: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface CreateBookingRequest {
  service_id: number;
  date: string;
  time: string;
  notes?: string;
}
