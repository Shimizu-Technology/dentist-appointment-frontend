// File: /src/pages/Appointments/New/components/TimeSlotPicker.tsx

import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import {
  getSchedules,
  getDayAppointments,
  getAppointmentTypes, // if you need to fetch the actual duration
} from '../../../../lib/api';
import { format } from 'date-fns';

interface TimeSlotPickerProps {
  editingAppointmentId?: number;
}

interface DayAppointment {
  id: number;
  appointmentTime: string; // e.g., "2025-01-10T09:00:00Z"
  duration: number;         // e.g., 45
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface DentistUnavailability {
  id: number;
  dentistId: number;
  date: string;      // "YYYY-MM-DD"
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
}

interface ClosedDay {
  id: number;
  date: string;
  reason?: string;
}

interface SchedulesResponse {
  clinicOpenTime: string;     // e.g. "09:00"
  clinicCloseTime: string;    // e.g. "17:00"
  openDays: number[];         // e.g. [1,2,3,4,5]
  closedDays: ClosedDay[];
  dentistUnavailabilities: DentistUnavailability[];
}

interface AppointmentType {
  id: number;
  name: string;
  duration: number; // e.g. 45
  description?: string;
}

export default function TimeSlotPicker({ editingAppointmentId }: TimeSlotPickerProps) {
  const { control, setValue } = useFormContext();

  // Watch fields from the form
  const dentistId         = useWatch({ control, name: 'dentist_id' });
  const appointmentDate   = useWatch({ control, name: 'appointment_date' });
  const appointmentTypeId = useWatch({ control, name: 'appointment_type_id' });
  const selectedTime      = useWatch({ control, name: 'appointment_time' });

  // 1) Query the global schedules
  const { data: scheduleData } = useQuery<SchedulesResponse>({
    queryKey: ['schedule-data'],
    queryFn: async () => {
      const res = await getSchedules();
      return res.data;
    },
  });

  // 2) Query the day’s appointments
  const { data: dayAppointments = [] } = useQuery<DayAppointment[]>({
    queryKey: ['day-appointments', dentistId, appointmentDate, editingAppointmentId],
    queryFn: async () => {
      if (!dentistId || !appointmentDate) return [];
      const res = await getDayAppointments(Number(dentistId), appointmentDate, editingAppointmentId);
      return res.data.appointments || [];
    },
    enabled: Boolean(dentistId && appointmentDate),
  });

  // 3) (Optional) If you store appointment type durations in DB, fetch them
  //    so we can see exactly how long this type is. If you already have them in context
  //    or you pass them down, you can skip this query.
  const { data: allTypes = [] } = useQuery<AppointmentType[]>({
    queryKey: ['appointment-types'],
    queryFn: async () => {
      const res = await getAppointmentTypes();
      return res.data || [];
    },
    // If you already have them, skip or use a different approach
  });

  // Figure out the duration of the chosen appointment type
  const chosenType = allTypes.find((t) => t.id === Number(appointmentTypeId));
  // Fallback if none found:
  const chosenDuration = chosenType?.duration || 60;

  // 4) Compute the list of free slots
  const availableSlots = useMemo(() => {
    if (!dentistId || !appointmentDate || !appointmentTypeId || !scheduleData) return [];

    // Check if day is open or closed
    const dayObj = new Date(appointmentDate);
    if (isNaN(dayObj.getTime())) return [];

    // Day-of-week
    const wday = dayObj.getDay();
    if (!scheduleData.openDays.includes(wday)) {
      // clinic closed
      return [];
    }

    // Check if globally closed
    const dateStr = appointmentDate;
    const isClosedDay = scheduleData.closedDays.some((cd) => cd.date === dateStr);
    if (isClosedDay) return [];

    // Let’s break the day into smaller increments (15 min).
    const SLOT_INCREMENT = 15; // or 30 if you prefer
    // Then we use the user’s chosenDuration to see if that slot is fully free.

    // Parse open/close times
    const [openH, openM] = scheduleData.clinicOpenTime.split(':').map(Number);
    const [closeH, closeM] = scheduleData.clinicCloseTime.split(':').map(Number);

    const slots: string[] = [];
    let hour = openH;
    let min  = openM;

    // Build small steps from open->close
    while (
      hour < closeH ||
      (hour === closeH && min + SLOT_INCREMENT <= closeM)
    ) {
      const hh = String(hour).padStart(2, '0');
      const mm = String(min).padStart(2, '0');
      slots.push(`${hh}:${mm}`);

      min += SLOT_INCREMENT;
      if (min >= 60) {
        hour += Math.floor(min / 60);
        min = min % 60;
      }
    }

    // Dentist blocks
    const dentistBlocks = scheduleData.dentistUnavailabilities.filter(
      (u) => u.dentistId === Number(dentistId) && u.date === dateStr
    );

    // Filter to see if a block overlaps the entire [slotStart, slotEnd]
    // where slotEnd = slotStart + chosenDuration
    const freeSlots = slots.filter((slotStr) => {
      const [slotH, slotM] = slotStr.split(':').map(Number);
      const slotStart = new Date(dayObj);
      slotStart.setHours(slotH, slotM, 0, 0);
      const slotEnd = new Date(slotStart.getTime() + chosenDuration * 60_000);

      // (a) Check overlap with dentistBlocks
      const hasBlockOverlap = dentistBlocks.some((block) => {
        const [bStartH, bStartM] = block.startTime.split(':').map(Number);
        const [bEndH, bEndM]     = block.endTime.split(':').map(Number);

        const blockStart = new Date(dayObj);
        blockStart.setHours(bStartH, bStartM, 0, 0);
        const blockEnd = new Date(dayObj);
        blockEnd.setHours(bEndH, bEndM, 0, 0);

        // overlap if (slotStart < blockEnd && slotEnd > blockStart)
        return slotStart < blockEnd && slotEnd > blockStart;
      });
      if (hasBlockOverlap) return false;

      // (b) Check overlap with existing “SCHEDULED” appts
      const activeAppts = dayAppointments.filter((a) => a.status !== 'cancelled');
      const hasApptOverlap = activeAppts.some((appt) => {
        const apptStart = new Date(appt.appointmentTime);
        const apptEnd   = new Date(apptStart.getTime() + (appt.duration ?? 30) * 60_000);
        return slotStart < apptEnd && slotEnd > apptStart;
      });
      if (hasApptOverlap) return false;

      return true;
    });

    return freeSlots;
  }, [
    dentistId,
    appointmentDate,
    appointmentTypeId,
    scheduleData,
    dayAppointments,
    allTypes,
    chosenDuration,
  ]);

  // Display
  function displaySlot(slotStr: string) {
    const [h, m] = slotStr.split(':').map(Number);
    const dummy = new Date();
    dummy.setHours(h, m, 0, 0);
    return format(dummy, 'h:mm aa'); // e.g. "9:00 AM"
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue('appointment_time', e.target.value, {
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  // If we have no data or it's not ready
  if (!scheduleData) {
    return <p className="text-gray-500 mt-2">Loading schedule...</p>;
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Available Time Slots
      </label>
      <select
        value={selectedTime || ''}
        onChange={handleChange}
        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        disabled={!dentistId || !appointmentDate || !appointmentTypeId}
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
