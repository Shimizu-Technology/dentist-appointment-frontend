import { DentistAvailability, BlockedTime } from '../../types';

export const mockAvailability: DentistAvailability[] = [
  // Dr. Sarah Johnson's availability
  { dentistId: 1, dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }, // Monday
  { dentistId: 1, dayOfWeek: 2, startTime: '09:00', endTime: '17:00' }, // Tuesday
  { dentistId: 1, dayOfWeek: 3, startTime: '09:00', endTime: '17:00' }, // Wednesday
  { dentistId: 1, dayOfWeek: 4, startTime: '09:00', endTime: '17:00' }, // Thursday
  { dentistId: 1, dayOfWeek: 5, startTime: '09:00', endTime: '15:00' }, // Friday
  
  // Dr. Michael Chen's availability
  { dentistId: 2, dayOfWeek: 1, startTime: '10:00', endTime: '18:00' }, // Monday
  { dentistId: 2, dayOfWeek: 2, startTime: '10:00', endTime: '18:00' }, // Tuesday
  { dentistId: 2, dayOfWeek: 4, startTime: '10:00', endTime: '18:00' }, // Thursday
  { dentistId: 2, dayOfWeek: 5, startTime: '10:00', endTime: '16:00' }, // Friday
];

export const mockBlockedDays: BlockedTime[] = [
  // Dr. Sarah Johnson's blocked days
  {
    dentistId: 1,
    date: '2024-03-25', // Next Monday
    reason: 'Conference'
  },
  {
    dentistId: 1,
    date: '2024-03-26', // Next Tuesday
    reason: 'Conference'
  },
  
  // Dr. Michael Chen's blocked day
  {
    dentistId: 2,
    date: '2024-03-28', // Next Thursday
    reason: 'Training'
  }
];