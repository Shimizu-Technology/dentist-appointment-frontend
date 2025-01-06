// File: /src/types/index.ts

export interface User {
  id: number;
  email: string;
  role: 'user' | 'admin';
  firstName: string;
  lastName: string;
  phone?: string;
  insuranceInfo?: {
    providerName: string;
    policyNumber: string;
    planType: string;
  };
}

export interface Dependent {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentType {
  id: number;
  name: string;
  duration?: number;
  description: string;
}

export interface Dentist {
  id: number;
  firstName: string;
  lastName: string;
  specialty: string | null;
  imageUrl?: string;
  qualifications?: string[];
}

export interface Appointment {
  id: number;
  userId: number;
  dentistId: number;
  appointmentTypeId: number;
  appointmentTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  notes?: string;

  user?: User;
  dependentId?: number;
  dependent?: Dependent;

  userName?: string;
  userEmail?: string;

  dentist?: Dentist;
  appointmentType?: AppointmentType;
}

export interface ClosedDay {
  id: number;
  date: string;       // e.g. "2025-12-25"
  reason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DentistUnavailability {
  id: number;
  dentistId: number;
  date: string;       // "YYYY-MM-DD"
  startTime: string;  // "HH:mm"
  endTime: string;    // "HH:mm"
}
