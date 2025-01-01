import { useQuery } from '@tanstack/react-query';
import { getDentists } from '../../../../lib/api';
import type { Dentist } from '../../../../types';

interface DentistSelectProps {
  register: any;
  error?: string;
}

export default function DentistSelect({ register, error }: DentistSelectProps) {
  const { data: dentists } = useQuery<Dentist[]>({
    queryKey: ['dentists'],
    queryFn: async () => {
      const response = await getDentists();
      return response.data;
    },
  });

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Select Dentist
      </label>
      <select
        // IMPORTANT: “dentist_id”
        {...register('dentist_id', { required: 'Please select a dentist' })}
        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Choose a dentist</option>
        {dentists?.map((dentist) => (
          <option key={dentist.id} value={dentist.id}>
            Dr. {dentist.firstName} {dentist.lastName} - {dentist.specialty}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
