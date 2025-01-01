import { format } from 'date-fns';
import { Calendar, Clock, User, Edit2, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAppointment, cancelAppointment } from '../../../lib/api'; // <-- add
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

  const queryClient = useQueryClient();

  // For the "Reschedule" action, let's do a naive approach:
  // We can prompt for a date/time or open a modal. For now, let's do a simple window.prompt:
  const handleReschedule = useMutation({
    mutationFn: async (newTime: string) => {
      // Convert newTime string -> e.g. '2024-05-04T10:00:00Z'
      // In a real scenario, you'd parse it or let the user pick a date/time
      return updateAppointment(appointment.id, {
        appointmentTime: newTime,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-appointments']);
    },
    onError: (error: any) => {
      alert(`Failed to reschedule: ${error.message}`);
    },
  });

  // For Cancel:
  const handleCancel = useMutation({
    mutationFn: () => cancelAppointment(appointment.id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-appointments']);
    },
    onError: (error: any) => {
      alert(`Failed to cancel: ${error.message}`);
    },
  });

  const doReschedule = () => {
    const newDateTime = window.prompt('Enter new appointmentTime (YYYY-MM-DDTHH:mm:00Z)', appointment.appointmentTime);
    if (newDateTime) {
      handleReschedule.mutate(newDateTime);
    }
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
        {appointment.status === 'scheduled' && (
          <Button
            variant="outline"
            onClick={doReschedule}
            className="flex items-center"
            isLoading={handleReschedule.isPending}
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Reschedule
          </Button>
        )}

        {appointment.status === 'scheduled' && (
          <Button
            variant="secondary"
            onClick={() => handleCancel.mutate()}
            className="flex items-center text-red-600 hover:text-red-700"
            isLoading={handleCancel.isPending}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
