// File: /src/pages/Appointments/New/components/TimeSlotPicker.tsx

import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import {
  getSchedules,
  getDayAppointments,
  getAppointmentTypes,
} from '../../../../lib/api';
import { format, parseISO } from 'date-fns';

interface DayAppointment {
  id: number;
  appointmentTime: string; // "2025-01-08T12:45:00Z"
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
}

/**
 * If your back-end returns `clinicDaySettings` in the shape of:
 * [
 *   { id, dayOfWeek, isOpen, openTime, closeTime }, ...
 * ]
 * then you can define that type here. Adjust if needed.
 */
interface ClinicDaySetting {
  id: number;
  dayOfWeek: number;    // 0=Sunday..6=Saturday
  isOpen: boolean;
  openTime: string;     // "HH:mm"
  closeTime: string;    // "HH:mm"
}

export default function TimeSlotPicker({
  editingAppointmentId,
}: {
  editingAppointmentId?: number;
}) {
  const { control, setValue } = useFormContext();

  // Watch relevant fields
  const dentistId = useWatch({ control, name: 'dentist_id' });
  const appointmentDate = useWatch({ control, name: 'appointment_date' });
  const appointmentTypeId = useWatch({ control, name: 'appointment_type_id' });
  const selectedTime = useWatch({ control, name: 'appointment_time' });

  // 1) Fetch the clinic schedule data
  //    This should return an object with { clinicDaySettings, closedDays, dentistUnavailabilities, ... }
  //    We only need clinicDaySettings in this file to determine open/close times.
  const { data: scheduleData } = useQuery({
    queryKey: ['schedules'],
    queryFn: async () => {
      const res = await getSchedules();
      return res.data;
    },
  });
  const daySettings: ClinicDaySetting[] = scheduleData?.clinicDaySettings || [];

  // 2) Fetch all day-appointments for the dentist on the chosen date
  const { data: dayAppointments = [] } = useQuery<DayAppointment[]>({
    queryKey: ['day-appointments', dentistId, appointmentDate, editingAppointmentId],
    queryFn: async () => {
      if (!dentistId || !appointmentDate) return [];
      const res = await getDayAppointments(
        Number(dentistId),
        appointmentDate,
        editingAppointmentId
      );
      return res.data.appointments || [];
    },
    enabled: Boolean(dentistId && appointmentDate),
  });

  // 3) Fetch appointment types (to get the duration)
  const { data: allTypesResp } = useQuery({
    queryKey: ['appointment-types'],
    queryFn: getAppointmentTypes,
  });
  const allTypes = allTypesResp?.data || [];
  const chosenType = allTypes.find((t: any) => t.id === Number(appointmentTypeId));
  const appointmentDuration = chosenType?.duration || 30;

  // 4) Build a list of possible (free) time slots
  const availableSlots = useMemo(() => {
    if (!dentistId || !appointmentDate || !appointmentTypeId) return [];

    // parse the selected date
    const dt = parseISO(`${appointmentDate}T00:00:00`);
    if (isNaN(dt.getTime())) return [];

    // find the dayOfWeek
    const wday = dt.getDay(); // 0=Sun..6=Sat
    // find matching daySetting
    const daySetting = daySettings.find((ds) => ds.dayOfWeek === wday);
    if (!daySetting || !daySetting.isOpen) return [];

    // Convert openTime/closeTime => total minutes
    const [openH, openM] = daySetting.openTime.split(':').map(Number);
    const [closeH, closeM] = daySetting.closeTime.split(':').map(Number);
    const openTotal = openH * 60 + openM;
    const closeTotal = closeH * 60 + closeM;

    // We'll build 15-min increments
    const slotIncrement = 15;
    const possibleSlots: string[] = [];
    let current = openTotal;

    while (current + appointmentDuration <= closeTotal) {
      const hh = Math.floor(current / 60);
      const mm = current % 60;
      const slotStr = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
      possibleSlots.push(slotStr);
      current += slotIncrement;
    }

    // Filter out slots that overlap with existing appointments
    const activeAppts = dayAppointments.filter((a) => a.status !== 'cancelled');
    const freeSlots = possibleSlots.filter((slot) => {
      const [sh, sm] = slot.split(':').map(Number);
      const start = new Date(dt);
      start.setHours(sh, sm, 0, 0);
      const end = new Date(start.getTime() + appointmentDuration * 60_000);

      // check overlap
      for (const appt of activeAppts) {
        const apptStart = new Date(appt.appointmentTime);
        const apptEnd = new Date(apptStart.getTime() + (appt.duration || 30) * 60_000);
        // overlap if start < apptEnd && end > apptStart
        if (start < apptEnd && end > apptStart) {
          return false;
        }
      }
      return true;
    });

    return freeSlots;
  }, [dentistId, appointmentDate, appointmentTypeId, daySettings, dayAppointments, chosenType?.duration]);

  // Helper to display "HH:mm" => e.g. "9:30 AM"
  function displaySlot(slotStr: string) {
    const [hh, mm] = slotStr.split(':').map(Number);
    const dt = new Date();
    dt.setHours(hh, mm, 0, 0);
    return format(dt, 'h:mm aa');
  }

  // Handle user selecting a time slot
  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setValue('appointment_time', e.target.value, {
      shouldTouch: true,
      shouldValidate: true,
    });
  }

  if (!appointmentDate) {
    return <p className="text-gray-500 mt-2">Please pick a date first.</p>;
  }

  // 5) Render
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Available Time Slots
      </label>
      <select
        value={selectedTime || ''}
        onChange={handleChange}
        disabled={!dentistId || !appointmentDate || !appointmentTypeId}
        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select a time slot</option>
        {availableSlots.map((slot) => (
          <option key={slot} value={slot}>
            {displaySlot(slot)}
          </option>
        ))}
      </select>
    </div>
  );
}
