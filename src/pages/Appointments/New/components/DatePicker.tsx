import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDentistAvailability } from '../../../../lib/api';
import Input from '../../../../components/UI/Input';

interface Availability {
  dentistId: number;
  dayOfWeek: number;  // e.g. 1 for Monday
  startTime: string;  // e.g. '09:00'
  endTime: string;    // e.g. '17:00'
}

interface DatePickerProps {
  dentistId?: string;
  appointmentTypeId?: string;
  register: any;
  error?: string;
  watch: any;
}

export default function DatePicker({ register, error, watch }: DatePickerProps) {
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  // Watch for dentist changes
  const selectedDentistId = watch('dentistId');

  // Query dentist availability from server
  const { data: availabilityData } = useQuery<Availability[]>(
    ['dentist-availability', selectedDentistId],
    async () => {
      if (!selectedDentistId) return [];
      const res = await getDentistAvailability(parseInt(selectedDentistId));
      return res.data; // array of availability
    },
    {
      enabled: !!selectedDentistId,
    }
  );

  useEffect(() => {
    if (!selectedDentistId || !availabilityData) {
      setAvailableDates([]);
      return;
    }

    // Generate next 30 days
    const dates: string[] = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Check if this day of week is in availabilityData
      const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, ...
      // find if there's an availability for this dayOfWeek
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
        {...register('appointmentDate', {
          required: 'Please select a date',
          validate: (value: string) =>
            availableDates.includes(value) || 'Selected date is not available',
        })}
        error={error}
      />
      {!selectedDentistId && (
        <p className="mt-1 text-sm text-gray-500">
          Please select a dentist first
        </p>
      )}
      {selectedDentistId && availableDates.length === 0 && (
        <p className="mt-1 text-sm text-red-600">
          No available dates in the next 30 days
        </p>
      )}
    </div>
  );
}
