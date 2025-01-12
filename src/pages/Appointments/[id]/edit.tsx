// File: /src/pages/Appointments/[id]/edit.tsx

import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { getAppointment } from '../../../lib/api';
import NewAppointmentForm from '../New/NewAppointmentForm';
import { format } from 'date-fns';
import type { Appointment } from '../../../types';

export default function AppointmentEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const appointmentId = Number(id);

  // 1) Pull just *this* appointment by ID
  const {
    data: appointment,
    isLoading,
    error,
  } = useQuery<Appointment>({
    queryKey: ['appointment', appointmentId],
    queryFn: async () => {
      const res = await getAppointment(appointmentId);
      return res.data; // { ...appointment }
    },
    enabled: !isNaN(appointmentId),
  });

  if (isNaN(appointmentId)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          Invalid appointment ID
        </h2>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Failed to load appointment
          </h2>
          <button
            onClick={() => navigate('/appointments')}
            className="text-blue-600 hover:text-blue-700"
          >
            Return to Appointments
          </button>
        </div>
      </div>
    );
  }

  // If we get back null or undefined => 404/forbidden
  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Appointment Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The appointment you’re looking for doesn’t exist or isn’t yours.
          </p>
          <button
            onClick={() => navigate('/appointments')}
            className="text-blue-600 hover:text-blue-700"
          >
            Return to Appointments
          </button>
        </div>
      </div>
    );
  }

  // Show “Currently scheduled” date/time if you want:
  let scheduledInfo = '';
  try {
    const dt = new Date(appointment.appointmentTime);
    if (!isNaN(dt.getTime())) {
      scheduledInfo = `Currently scheduled: ${format(dt, 'MMMM d, yyyy h:mm a')}`;
    }
  } catch {
    // no-op
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to={`/appointments/${id}`}
            className="inline-flex items-center text-blue-100 hover:text-white mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Appointment
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Reschedule Appointment</h1>
          <p className="text-xl text-blue-100">Update your appointment details</p>
          {scheduledInfo && (
            <p className="mt-2 text-sm text-blue-100">{scheduledInfo}</p>
          )}
        </div>
      </div>

      {/* Body: reuse same form as “new,” but pass the existing appointment */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <NewAppointmentForm
          appointment={appointment} // pre-fill the form
          onSuccess={() => navigate(`/appointments/${id}`)}
        />
      </div>
    </div>
  );
}
