import { format } from 'date-fns';
import { Calendar, Clock, User, Edit2, X } from 'lucide-react';
import Button from '../../../components/UI/Button';
import type { Appointment } from '../../../types';

interface AdminAppointmentCardProps {
  appointment: Appointment;
}

export default function AdminAppointmentCard({ appointment }: AdminAppointmentCardProps) {
  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const handleReschedule = () => {
    // TODO: Implement reschedule modal
    console.log('Reschedule appointment:', appointment.id);
  };

  const handleCancel = () => {
    // TODO: Implement cancel confirmation
    console.log('Cancel appointment:', appointment.id);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {appointment.appointmentType?.name}
          </h3>
          <p className="text-sm text-gray-500">
            Patient: {appointment.user?.firstName} {appointment.user?.lastName}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[appointment.status]}`}>
          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
        </span>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center text-gray-600">
          <Calendar className="w-5 h-5 mr-2" />
          {format(new Date(appointment.appointmentTime), 'MMMM d, yyyy')}
        </div>
        
        <div className="flex items-center text-gray-600">
          <Clock className="w-5 h-5 mr-2" />
          {format(new Date(appointment.appointmentTime), 'h:mm a')}
        </div>

        <div className="flex items-center text-gray-600">
          <User className="w-5 h-5 mr-2" />
          Dr. {appointment.dentist?.firstName} {appointment.dentist?.lastName}
        </div>
      </div>

      <div className="flex space-x-4">
        <Button
          variant="outline"
          onClick={handleReschedule}
          className="flex items-center"
        >
          <Edit2 className="w-4 h-4 mr-2" />
          Reschedule
        </Button>
        
        <Button
          variant="secondary"
          onClick={handleCancel}
          className="flex items-center text-red-600 hover:text-red-700"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
}