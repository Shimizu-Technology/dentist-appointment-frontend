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
  // Use the matching type for the "data" your API returns:
  const { data, isLoading, error } = useQuery<AppointmentsApiResponse>({
    queryKey: ['appointments'],
    queryFn: async () => {
      const response = await getAppointments();
      return response.data; 
      // NOTE: response.data is { appointments, meta }, not just an array
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

  if (!appointments.length) {
    return (
      <div className="text-center py-12 text-gray-600">
        You have no appointments scheduled. Book your first appointment now!
      </div>
    );
  }

  // Separate upcoming vs. past appointments
  const now = new Date();
  const upcoming = appointments.filter(
    (appt) => new Date(appt.appointmentTime).getTime() >= now.getTime()
  );
  const past = appointments.filter(
    (appt) => new Date(appt.appointmentTime).getTime() < now.getTime()
  );

  // Sort upcoming in ascending order (earliest first)
  upcoming.sort(
    (a, b) => new Date(a.appointmentTime).getTime() - new Date(b.appointmentTime).getTime()
  );
  // Sort past in descending order (most recent first)
  past.sort(
    (a, b) => new Date(b.appointmentTime).getTime() - new Date(a.appointmentTime).getTime()
  );

  return (
    <div className="space-y-8">
      {/* Upcoming Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Upcoming Appointments</h2>
        {upcoming.length === 0 ? (
          <p className="text-gray-500">No upcoming appointments.</p>
        ) : (
          <div className="space-y-6">
            {upcoming.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        )}
      </section>

      {/* Past (Archive) Section */}
      <section>
        <h2 className="text-xl font-semibold mt-6 mb-4 text-gray-800">Past Appointments</h2>
        {past.length === 0 ? (
          <p className="text-gray-500">No past appointments.</p>
        ) : (
          <div className="space-y-6">
            {past.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
