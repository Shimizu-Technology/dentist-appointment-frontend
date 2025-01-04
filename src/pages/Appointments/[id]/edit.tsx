import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAppointments } from '../../../lib/api';
import NewAppointmentForm from '../New/NewAppointmentForm';
import { ArrowLeft } from 'lucide-react';
import type { Appointment } from '../../../types';

interface AppointmentsApiResponse {
  appointments: Appointment[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    perPage: number;
  };
}

export default function AppointmentEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Query all appointments (the user sees only theirs, admin sees all).
  const { data, isLoading, error } = useQuery<AppointmentsApiResponse>({
    queryKey: ['appointments'],
    queryFn: async () => {
      const response = await getAppointments();
      return response.data;
    },
  });

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

  const appointments = data?.appointments || [];
  const appointment = appointments.find((a) => a.id === Number(id));

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Appointment Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The appointment you're looking for doesn't exist.
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to={`/appointments/${id}`}
            className="inline-flex items-center text-blue-100 hover:text-white mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Appointment
          </Link>
          <h1 className="text-4xl font-bold text-white mb-4">
            Reschedule Appointment
          </h1>
          <p className="text-xl text-blue-100">
            Update your appointment details
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Just use the existing appointment as default for NewAppointmentForm */}
        <NewAppointmentForm
          appointment={appointment}
          onSuccess={() => navigate(`/appointments/${id}`)}
        />
      </div>
    </div>
  );
}
