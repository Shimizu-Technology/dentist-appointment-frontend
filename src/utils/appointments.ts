import { addHours, isFuture, isAfter } from 'date-fns';
import type { Appointment } from '../types';

export function canManageAppointment(appointment: Appointment): boolean {
  if (appointment.status !== 'scheduled') {
    return false;
  }

  const appointmentDate = new Date(appointment.appointmentTime);
  const now = new Date();
  const twentyFourHoursFromNow = addHours(now, 24);

  return isFuture(appointmentDate) && isAfter(appointmentDate, twentyFourHoursFromNow);
}