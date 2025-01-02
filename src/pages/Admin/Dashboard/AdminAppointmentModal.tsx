// File: /src/pages/Admin/Dashboard/AdminAppointmentModal.tsx

import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAppointment, updateAppointment, cancelAppointment } from '../../../lib/api';

import { Appointment } from '../../../types';
import DentistSelect from '../../Appointments/New/components/DentistSelect';
import AppointmentTypeSelect from '../../Appointments/New/components/AppointmentTypeSelect';
import DatePicker from '../../Appointments/New/components/DatePicker';
import TimeSlotPicker from '../../Appointments/New/components/TimeSlotPicker';
import Button from '../../../components/UI/Button';
import { X } from 'lucide-react';
import { useEffect } from 'react';

/**
 * If editingAppointment is null, we create. Otherwise, we edit that appointment.
 * defaultDate is used only in “create” mode to pre-fill the date/time if they clicked on an empty slot.
 */
interface AdminAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAppointment: Appointment | null;
  defaultDate?: Date | null;
}

interface FormData {
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
  const isEditing = !!editingAppointment; // true if we have an appointment to edit
  const queryClient = useQueryClient();

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormData>({
    mode: 'onChange',
  });

  // If we are editing, we parse the existing appointment data into default form values
  // If we are creating, we can use defaultDate for the date portion
  useEffect(() => {
    if (isEditing && editingAppointment) {
      const dt = new Date(editingAppointment.appointmentTime);
      const dateStr = dt.toISOString().split('T')[0];
      // e.g. "08:30"
      const timeStr = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

      reset({
        dentist_id: String(editingAppointment.dentistId),
        appointment_type_id: String(editingAppointment.appointmentTypeId),
        appointment_date: dateStr,
        appointment_time: timeStr,
        notes: editingAppointment.notes || '',
      });
    } else if (!isEditing && defaultDate) {
      // Creating a new one, pre-fill only the date from defaultDate
      const dateStr = defaultDate.toISOString().split('T')[0];
      // optional: also parse out a time if you want. By default maybe "09:00" or something
      reset({
        dentist_id: '',
        appointment_type_id: '',
        appointment_date: dateStr,
        appointment_time: '',
        notes: '',
      });
    } else {
      // Neither editing nor default date. Possibly the user clicked "Add" from scratch.
      reset({
        dentist_id: '',
        appointment_type_id: '',
        appointment_date: '',
        appointment_time: '',
        notes: '',
      });
    }
  }, [isEditing, editingAppointment, defaultDate, reset]);

  // Mutations: create or update
  const { mutateAsync: mutateAppointment } = useMutation({
    mutationFn: async (formData: FormData) => {
      const isoString = buildIsoString(formData.appointment_date, formData.appointment_time);
      const payload = {
        appointment_time: isoString,
        dentist_id: parseInt(formData.dentist_id, 10),
        appointment_type_id: parseInt(formData.appointment_type_id, 10),
        notes: formData.notes,
      };

      if (isEditing && editingAppointment) {
        // update existing
        return updateAppointment(editingAppointment.id, payload);
      } else {
        // create new
        return createAppointment(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-appointments-for-calendar']);
      onClose();
    },
    onError: (error: any) => {
      alert(`Failed to save appointment: ${error.message || error}`);
    },
  });

  // For “Delete Appointment” button
  const { mutateAsync: deleteAppointment } = useMutation({
    mutationFn: async (id: number) => {
      return cancelAppointment(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-appointments-for-calendar']);
      onClose();
    },
    onError: (error: any) => {
      alert(`Failed to delete appointment: ${error.message || error}`);
    },
  });

  const onSubmit = async (formData: FormData) => {
    await mutateAppointment(formData);
  };

  const handleDeleteClick = async () => {
    if (!editingAppointment) return;
    const yes = window.confirm('Are you sure you want to delete/cancel this appointment?');
    if (!yes) return;
    await deleteAppointment(editingAppointment.id);
  };

  // If the modal is closed, don’t render anything
  if (!isOpen) return null;

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

        {/* Modal body (the form) */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="space-y-4">
            {/* Dentist dropdown */}
            <DentistSelect
              register={register}
              error={errors.dentist_id?.message}
            />

            {/* Appointment type dropdown */}
            <AppointmentTypeSelect
              register={register}
              error={errors.appointment_type_id?.message}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* DatePicker expects watch + register + error props */}
              <DatePicker
                register={register}
                watch={watch}
                error={errors.appointment_date?.message}
              />

              <TimeSlotPicker
                register={register}
                watch={watch}
                error={errors.appointment_time?.message}
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
                className={`
                  w-full border-gray-300 rounded-md shadow-sm
                  focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                `}
                placeholder="Any special requirements or concerns?"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4">
            {/* If editing, show a “Delete” button */}
            {isEditing && (
              <Button
                variant="danger"
                onClick={handleDeleteClick}
                type="button"
              >
                Delete
              </Button>
            )}

            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
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
 * Utility to combine “YYYY-MM-DD” + “HH:mm” into an ISO date string
 */
function buildIsoString(dateStr: string, timeStr: string): string {
  // For example: dateStr = "2024-03-10", timeStr = "09:30"
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);

  const dt = new Date(year, month - 1, day, hour, minute);
  return dt.toISOString();
}
