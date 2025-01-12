// File: /src/pages/Admin/Dashboard/AdminAppointmentCard.tsx

import React, { useState } from 'react';
import { format } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  cancelAppointment,
  updateAppointment,
} from '../../../lib/api';
import type { Appointment } from '../../../types';
import toast from 'react-hot-toast';

// Your custom Button component (with variants, etc.)
import Button from '../../../components/UI/Button';

// Lucide or other icons
import {
  Check,         // Check In icon
  CheckCircle,   // Complete icon
  Edit3 as RescheduleIcon,  // "Reschedule" icon
  XCircle,       // Cancel icon
} from 'lucide-react';

import AdminAppointmentModal from './AdminAppointmentModal';

interface AdminAppointmentCardProps {
  appointment: Appointment;
}

/**
 * A mobile-friendly Appointment Card with:
 * - The user/dentist info
 * - Responsive status + arrived badges
 * - Wrap-friendly action buttons
 * - Reschedule modal integration
 */
export default function AdminAppointmentCard({ appointment }: AdminAppointmentCardProps) {
  const queryClient = useQueryClient();
  const [showEditModal, setShowEditModal] = useState(false);

  // ----- CANCEL -----
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

  // ----- COMPLETE -----
  const { mutate: handleComplete } = useMutation({
    mutationFn: () => updateAppointment(appointment.id, { status: 'completed' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-appointments']);
      toast.success('Appointment marked as completed!');
    },
    onError: (err: any) => {
      toast.error(`Failed to complete: ${err.message}`);
    },
  });

  // ----- CHECK-IN (TOGGLE) -----
  const { mutate: handleCheckInToggle, isLoading: isToggling } = useMutation({
    mutationFn: () => updateAppointment(appointment.id, {
      checked_in: !appointment.checkedIn,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-appointments']);
      toast.success('Check-in status updated!');
    },
    onError: (err: any) => {
      toast.error(`Failed to check in/out: ${err.message}`);
    },
  });

  // Confirmations
  const onCancelClick = () => {
    if (window.confirm('Cancel this appointment?')) {
      handleCancel();
    }
  };
  const onCompleteClick = () => {
    if (window.confirm('Mark this appointment as completed?')) {
      handleComplete();
    }
  };
  const onCheckInClick = () => {
    const msg = appointment.checkedIn
      ? 'Un-check this patient? (Mark as not arrived?)'
      : 'Check in the patient (Mark as arrived)?';
    if (window.confirm(msg)) {
      handleCheckInToggle();
    }
  };

  // Format the date/time
  let formattedDate = '';
  let formattedTime = '';
  try {
    const dt = new Date(appointment.appointmentTime);
    if (!isNaN(dt.getTime())) {
      formattedDate = format(dt, 'MMMM d, yyyy');
      formattedTime = format(dt, 'h:mm a');
    }
  } catch {
    /* no-op */
  }

  // Choose a color for the status badge
  let statusClasses = 'bg-blue-100 text-blue-700'; // default: scheduled
  if (appointment.status === 'completed') {
    statusClasses = 'bg-green-100 text-green-700';
  } else if (appointment.status === 'cancelled') {
    statusClasses = 'bg-red-100 text-red-700';
  }
  // Past or other statuses can be handled if needed

  // “Arrived” badge if checked_in
  const arrivedBadge = appointment.checkedIn && (
    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
      Arrived
    </span>
  );

  return (
    <div
      className="bg-white rounded-md shadow p-4
                 flex flex-col gap-3
                 md:flex-row md:justify-between md:items-center"
    >
      {/* LEFT side: Appointment info */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold leading-snug">
          {appointment.appointmentType?.name || 'Appointment'}
        </h2>

        <p className="text-sm text-gray-600">
          Patient:{' '}
          {appointment.user ? (
            <>
              {appointment.user.firstName} {appointment.user.lastName}
              {appointment.user.email && (
                <> (<span className="italic">{appointment.user.email}</span>)</>
              )}
            </>
          ) : 'Unknown'}
        </p>

        <p className="text-sm text-gray-600">
          Dentist:{' '}
          {appointment.dentist
            ? <>Dr. {appointment.dentist.firstName} {appointment.dentist.lastName}</>
            : 'N/A'}
        </p>

        {formattedDate && (
          <p className="text-sm text-gray-600">
            {formattedDate} &bull; {formattedTime}
          </p>
        )}
      </div>

      {/* RIGHT side: Status, Arrived, Buttons */}
      <div className="flex flex-col items-start md:items-end gap-2">
        {/* Badges row -> status + arrived */}
        <div className="flex flex-wrap gap-2">
          <span
            className={`inline-block px-2 py-1 text-sm font-semibold rounded-full ${statusClasses}`}
          >
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </span>
          {arrivedBadge}
        </div>

        {/* Buttons row -> wraps on mobile */}
        <div className="flex flex-wrap gap-2 text-sm">
          {/* Check In button */}
          {appointment.status === 'scheduled' && (
            <Button
              variant="warning"
              onClick={onCheckInClick}
              isLoading={isToggling}
              className="flex items-center"
            >
              <Check className="w-4 h-4 mr-1" />
              {appointment.checkedIn ? 'Un-Check' : 'Check In'}
            </Button>
          )}

          {/* Reschedule => show modal */}
          {appointment.status === 'scheduled' && (
            <Button
              variant="outline"
              onClick={() => setShowEditModal(true)}
              className="flex items-center"
            >
              <RescheduleIcon className="w-4 h-4 mr-1" />
              Reschedule
            </Button>
          )}

          {/* Cancel */}
          {appointment.status === 'scheduled' && (
            <Button
              variant="danger"
              onClick={onCancelClick}
              className="flex items-center"
            >
              <XCircle className="w-4 h-4 mr-1" />
              Cancel
            </Button>
          )}

          {/* Complete */}
          {appointment.status === 'scheduled' && (
            <Button
              variant="success"
              onClick={onCompleteClick}
              className="flex items-center"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Complete
            </Button>
          )}
        </div>
      </div>

      {/* Edit (Reschedule) modal */}
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
