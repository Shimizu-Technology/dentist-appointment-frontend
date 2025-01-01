import { useForm } from 'react-hook-form';
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
  dentistId: string;
  appointmentTypeId: string;
  appointmentDate: string;
  appointmentTime: string;
  notes?: string;
}

interface NewAppointmentFormProps {
  appointment?: Appointment;
  onSuccess?: () => void;
}

export default function NewAppointmentForm({ appointment, onSuccess }: NewAppointmentFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const defaultValues = appointment ? {
    dentistId: appointment.dentistId.toString(),
    appointmentTypeId: appointment.appointmentTypeId.toString(),
    appointmentDate: new Date(appointment.appointmentTime).toISOString().split('T')[0],
    appointmentTime: new Date(appointment.appointmentTime).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    }),
  } : undefined;

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<AppointmentFormData>({
    defaultValues
  });

  const mutation = useMutation({
    mutationFn: (data: AppointmentFormData) => {
      const appointmentDateTime = formatAppointmentDate(data.appointmentDate, data.appointmentTime);
      const appointmentData = {
        ...data,
        dentistId: parseInt(data.dentistId),
        appointmentTypeId: parseInt(data.appointmentTypeId),
        appointmentTime: appointmentDateTime
      };

      if (appointment) {
        return updateAppointment(appointment.id, appointmentData);
      }
      return createAppointment(appointmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/appointments');
      }
    }
  });

  const onSubmit = (data: AppointmentFormData) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-md rounded-lg p-8">
      <div className="space-y-6">
        <DentistSelect 
          register={register} 
          error={errors.dentistId?.message} 
        />

        <AppointmentTypeSelect 
          register={register}
          error={errors.appointmentTypeId?.message}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DatePicker
            register={register}
            error={errors.appointmentDate?.message}
            watch={watch}
          />

          <TimeSlotPicker
            register={register}
            error={errors.appointmentTime?.message}
            watch={watch}
          />
        </div>

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

        <Button type="submit" isLoading={isSubmitting} className="w-full">
          {appointment ? 'Update Appointment' : 'Book Appointment'}
        </Button>
      </div>
    </form>
  );
}