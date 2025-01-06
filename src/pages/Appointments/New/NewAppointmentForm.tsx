// File: /src/pages/Appointments/New/NewAppointmentForm.tsx
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAppointment, updateAppointment } from '../../../lib/api';
import Button from '../../../components/UI/Button';
import { formatAppointmentDate } from '../../../utils/dates';

import DentistSelect from './components/DentistSelect';
import AppointmentTypeSelect from './components/AppointmentTypeSelect';
import DatePicker from './components/DatePicker';
import TimeSlotPicker from './components/TimeSlotPicker';

import type { Appointment } from '../../../types';

interface AppointmentFormData {
  dentist_id: string;
  appointment_type_id: string;
  appointment_date: string;
  appointment_time: string;
  notes?: string;
}

interface NewAppointmentFormProps {
  appointment?: Appointment;
  onSuccess?: () => void;
}

export default function NewAppointmentForm({ appointment, onSuccess }: NewAppointmentFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Default values if editing an existing appointment
  const defaultValues: AppointmentFormData = appointment
    ? {
        dentist_id: String(appointment.dentistId),
        appointment_type_id: String(appointment.appointmentTypeId),
        appointment_date: new Date(appointment.appointmentTime)
          .toISOString()
          .split('T')[0],
        appointment_time: new Date(appointment.appointmentTime).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
        notes: appointment.notes || '',
      }
    : {
        dentist_id: '',
        appointment_type_id: '',
        appointment_date: '',
        appointment_time: '',
        notes: '',
      };

  // 1) Create the form context
  const methods = useForm<AppointmentFormData>({
    mode: 'onChange',
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = methods;

  // 2) Setup mutation
  const mutation = useMutation({
    mutationFn: (data: AppointmentFormData) => {
      const isoString = formatAppointmentDate(data.appointment_date, data.appointment_time);
      const payload = {
        ...data,
        dentist_id: parseInt(data.dentist_id, 10),
        appointment_type_id: parseInt(data.appointment_type_id, 10),
        appointment_time: isoString,
      };
      return appointment
        ? updateAppointment(appointment.id, payload)
        : createAppointment(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      onSuccess ? onSuccess() : navigate('/appointments');
    },
  });

  // 3) Actual form submit
  const onSubmit = (formData: AppointmentFormData) => {
    mutation.mutate(formData);
  };

  return (
    // Wrap everything in <FormProvider> so child components can useFormContext()
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-md rounded-lg p-8">
        <div className="space-y-6">
          <DentistSelect />
          <AppointmentTypeSelect />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DatePicker />
            <TimeSlotPicker />
          </div>

          {/* Additional notes */}
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
            isLoading={mutation.isLoading || isSubmitting}
            disabled={mutation.isLoading || isSubmitting || !isValid}
            className="w-full"
          >
            {appointment ? 'Update Appointment' : 'Book Appointment'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
