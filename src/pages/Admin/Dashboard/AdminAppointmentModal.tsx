// File: /src/pages/Admin/Dashboard/AdminAppointmentModal.tsx
import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { X } from 'lucide-react';
import Button from '../../../components/UI/Button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createAppointment,
  updateAppointment,
  cancelAppointment
} from '../../../lib/api';

// The same reused “New Appointment” form components:
import DentistSelect from '../../../pages/Appointments/New/components/DentistSelect';
import AppointmentTypeSelect from '../../../pages/Appointments/New/components/AppointmentTypeSelect';
import DatePicker from '../../../pages/Appointments/New/components/DatePicker';
import TimeSlotPicker from '../../../pages/Appointments/New/components/TimeSlotPicker';

// For picking the user if creating a brand-new appointment
import UserSearchSelect from './UserSearchSelect';
import { format } from 'date-fns';

// Type definitions
interface Appointment {
  id: number;
  appointmentTime: string;
  dentistId: number;
  appointmentTypeId: number;
  notes?: string;
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
  defaultDate?: Date | null; // if you want to pass in a suggested date for new appts
}

interface FormData {
  user_id?: string;
  dentist_id: string;
  appointment_type_id: string;
  appointment_date: string; // "YYYY-MM-DD"
  appointment_time: string; // "HH:mm"
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

  // For "Select User" in the form (only for brand-new appts)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // 1) Setup react-hook-form
  const methods = useForm<FormData>({ mode: 'onChange' });
  const {
    handleSubmit,
    reset,
    formState: { isSubmitting, isValid },
  } = methods;

  // 2) On open, prefill form (if editing) or set defaults
  useEffect(() => {
    if (!isOpen) return;

    if (isEditing && editingAppointment) {
      // Fill with existing appointment data
      const dt = new Date(editingAppointment.appointmentTime);
      const dateStr = dt.toISOString().split('T')[0]; // "YYYY-MM-DD"
      const timeStr = dt.toTimeString().slice(0, 5);   // "HH:mm"

      reset({
        user_id: '', // Admin might not allow changing user on an edit
        dentist_id: String(editingAppointment.dentistId),
        appointment_type_id: String(editingAppointment.appointmentTypeId),
        appointment_date: dateStr,
        appointment_time: timeStr,
        notes: editingAppointment.notes || '',
      });
      setSelectedUserId(null);
    } else if (!isEditing && defaultDate) {
      // Creating new, but we do have a suggested date
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
      // brand-new, no default date
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

  // 3) Create or Update appointment
  const { mutateAsync: mutateAppointment } = useMutation({
    mutationFn: async (data: FormData) => {
      // combine date + time into a single ISO string
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
        // update existing
        return updateAppointment(editingAppointment.id, payload);
      } else {
        // create new
        return createAppointment(payload);
      }
    },
    onSuccess: () => {
      // refresh the admin appointments
      queryClient.invalidateQueries(['admin-appointments']);
      // refresh the calendar view
      queryClient.invalidateQueries(['admin-appointments-for-calendar']);
      onClose();
    },
    onError: (err: any) => {
      alert(`Failed to save: ${err.message}`);
    },
  });

  const onSubmit = async (data: FormData) => {
    await mutateAppointment(data);
  };

  // 4) Delete appointment if editing
  const { mutateAsync: deleteAppointmentMut } = useMutation({
    mutationFn: async () => {
      if (!editingAppointment) throw new Error('No appointment to delete');
      return cancelAppointment(editingAppointment.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-appointments']);
      queryClient.invalidateQueries(['admin-appointments-for-calendar']);
      onClose();
    },
    onError: (err: any) => {
      alert(`Failed to cancel: ${err.message}`);
    },
  });

  const handleDelete = async () => {
    if (!editingAppointment) return;
    const yes = window.confirm('Are you sure you want to delete this appointment?');
    if (!yes) return;
    await deleteAppointmentMut();
  };

  // For display: old date/time if editing
  let originalTimeString = '';
  if (isEditing && editingAppointment) {
    const oldDateObj = new Date(editingAppointment.appointmentTime);
    originalTimeString = format(oldDateObj, 'MMMM d, yyyy h:mm aa');
  }

  // Not open? Return nothing
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-md">
        {/* Header */}
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-semibold">
            {isEditing ? 'Edit Appointment' : 'Create Appointment'}
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {/* If editing, show some basic info */}
        {isEditing && editingAppointment?.user && (
          <div className="px-4 py-2 bg-gray-50 border-b text-sm text-gray-700">
            <p className="font-medium">Patient Info:</p>
            <p>
              {editingAppointment.user.firstName} {editingAppointment.user.lastName}{' '}
              (<span className="text-gray-600">{editingAppointment.user.email}</span>)
            </p>
            <p className="mt-1">
              <span className="font-medium">Currently scheduled:</span> {originalTimeString}
            </p>
          </div>
        )}

        {/* 5) Wrap your form in FormProvider so that DentistSelect, TimeSlotPicker, etc. can do useFormContext() */}
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* If new appointment, let admin pick user */}
            {!isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select User
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
              <DatePicker />
              <TimeSlotPicker editingAppointmentId={editingAppointment?.id} />
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                {...methods.register('notes')}
                rows={4}
                className="w-full border-gray-300 rounded-md shadow-sm
                           focus:ring-blue-500 focus:border-blue-500"
                placeholder="(Optional) Any special requirements or details?"
              />
            </div>

            {/* Footer actions */}
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

/** Utility: Combine date(YYYY-MM-DD) + time(HH:mm) => ISO string */
function buildIsoString(dateStr: string, timeStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);
  const dt = new Date(year, month - 1, day, hour, minute);
  return dt.toISOString();
}
