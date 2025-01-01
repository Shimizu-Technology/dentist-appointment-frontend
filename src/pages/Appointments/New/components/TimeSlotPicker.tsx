import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDentistAvailability } from '../../../../lib/api';

interface Availability {
  dentistId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface TimeSlotPickerProps {
  dentistId?: string;
  appointmentTypeId?: string;
  appointmentDate?: string;
  register: any;
  error?: string;
  watch: any;
}

export default function TimeSlotPicker({
  register,
  error,
  watch,
}: TimeSlotPickerProps) {
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  const selectedDentistId = watch('dentistId');
  const selectedDate = watch('appointmentDate');
  const selectedTypeId = watch('appointmentTypeId');

  // Optional: you might have the real appointment type duration
  const appointmentDuration = 30; // default to 30

  // Query the dentist’s availability
  const { data: availabilityData = [] } = useQuery<Availability[]>(
    ['dentist-availability', selectedDentistId],
    async () => {
      if (!selectedDentistId) return [];
      const res = await getDentistAvailability(parseInt(selectedDentistId));
      return res.data;
    },
    {
      enabled: !!selectedDentistId,
      initialData: [],
    }
  );

  useEffect(() => {
    // If any requirement not met, clear
    if (!selectedDentistId || !selectedDate || !selectedTypeId) {
      setAvailableSlots([]);
      return;
    }

    // If no availability data:
    if (!availabilityData.length) {
      setAvailableSlots([]);
      return;
    }

    // Identify dayOfWeek from selectedDate
    const dayObj = new Date(selectedDate);
    const dayOfWeek = dayObj.getDay();

    // Find matching availability for that day
    const dayAvailability = availabilityData.find(
      (slot) => slot.dayOfWeek === dayOfWeek
    );
    if (!dayAvailability) {
      setAvailableSlots([]);
      return;
    }

    // Generate time slots from startTime to endTime
    const { startTime, endTime } = dayAvailability;
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const slots: string[] = [];
    let currentHour = startHour;
    let currentMinute = startMinute;

    while (
      currentHour < endHour ||
      (currentHour === endHour && currentMinute + appointmentDuration <= endMinute)
    ) {
      const hourStr = String(currentHour).padStart(2, '0');
      const minuteStr = String(currentMinute).padStart(2, '0');
      slots.push(`${hourStr}:${minuteStr}`);

      currentMinute += appointmentDuration;
      if (currentMinute >= 60) {
        currentHour += Math.floor(currentMinute / 60);
        currentMinute = currentMinute % 60;
      }
    }

    setAvailableSlots(slots);
  }, [selectedDentistId, selectedDate, selectedTypeId, availabilityData, appointmentDuration]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Available Time Slots
      </label>
      <select
        {...register('appointmentTime', { required: 'Please select a time slot' })}
        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        disabled={!selectedDentistId || !selectedDate || !selectedTypeId}
      >
        <option value="">Select a time slot</option>
        {availableSlots.map((slot) => (
          <option key={slot} value={slot}>
            {slot}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {!selectedDentistId && (
        <p className="mt-1 text-sm text-gray-500">
          Please select a dentist first
        </p>
      )}
      {!selectedDate && selectedDentistId && (
        <p className="mt-1 text-sm text-gray-500">
          Please select a date first
        </p>
      )}
      {!selectedTypeId && selectedDate && selectedDentistId && (
        <p className="mt-1 text-sm text-gray-500">
          Please select an appointment type
        </p>
      )}
    </div>
  );
}
