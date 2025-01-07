// File: /src/pages/Appointments/New/NewAppointmentForm.tsx

import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAppointment, updateAppointment } from '../../../lib/api';
import { getDependents } from '../../../lib/api';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import Button from '../../../components/UI/Button';
import { formatAppointmentDate } from '../../../utils/dates';

import DentistSelect from './components/DentistSelect';
import AppointmentTypeSelect from './components/AppointmentTypeSelect';
import DatePicker from './components/DatePicker';
import TimeSlotPicker from './components/TimeSlotPicker';
import type { Dependent, Appointment } from '../../../types';

interface AppointmentFormData {
  who: string;  // "self" or a dependent ID
  dentist_id: string;
  appointment_type_id: string;
  appointment_date: string;
  appointment_time: string;
  notes?: string;
}

/**
 * Props:
 * - `appointment`: if present, we’re editing an existing appointment
 * - `onSuccess`: callback after a successful creation/update
 */
interface NewAppointmentFormProps {
  appointment?: Appointment;
  onSuccess?: () => void;
}

export default function NewAppointmentForm({
  appointment,
  onSuccess,
}: NewAppointmentFormProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // 1) Fetch user’s dependents
  const {
    data: dependents = [],
    isLoading: depsLoading,
  } = useQuery<Dependent[]>({
    queryKey: ['dependents'],
    queryFn: async () => {
      const res = await getDependents();
      return res.data; // array of Dependent objects
    },
  });

  // 2) Build default values (if “appointment” is provided, fill them)
  let defaultWho = 'self';
  if (appointment && appointment.dependentId) {
    defaultWho = String(appointment.dependentId);
  }

  // Convert appointment’s date/time => separate date / time strings
  let defaultDate = '';
  let defaultTime = '';
  if (appointment?.appointmentTime) {
    try {
      const dt = new Date(appointment.appointmentTime);
      if (!isNaN(dt.getTime())) {
        // e.g., "2025-06-10"
        defaultDate = dt.toISOString().split('T')[0];
        // e.g., "09:30"
        defaultTime = dt
          .toTimeString()
          .slice(0, 5); // "HH:MM"
      }
    } catch {
      /* ignore parse errors */
    }
  }

  const methods = useForm<AppointmentFormData>({
    mode: 'onChange',
    defaultValues: {
      who: defaultWho,
      dentist_id: appointment ? String(appointment.dentistId) : '',
      appointment_type_id: appointment ? String(appointment.appointmentTypeId) : '',
      appointment_date: defaultDate,
      appointment_time: defaultTime,
      notes: appointment?.notes || '',
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = methods;

  // 3) Reuse a single mutation for create or update, depending on `appointment`.
  const { mutateAsync } = useMutation({
    mutationFn: async (data: AppointmentFormData) => {
      // Convert date + time into an ISO string
      const isoString = formatAppointmentDate(data.appointment_date, data.appointment_time);

      // If user selected a dependent from the dropdown (who != "self")
      let dependentId: number | undefined;
      if (data.who !== 'self') {
        dependentId = Number(data.who);
      }

      // Build the payload
      const payload = {
        appointment_time: isoString,
        dentist_id: Number(data.dentist_id),
        appointment_type_id: Number(data.appointment_type_id),
        notes: data.notes || '',
        ...(dependentId ? { dependent_id: dependentId } : {}),
      };

      if (appointment) {
        // Update existing
        return updateAppointment(appointment.id, payload);
      } else {
        // Create new
        return createAppointment(payload);
      }
    },
    onSuccess: (resp) => {
      queryClient.invalidateQueries(['appointments']);
      toast.success(
        appointment ? 'Appointment updated successfully!' : 'Appointment created successfully!'
      );
      onSuccess?.();
    },
    onError: (error: any) => {
      const errors = error?.response?.data?.errors;
      if (Array.isArray(errors) && errors.length > 0) {
        toast.error(`Failed to save appointment: ${errors.join(', ')}`);
      } else {
        toast.error(`Failed to save appointment: ${error.message}`);
      }
    },
  });

  // 4) Submit
  const onSubmit = async (data: AppointmentFormData) => {
    await mutateAsync(data);
  };

  // 5) Render
  if (depsLoading) {
    return <p className="text-gray-500">Loading dependents...</p>;
  }

  const formTitle = appointment
    ? 'Save Changes'
    : 'Book Appointment';

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-md rounded-lg p-8">
        <div className="space-y-6">
          {/* Who is the appointment for: “Myself” or dependent ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Who is this appointment for?
            </label>
            <select
              {...methods.register('who')}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="self">Myself</option>
              {dependents.map((dep) => (
                <option key={dep.id} value={String(dep.id)}>
                  {dep.firstName} {dep.lastName} (DOB: {dep.dateOfBirth})
                </option>
              ))}
            </select>
          </div>

          <DentistSelect />
          <AppointmentTypeSelect />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DatePicker />
            <TimeSlotPicker editingAppointmentId={appointment?.id} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              {...methods.register('notes')}
              rows={4}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any special requirements or concerns?"
            />
          </div>

          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting || !isValid}
            className="w-full"
          >
            {formTitle}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
