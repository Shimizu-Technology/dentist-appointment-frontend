// File: /src/pages/Appointments/AppointmentCard.tsx
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, Clock, User } from 'lucide-react';
import type { Appointment } from '../../types';

interface AppointmentCardProps {
  appointment: Appointment;
}

export default function AppointmentCard({ appointment }: AppointmentCardProps) {
  // 1) Determine if it’s for a dependent vs main user
  const isForDependent = !!appointment.dependent;
  const displayName = isForDependent
    ? `${appointment.dependent?.firstName} ${appointment.dependent?.lastName}`
    : `${appointment.user?.firstName} ${appointment.user?.lastName}`;

  // 2) Format date/time
  let dateString = 'Invalid date';
  let timeString = '';
  try {
    const d = new Date(appointment.appointmentTime);
    if (!isNaN(d.getTime())) {
      dateString = format(d, 'MMMM d, yyyy');
      timeString = format(d, 'h:mm a');
    }
  } catch {
    /* no-op */
  }

  // 3) Color-coded label for status
  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  // 4) The entire card is wrapped in a <Link> to details
  return (
    <Link
      to={`/appointments/${appointment.id}`}
      className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
    >
      {/* Header: appointment type & status */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {appointment.appointmentType?.name || 'Appointment'}
        </h3>
        <span
          className={[
            'px-3 py-1 rounded-full text-sm font-medium',
            statusColors[appointment.status] || '',
          ].join(' ')}
        >
          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
        </span>
      </div>

      {/* Date / Time */}
      <div className="space-y-3 text-gray-600">
        <div className="flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          <span>{dateString}</span>
        </div>
        <div className="flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          <span>{timeString}</span>
        </div>

        {/* Who is it for? */}
        <div className="flex items-center">
          <User className="w-5 h-5 mr-2" />
          <span>
            {isForDependent
              ? `For ${displayName} (Dependent)`
              : `For ${displayName}`}
          </span>
        </div>
      </div>

      {/* Dentist info, if desired */}
      <div className="mt-3 text-gray-500 text-sm">
        {appointment.dentist && (
          <p>
            Dr. {appointment.dentist.firstName} {appointment.dentist.lastName}
          </p>
        )}
      </div>
    </Link>
  );
}
