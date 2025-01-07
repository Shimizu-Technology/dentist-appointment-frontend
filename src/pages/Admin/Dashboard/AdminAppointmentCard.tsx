// File: /src/pages/Admin/Dashboard/AdminAppointmentCard.tsx

import { useState } from 'react';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  User,
  Edit2,
  X,
  CheckCircle,
  Check,
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  cancelAppointment,
  updateAppointment,
  // or a dedicated checkInAppointment function, see note below
  // checkInAppointment,
} from '../../../lib/api';
import Button from '../../../components/UI/Button';
import { Appointment } from '../../../types';
import toast from 'react-hot-toast';
import AdminAppointmentModal from './AdminAppointmentModal';

interface AdminAppointmentCardProps {
  appointment: Appointment;
}

export default function AdminAppointmentCard({ appointment }: AdminAppointmentCardProps) {
  const queryClient = useQueryClient();
  const [showEditModal, setShowEditModal] = useState(false);

  // Cancel
  const { mutate: handleCancel } = useMutation({
    mutationFn: () => cancelAppointment(appointment.id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-appointments']);
      toast.success('Appointment cancelled.');
    },
    onError: (err: any) => {
      toast.error(`Failed to cancel: ${err.message}`);
    },
  });

  // Complete
  const { mutate: handleComplete } = useMutation({
    mutationFn: () =>
      updateAppointment(appointment.id, { status: 'completed' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-appointments']);
      toast.success('Appointment marked as completed!');
    },
    onError: (err: any) => {
      toast.error(`Failed to complete: ${err.message}`);
    },
  });

  // Toggle Check-In
  const { mutate: handleCheckInToggle, isLoading: isToggling } = useMutation({
    // If you prefer calling the separate route:
    // mutationFn: () => checkInAppointment(appointment.id),
    // Or just do an update with { checked_in: !appointment.checkedIn }
    mutationFn: () => updateAppointment(appointment.id, { checked_in: !appointment.checkedIn }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-appointments']);
      toast.success('Check-in status updated!');
    },
    onError: (err: any) => {
      toast.error(`Failed to check in/out: ${err.message}`);
    },
  });

  // Confirm dialogs
  const onCancelClick = () => {
    if (!window.confirm('Cancel this appointment?')) return;
    handleCancel();
  };

  const onCompleteClick = () => {
    if (!window.confirm('Mark as completed?')) return;
    handleComplete();
  };

  const onCheckInClick = () => {
    const msg = appointment.checkedIn
      ? 'Uncheck-in the patient (Mark them as not arrived)?'
      : 'Check-in the patient (Mark them as arrived)?';
    if (!window.confirm(msg)) return;
    handleCheckInToggle();
  };

  // Parse date
  let startTime = '';
  try {
    const dt = new Date(appointment.appointmentTime);
    startTime = format(dt, 'MMMM d, yyyy • h:mm a');
  } catch {}

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      {/* Header row */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-900">
          {appointment.appointmentType?.name || 'Appointment'}
        </h3>
        <div className="flex items-center space-x-2">
          {/* Show "Arrived" if checkedIn is true */}
          {appointment.checkedIn && (
            <span className="bg-green-100 text-green-800 px-2 py-1 text-xs rounded-full">
              Arrived
            </span>
          )}
          {/* status badge */}
          <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded-full">
            {appointment.status.charAt(0).toUpperCase() +
              appointment.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="text-sm text-gray-600 mb-4">
        {appointment.user && (
          <p className="mb-1">
            Patient: {appointment.user.firstName} {appointment.user.lastName} (
            {appointment.user.email})
          </p>
        )}
        {appointment.dentist && (
          <p className="mb-1">
            Dentist: Dr. {appointment.dentist.firstName} {appointment.dentist.lastName}
          </p>
        )}
        <p>{startTime}</p>
      </div>

      <div className="flex items-center space-x-3">
        {/* Check In toggle */}
        {appointment.status === 'scheduled' && (
          <Button variant="outline" onClick={onCheckInClick} isLoading={isToggling}>
            <Check className="w-4 h-4 mr-1" />
            {appointment.checkedIn ? 'Un-Check In' : 'Check In'}
          </Button>
        )}

        {/* Reschedule if scheduled */}
        {appointment.status === 'scheduled' && (
          <Button variant="outline" onClick={() => setShowEditModal(true)}>
            <Edit2 className="w-4 h-4 mr-1" />
            Reschedule
          </Button>
        )}

        {/* Cancel if scheduled */}
        {appointment.status === 'scheduled' && (
          <Button
            variant="secondary"
            onClick={onCancelClick}
            className="text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
        )}

        {/* Complete if scheduled */}
        {appointment.status === 'scheduled' && (
          <Button variant="outline" onClick={onCompleteClick}>
            <CheckCircle className="w-4 h-4 mr-1" />
            Complete
          </Button>
        )}
      </div>

      {/* Reschedule modal if you use one */}
      {showEditModal && (
        <AdminAppointmentModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          editingAppointment={appointment}
        />
      )}
    </div>
  );
}
