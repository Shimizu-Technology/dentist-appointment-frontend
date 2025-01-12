// File: /src/pages/Appointments/New/NewAppointmentForm.tsx

import { FormProvider, useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import {
  createAppointment,
  updateAppointment,
  api,
  getMyChildren,
} from '../../../lib/api';
import toast from 'react-hot-toast';

import Button from '../../../components/UI/Button';
import { formatAppointmentDate } from '../../../utils/dates';

import DentistSelect from './components/DentistSelect';
import AppointmentTypeSelect from './components/AppointmentTypeSelect';
import DatePicker from './components/DatePicker';
import TimeSlotPicker from './components/TimeSlotPicker';
import type { Appointment, User } from '../../../types';

interface AppointmentFormData {
  who: string; // "self" or a child-user ID as string
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
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // 1) Fetch child users (we can also use getMyChildren)
  const { data: childUsers = [], isLoading: childLoading } = useQuery<User[]>({
    queryKey: ['my-children'],
    queryFn: async () => {
      // If your approach is to do GET /users?parent_id=me, do that here.
      // Or if you have getMyChildren => GET /users/my_children, do that:
      const res = await getMyChildren();
      return res.data; // depends on your API shape
    },
  });

  // 2) Build default values
  let defaultWho = 'self';

  // If editing an existing appointment that had a child user
  if (appointment && appointment.user?.isDependent) {
    defaultWho = String(appointment.userId);
  }

  // Convert appointment’s date/time => separate date / time
  let defaultDate = '';
  let defaultTime = '';
  if (appointment?.appointmentTime) {
    try {
      const dt = new Date(appointment.appointmentTime);
      if (!isNaN(dt.getTime())) {
        defaultDate = dt.toISOString().split('T')[0]; // "YYYY-MM-DD"
        defaultTime = dt.toTimeString().slice(0, 5);   // "HH:MM"
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
    register,
    formState: { isSubmitting, isValid },
  } = methods;

  // Ensure date/time fields are required
  useEffect(() => {
    register('appointment_date', { required: 'Please pick an appointment date' });
    register('appointment_time', { required: 'Please pick an appointment time' });
  }, [register]);

  // 3) Create/update mutation
  const { mutateAsync } = useMutation({
    mutationFn: async (data: AppointmentFormData) => {
      const isoString = formatAppointmentDate(data.appointment_date, data.appointment_time);

      let payload: Record<string, any> = {
        appointment_time: isoString,
        dentist_id: Number(data.dentist_id),
        appointment_type_id: Number(data.appointment_type_id),
        notes: data.notes || '',
      };

      // If user selected a child user (who != 'self'), pass child_user_id
      if (data.who !== 'self') {
        payload.child_user_id = Number(data.who);
      }

      if (appointment) {
        // update existing
        return updateAppointment(appointment.id, payload);
      } else {
        // create new
        return createAppointment(payload);
      }
    },
    onSuccess: (resp) => {
      queryClient.invalidateQueries(['appointments']);
      toast.success(appointment ? 'Appointment updated!' : 'Appointment created!');
      onSuccess?.();

      if (!appointment) {
        const newAppt = resp.data; // the newly created appointment object
        navigate(`/appointments/new/confirmation?id=${newAppt.id}`);
      }
    },
    onError: (error: any) => {
      const errors = error?.response?.data?.errors;
      if (Array.isArray(errors) && errors.length > 0) {
        toast.error(`Failed: ${errors.join(', ')}`);
      } else {
        toast.error(`Failed: ${error.message}`);
      }
    },
  });

  // 4) Form submit handler
  async function onSubmit(data: AppointmentFormData) {
    await mutateAsync(data);
  }

  if (childLoading) {
    return <p className="text-gray-500">Loading child users...</p>;
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow rounded-lg p-6">
        <div className="space-y-6">
          {/* Who: “Myself” or child user */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Who is this appointment for?
              <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              {...methods.register('who')}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="self">Myself</option>
              {childUsers.map((child) => (
                <option key={child.id} value={String(child.id)}>
                  {child.firstName} {child.lastName}{' '}
                  {child.dateOfBirth ? `(DOB: ${child.dateOfBirth})` : ''}
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
              rows={4}
              {...methods.register('notes')}
              className="w-full border-gray-300 rounded-md shadow-sm 
                         focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any special requirements or concerns?"
            />
          </div>

          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting || !isValid}
            className="w-full"
          >
            {appointment ? 'Save Changes' : 'Book Appointment'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
