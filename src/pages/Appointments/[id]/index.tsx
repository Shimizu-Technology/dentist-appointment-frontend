// File: /src/pages/Appointments/[id]/index.tsx

import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAppointment } from '../../../lib/api';
import AppointmentDetails from './AppointmentDetails';
import AppointmentHeader from './AppointmentHeader';
import type { Appointment } from '../../../types';

export default function AppointmentShow() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Single appointment fetch => we pass the numeric ID
  const appointmentId = Number(id);

  const { data, isLoading, error } = useQuery<Appointment>({
    queryKey: ['appointment', appointmentId],
    queryFn: async () => {
      const response = await getAppointment(appointmentId);
      // The server returns appointment data directly or { appointment: {...} } depending on your code
      return response.data; 
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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

  // If our query returned no data, or a 404 => data would be “null” or undefined.
  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Appointment Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The appointment you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.
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

  // Otherwise, we have the appointment
  const appointment: Appointment = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <AppointmentHeader appointment={appointment} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AppointmentDetails appointment={appointment} />
      </div>
    </div>
  );
}
