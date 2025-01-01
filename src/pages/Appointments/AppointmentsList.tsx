// src/pages/Appointments/AppointmentsList.tsx
import { useQuery } from '@tanstack/react-query';
import { getAppointments } from '../../lib/api';
import AppointmentCard from './AppointmentCard';
import type { Appointment } from '../../types';

/** 
 * Matches the shape your Rails backend sends:
 * {
 *   appointments: [...array of Appointment...],
 *   meta: {
 *     currentPage: number,
 *     totalPages: number,
 *     totalCount: number,
 *     perPage: number
 *   }
 * }
 */
interface AppointmentsApiResponse {
  appointments: Appointment[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    perPage: number;
  };
}

export default function AppointmentsList() {
  // Use the matching type for the "data" your API actually returns:
  const { data, isLoading, error } = useQuery<AppointmentsApiResponse>({
    queryKey: ['appointments'],
    queryFn: async () => {
      const response = await getAppointments();
      return response.data; 
      // NOTE: response.data is now { appointments, meta }, not just an array
    },
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

  // Extract the array of appointments from the object
  const appointments = data?.appointments || [];

  // Sort from earliest date to latest date
  appointments.sort((a, b) => {
    const dateA = new Date(a.appointmentTime).getTime();
    const dateB = new Date(b.appointmentTime).getTime();
    return dateA - dateB; // ascending
  });

  if (!appointments.length) {
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
