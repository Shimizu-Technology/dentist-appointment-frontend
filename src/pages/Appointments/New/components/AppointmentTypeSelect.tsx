import { useQuery } from '@tanstack/react-query';
import { getAppointmentTypes } from '../../../../lib/api';
import type { AppointmentType } from '../../../../types';

interface AppointmentTypeSelectProps {
  register: any;
  error?: string;
}

export default function AppointmentTypeSelect({ register, error }: AppointmentTypeSelectProps) {
  const { data: appointmentTypes } = useQuery<AppointmentType[]>({
    queryKey: ['appointmentTypes'],
    queryFn: async () => {
      const response = await getAppointmentTypes();
      return response.data;
    }
  });

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Appointment Type
      </label>
      <select
        {...register('appointmentTypeId', { required: 'Please select an appointment type' })}
        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select type of appointment</option>
        {appointmentTypes?.map(type => (
          <option key={type.id} value={type.id}>
            {type.name} ({type.duration} minutes)
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}