// File: /src/pages/Admin/Dashboard/AdminAppointmentModal.tsx

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createAppointment,
  updateAppointment,
  cancelAppointment
} from '../../../lib/api';
import DentistSelect from '../../../pages/Appointments/New/components/DentistSelect';
import AppointmentTypeSelect from '../../../pages/Appointments/New/components/AppointmentTypeSelect';
import DatePicker from '../../../pages/Appointments/New/components/DatePicker';
import TimeSlotPicker from '../../../pages/Appointments/New/components/TimeSlotPicker';
import UserSearchSelect from './UserSearchSelect';
import Button from '../../../components/UI/Button';
import { X } from 'lucide-react';
import type { Appointment } from '../../../types';

interface AdminAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAppointment: Appointment | null;
  defaultDate?: Date | null;
}

interface FormData {
  user_id?: string;
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
  const isEditing = !!editingAppointment;
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // React Hook Form
  const { register, handleSubmit, watch, reset, setValue, formState } = useForm<FormData>({
    mode: 'onChange',
  });
  const { errors, isSubmitting, isValid } = formState;

  // Fill form if editing or if we have a default date
  useEffect(() => {
    if (!isOpen) return;

    if (isEditing && editingAppointment) {
      // Load the existing data
      const dt = new Date(editingAppointment.appointmentTime);
      const dateStr = dt.toISOString().split('T')[0];  // e.g. 2025-01-07
      const timeStr = dt.toTimeString().slice(0, 5);   // e.g. 14:00

      reset({
        user_id: '', // Usually can’t change user for existing appt
        dentist_id: String(editingAppointment.dentistId),
        appointment_type_id: String(editingAppointment.appointmentTypeId),
        appointment_date: dateStr,
        appointment_time: timeStr,
        notes: editingAppointment.notes || '',
      });
      setSelectedUserId(null);
    } else if (!isEditing && defaultDate) {
      // Creating new, but have a default date
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
      // brand new, no defaults
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
  }, [isOpen, isEditing, editingAppointment, defaultDate, reset]);

  // Submit: create or update
  const { mutateAsync: mutateAppointment } = useMutation({
    mutationFn: async (data: FormData) => {
      // Convert date + time => ISO
      const isoString = buildIsoString(data.appointment_date, data.appointment_time);

      const payload: Record<string, any> = {
        appointment_time: isoString,
        dentist_id: parseInt(data.dentist_id, 10),
        appointment_type_id: parseInt(data.appointment_type_id, 10),
        notes: data.notes,
      };

      if (!isEditing && data.user_id) {
        payload.user_id = parseInt(data.user_id, 10);
      }

      if (isEditing && editingAppointment) {
        // Update existing
        return updateAppointment(editingAppointment.id, payload);
      } else {
        // Create new
        return createAppointment(payload);
      }
    },
    onSuccess: () => {
      // Refresh queries
      queryClient.invalidateQueries(['admin-appointments']);
      queryClient.invalidateQueries(['admin-appointments-for-calendar']);
      onClose();
    },
    onError: (error: any) => {
      alert(`Failed to save appointment: ${error.message}`);
    },
  });

  // Delete
  const { mutateAsync: deleteAppointmentMut } = useMutation({
    mutationFn: async () => {
      if (!editingAppointment) throw new Error('No appointment selected');
      return cancelAppointment(editingAppointment.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-appointments']);
      queryClient.invalidateQueries(['admin-appointments-for-calendar']);
      onClose();
    },
    onError: (error: any) => {
      alert(`Failed to cancel: ${error.message}`);
    },
  });

  const onSubmit = (formData: FormData) => {
    mutateAppointment(formData);
  };

  const handleDelete = async () => {
    if (!editingAppointment) return;
    const yes = window.confirm('Are you sure you want to delete this appointment?');
    if (!yes) return;
    await deleteAppointmentMut();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-md">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-xl font-semibold">
            {isEditing ? 'Edit Appointment' : 'Create Appointment'}
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {/* Body / Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* If new appointment, let admin pick user */}
          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select User
              </label>
              <UserSearchSelect
                onSelectUser={(uid) => {
                  setValue('user_id', String(uid));
                  setSelectedUserId(String(uid));
                }}
              />
              {errors.user_id && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.user_id.message}
                </p>
              )}
            </div>
          )}

          <DentistSelect
            register={register}
            error={errors.dentist_id?.message}
          />

          <AppointmentTypeSelect
            register={register}
            error={errors.appointment_type_id?.message}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DatePicker
              register={register}
              watch={watch}
              error={errors.appointment_date?.message}
            />
            <TimeSlotPicker
              register={register}
              watch={watch}
              error={errors.appointment_time?.message}
              editingAppointmentId={editingAppointment?.id} // Pass existing ID so we ignore ourselves
            />
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
              placeholder="Optional notes..."
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-4">
            {isEditing && (
              <Button
                variant="danger"
                type="button"
                onClick={handleDelete}
              >
                Delete
              </Button>
            )}
            <Button
              variant="secondary"
              type="button"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting || !isValid}
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
 * Utility: combine date (YYYY-MM-DD) + time (HH:mm) => ISO string
 */
function buildIsoString(dateStr: string, timeStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);
  const dt = new Date(year, month - 1, day, hour, minute);
  return dt.toISOString();
}
