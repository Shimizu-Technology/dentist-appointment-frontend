// File: /src/pages/Appointments/New/components/TimeSlotPicker.tsx

import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import {
  getSchedules,
  getDayAppointments,
} from '../../../../lib/api';
import { format } from 'date-fns'; // We'll use `format` to display 12h times

interface TimeSlotPickerProps {
  editingAppointmentId?: number;
}

interface DayAppointment {
  id: number;
  appointmentTime: string;
  duration: number;
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

  // 2) Query the day’s appointments for that dentist/date
  const { data: dayAppointments = [] } = useQuery<DayAppointment[]>({
    queryKey: ['day-appointments', dentistId, appointmentDate, editingAppointmentId],
    queryFn: async () => {
      if (!dentistId || !appointmentDate) return [];
      const res = await getDayAppointments(Number(dentistId), appointmentDate, editingAppointmentId);
      // res.data.appointments is an array of { id, appointmentTime, duration, status }
      return res.data.appointments || [];
    },
    enabled: Boolean(dentistId && appointmentDate),
  });

  // 3) Compute the list of free slots in "HH:mm" format
  const availableSlots = useMemo(() => {
    if (!dentistId || !appointmentDate || !appointmentTypeId || !scheduleData) return [];

    // Check if day is open or closed
    const dayObj = new Date(appointmentDate);
    if (isNaN(dayObj.getTime())) return [];

    // Day-of-week
    const wday = dayObj.getDay();
    if (!scheduleData.openDays.includes(wday)) {
      // Clinic closed on that weekday
      return [];
    }

    // Check if globally closed
    const dateStr = appointmentDate;
    const isClosedDay = scheduleData.closedDays.some(cd => cd.date === dateStr);
    if (isClosedDay) {
      return [];
    }

    // Suppose we fetch actual duration from the selected appointment type
    // but we'll just guess a default 60 min for demonstration:
    const assumedDuration = 60; // minutes

    // Parse clinic's open/close times, e.g. "09:00" => [9, 0]
    const [openH,  openM]  = scheduleData.clinicOpenTime.split(':').map(Number);
    const [closeH, closeM] = scheduleData.clinicCloseTime.split(':').map(Number);

    // Build candidate slots
    const slots: string[] = [];
    let hour = openH;
    let min  = openM;

    while (
      hour < closeH ||
      (hour === closeH && min + assumedDuration <= closeM)
    ) {
      const hh = String(hour).padStart(2, '0');
      const mm = String(min).padStart(2, '0');
      slots.push(`${hh}:${mm}`);

      min += assumedDuration;
      if (min >= 60) {
        hour += Math.floor(min / 60);
        min = min % 60;
      }
    }

    // Next, filter out any “DentistUnavailability” blocks for that date/dentist
    const dentistBlocks = scheduleData.dentistUnavailabilities.filter(
      (u) => u.dentistId === Number(dentistId) && u.date === dateStr
    );

    // Then exclude overlap with dayAppointments
    const freeSlots = slots.filter(slotStr => {
      const [slotH, slotM] = slotStr.split(':').map(Number);
      const slotStart = new Date(dayObj);
      slotStart.setHours(slotH, slotM, 0, 0);
      const slotEnd = new Date(slotStart.getTime() + assumedDuration * 60_000);

      // (a) Check overlap with dentistBlocks
      const hasBlockOverlap = dentistBlocks.some(block => {
        const [bStartH, bStartM] = block.startTime.split(':').map(Number);
        const [bEndH,   bEndM]   = block.endTime.split(':').map(Number);

        const blockStart = new Date(dayObj);
        blockStart.setHours(bStartH, bStartM, 0, 0);
        const blockEnd   = new Date(dayObj);
        blockEnd.setHours(bEndH, bEndM, 0, 0);

        return slotStart < blockEnd && slotEnd > blockStart;
      });
      if (hasBlockOverlap) return false;

      // (b) Check overlap with SCHEDULED appointments (ignore cancelled):
      // Filter out 'cancelled' (and possibly 'completed' if it shouldn’t block).
      const activeAppointments = dayAppointments.filter(appt => appt.status !== 'cancelled');

      const hasApptOverlap = activeAppointments.some(appt => {
        const apptStart = new Date(appt.appointmentTime);
        const apptDur   = appt.duration ?? 30;
        const apptEnd   = new Date(apptStart.getTime() + apptDur * 60_000);

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
  ]);

  // Helper to convert "HH:mm" => "h:mm a" for display
  function displaySlot(slotStr: string) {
    const [h, m] = slotStr.split(':').map(Number);
    // We'll build a Date object for the same day (just to format):
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
        {availableSlots.map(slot => (
          <option key={slot} value={slot}>
            {displaySlot(slot)} {/* 12-hour format display */}
          </option>
        ))}
      </select>
    </div>
  );
}
