// File: /src/pages/Appointments/New/components/DatePicker.tsx

import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DayPicker } from 'react-day-picker';
import { format, addMonths, isBefore, isAfter } from 'date-fns';
import { useFormContext, useWatch } from 'react-hook-form';
import 'react-day-picker/style.css'; // Make sure this is imported somewhere globally

import { getSchedules, getDentistAvailability } from '../../../../lib/api';

// Types your server might return
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
  openDays: number[];             // e.g. [1,2,3,4,5] => Monday..Friday
  closedDays: ClosedDay[];
  dentistUnavailabilities: DentistUnavailability[];
}

export default function DatePicker() {
  const { control, setValue } = useFormContext();

  // Watches from your form
  const dentistId = useWatch({ control, name: 'dentist_id' });
  const selectedDateStr = useWatch({ control, name: 'appointment_date' });

  // For controlling the “month” the calendar is showing
  const [month, setMonth] = useState<Date>(() => {
    // If you want the calendar to default to something, use a date a bit in the future or “today”
    return new Date(); // Start with current month
  });

  // 1) Query global schedules (openDays, closedDays, etc.)
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

  // 2) Dentist unavailability
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

  // Create a minDate (today) / maxDate (6 mo. in future)
  const minDate = new Date();
  const maxDate = addMonths(minDate, 6);

  // Figure out if a day is disabled
  const isDayDisabled = useCallback(
    (day: Date): boolean => {
      // If we are still loading schedule data, or no data yet, just disable everything
      if (!scheduleData) return true;

      // 1) If day < today or day > max => disable
      if (isBefore(day, minDate) || isAfter(day, maxDate)) return true;

      // 2) If day’s weekday is not in openDays
      const wday = day.getDay(); // 0=Sun,1=Mon,2=Tue,...
      if (!scheduleData.openDays.includes(wday)) {
        return true;
      }

      // 3) If day is in closedDays
      const dateStr = format(day, 'yyyy-MM-dd');
      const isGloballyClosed = scheduleData.closedDays.some(
        (cd) => cd.date === dateStr
      );
      if (isGloballyClosed) {
        return true;
      }

      // 4) If dentist has an unavailability that blocks the *entire* day
      const blocked = dentistUnavailData.some((u) => u.date === dateStr);
      if (blocked) {
        return true;
      }

      return false;
    },
    [scheduleData, dentistUnavailData]
  );

  // Convert selectedDateStr => actual Date
  const selectedDate = useMemo(() => {
    if (!selectedDateStr) return undefined;
    const dt = new Date(selectedDateStr);
    return isNaN(dt.getTime()) ? undefined : dt;
  }, [selectedDateStr]);

  // Handler: when user clicks a day
  const handleDayClick = (day: Date | undefined) => {
    if (!day) return;
    const dateStr = format(day, 'yyyy-MM-dd');
    setValue('appointment_date', dateStr, {
      shouldTouch: true,
      shouldValidate: true,
    });
    // Clear the time field so they re-pick after date changes
    setValue('appointment_time', '');
  };

  // Rendering states
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

  return (
    <div className="my-4">
      <p className="mb-2 text-sm text-gray-700 font-medium">Pick an Appointment Date</p>

      <DayPicker
        // "single" selection mode
        mode="single"
        // Which month to show
        month={month}
        onMonthChange={setMonth}
        // If you’d like to limit navigation, do:
        // startMonth={minDate}
        // endMonth={maxDate}
        // We rely on `isDayDisabled` instead of fromDate/toDate
        selected={selectedDate}
        onSelect={(day) => handleDayClick(day ?? undefined)}
        // This function decides if a day is disabled
        disabled={isDayDisabled}
        // You can set the defaultMonth to something else if you prefer
        defaultMonth={new Date()} 
      />
    </div>
  );
}
