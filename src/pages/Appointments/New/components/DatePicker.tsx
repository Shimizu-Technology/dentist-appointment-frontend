import 'react-day-picker/dist/style.css'; // <--- Make sure to import DayPicker CSS
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DayPicker } from 'react-day-picker';
import { parseISO, isBefore, isAfter, format } from 'date-fns';
import { useFormContext, useWatch } from 'react-hook-form';

// We no longer import getClinicDaySettings or getClosedDays separately.
// Instead, we’ll fetch them from getSchedules().
import { getSchedules, getDentistAvailability } from '../../../../lib/api';

interface DentistUnavailability {
  id: number;
  dentistId: number;
  date: string;   // "YYYY-MM-DD"
  startTime: string;
  endTime: string;
  reason?: string;
}
interface ClosedDay {
  id: number;
  date: string;
  reason?: string;
}
interface ClinicDaySetting {
  id: number;
  dayOfWeek: number;    // 0=Sunday..6=Saturday
  isOpen: boolean;
  openTime: string;     // "HH:mm"
  closeTime: string;    // "HH:mm"
}

export default function DatePicker() {
  const { control, setValue } = useFormContext();

  // Watch fields from the form
  const dentistId = useWatch({ name: 'dentist_id', control });
  const selectedDateStr = useWatch({ name: 'appointment_date', control });

  // Convert "YYYY-MM-DD" -> Date
  const selectedDate = useMemo(() => {
    if (!selectedDateStr) return undefined;
    const d = parseISO(selectedDateStr);
    return isNaN(d.getTime()) ? undefined : d;
  }, [selectedDateStr]);

  // Local state to track which month is displayed
  const [month, setMonth] = useState<Date>(selectedDate || new Date());

  // After the user picks a date, ensure the calendar focuses that date
  useEffect(() => {
    if (selectedDate) {
      setMonth(selectedDate);
    }
  }, [selectedDate]);

  /**
   * Fetch schedule data from GET /schedule so we can get:
   * - clinicDaySettings
   * - closedDays
   */
  const { data: scheduleData } = useQuery({
    queryKey: ['schedule-data'],
    queryFn: async () => {
      const res = await getSchedules();
      return res.data; 
      // => { clinicDaySettings: [...], closedDays: [...], dentistUnavailabilities: [...] }
    },
  });
  // Extract arrays (fallback to []) so they’re never undefined
  const daySettings: ClinicDaySetting[] = scheduleData?.clinicDaySettings || [];
  const closedDays: ClosedDay[] = scheduleData?.closedDays || [];

  // Dentist unavailability (for partial-day blocks), if needed
  const { data: unavailData = [] } = useQuery<DentistUnavailability[]>({
    queryKey: ['dentist-availability', dentistId],
    queryFn: async () => {
      if (!dentistId) return [];
      const res = await getDentistAvailability(Number(dentistId));
      return res.data; 
      // => array of unavailability objects
    },
    enabled: !!dentistId,
  });

  // Limit selection to [today..+6 months]
  const minDate = new Date();
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 6);

  // DayPicker callback to disable certain days
  const isDayDisabled = useCallback(
    (day: Date): boolean => {
      // If daySettings not loaded yet, disable
      if (!daySettings.length) return true;

      // Outside [minDate..maxDate]
      if (isBefore(day, minDate) || isAfter(day, maxDate)) return true;

      // If closedDays includes this date
      const dateStr = format(day, 'yyyy-MM-dd');
      if (closedDays.some((cd) => cd.date === dateStr)) {
        return true;
      }

      // If dayOfWeek is not open
      const wday = day.getDay(); // 0=Sun..6=Sat
      const setting = daySettings.find((ds) => ds.dayOfWeek === wday);
      if (!setting || !setting.isOpen) {
        return true;
      }

      return false;
    },
    [daySettings, closedDays, minDate, maxDate]
  );

  // When a day is clicked
  const handleDayClick = (day: Date | undefined) => {
    if (!day) return;
    const dateStr = format(day, 'yyyy-MM-dd');
    setValue('appointment_date', dateStr, { shouldTouch: true, shouldValidate: true });
    // Clear the time (since date changed)
    setValue('appointment_time', '');
  };

  if (!dentistId) {
    return <p className="text-gray-500 mt-2">Please select a dentist first.</p>;
  }

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
