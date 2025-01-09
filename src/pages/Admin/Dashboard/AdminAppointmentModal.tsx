// File: /src/pages/Admin/Dashboard/AdminAppointmentModal.tsx

import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { X } from 'lucide-react';
import Button from '../../../components/UI/Button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createAppointment,
  updateAppointment,
  cancelAppointment,
} from '../../../lib/api';

import DentistSelect from '../../../pages/Appointments/New/components/DentistSelect';
import AppointmentTypeSelect from '../../../pages/Appointments/New/components/AppointmentTypeSelect';
import DatePicker from '../../../pages/Appointments/New/components/DatePicker';
import TimeSlotPicker from '../../../pages/Appointments/New/components/TimeSlotPicker';

import UserSearchSelect from './UserSearchSelect';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface Appointment {
  id: number;
  appointmentTime: string; // e.g. "2025-01-08T12:45:00Z"
  dentistId: number;
  appointmentTypeId: number;
  notes?: string;
  checkedIn?: boolean;
  user?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
}

interface AdminAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAppointment: Appointment | null;
  defaultDate?: Date | null;     // optional if you want a “create” default date
  defaultDentistId?: number;     // optional if you want a “create” default dentist
}

interface FormData {
  user_id?: string;
  dentist_id: string;
  appointment_type_id: string;
  appointment_date: string;  // "YYYY-MM-DD"
  appointment_time: string;  // "HH:mm"
  notes?: string;
  checked_in?: boolean;
}

