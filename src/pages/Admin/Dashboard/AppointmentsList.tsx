import { useQuery } from '@tanstack/react-query';
import { getAppointments } from '../../../lib/api';
import AdminAppointmentCard from './AdminAppointmentCard';
import type { Appointment } from '../../../types';

export default function AppointmentsList() {
  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ['admin-appointments'],
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">All Appointments</h2>
      </div>

      {appointments?.map((appointment) => (
        <AdminAppointmentCard key={appointment.id} appointment={appointment} />
      ))}
    </div>
  );
}