import { format } from 'date-fns';
import { Calendar, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Appointment } from '../../types';

interface AppointmentCardProps {
  appointment: Appointment;
}

export default function AppointmentCard({ appointment }: AppointmentCardProps) {
  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const appointmentType = appointment.appointmentType || { name: 'Loading...' };
  const dentist = appointment.dentist || { firstName: '', lastName: '' };

  return (
    <Link 
      to={`/appointments/${appointment.id}`}
      className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {appointmentType.name}
        </h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[appointment.status]}`}>
          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-gray-600">
          <Calendar className="w-5 h-5 mr-2" />
          {format(new Date(appointment.appointmentTime), 'MMMM d, yyyy')}
        </div>
        
        <div className="flex items-center text-gray-600">
          <Clock className="w-5 h-5 mr-2" />
          {format(new Date(appointment.appointmentTime), 'h:mm a')}
        </div>

        {dentist && (
          <div className="flex items-center text-gray-600">
            <User className="w-5 h-5 mr-2" />
            Dr. {dentist.firstName} {dentist.lastName}
          </div>
        )}
      </div>
    </Link>
  );
}