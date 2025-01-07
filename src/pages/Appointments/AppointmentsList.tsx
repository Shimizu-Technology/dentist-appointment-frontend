// File: /src/pages/Appointments/AppointmentsList.tsx

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
  // Always see "only mine" for this page.
  const { data, isLoading, error } = useQuery<AppointmentsApiResponse>({
    queryKey: ['appointments', 'mine'],
    queryFn: async () => {
      // We pass onlyMine: true for both normal user & admin
      const response = await getAppointments(undefined, undefined, undefined, { onlyMine: true });
      return response.data; // shape: { appointments, meta }
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

  const appointments = data?.appointments || [];
  if (!appointments.length) {
    return (
      <div className="text-center py-12 text-gray-600">
        You have no appointments scheduled. Book your first appointment now!
      </div>
    );
  }

  // Separate upcoming vs. past
  const now = new Date();
  const upcoming = appointments.filter(
    (appt) => new Date(appt.appointmentTime).getTime() >= now.getTime()
  );
  const past = appointments.filter(
    (appt) => new Date(appt.appointmentTime).getTime() < now.getTime()
  );

  // Sort upcoming ascending
  upcoming.sort(
    (a, b) => new Date(a.appointmentTime).getTime() - new Date(b.appointmentTime).getTime()
  );
  // Sort past descending
  past.sort(
    (a, b) => new Date(b.appointmentTime).getTime() - new Date(a.appointmentTime).getTime()
  );

  return (
    <div className="space-y-8">
      {/* Upcoming */}
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

      {/* Past */}
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
