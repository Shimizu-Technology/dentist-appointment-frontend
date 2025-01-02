// File: /src/pages/Appointments/New/components/TimeSlotPicker.tsx
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDentistAvailability, getDayAppointments } from '../../../../lib/api';
import type { Availability } from '../../../../types'; // Adjust as needed

interface TimeSlotPickerProps {
  register: any; // from react-hook-form
  error?: string;
  watch: any;    // from react-hook-form
}

/**
 * Example shape for dentist availability:
 *   { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', dentistId: 2 }
 * Adjust to match your actual type definitions.
 */
interface DentistAvailability {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  dentistId: number;
}

export default function TimeSlotPicker({ register, error, watch }: TimeSlotPickerProps) {
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  
  // Watch the specific fields from the form
  const selectedDentistId = watch('dentist_id');
  const selectedDate = watch('appointment_date');
  const selectedTypeId = watch('appointment_type_id');

  // For demonstration, we assume an appointment type is 30 minutes by default
  // or you might have a centralized "getAppointmentTypes()" query in the parent
  // that can return e.g. { id: 2, duration: 60 }, etc.
  // You need to figure out the actual "duration" from selectedTypeId.
  // If you already store that in the form, you can watch('duration') as well.
  const [appointmentDuration, setAppointmentDuration] = useState(30);

  // 1) Query the dentist’s availability, then find the correct day-of-week block.
  const { data: availabilityData } = useQuery<DentistAvailability[]>({
    queryKey: ['dentist-availability', selectedDentistId],
    queryFn: async () => {
      if (!selectedDentistId) return [];
      const res = await getDentistAvailability(Number(selectedDentistId));
      return res.data;
    },
    enabled: !!selectedDentistId,
    initialData: [],
  });

  // 2) Query existing appointments on that day for that dentist
  const { data: dayAppointments } = useQuery<any[]>({
    queryKey: ['day-appointments', selectedDentistId, selectedDate],
    queryFn: async () => {
      if (!selectedDentistId || !selectedDate) return [];
      const res = await getDayAppointments(Number(selectedDentistId), selectedDate);
      return res.data.appointments || [];
    },
    enabled: !!selectedDentistId && !!selectedDate,
    initialData: [],
  });

  // 3) On mount or whenever relevant values change, compute free slots
  useEffect(() => {
    // If anything is missing, just clear out available slots
    if (!selectedDentistId || !selectedDate || !selectedTypeId) {
      setAvailableSlots([]);
      return;
    }

    // For example, you might have a separate lookup for the appointment type’s duration:
    // e.g. from your parent's "appointmentTypes" data.
    // Here, we just do a naive approach to keep code simpler:
    const assumedDuration = 60; // or 30, etc. Or store it somewhere else.
    setAppointmentDuration(assumedDuration);

    // 3A) Figure out which availability block applies to that day
    const dayObj = new Date(selectedDate);
    const dayOfWeek = dayObj.getDay(); // 0=Sun,1=Mon,...

    // Find the matching availability record for that dayOfWeek
    const dayAvail = availabilityData.find(
      (slot) => slot.dayOfWeek === dayOfWeek
    );
    if (!dayAvail) {
      // The dentist is not available that day
      setAvailableSlots([]);
      return;
    }

    // 3B) Build a list of candidate start times
    const [startHour, startMinute] = dayAvail.startTime.split(':').map(Number);
    const [endHour, endMinute] = dayAvail.endTime.split(':').map(Number);

    const candidateSlots: string[] = [];
    let currentHour = startHour;
    let currentMin = startMinute;

    while (
      currentHour < endHour ||
      (currentHour === endHour && currentMin + assumedDuration <= endMinute)
    ) {
      const hh = String(currentHour).padStart(2, '0');
      const mm = String(currentMin).padStart(2, '0');
      candidateSlots.push(`${hh}:${mm}`);

      currentMin += assumedDuration;
      if (currentMin >= 60) {
        currentHour += Math.floor(currentMin / 60);
        currentMin = currentMin % 60;
      }
    }

    // 3C) Filter out candidateSlots if they overlap any existing appointments
    const freeSlots = candidateSlots.filter((slotStr) => {
      const [slotH, slotM] = slotStr.split(':').map(Number);
      const slotStart = new Date(selectedDate);
      slotStart.setHours(slotH, slotM, 0, 0);
      const slotEnd = new Date(slotStart.getTime() + assumedDuration * 60_000);

      // Check if it conflicts with any existing dayAppointments
      const conflict = dayAppointments.some((appt) => {
        // Each appt might have .appointmentTime + .appointmentType.duration
        // or .duration from the backend day_appointments call
        const apptStart = new Date(appt.appointmentTime);
        const apptDuration = appt.duration ?? 30;
        const apptEnd = new Date(apptStart.getTime() + apptDuration * 60_000);

        // Overlap check: (startA < endB) && (endA > startB)
        if (slotStart < apptEnd && slotEnd > apptStart) {
          return true;
        }
        return false;
      });

      return !conflict;
    });

    setAvailableSlots(freeSlots);
  }, [
    selectedDentistId,
    selectedDate,
    selectedTypeId,
    availabilityData,
    dayAppointments,
  ]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Available Time Slots
      </label>
      <select
        {...register('appointment_time', {
          required: 'Please select a time slot',
        })}
        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        disabled={!selectedDentistId || !selectedDate || !selectedTypeId}
      >
        <option value="">Select a time slot</option>
        {availableSlots.map((slot) => (
          <option key={slot} value={slot}>
            {slot}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {/* Debug info (optional) */}
      {/* <p className="mt-2 text-sm text-gray-500">
        Duration: {appointmentDuration} minutes
      </p> */}
    </div>
  );
}
