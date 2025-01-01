export interface User {
  id: number;
  email: string;
  role: 'user' | 'admin';
  firstName: string;
  lastName: string;
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

export interface Dentist {
  id: number;
  firstName: string;
  lastName: string;
  specialty: 'general' | 'pediatric';
  imageUrl: string;
  qualifications: string[];
}

export interface AppointmentType {
  id: number;
  name: string;
  duration: number;
  description: string;
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
  dentist?: Dentist;
  appointmentType?: AppointmentType;
}

export interface DentistAvailability {
  dentistId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface BlockedTime {
  dentistId: number;
  date: string;
  reason: string;
}