import { useEffect, useState } from 'react';
import { mockAvailability } from '../../../../lib/mockData';
import { getAvailableTimeSlots } from '../../../../utils/availability';

interface TimeSlotPickerProps {
  dentistId?: string;
  appointmentTypeId?: string;
  appointmentDate?: string;
  register: any;
  error?: string;
  watch: any;
}

export default function TimeSlotPicker({ register, error, watch }: TimeSlotPickerProps) {
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  
  const selectedDentistId = watch('dentistId');
  const selectedDate = watch('appointmentDate');
  const selectedTypeId = watch('appointmentTypeId');

  useEffect(() => {
    if (!selectedDentistId || !selectedDate || !selectedTypeId) {
      setAvailableSlots([]);
      return;
    }

    // Get appointment duration
    const appointmentDuration = 30; // Default to 30 minutes if type not found

    const slots = getAvailableTimeSlots(
      parseInt(selectedDentistId),
      new Date(selectedDate),
      mockAvailability,
      appointmentDuration
    );
    
    setAvailableSlots(slots);
  }, [selectedDentistId, selectedDate, selectedTypeId]);

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
        {availableSlots.map(slot => (
          <option key={slot} value={slot}>
            {slot}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
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