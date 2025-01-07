// File: /src/pages/Appointments/New/Confirmation.tsx

import { CheckCircle } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAppointments } from '../../../lib/api';
import { format } from 'date-fns';
import type { Appointment } from '../../../types';

interface AppointmentsApiResponse {
  appointments: Appointment[];
  meta: any; // omitted for brevity
}

export default function BookingConfirmation() {
  const { id } = useParams();

  // We'll re-use the same “getAppointments” or the single “getAppointments” call,
  // then find the appointment with `id`. Another approach is to create an endpoint
  // to fetch by ID. For simplicity, we do the same approach as AppointmentShow.
  const { data, isLoading, error } = useQuery<AppointmentsApiResponse>({
    queryKey: ['appointments'],
    queryFn: async () => {
      const res = await getAppointments();
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
  const appointment = appointments.find((appt) => appt.id === Number(id));

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

  // Format date/time
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
      {/* Big checkmark or success icon */}
      <CheckCircle className="w-24 h-24 text-green-500 mb-6" />

      <h1 className="text-3xl font-bold text-gray-800 mb-4">Appointment Booked!</h1>
      <p className="text-lg text-gray-600 mb-12">
        Your appointment has been successfully scheduled.
      </p>

      {/* Appointment details card */}
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
            {isForDependent ? displayName : displayName}
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

      {/* Link to see all appointments */}
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
