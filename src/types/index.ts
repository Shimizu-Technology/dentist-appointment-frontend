// File: /src/types/index.ts
export interface User {
  id: number;
  email: string | null;
  role: 'user' | 'admin' | 'phone_only';
  firstName: string;
  lastName: string;
  phone?: string;
  insuranceInfo?: {
    providerName: string;
    policyNumber: string;
    planType: string;
  };
  forcePasswordReset?: boolean;
  invitationToken?: string;

  // Child user logic:
  isDependent?: boolean;        // true if this is a child
  parentUserId?: number | null; // references parent's ID
  dateOfBirth?: string | null;  // child's DOB if is_dependent
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
  checkedIn: boolean;

  childUserId?: number;       
  childUser?: User;           // If the appointment is for a child

  user?: User;
  dentist?: Dentist;
  appointmentType?: AppointmentType;
}
