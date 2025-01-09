// File: /src/pages/Appointments/New/components/TimeSlotPicker.tsx

import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import {
  getSchedules,
  getDayAppointments,
  getAppointmentTypes,
} from '../../../../lib/api';
import { format } from 'date-fns';

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
  date: string;
  startTime: string;
  endTime: string;
}

interface ClosedDay {
  id: number;
  date: string;
  reason?: string;
}

interface SchedulesResponse {
  clinicOpenTime: string;
  clinicCloseTime: string;
  openDays: number[];
  closedDays: ClosedDay[];
  dentistUnavailabilities: DentistUnavailability[];
}

interface AppointmentType {
  id: number;
  name: string;
  duration: number;
  description?: string;
}

export default function TimeSlotPicker({ editingAppointmentId }: TimeSlotPickerProps) {
  const { control, setValue } = useFormContext();

  // 1) Watch fields from the parent form
  const dentistId         = useWatch({ control, name: 'dentist_id' });
  const appointmentDate   = useWatch({ control, name: 'appointment_date' });
  const appointmentTypeId = useWatch({ control, name: 'appointment_type_id' });
  const selectedTime      = useWatch({ control, name: 'appointment_time' });

  // 2) Fetch global schedule
  const { data: scheduleData } = useQuery<SchedulesResponse>({
    queryKey: ['schedule-data'],
    queryFn: async () => {
      const res = await getSchedules();
      return res.data;
    },
  });

  // 3) Fetch existing appointments for that day
  const { data: dayAppointments = [] } = useQuery<DayAppointment[]>({
    queryKey: ['day-appointments', dentistId, appointmentDate, editingAppointmentId],
    queryFn: async () => {
      if (!dentistId || !appointmentDate) return [];
      const res = await getDayAppointments(Number(dentistId), appointmentDate, editingAppointmentId);
      return res.data.appointments || [];
    },
    enabled: Boolean(dentistId && appointmentDate),
  });

  // 4) If the appointment type durations are stored in DB, fetch them
  const { data: allTypes = [] } = useQuery<AppointmentType[]>({
    queryKey: ['appointment-types'],
    queryFn: async () => {
      const res = await getAppointmentTypes();
      return res.data || [];
    },
  });

  const chosenType    = allTypes.find((t) => t.id === Number(appointmentTypeId));
  const chosenDuration = chosenType?.duration || 60; // fallback

  // 5) Build a list of free 15-min time slots
  const availableSlots = useMemo(() => {
    if (!dentistId || !appointmentDate || !appointmentTypeId || !scheduleData) return [];

    const dayObj = new Date(appointmentDate);
    if (isNaN(dayObj.getTime())) return [];

    // If day-of-week not in openDays, or globally closed, we skip
    const wday = dayObj.getDay();
    if (!scheduleData.openDays.includes(wday)) return [];
    if (scheduleData.closedDays.some((cd) => cd.date === appointmentDate)) return [];

    // Build small increments
    const SLOT_INCREMENT = 15; // 15-min step
    const [openH, openM]  = scheduleData.clinicOpenTime.split(':').map(Number);
    const [closeH, closeM] = scheduleData.clinicCloseTime.split(':').map(Number);

    // Generate slot strings "HH:MM"
    const slots: string[] = [];
    let hour = openH;
    let min  = openM;

    while (hour < closeH || (hour === closeH && min + SLOT_INCREMENT <= closeM)) {
      slots.push(`${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`);
      min += SLOT_INCREMENT;
      if (min >= 60) {
        hour += Math.floor(min / 60);
        min = min % 60;
      }
    }

    // Gather that dentist’s unavailability blocks on that date
    const blocks = scheduleData.dentistUnavailabilities.filter(
      (b) => b.dentistId === Number(dentistId) && b.date === appointmentDate
    );

    // Filter out any slot that overlaps a block or another scheduled appt
    const freeSlots = slots.filter((slotStr) => {
      // Convert slot => a start..end range
      const [sh, sm] = slotStr.split(':').map(Number);
      const slotStart = new Date(dayObj);
      slotStart.setHours(sh, sm, 0, 0);
      const slotEnd = new Date(slotStart.getTime() + chosenDuration * 60_000);

      // (a) Check overlap with unavailability
      const hasBlockOverlap = blocks.some((block) => {
        const [bsh, bsm] = block.startTime.split(':').map(Number);
        const [beh, bem] = block.endTime.split(':').map(Number);
        const blockStart = new Date(dayObj);
        blockStart.setHours(bsh, bsm, 0, 0);
        const blockEnd = new Date(dayObj);
        blockEnd.setHours(beh, bem, 0, 0);

        return slotStart < blockEnd && slotEnd > blockStart;
      });
      if (hasBlockOverlap) return false;

      // (b) Check overlap with existing SCHEDULED appointments
      const activeAppts = dayAppointments.filter((a) => a.status !== 'cancelled');
      const conflicts = activeAppts.some((appt) => {
        // We have apptStart..apptEnd
        const apptStart = new Date(appt.appointmentTime);
        const realDur   = appt.duration || 30;
        const apptEnd   = new Date(apptStart.getTime() + realDur * 60_000);

        return slotStart < apptEnd && slotEnd > apptStart;
      });
      if (conflicts) return false;

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

  // 6) Utility to show a more readable time
  function displaySlot(slotStr: string) {
    const [h, m] = slotStr.split(':').map(Number);
    const dt = new Date();
    dt.setHours(h, m, 0, 0);
    return format(dt, 'h:mm aa'); // "9:00 AM"
  }

  // 7) When user selects from the dropdown
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue('appointment_time', e.target.value, {
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  // 8) If no schedule data or the user hasn't picked a date, we might show a placeholder
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
