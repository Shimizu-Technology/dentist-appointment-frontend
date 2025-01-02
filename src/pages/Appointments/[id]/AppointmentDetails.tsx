import { format } from 'date-fns';
import { Calendar, Clock, User, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelAppointment } from '../../../lib/api';
import Button from '../../../components/UI/Button';
import { canManageAppointment } from '../../../utils/appointments';
import type { Appointment } from '../../../types';

interface AppointmentDetailsProps {
  appointment: Appointment;
}

export default function AppointmentDetails({ appointment }: AppointmentDetailsProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { mutate: handleCancel, isPending: isCancelling } = useMutation({
    mutationFn: () => cancelAppointment(appointment.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      navigate('/appointments');
    },
  });

  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const canManage = canManageAppointment(appointment);

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

  const onCancelClick = () => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    handleCancel();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              statusColors[appointment.status] || ''
            }`}
          >
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </span>
        </div>
        {canManage && (
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate(`/appointments/${appointment.id}/edit`)}
              className="flex items-center"
            >
              Reschedule Appointment
            </Button>
            <Button
              variant="secondary"
              onClick={onCancelClick}
              isLoading={isCancelling}
              className="flex items-center text-red-600 hover:text-red-700"
            >
              Cancel Appointment
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* DATE */}
        <div className="flex items-start">
          <Calendar className="w-6 h-6 text-blue-600 mt-1 mr-4" />
          <div>
            <h3 className="font-medium text-gray-900">Date</h3>
            <p className="text-gray-600 mt-1">
              {parsedDate ? format(parsedDate, 'MMMM d, yyyy') : 'Invalid date/time'}
            </p>
          </div>
        </div>

        {/* TIME */}
        <div className="flex items-start">
          <Clock className="w-6 h-6 text-blue-600 mt-1 mr-4" />
          <div>
            <h3 className="font-medium text-gray-900">Time</h3>
            <p className="text-gray-600 mt-1">
              {parsedDate ? format(parsedDate, 'h:mm a') : 'Invalid date/time'}
            </p>
          </div>
        </div>

        {/* DENTIST */}
        <div className="flex items-start">
          <User className="w-6 h-6 text-blue-600 mt-1 mr-4" />
          <div>
            <h3 className="font-medium text-gray-900">Dentist</h3>
            <p className="text-gray-600 mt-1">
              Dr. {appointment.dentist?.firstName} {appointment.dentist?.lastName}
            </p>
            <p className="text-gray-500 text-sm">
              {appointment.dentist?.specialty === 'pediatric' ? 'Pediatric Dentist' : 'General Dentist'}
            </p>
          </div>
        </div>

        {/* APPOINTMENT TYPE */}
        <div className="flex items-start">
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
    </div>
  );
}
