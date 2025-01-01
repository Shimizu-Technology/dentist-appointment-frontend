import { AppointmentType, Appointment } from '../../types';
import { mockDentists } from './dentists';

export const mockAppointmentTypes: AppointmentType[] = [
  {
    id: 1,
    name: 'Regular Checkup',
    duration: 30,
    description: 'Routine dental examination and cleaning'
  },
  {
    id: 2,
    name: 'Deep Cleaning',
    duration: 60,
    description: 'Thorough cleaning and scaling'
  },
  {
    id: 3,
    name: 'Emergency Visit',
    duration: 45,
    description: 'Urgent dental care'
  },
  {
    id: 4,
    name: 'Teeth Whitening',
    duration: 60,
    description: 'Professional teeth whitening treatment'
  },
  {
    id: 5,
    name: 'Pediatric Checkup',
    duration: 45,
    description: 'Child-friendly dental examination'
  }
];

// Helper function to create dates relative to now
const createDate = (daysFromNow: number, hour: number = 9) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

export const mockAppointments: Appointment[] = [
  // Past appointment (completed)
  {
    id: 1,
    userId: 1,
    dentistId: 1,
    appointmentTypeId: 1,
    appointmentTime: createDate(-7),
    status: 'completed',
    createdAt: createDate(-14),
    updatedAt: createDate(-7),
    dentist: mockDentists[0],
    appointmentType: mockAppointmentTypes[0]
  },
  // Today's appointment
  {
    id: 2,
    userId: 1,
    dentistId: 2,
    appointmentTypeId: 5,
    appointmentTime: createDate(0, 14),
    status: 'scheduled',
    createdAt: createDate(-5),
    updatedAt: createDate(-5),
    dentist: mockDentists[1],
    appointmentType: mockAppointmentTypes[4]
  },
  // Tomorrow's appointment (within 24h, can't modify)
  {
    id: 3,
    userId: 1,
    dentistId: 1,
    appointmentTypeId: 2,
    appointmentTime: createDate(1, 11),
    status: 'scheduled',
    createdAt: createDate(-3),
    updatedAt: createDate(-3),
    dentist: mockDentists[0],
    appointmentType: mockAppointmentTypes[1]
  },
  // Next week (can modify)
  {
    id: 4,
    userId: 1,
    dentistId: 2,
    appointmentTypeId: 3,
    appointmentTime: createDate(7, 15),
    status: 'scheduled',
    createdAt: createDate(-2),
    updatedAt: createDate(-2),
    dentist: mockDentists[1],
    appointmentType: mockAppointmentTypes[2]
  },
  // Next month (can modify)
  {
    id: 5,
    userId: 1,
    dentistId: 1,
    appointmentTypeId: 4,
    appointmentTime: createDate(30, 13),
    status: 'scheduled',
    createdAt: createDate(-1),
    updatedAt: createDate(-1),
    dentist: mockDentists[0],
    appointmentType: mockAppointmentTypes[3]
  },
  // Cancelled appointment
  {
    id: 6,
    userId: 1,
    dentistId: 1,
    appointmentTypeId: 1,
    appointmentTime: createDate(14, 10),
    status: 'cancelled',
    createdAt: createDate(-10),
    updatedAt: createDate(-2),
    dentist: mockDentists[0],
    appointmentType: mockAppointmentTypes[0]
  }
];