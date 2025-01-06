// File: /src/utils/unavailability.ts
import { DentistUnavailability } from '../types';
import { mockUnavailability } from '../lib/mockData/unavailability';

/**
 * Return true if the dentist is *available* on the given date,
 * i.e. we do not find an unavailability record for that entire day.
 */
export function isDayAvailable(
  dentistId: number,
  date: Date,
  unavailability: DentistUnavailability[] = mockUnavailability
): boolean {
  const dateStr = date.toISOString().split('T')[0];
  // If there's any unavailability record for that date, we consider the day blocked (simplified).
  return !unavailability.some(u => u.dentistId === dentistId && u.date === dateStr);
}

/**
 * Return all free time slots, considering the clinic's open hours minus any unavailability blocks.
 */
export function getAvailableTimeSlots(
  dentistId: number,
  date: Date,
  appointmentDuration: number,
  unavailability: DentistUnavailability[] = mockUnavailability,
  clinicOpenTime: string = '09:00',
  clinicCloseTime: string = '17:00'
): string[] {
  const dateStr = date.toISOString().split('T')[0];

  // Convert clinic open/close times to minutes
  const [openH, openM] = clinicOpenTime.split(':').map(Number);
  const [closeH, closeM] = clinicCloseTime.split(':').map(Number);
  const openTotal = openH * 60 + openM;
  const closeTotal = closeH * 60 + closeM;

  // Gather the dentist's unavailability for that date
  const blocks = unavailability.filter(
    block => block.dentistId === dentistId && block.date === dateStr
  );

  // Build candidate slots, remove ones that overlap unavailability
  const result: string[] = [];
  let currentMin = openTotal;

  while (currentMin + appointmentDuration <= closeTotal) {
    const slotStart = currentMin;
    const slotEnd = currentMin + appointmentDuration;

    let conflict = false;
    for (const block of blocks) {
      // Convert block start/end to minutes
      const [bStartH, bStartM] = block.startTime.split(':').map(Number);
      const [bEndH, bEndM] = block.endTime.split(':').map(Number);
      const blockStart = bStartH * 60 + bStartM;
      const blockEnd = bEndH * 60 + bEndM;

      // Overlap check
      if (slotStart < blockEnd && slotEnd > blockStart) {
        conflict = true;
        break;
      }
    }

    if (!conflict) {
      // Convert slotStart -> "HH:mm"
      const hh = String(Math.floor(slotStart / 60)).padStart(2, '0');
      const mm = String(slotStart % 60).padStart(2, '0');
      result.push(`${hh}:${mm}`);
    }

    currentMin += appointmentDuration;
  }

  return result;
}
