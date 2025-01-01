import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAppointments } from '../../../lib/api';
import AppointmentDetails from './AppointmentDetails';
import AppointmentHeader from './AppointmentHeader';
import Footer from '../../../components/Layout/Footer';
import type { Appointment } from '../../../types';

export default function AppointmentShow() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: async () => {
      const response = await getAppointments();
      return response.data;
    }
  });

  const appointment = appointments?.find(a => a.id === Number(id));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Appointment Not Found</h2>
          <p className="text-gray-600 mb-4">The appointment you're looking for doesn't exist.</p>
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
      <AppointmentHeader appointment={appointment} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AppointmentDetails appointment={appointment} />
      </div>
      <Footer />
    </div>
  );
}