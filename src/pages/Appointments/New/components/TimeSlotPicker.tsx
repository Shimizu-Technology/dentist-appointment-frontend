// File: /src/pages/Appointments/New/components/TimeSlotPicker.tsx

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getDentistAvailability,
  getDayAppointments, // must accept optional ignoreId
} from '../../../../lib/api';

interface TimeSlotPickerProps {
  register: any;
  error?: string;
  watch: any;
  editingAppointmentId?: number; // Pass this in if editing
}

interface DentistAvailability {
  dayOfWeek: number;
  startTime: string; // e.g. '09:00'
  endTime: string;   // e.g. '17:00'
  dentistId: number;
}

export default function TimeSlotPicker({
  register,
  error,
  watch,
  editingAppointmentId,
}: TimeSlotPickerProps) {
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  // Watch relevant fields from react-hook-form
  const selectedDentistId = watch('dentist_id');
  const selectedDate = watch('appointment_date');
  const selectedTypeId = watch('appointment_type_id');

  // If you want to store the correct appointment duration from the selected type, you can do that, or just set a default
  const [appointmentDuration, setAppointmentDuration] = useState(30);

  // 1) Get the dentist’s availability
  const { data: availabilityData = [] } = useQuery<DentistAvailability[]>({
    queryKey: ['dentist-availability', selectedDentistId],
    queryFn: async () => {
      if (!selectedDentistId) return [];
      const res = await getDentistAvailability(Number(selectedDentistId));
      return res.data;
    },
    enabled: !!selectedDentistId,
    initialData: [],
  });

  // 2) Get existing appointments for that dentist on the chosen date, ignoring our own ID (if editing)
  const { data: dayAppointments = [] } = useQuery<any[]>({
    queryKey: [
      'day-appointments',
      selectedDentistId,
      selectedDate,
      editingAppointmentId,
    ],
    queryFn: async () => {
      if (!selectedDentistId || !selectedDate) return [];
      // Pass editingAppointmentId as "ignore_id"
      const res = await getDayAppointments(
        Number(selectedDentistId),
        selectedDate,
        editingAppointmentId
      );
      return res.data.appointments || [];
    },
    enabled: !!selectedDentistId && !!selectedDate,
    initialData: [],
  });

  // 3) Recompute free slots whenever dependencies change
  useEffect(() => {
    if (!selectedDentistId || !selectedDate || !selectedTypeId) {
      setAvailableSlots([]);
      return;
    }

    // If your selected appointment type has a dynamic duration, replace this:
    const assumedDuration = 60; 
    setAppointmentDuration(assumedDuration);

    // (A) Find which availability record matches that day of the week
    const dayObj = new Date(selectedDate);
    const dayOfWeek = dayObj.getDay(); // Sunday=0, Monday=1, etc.

    const dayAvail = availabilityData.find(
      (slot) => slot.dayOfWeek === dayOfWeek
    );
    if (!dayAvail) {
      // Not available that day
      setAvailableSlots([]);
      return;
    }

    // (B) Build candidate times (in increments of `assumedDuration`)
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

    // (C) Exclude any that overlap dayAppointments
    const freeSlots = candidateSlots.filter((slotStr) => {
      const [slotH, slotM] = slotStr.split(':').map(Number);
      const slotStart = new Date(selectedDate);
      slotStart.setHours(slotH, slotM, 0, 0);
      const slotEnd = new Date(slotStart.getTime() + assumedDuration * 60_000);

      // Compare with each existing scheduled appointment
      const conflict = dayAppointments.some((appt) => {
        const apptStart = new Date(appt.appointmentTime);
        const apptDur = appt.duration ?? 30; // fallback 30
        const apptEnd = new Date(apptStart.getTime() + apptDur * 60_000);

        // Overlap check: (startA < endB) && (endA > startB)
        return slotStart < apptEnd && slotEnd > apptStart;
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
    </div>
  );
}