export default function AdminAppointmentModal({
  isOpen,
  onClose,
  editingAppointment,
  defaultDate,
  defaultDentistId,
}: AdminAppointmentModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!editingAppointment;

  // We store the selected user id if creating a new appointment.
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const methods = useForm<FormData>({
    mode: 'onChange',
  });
  const {
    handleSubmit,
    reset,
    watch,
    register,
    formState: { isSubmitting, isValid },
  } = methods;

  // If editing => we show a "Currently scheduled" line
  let originalTimeString = '';
  if (isEditing && editingAppointment) {
    const oldDateObj = new Date(editingAppointment.appointmentTime);
    originalTimeString = format(oldDateObj, 'MMMM d, yyyy h:mm aa');
  }

  // Whenever the modal becomes “open” or the `editingAppointment` changes,
  // we reset the form fields so that the first click is populated correctly.
  useEffect(() => {
    if (!isOpen) return;
    if (editingAppointment) {
      // Parse the existing date/time into "YYYY-MM-DD" and "HH:mm"
      const dt = new Date(editingAppointment.appointmentTime);
      const isValidDate = !isNaN(dt.getTime());

      const dateStr = isValidDate
        ? dt.toISOString().split('T')[0] // => "2025-01-08"
        : '';
      const hh = dt.getHours().toString().padStart(2, '0');
      const mm = dt.getMinutes().toString().padStart(2, '0');
      const timeStr = isValidDate ? `${hh}:${mm}` : '';

      reset({
        user_id: '', // Not used when editing
        dentist_id: String(editingAppointment.dentistId),
        appointment_type_id: String(editingAppointment.appointmentTypeId),
        appointment_date: dateStr,
        appointment_time: timeStr,
        notes: editingAppointment.notes || '',
        checked_in: !!editingAppointment.checkedIn,
      });
      setSelectedUserId(null);
    } else {
      // Creating new appointment
      const baseDateObj = defaultDate ?? new Date();
      const baseDateStr = baseDateObj.toISOString().split('T')[0]; // "YYYY-MM-DD"

      reset({
        user_id: '',
        dentist_id: defaultDentistId ? String(defaultDentistId) : '',
        appointment_type_id: '',
        appointment_date: baseDateStr,
        appointment_time: '', // blank until user picks a slot
        notes: '',
        checked_in: false,
      });
      setSelectedUserId(null);
    }
  }, [isOpen, editingAppointment, defaultDate, defaultDentistId, reset]);

  // CREATE or UPDATE
  const { mutateAsync: mutateAppointment } = useMutation({
    mutationFn: async (data: FormData) => {
      // Convert date + time => ISO
      const isoString = buildIsoString(data.appointment_date, data.appointment_time);
      const payload: Record<string, any> = {
        appointment_time: isoString,
        dentist_id: parseInt(data.dentist_id, 10),
        appointment_type_id: parseInt(data.appointment_type_id, 10),
        notes: data.notes || '',
        checked_in: !!data.checked_in,
      };

      // If creating new, we need a user_id
      if (!isEditing && data.user_id) {
        payload.user_id = parseInt(data.user_id, 10);
      }
      if (isEditing && editingAppointment) {
        return updateAppointment(editingAppointment.id, payload);
      } else {
        return createAppointment(payload);
      }
    },
    onSuccess: () => {
      // Re-fetch relevant queries
      queryClient.invalidateQueries(['admin-appointments']);
      queryClient.invalidateQueries(['admin-appointments-for-calendar']);
      toast.success(isEditing ? 'Appointment updated!' : 'Appointment created!');
      onClose();
    },
    onError: (err: any) => {
      toast.error(`Failed to save appointment: ${err.message}`);
    },
  });

  // CANCEL (delete) if editing
  const { mutateAsync: deleteAppointmentMut } = useMutation({
    mutationFn: async () => {
      if (!editingAppointment) throw new Error('No appointment to delete');
      return cancelAppointment(editingAppointment.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-appointments']);
      queryClient.invalidateQueries(['admin-appointments-for-calendar']);
      toast.success('Appointment deleted!');
      onClose();
    },
    onError: (err: any) => {
      toast.error(`Failed to delete appointment: ${err.message}`);
    },
  });

  const handleDelete = async () => {
    if (!editingAppointment) return;
    const yes = window.confirm('Are you sure you want to delete this appointment?');
    if (!yes) return;
    await deleteAppointmentMut();
  };

  const onSubmit = async (data: FormData) => {
    await mutateAppointment(data);
  };

  // If we are editing, we skip picking a user. If we are creating, we show the <UserSearchSelect />.

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-md">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-semibold">
            {isEditing ? 'Edit Appointment' : 'Create Appointment'}
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {/* If editing, show some read-only info up top */}
        {isEditing && editingAppointment?.user && (
          <div className="px-4 py-2 bg-gray-50 border-b text-sm text-gray-700">
            <p className="font-medium">
              Patient: {editingAppointment.user.firstName} {editingAppointment.user.lastName}{' '}
              (<span className="text-gray-600">{editingAppointment.user.email}</span>)
            </p>
            <p className="mt-1">
              <span className="font-medium">Currently scheduled:</span> {originalTimeString}
            </p>
          </div>
        )}

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {!isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select User <span className="text-red-500">*</span>
                </label>
                <UserSearchSelect
                  onSelectUser={(uid) => {
                    methods.setValue('user_id', String(uid));
                    setSelectedUserId(String(uid));
                  }}
                />
              </div>
            )}

            <DentistSelect />
            <AppointmentTypeSelect />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pass the existing date if editing */}
              <DatePicker editingAppointmentId={editingAppointment?.id} />
              <TimeSlotPicker editingAppointmentId={editingAppointment?.id} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                {...register('notes')}
                rows={4}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Only show check-in toggle if editing */}
            {isEditing && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="checked_in_cb"
                  {...register('checked_in')}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="checked_in_cb" className="text-sm text-gray-700">
                  Patient Checked In?
                </label>
              </div>
            )}

            {/* Footer: Delete (if editing), Cancel, Save */}
            <div className="flex justify-end space-x-4">
              {isEditing && (
                <Button variant="danger" type="button" onClick={handleDelete}>
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
              >
                {isEditing ? 'Save Changes' : 'Book Appointment'}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}

function buildIsoString(dateStr: string, timeStr: string) {
  if (!dateStr || !timeStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);
  // JS Date’s month is 0-based
  const dt = new Date(year, month - 1, day, hour, minute);
  return dt.toISOString();
}
