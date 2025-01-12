// File: /src/pages/Appointments/[id]/AppointmentDetails.tsx

import { format } from 'date-fns';
import { Calendar, Clock, User, FileText, StickyNote } from 'lucide-react';
import type { Appointment } from '../../../types';
import AppointmentActions from '../../../components/Appointments/AppointmentActions';
import { useNavigate } from 'react-router-dom';
import { canManageAppointment } from '../../../utils/appointments';

interface AppointmentDetailsProps {
  appointment: Appointment;
}

export default function AppointmentDetails({ appointment }: AppointmentDetailsProps) {
  const navigate = useNavigate();

  const isForDependent = !!appointment.dependent;
  const displayName = isForDependent
    ? `${appointment.dependent?.firstName} ${appointment.dependent?.lastName} (Dependent)`
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
    // no-op
  }

  const handleEdit = () => {
    navigate(`/appointments/${appointment.id}/edit`);
  };

  // Simple color-coded status badge
  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white rounded-md shadow-md p-4 sm:p-6 lg:p-8">
      {/* Top row: status + any user-manageable actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div>
          <span
            className={[
              'inline-block px-3 py-1 rounded-full text-sm font-medium',
              statusColors[appointment.status] || 'bg-gray-100 text-gray-800',
            ].join(' ')}
          >
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </span>
        </div>
        {canManageAppointment(appointment) && (
          <div className="flex gap-2">
            <AppointmentActions appointment={appointment} onEdit={handleEdit} />
          </div>
        )}
      </div>

      {/* Appointment For */}
      <DetailRow
        icon={<User className="w-5 h-5 text-blue-600" />}
        title="Appointment For"
        content={displayName}
      />

      {/* Date */}
      <DetailRow
        icon={<Calendar className="w-5 h-5 text-blue-600" />}
        title="Date"
        content={dateString}
      />

      {/* Time */}
      <DetailRow
        icon={<Clock className="w-5 h-5 text-blue-600" />}
        title="Time"
        content={timeString}
      />

      {/* Dentist */}
      <DetailRow
        icon={<User className="w-5 h-5 text-blue-600" />}
        title="Dentist"
        content={
          appointment.dentist ? (
            <>
              <p>
                Dr. {appointment.dentist.firstName} {appointment.dentist.lastName}
              </p>
              <p className="text-sm text-gray-500">
                {appointment.dentist.specialty === 'pediatric'
                  ? 'Pediatric Dentist'
                  : 'General Dentist'}
              </p>
            </>
          ) : (
            'N/A'
          )
        }
      />

      {/* Appointment Type */}
      <DetailRow
        icon={<FileText className="w-5 h-5 text-blue-600" />}
        title="Appointment Type"
        content={
          appointment.appointmentType ? (
            <>
              <p>{appointment.appointmentType.name}</p>
              {appointment.appointmentType.duration && (
                <p className="text-sm text-gray-500">
                  Duration: {appointment.appointmentType.duration} minutes
                </p>
              )}
            </>
          ) : (
            'N/A'
          )
        }
      />

      {/* Notes */}
      <DetailRow
        icon={<StickyNote className="w-5 h-5 text-blue-600" />}
        title="Notes"
        content={
          appointment.notes && appointment.notes.trim().length > 0
            ? appointment.notes
            : 'No notes provided.'
        }
      />
    </div>
  );
}

/**
 * Small helper component to reduce repetition in the layout.
 */
function DetailRow({
  icon,
  title,
  content,
}: {
  icon: React.ReactNode;
  title: string;
  content: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="mt-1">{icon}</div>
      <div>
        <h3 className="font-medium text-gray-900 text-sm sm:text-base">{title}</h3>
        <div className="text-gray-700 mt-1 text-sm sm:text-base">{content}</div>
      </div>
    </div>
  );
}
