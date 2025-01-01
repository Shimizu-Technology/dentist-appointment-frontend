import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDentists, getAppointmentTypes } from '../../../../lib/api';
import { mockAvailability, mockBlockedDays } from '../../../../lib/mockData';
import { isDayAvailable } from '../../../../utils/availability';
import Input from '../../../../components/UI/Input';

interface DatePickerProps {
  dentistId?: string;
  appointmentTypeId?: string;
  register: any;
  error?: string;
  watch: any;
}

export default function DatePicker({ dentistId, register, error, watch }: DatePickerProps) {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  
  // Watch for dentist changes
  const selectedDentistId = watch('dentistId');

  useEffect(() => {
    if (!selectedDentistId) {
      setAvailableDates([]);
      return;
    }

    // Generate next 30 days
    const dates: string[] = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      if (isDayAvailable(parseInt(selectedDentistId), date, mockAvailability, mockBlockedDays)) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    
    setAvailableDates(dates);
  }, [selectedDentistId]);

  return (
    <div>
      <Input
        type="date"
        label="Appointment Date"
        min={new Date().toISOString().split('T')[0]}
        {...register('appointmentDate', { 
          required: 'Please select a date',
          validate: (value: string) => 
            availableDates.includes(value) || 'Selected date is not available'
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