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

  // Check if for dependent or main user
  const isForDependent = !!appointment.dependent;
  const displayName = isForDependent
    ? `${appointment.dependent?.firstName} ${appointment.dependent?.lastName} (Dependent)`
    : `${appointment.user?.firstName} ${appointment.user?.lastName} (You)`;

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

  const handleEdit = () => {
    navigate(`/appointments/${appointment.id}/edit`);
  };

  // For a simple color-coded status badge
  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      {/* Top row: status & reschedule/cancel actions (if allowed) */}
      <div className="flex items-center justify-between mb-6">
        <span
          className={[
            'px-3 py-1 rounded-full text-sm font-medium',
            statusColors[appointment.status] || '',
          ].join(' ')}
        >
          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
        </span>
        {/* Show actions if the user can manage this appointment */}
        {canManageAppointment(appointment) && (
          <AppointmentActions appointment={appointment} onEdit={handleEdit} />
        )}
      </div>

      {/* Appointment For */}
      <div className="flex items-start mb-4">
        <User className="w-6 h-6 text-blue-600 mt-1 mr-4" />
        <div>
          <h3 className="font-medium text-gray-900">Appointment For</h3>
          <p className="text-gray-600 mt-1">{displayName}</p>
        </div>
      </div>

      {/* Date */}
      <div className="flex items-start mb-4">
        <Calendar className="w-6 h-6 text-blue-600 mt-1 mr-4" />
        <div>
          <h3 className="font-medium text-gray-900">Date</h3>
          <p className="text-gray-600 mt-1">{dateString}</p>
        </div>
      </div>

      {/* Time */}
      <div className="flex items-start mb-4">
        <Clock className="w-6 h-6 text-blue-600 mt-1 mr-4" />
        <div>
          <h3 className="font-medium text-gray-900">Time</h3>
          <p className="text-gray-600 mt-1">{timeString}</p>
        </div>
      </div>

      {/* Dentist */}
      <div className="flex items-start mb-4">
        <User className="w-6 h-6 text-blue-600 mt-1 mr-4" />
        <div>
          <h3 className="font-medium text-gray-900">Dentist</h3>
          {appointment.dentist && (
            <>
              <p className="text-gray-600 mt-1">
                Dr. {appointment.dentist.firstName} {appointment.dentist.lastName}
              </p>
              <p className="text-gray-500 text-sm">
                {appointment.dentist.specialty === 'pediatric'
                  ? 'Pediatric Dentist'
                  : 'General Dentist'}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Appointment Type */}
      <div className="flex items-start mb-4">
        <FileText className="w-6 h-6 text-blue-600 mt-1 mr-4" />
        <div>
          <h3 className="font-medium text-gray-900">Appointment Type</h3>
          {appointment.appointmentType ? (
            <>
              <p className="text-gray-600 mt-1">{appointment.appointmentType.name}</p>
              {appointment.appointmentType.duration && (
                <p className="text-gray-500 text-sm">
                  Duration: {appointment.appointmentType.duration} minutes
                </p>
              )}
            </>
          ) : (
            <p className="text-gray-600 mt-1">N/A</p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="flex items-start mb-4">
        <StickyNote className="w-6 h-6 text-blue-600 mt-1 mr-4" />
        <div>
          <h3 className="font-medium text-gray-900">Notes</h3>
          <p className="text-gray-600 mt-1">
            {appointment.notes && appointment.notes.trim().length > 0
              ? appointment.notes
              : 'No notes provided.'}
          </p>
        </div>
      </div>
    </div>
  );
}
