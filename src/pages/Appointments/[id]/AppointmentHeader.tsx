// File: /src/pages/Appointments/[id]/AppointmentHeader.tsx

import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Appointment } from '../../../types';

interface AppointmentHeaderProps {
  appointment: Appointment;
}

export default function AppointmentHeader({ appointment }: AppointmentHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/appointments"
          className="inline-flex items-center text-blue-100 hover:text-white mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Appointments
        </Link>
        <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 sm:mb-4">
          {appointment.appointmentType?.name}
        </h1>
        {appointment.dentist && (
          <p className="text-base sm:text-xl text-blue-100">
            Appointment with Dr. {appointment.dentist.firstName} {appointment.dentist.lastName}
          </p>
        )}
      </div>
    </div>
  );
}
