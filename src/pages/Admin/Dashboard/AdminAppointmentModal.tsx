// File: /src/pages/Admin/Dashboard/AdminAppointmentModal.tsx

import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createAppointment,
  updateAppointment,
  cancelAppointment
} from '../../../lib/api';

import type { Appointment } from '../../../types';
import DentistSelect from '../../Appointments/New/components/DentistSelect';
import AppointmentTypeSelect from '../../Appointments/New/components/AppointmentTypeSelect';
import DatePicker from '../../Appointments/New/components/DatePicker';
import TimeSlotPicker from '../../Appointments/New/components/TimeSlotPicker';
import Button from '../../../components/UI/Button';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

// For searching/picking a user if not editing:
import UserSearchSelect from './UserSearchSelect'; 

interface AdminAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAppointment: Appointment | null;
  defaultDate?: Date | null;
}

/**
 * If editingAppointment == null, we create a new appointment (admin can pick user).
 * If editingAppointment != null, we edit that appointment.
 */
interface FormData {
  user_id?: string;          // Only needed if admin is creating a new appointment for a specific user
  dentist_id: string;
  appointment_type_id: string;
  appointment_date: string;
  appointment_time: string;
  notes?: string;
}

export default function AdminAppointmentModal({
  isOpen,
  onClose,
  editingAppointment,
  defaultDate,
}: AdminAppointmentModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!editingAppointment; // True if we are editing an existing appointment

  // If admin is creating a new appointment, store the userId from the search select
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormData>({
    mode: 'onChange',
  });

  useEffect(() => {
    if (isEditing && editingAppointment) {
      // We have an existing appointment => parse data into the form
      const dt = new Date(editingAppointment.appointmentTime);
      const dateStr = dt.toISOString().split('T')[0];
      const timeStr = dt.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      reset({
        // typically, you don’t let admins change the user for an existing appointment
        // so we skip user_id or set it to empty
        user_id: '',
        dentist_id: String(editingAppointment.dentistId),
        appointment_type_id: String(editingAppointment.appointmentTypeId),
        appointment_date: dateStr,
        appointment_time: timeStr,
        notes: editingAppointment.notes || '',
      });
      setSelectedUserId(null);
    } else if (!isEditing && defaultDate) {
      // Creating a new appointment with a default date/time
      const dateStr = defaultDate.toISOString().split('T')[0];
      reset({
        user_id: '',
        dentist_id: '',
        appointment_type_id: '',
        appointment_date: dateStr,
        appointment_time: '',
        notes: '',
      });
      setSelectedUserId(null);
    } else {
      // Otherwise just empty fields
      reset({
        user_id: '',
        dentist_id: '',
        appointment_type_id: '',
        appointment_date: '',
        appointment_time: '',
        notes: '',
      });
      setSelectedUserId(null);
    }
  }, [isEditing, editingAppointment, defaultDate, reset]);

  // Create/update appointment
  const { mutateAsync: mutateAppointment } = useMutation({
    mutationFn: async (formData: FormData) => {
      // Combine date + time into ISO string
      const isoString = buildIsoString(formData.appointment_date, formData.appointment_time);

      // Build the payload
      const payload: any = {
        appointment_time: isoString,
        dentist_id: parseInt(formData.dentist_id, 10),
        appointment_type_id: parseInt(formData.appointment_type_id, 10),
        notes: formData.notes,
      };

      // If admin is creating a new appointment, pass user_id if present
      if (!isEditing && formData.user_id) {
        payload.user_id = parseInt(formData.user_id, 10);
      }

      if (isEditing && editingAppointment) {
        // Updating existing
        return updateAppointment(editingAppointment.id, payload);
      } else {
        // Creating new
        return createAppointment(payload);
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries so the new/updated appointment is visible
      queryClient.invalidateQueries(['admin-appointments-for-calendar']);
      queryClient.invalidateQueries(['admin-appointments']);
      onClose();
    },
    onError: (error: any) => {
      alert(`Failed to save appointment: ${error.message || error}`);
    },
  });

  // For “Delete Appointment” button
  const { mutateAsync: deleteAppointmentMut } = useMutation({
    mutationFn: async (id: number) => cancelAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-appointments-for-calendar']);
      queryClient.invalidateQueries(['admin-appointments']);
      onClose();
    },
    onError: (error: any) => {
      alert(`Failed to delete appointment: ${error.message || error}`);
    },
  });

  const onSubmit = async (data: FormData) => {
    await mutateAppointment(data);
  };

  const handleDeleteClick = async () => {
    if (!editingAppointment) return;
    const yes = window.confirm('Are you sure you want to cancel this appointment?');
    if (!yes) return;
    await deleteAppointmentMut(editingAppointment.id);
  };

  if (!isOpen) return null; // Don’t render if the modal isn’t open

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-md">
        {/* Modal header */}
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-semibold">
            {isEditing ? 'Edit Appointment' : 'Create Appointment'}
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {/* Form for create/edit */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* If we are editing, show the existing user info */}
          {isEditing && editingAppointment?.user && (
            <div className="bg-gray-50 p-4 border border-gray-300 rounded">
              <h3 className="text-sm font-semibold text-gray-600 mb-1">Patient</h3>
              <p className="text-sm text-gray-700">
                {editingAppointment.user.firstName} {editingAppointment.user.lastName}{' '}
                ({editingAppointment.user.email ?? 'No email'})
              </p>
            </div>
          )}

          {/* If we are NOT editing (i.e. creating), let admin pick the user */}
          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select User
              </label>
              <UserSearchSelect
                onSelectUser={(uid) => {
                  setSelectedUserId(String(uid));
                  // Also store in form data so it’s submitted
                  setValue('user_id', String(uid));
                }}
              />
              {errors.user_id && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.user_id.message}
                </p>
              )}
            </div>
          )}

          <div className="space-y-4">
            <DentistSelect register={register} error={errors.dentist_id?.message} />
            <AppointmentTypeSelect register={register} error={errors.appointment_type_id?.message} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DatePicker register={register} watch={watch} error={errors.appointment_date?.message} />
              <TimeSlotPicker register={register} watch={watch} error={errors.appointment_time?.message} />
            </div>

            {/* Additional notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                {...register('notes')}
                rows={4}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any special requirements or concerns?"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            {/* If editing, show "Delete" */}
            {isEditing && (
              <Button
                variant="danger"
                onClick={handleDeleteClick}
                type="button"
              >
                Delete
              </Button>
            )}

            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting || !isValid}
              className="bg-blue-600 text-white"
            >
              {isEditing ? 'Save Changes' : 'Book Appointment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Utility function to combine a date string (YYYY-MM-DD) + time (HH:mm)
 * into an ISO date string suitable for the Rails API.
 */
function buildIsoString(dateStr: string, timeStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);
  const dt = new Date(year, (month - 1), day, hour, minute);
  return dt.toISOString();
}
