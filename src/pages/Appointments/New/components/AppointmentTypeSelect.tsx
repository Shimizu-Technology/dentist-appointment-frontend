// File: /src/pages/Appointments/New/components/AppointmentTypeSelect.tsx
import { useQuery } from '@tanstack/react-query';
import { getAppointmentTypes } from '../../../../lib/api';
import { useFormContext } from 'react-hook-form';
import type { AppointmentType } from '../../../../types';

export default function AppointmentTypeSelect() {
  const { register, formState: { errors } } = useFormContext();

  const { data: appointmentTypes } = useQuery<AppointmentType[]>({
    queryKey: ['appointmentTypes'],
    queryFn: async () => {
      const response = await getAppointmentTypes();
      return response.data;
    },
  });

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Appointment Type
      </label>
      <select
        // Instead of props.register, we do:
        {...register('appointment_type_id', {
          required: 'Please select an appointment type',
        })}
        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select type of appointment</option>
        {appointmentTypes?.map((type) => (
          <option key={type.id} value={type.id}>
            {type.name} ({type.duration} minutes)
          </option>
        ))}
      </select>

      {/* If you want to show error: */}
      {errors.appointment_type_id && (
        <p className="mt-1 text-sm text-red-600">
          {errors.appointment_type_id.message as string}
        </p>
      )}
    </div>
  );
}
