// File: /src/pages/Appointments/New/components/AppointmentTypeSelect.tsx
import { useQuery } from '@tanstack/react-query';
import { getAppointmentTypes } from '../../../../lib/api';
import { useFormContext } from 'react-hook-form';
import type { AppointmentType } from '../../../../types';

export default function AppointmentTypeSelect() {
  const { register, formState: { errors }, watch } = useFormContext();
  const selectedTypeId = watch('appointment_type_id');

  const { data: appointmentTypes, isLoading } = useQuery<AppointmentType[]>({
    queryKey: ['appointmentTypes'],
    queryFn: async () => {
      const response = await getAppointmentTypes();
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="text-gray-500 mt-2">
        Loading appointment types...
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Appointment Type <span className="text-red-500">*</span>
      </label>
      <select
        {...register('appointment_type_id', {
          required: 'Please select an appointment type',
        })}
        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select type of appointment</option>
        {appointmentTypes?.map((type) => (
          <option key={type.id} value={String(type.id)}>
            {type.name} ({type.duration} minutes)
          </option>
        ))}
      </select>

      {errors.appointment_type_id && (
        <p className="mt-1 text-sm text-red-600">
          {String(errors.appointment_type_id.message)}
        </p>
      )}
    </div>
  );
}
