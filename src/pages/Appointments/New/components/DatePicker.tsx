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

  // Watches from your form
  const dentistId = useWatch({ control, name: 'dentist_id' });
  const selectedDateStr = useWatch({ control, name: 'appointment_date' });

  // 1) Convert the string "YYYY-MM-DD" => Date
  //    We use parseISO if we like, or just new Date(dateStr).
  //    We store undefined if it’s invalid or blank.
  const selectedDate = useMemo(() => {
    if (!selectedDateStr) return undefined;
    // safer parse:
    const parsed = parseISO(selectedDateStr);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }, [selectedDateStr]);

  // 2) State for controlling which month the calendar is showing
  //    We start with selectedDate if available, or "today" otherwise.
  const [month, setMonth] = useState<Date>(selectedDate || new Date());

  // If the selectedDate changes (e.g., the form resets), update the calendar month
  useEffect(() => {
    if (selectedDate) {
      setMonth(selectedDate);
    }
  }, [selectedDate]);

  // 3) Schedules & Dentist Unavailability queries
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

  // 4) We limit the day range to within 6 months from now
  const minDate = new Date();
  const maxDate = addMonths(minDate, 6);

  // 5) Determine whether a day is disabled
  const isDayDisabled = useCallback(
    (day: Date): boolean => {
      // If no schedule data yet, we disable all days
      if (!scheduleData) return true;

      // (a) Out of min/max range
      if (isBefore(day, minDate) || isAfter(day, maxDate)) return true;

      // (b) If day’s weekday is not in openDays
      const wday = day.getDay(); // 0=Sun,1=Mon, etc.
      if (!scheduleData.openDays.includes(wday)) {
        return true;
      }

      // (c) If day is in closedDays
      const dateStr = format(day, 'yyyy-MM-dd');
      const isGloballyClosed = scheduleData.closedDays.some(
        (cd) => cd.date === dateStr
      );
      if (isGloballyClosed) {
        return true;
      }

      // (d) If this dentist has an all-day unavailability on that date
      const blocked = dentistUnavailData.some((u) => u.date === dateStr);
      if (blocked) {
        return true;
      }

      return false;
    },
    [scheduleData, dentistUnavailData, minDate, maxDate]
  );

  // 6) When a user selects a day
  const handleDayClick = (day: Date | undefined) => {
    if (!day) return;
    const dateStr = format(day, 'yyyy-MM-dd');
    setValue('appointment_date', dateStr, {
      shouldTouch: true,
      shouldValidate: true,
    });
    // Clear the time field if changing date
    setValue('appointment_time', '');
  };

  // 7) Handle loading / error states
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

  // 8) Render the DayPicker
  return (
    <div className="my-4">
      <label className="mb-2 text-sm text-gray-700 font-medium block">
        Pick an Appointment Date
      </label>

      <DayPicker
        mode="single"
        month={month}
        onMonthChange={setMonth}
        // If you also want to limit user navigation
        // fromDate={minDate}
        // toDate={maxDate}
        selected={selectedDate}
        onSelect={(day) => handleDayClick(day ?? undefined)}
        disabled={isDayDisabled}
      />
    </div>
  );
}
