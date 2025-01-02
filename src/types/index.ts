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

export interface Appointment {
  id: number;
  userId: number;

  user?: User;

  dependentId?: number;
  dentistId: number;
  appointmentTypeId: number;
  appointmentTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  notes?: string;

  userName?: string;
  userEmail?: string;

  dentist?: {
    id: number;
    firstName: string;
    lastName: string;
    specialty: string | null;
  };
  appointmentType?: {
    id: number;
    name: string;
    duration?: number;
    description: string;
  };
}
