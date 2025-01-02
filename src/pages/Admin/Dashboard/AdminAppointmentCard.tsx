// File: /src/pages/Admin/Dashboard/AdminAppointmentCard.tsx

import { format } from 'date-fns';
import { Calendar, Clock, User, Edit2, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAppointment, cancelAppointment } from '../../../lib/api';
import Button from '../../../components/UI/Button';
import type { Appointment } from '../../../types';

interface AdminAppointmentCardProps {
  appointment: Appointment;
}

export default function AdminAppointmentCard({ appointment }: AdminAppointmentCardProps) {
  const queryClient = useQueryClient();

  // Display a color-coded badge for appointment status
  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  // Reschedule mutation (naive approach with a prompt)
  const handleReschedule = useMutation({
    mutationFn: async (newTime: string) => {
      return updateAppointment(appointment.id, {
        appointment_time: newTime,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-appointments']);
    },
    onError: (error: any) => {
      alert(`Failed to reschedule: ${error.message}`);
    },
  });

  // Cancel mutation
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
    const newDateTime = window.prompt(
      'Enter new appointment_time (YYYY-MM-DDTHH:mm:00Z)',
      appointment.appointmentTime
    );
    if (!newDateTime) return;
    handleReschedule.mutate(newDateTime);
  };

  const onCancelClick = () => {
    const yes = window.confirm('Are you sure you want to cancel this appointment?');
    if (!yes) return;
    handleCancel.mutate();
  };

  // Safely parse the date/time
  let parsedDate: Date | null = null;
  try {
    parsedDate = new Date(appointment.appointmentTime);
    if (isNaN(parsedDate.getTime())) {
      parsedDate = null;
    }
  } catch {
    parsedDate = null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header row: type + status badge */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {appointment.appointmentType?.name || 'Appointment'}
          </h3>
          {/* Show user’s name + email if the user object is present */}
          <p className="text-sm text-gray-500">
            {appointment.user
              ? `Patient: ${appointment.user.firstName} ${appointment.user.lastName} (${appointment.user.email})`
              : appointment.userName
                ? `Patient: ${appointment.userName} (${appointment.userEmail ?? 'No email'})`
                : `Patient ID: ${appointment.userId}`
            }
          </p>
        </div>
        <span
          className={[
            'px-3 py-1 rounded-full text-sm font-medium',
            statusColors[appointment.status] || '',
          ].join(' ')}
        >
          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
        </span>
      </div>

      {/* Body: date/time + dentist */}
      <div className="space-y-3 mb-6">
        {parsedDate ? (
          <>
            <div className="flex items-center text-gray-600">
              <Calendar className="w-5 h-5 mr-2" />
              {format(parsedDate, 'MMMM d, yyyy')}
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="w-5 h-5 mr-2" />
              {format(parsedDate, 'h:mm a')}
            </div>
          </>
        ) : (
          <p className="text-sm text-red-500">Invalid date/time</p>
        )}

        {/* Dentist info */}
        {appointment.dentist && (
          <div className="flex items-center text-gray-600">
            <User className="w-5 h-5 mr-2" />
            Dr. {appointment.dentist.firstName} {appointment.dentist.lastName}
          </div>
        )}
      </div>

      {/* Actions row */}
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
            onClick={onCancelClick}
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
