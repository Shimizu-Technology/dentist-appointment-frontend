import { useQuery } from '@tanstack/react-query';
import { getDentists } from '../../lib/api';
import DoctorCard from './DoctorCard';
import type { Dentist } from '../../types';

export default function DoctorsList() {
  const { data: doctors, isLoading, error } = useQuery<Dentist[]>({
    queryKey: ['dentists'],
    queryFn: async () => {
      const response = await getDentists();
      return response.data;
    }
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        Failed to load doctors. Please try again later.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {doctors?.map((doctor) => (
        <DoctorCard key={doctor.id} doctor={doctor} />
      ))}
    </div>
  );
}