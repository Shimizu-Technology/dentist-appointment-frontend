// File: /src/pages/Appointments/New/Confirmation.tsx

import { CheckCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAppointments } from '../../../lib/api';
import { format } from 'date-fns';
import type { Appointment } from '../../../types';

interface AppointmentsApiResponse {
  appointments: Appointment[];
  meta: any; // omitted for brevity
}

export default function BookingConfirmation() {
  // 1) We read “id” from the query string
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const idParam = searchParams.get('id');

  // 2) If no ID => show an error or fallback
  if (!idParam) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          No appointment ID provided.
        </h2>
        <Link
          to="/appointments"
          className="text-blue-600 hover:text-blue-800 font-medium underline"
        >
          Back to My Appointments
        </Link>
      </div>
    );
  }

  // 3) We fetch all “my” appointments or all if admin, etc. But simplest is to
  //    reuse the “appointments” query, then find the one with ID = idParam.
  const { data, isLoading, error } = useQuery<AppointmentsApiResponse>({
    queryKey: ['appointments', 'mine'],
    queryFn: async () => {
      // same logic as “My Appointments” to ensure you can see your own
      const res = await getAppointments(undefined, undefined, undefined, { onlyMine: true });
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-600">
        Failed to load appointment data.
      </div>
    );
  }

  const appointments = data?.appointments || [];
  const appointment = appointments.find((appt) => appt.id === Number(idParam));

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Appointment Not Found
        </h2>
        <Link
          to="/appointments"
          className="text-blue-600 hover:text-blue-800 font-medium underline"
        >
          Back to My Appointments
        </Link>
      </div>
    );
  }

  // 4) Format date/time
  let dateStr = '';
  let timeStr = '';
  try {
    const dt = new Date(appointment.appointmentTime);
    dateStr = format(dt, 'MMMM d, yyyy');
    timeStr = format(dt, 'h:mm a');
  } catch {}

  const isForDependent = appointment.dependentId != null;
  const displayName = isForDependent && appointment.dependent
    ? `${appointment.dependent.firstName} ${appointment.dependent.lastName}`
    : appointment.user
      ? `${appointment.user.firstName} ${appointment.user.lastName}`
      : 'Unknown';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-16 px-4">
      <CheckCircle className="w-24 h-24 text-green-500 mb-6" />

      <h1 className="text-3xl font-bold text-gray-800 mb-4">Appointment Booked!</h1>
      <p className="text-lg text-gray-600 mb-12">
        Your appointment has been successfully scheduled.
      </p>

      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-xl">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {appointment.appointmentType?.name || 'Appointment'}
          </h2>
          <p className="text-sm text-gray-500">
            Status: {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </p>
        </div>

        <div className="space-y-2 text-gray-700">
          <p>
            <span className="font-medium">Date:</span> {dateStr}
          </p>
          <p>
            <span className="font-medium">Time:</span> {timeStr}
          </p>
          <p>
            <span className="font-medium">For: </span>{' '}
            {displayName}
          </p>
          {appointment.dentist && (
            <p>
              <span className="font-medium">Dentist:</span>{' '}
              Dr. {appointment.dentist.firstName} {appointment.dentist.lastName}
            </p>
          )}
          {appointment.notes && (
            <p>
              <span className="font-medium">Notes:</span> {appointment.notes}
            </p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <Link
          to="/appointments"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md
                     hover:bg-blue-700 transition-colors font-semibold"
        >
          View My Appointments
        </Link>
      </div>
    </div>
  );
}
