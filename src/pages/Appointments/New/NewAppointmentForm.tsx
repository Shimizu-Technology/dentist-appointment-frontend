// File: /src/pages/Appointments/New/NewAppointmentForm.tsx

import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAppointment } from '../../../lib/api';
import { getDependents } from '../../../lib/api';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';   // <-- Import the toast function
import Button from '../../../components/UI/Button';
import { formatAppointmentDate } from '../../../utils/dates';

import DentistSelect from './components/DentistSelect';
import AppointmentTypeSelect from './components/AppointmentTypeSelect';
import DatePicker from './components/DatePicker';
import TimeSlotPicker from './components/TimeSlotPicker';
import type { Dependent } from '../../../types';

interface AppointmentFormData {
  who: string;  // "self" or a dependent ID
  dentist_id: string;
  appointment_type_id: string;
  appointment_date: string;
  appointment_time: string;
  notes?: string;
}

export default function NewAppointmentForm() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // 1) Fetch user’s dependents
  const { data: dependents = [], isLoading: depsLoading } = useQuery<Dependent[]>({
    queryKey: ['dependents'],
    queryFn: async () => {
      const res = await getDependents();
      return res.data; // array of Dependent objects
    },
  });

  // 2) Initialize the form
  const methods = useForm<AppointmentFormData>({
    mode: 'onChange',
    defaultValues: {
      who: 'self',
      dentist_id: '',
      appointment_type_id: '',
      appointment_date: '',
      appointment_time: '',
      notes: '',
    },
  });
  const {
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = methods;

  // 3) React Query mutation for creating an appointment
  const { mutateAsync } = useMutation({
    mutationFn: async (formData: AppointmentFormData) => {
      // Convert date + time into an ISO string
      const isoString = formatAppointmentDate(
        formData.appointment_date,
        formData.appointment_time
      );

      // Determine if user selected "self" or dependent
      let dependentId: number | undefined;
      if (formData.who !== 'self') {
        dependentId = Number(formData.who);
      }

      // Build payload for the backend
      const payload = {
        appointment_time: isoString,
        dentist_id: Number(formData.dentist_id),
        appointment_type_id: Number(formData.appointment_type_id),
        notes: formData.notes || '',
        ...(dependentId ? { dependent_id: dependentId } : {}),
      };

      // Actually call our createAppointment API
      return createAppointment(payload);
    },
  });

  // 4) onSubmit: handle the success/error flow
  const onSubmit = async (data: AppointmentFormData) => {
    try {
      const response = await mutateAsync(data);
      // If we get here, the appointment was created successfully
      toast.success('Appointment created successfully!');
      // Optionally refresh the appointments list
      queryClient.invalidateQueries(['appointments']);
      // Redirect the user
      navigate('/appointments');
    } catch (error: any) {
      // If server returns 422, we likely have validation errors
      // e.g., error.response?.data?.errors => ["Dentist is unavailable", ...]
      const errors = error?.response?.data?.errors;
      if (Array.isArray(errors) && errors.length > 0) {
        toast.error(`Failed to create appointment: ${errors.join(', ')}`);
      } else {
        toast.error(`Failed to create appointment: ${error.message}`);
      }
    }
  };

  // 5) Render
  if (depsLoading) {
    return <p className="text-gray-500">Loading dependents...</p>;
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-md rounded-lg p-8">
        <div className="space-y-6">
          {/* Who is the appointment for: “Myself” or “depId” */}
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
            <TimeSlotPicker />
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

          {/* 
            6) The “Book Appointment” button 
            Show spinner if isSubmitting = true. 
            Our custom Button component might have a prop called `isLoading`.
          */}
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting || !isValid}
            className="w-full"
          >
            Book Appointment
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
