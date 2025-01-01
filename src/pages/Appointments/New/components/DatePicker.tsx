import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDentistAvailability } from '../../../../lib/api';
import Input from '../../../../components/UI/Input';

interface Availability {
  dentistId: number;
  dayOfWeek: number;
  startTime: string; // e.g. '09:00'
  endTime: string;   // e.g. '17:00'
}

interface DatePickerProps {
  dentistId?: string;        // Not strictly used if we rely on watch
  appointmentTypeId?: string;
  register: any;
  error?: string;
  watch: any;
}

export default function DatePicker({ register, error, watch }: DatePickerProps) {
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  // The form uses “dentist_id”
  const selectedDentistId = watch('dentist_id');

  // Query dentist availability
  const { data: availabilityData = [] } = useQuery<Availability[]>({
    queryKey: ['dentist-availability', selectedDentistId],
    queryFn: async () => {
      if (!selectedDentistId) return [];
      const res = await getDentistAvailability(parseInt(selectedDentistId, 10));
      return res.data;
    },
    enabled: !!selectedDentistId,
    initialData: [],
  });

  useEffect(() => {
    if (!selectedDentistId) {
      setAvailableDates([]);
      return;
    }

    if (!availabilityData.length) {
      setAvailableDates([]);
      return;
    }

    // Build next 30 days
    const dates: string[] = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, ...
      const isAvailable = availabilityData.some((slot) => slot.dayOfWeek === dayOfWeek);
      if (isAvailable) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    setAvailableDates(dates);
  }, [selectedDentistId, availabilityData]);

  return (
    <div>
      <Input
        type="date"
        label="Appointment Date"
        min={new Date().toISOString().split('T')[0]}
        {...register('appointment_date', {
          required: 'Please select a date',
          validate: (value: string) =>
            availableDates.includes(value) || 'Selected date is not available',
        })}
        error={error}
      />
      {!selectedDentistId && (
        <p className="mt-1 text-sm text-gray-500">Please select a dentist first</p>
      )}
      {selectedDentistId && availableDates.length === 0 && (
        <p className="mt-1 text-sm text-red-600">
          No available dates in the next 30 days
        </p>
      )}
    </div>
  );
}
