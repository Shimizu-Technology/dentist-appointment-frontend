import { useQuery } from '@tanstack/react-query';
import { getAppointments } from '../../lib/api';
import AppointmentCard from './AppointmentCard';
import type { Appointment } from '../../types';

export default function AppointmentsList() {
  const { data: appointments, isLoading, error } = useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: async () => {
      const response = await getAppointments();
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
        Failed to load appointments. Please try again later.
      </div>
    );
  }

  if (!appointments?.length) {
    return (
      <div className="text-center py-12 text-gray-600">
        No appointments scheduled. Book your first appointment now!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {appointments.map((appointment) => (
        <AppointmentCard key={appointment.id} appointment={appointment} />
      ))}
    </div>
  );
}