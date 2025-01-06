// src/pages/Appointments/[id]/AppointmentDetails.tsx
import { format } from 'date-fns';
import { Calendar, Clock, User, FileText } from 'lucide-react';
import type { Appointment } from '../../../types';

interface AppointmentDetailsProps {
  appointment: Appointment;
}

export default function AppointmentDetails({ appointment }: AppointmentDetailsProps) {
  // For the main user or a dependent?
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

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      {/* Show status label up top, e.g. “Scheduled”, “Cancelled”, etc. */}
      <div className="flex items-center justify-between mb-6">
        <span className="px-3 py-1 rounded-full text-sm font-medium
                         bg-blue-100 text-blue-800">
          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
        </span>
        {/* Possibly your “Reschedule” or “Cancel” buttons go here */}
      </div>

      {/* Who is it for? */}
      <div className="flex items-start mb-4">
        <User className="w-6 h-6 text-blue-600 mt-1 mr-4" />
        <div>
          <h3 className="font-medium text-gray-900">Appointment For</h3>
          <p className="text-gray-600 mt-1">
            {isForDependent
              ? `${displayName} (Dependent)`
              : `${displayName} (You)`}
          </p>
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
          <p className="text-gray-600 mt-1">
            Dr. {appointment.dentist?.firstName} {appointment.dentist?.lastName}
          </p>
          <p className="text-gray-500 text-sm">
            {appointment.dentist?.specialty === 'pediatric'
              ? 'Pediatric Dentist'
              : 'General Dentist'}
          </p>
        </div>
      </div>

      {/* Appointment Type */}
      <div className="flex items-start mb-4">
        <FileText className="w-6 h-6 text-blue-600 mt-1 mr-4" />
        <div>
          <h3 className="font-medium text-gray-900">Appointment Type</h3>
          <p className="text-gray-600 mt-1">
            {appointment.appointmentType?.name || 'N/A'}
          </p>
          <p className="text-gray-500 text-sm">
            Duration: {appointment.appointmentType?.duration} minutes
          </p>
        </div>
      </div>
    </div>
  );
}
