// File: /src/pages/Appointments/New/components/DatePicker.tsx

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DayPicker } from 'react-day-picker';
import { format, addMonths, isBefore, isAfter, parseISO } from 'date-fns';
import { useFormContext, useWatch } from 'react-hook-form';
import 'react-day-picker/style.css';

import { getSchedules, getDentistAvailability } from '../../../../lib/api';

interface DentistUnavailability {
  id: number;
  dentistId: number;
  date: string;      // "YYYY-MM-DD"
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  reason?: string;
}

interface ClosedDay {
  id: number;
  date: string; // "YYYY-MM-DD"
  reason?: string;
}

interface SchedulesResponse {
  clinicOpenTime: string;
  clinicCloseTime: string;
  openDays: number[]; // e.g. [1,2,3,4,5]
  closedDays: ClosedDay[];
  dentistUnavailabilities: DentistUnavailability[];
}

export default function DatePicker() {
  const { control, setValue } = useFormContext();

  // 1) Watch the dentist and the currently selected date (string "YYYY-MM-DD")
  const dentistId = useWatch({ control, name: 'dentist_id' });
  const selectedDateStr = useWatch({ control, name: 'appointment_date' });

  // 2) Convert "YYYY-MM-DD" -> Date, or undefined if invalid
  const selectedDate = useMemo(() => {
    if (!selectedDateStr) return undefined;
    const parsed = parseISO(selectedDateStr); // or new Date(selectedDateStr)
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }, [selectedDateStr]);

  // 3) Use local state to control which month the calendar shows
  const [month, setMonth] = useState<Date>(selectedDate || new Date());

  // Whenever the selected date changes (e.g. form resets), jump the calendar to it
  useEffect(() => {
    if (selectedDate) {
      setMonth(selectedDate);
    }
  }, [selectedDate]);

  // 4) Fetch schedules and partial unavailabilities
  const {
    data: scheduleData,
    isLoading: scheduleLoading,
    isError: scheduleError,
  } = useQuery<SchedulesResponse>({
    queryKey: ['schedules'],
    queryFn: async () => {
      const res = await getSchedules();
      return res.data;
    },
  });

  const {
    data: dentistUnavailData = [],
    isLoading: dentistLoading,
    isError: dentistError,
  } = useQuery<DentistUnavailability[]>({
    queryKey: ['dentist-availability', dentistId],
    queryFn: async () => {
      if (!dentistId) return [];
      const res = await getDentistAvailability(Number(dentistId));
      return res.data;
    },
    enabled: !!dentistId,
  });

  // 5) Limit selection from [today .. +6 months]
  const minDate = new Date();
  const maxDate = addMonths(minDate, 6);

  // 6) Decide if a day is disabled
  const isDayDisabled = useCallback(
    (day: Date): boolean => {
      if (!scheduleData) return true;

      // (a) If day is outside [minDate, maxDate], disable
      if (isBefore(day, minDate) || isAfter(day, maxDate)) return true;

      // (b) If day’s weekday not in scheduleData.openDays, disable
      const wday = day.getDay(); // 0=Sunday,1=Monday,...
      if (!scheduleData.openDays.includes(wday)) {
        return true;
      }

      // (c) If the clinic is globally closed that day
      const dateStr = format(day, 'yyyy-MM-dd');
      const isGloballyClosed = scheduleData.closedDays.some(
        (cd) => cd.date === dateStr
      );
      if (isGloballyClosed) {
        return true;
      }

      // (d) REMOVE the old logic that “any unavailability => entire day blocked”
      // We now allow partial day usage, so we do NOT disable the day
      // just because unavailability exists.

      return false; // The day is allowed
    },
    [scheduleData, minDate, maxDate]
  );

  // 7) When user picks a day
  const handleDayClick = (day: Date | undefined) => {
    if (!day) return;
    const dateStr = format(day, 'yyyy-MM-dd');
    // Update form
    setValue('appointment_date', dateStr, {
      shouldTouch: true,
      shouldValidate: true,
    });
    // Clear the time if changing date
    setValue('appointment_time', '');
  };

  // 8) Show loading/error placeholders
  if (scheduleLoading || dentistLoading) {
    return <p className="text-gray-500 mt-2">Loading schedule...</p>;
  }
  if (scheduleError) {
    return <p className="text-red-600 mt-2">Failed to load clinic schedule.</p>;
  }
  if (dentistError) {
    return <p className="text-red-600 mt-2">Failed to load dentist availability.</p>;
  }
  if (!scheduleData) {
    return <p className="text-red-600 mt-2">No schedule data found.</p>;
  }
  if (!dentistId) {
    return <p className="text-gray-500 mt-2">Please select a dentist first.</p>;
  }

  // 9) Render
  return (
    <div className="my-4">
      <label className="mb-2 text-sm text-gray-700 font-medium block">
        Pick an Appointment Date
      </label>

      <DayPicker
        mode="single"
        month={month}
        onMonthChange={setMonth}
        selected={selectedDate}
        onSelect={(day) => handleDayClick(day ?? undefined)}
        disabled={isDayDisabled}
      />
    </div>
  );
}
