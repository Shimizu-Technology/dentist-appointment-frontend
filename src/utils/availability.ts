import { DentistAvailability, BlockedTime } from '../types';
import { mockAvailability, mockBlockedDays } from '../lib/mockData/availability';

export function isDayAvailable(
  dentistId: number,
  date: Date,
  availability: DentistAvailability[] = mockAvailability,
  blockedDays: BlockedTime[] = mockBlockedDays
): boolean {
  const dateString = date.toISOString().split('T')[0];
  const isBlocked = blockedDays.some(
    block => block.dentistId === dentistId && block.date === dateString
  );
  if (isBlocked) return false;

  const dayOfWeek = date.getDay();
  const hasAvailability = availability.some(
    slot => slot.dentistId === dentistId && slot.dayOfWeek === dayOfWeek
  );

  return hasAvailability;
}

export function getAvailableTimeSlots(
  dentistId: number,
  date: Date,
  availability: DentistAvailability[] = mockAvailability,
  appointmentDuration: number
): string[] {
  const dayOfWeek = date.getDay();
  const dayAvailability = availability.find(
    slot => slot.dentistId === dentistId && slot.dayOfWeek === dayOfWeek
  );

  if (!dayAvailability) return [];

  const { startTime, endTime } = dayAvailability;
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  const slots: string[] = [];
  let currentHour = startHour;
  let currentMinute = startMinute;

  while (
    currentHour < endHour ||
    (currentHour === endHour && currentMinute + appointmentDuration <= endMinute)
  ) {
    slots.push(
      `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
    );
    
    currentMinute += appointmentDuration;
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60);
      currentMinute = currentMinute % 60;
    }
  }

  return slots;
}