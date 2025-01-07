// File: /src/pages/Appointments/AppointmentCard.tsx
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, Clock, User } from 'lucide-react';
import type { Appointment } from '../../types';
import { canManageAppointment } from '../../utils/appointments';
import AppointmentActions from '../../components/Appointments/AppointmentActions';

interface AppointmentCardProps {
  appointment: Appointment;
}

export default function AppointmentCard({ appointment }: AppointmentCardProps) {
  const navigate = useNavigate();

  // For a dependent vs. main user
  const isForDependent = !!appointment.dependent;
  const displayName = isForDependent
    ? `${appointment.dependent?.firstName} ${appointment.dependent?.lastName}`
    : `${appointment.user?.firstName} ${appointment.user?.lastName}`;

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

  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  // Handler for going to edit page
  const handleEdit = () => {
    navigate(`/appointments/${appointment.id}/edit`);
  };

  return (
    <div className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Title row: Appt Type & Status */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {appointment.appointmentType?.name || 'Appointment'}
        </h3>
        <span
          className={[
            'px-3 py-1 rounded-full text-sm font-medium',
            statusColors[appointment.status] ?? '',
          ].join(' ')}
        >
          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
        </span>
      </div>

      {/* Date / Time */}
      <div className="space-y-3 text-gray-600 mb-4">
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

      {/* Dentist info */}
      {appointment.dentist && (
        <p className="text-gray-500 text-sm">
          Dr. {appointment.dentist.firstName} {appointment.dentist.lastName}
        </p>
      )}

      {/* Link to details */}
      <div className="mt-4">
        <Link
          to={`/appointments/${appointment.id}`}
          className="text-blue-600 hover:underline text-sm"
        >
          View Details
        </Link>
      </div>

      {/* Actions if user can manage */}
      {canManageAppointment(appointment) && (
        <div className="mt-4">
          <AppointmentActions
            appointment={appointment}
            onEdit={handleEdit}
          />
        </div>
      )}
    </div>
  );
}
