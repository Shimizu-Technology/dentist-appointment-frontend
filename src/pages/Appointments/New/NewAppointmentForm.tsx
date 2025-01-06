// File: /src/pages/Appointments/New/NewAppointmentForm.tsx

import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAppointment } from '../../../lib/api';
import { getDependents } from '../../../lib/api';  // So we can fetch user’s dependents
import { useQuery } from '@tanstack/react-query';
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

export default function NewAppointmentForm() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // (1) Fetch the user’s dependents so we can list them
  const { data: dependents = [], isLoading: depsLoading } = useQuery<Dependent[]>({
    queryKey: ['dependents'],
    queryFn: async () => {
      const res = await getDependents();
      return res.data; // shape: Dependent[]
    },
  });

  // (2) Setup the form
  const methods = useForm<AppointmentFormData>({
    mode: 'onChange',
    defaultValues: {
      who: 'self',  // default to “myself”
      dentist_id: '',
      appointment_type_id: '',
      appointment_date: '',
      appointment_time: '',
      notes: '',
    },
  });

  const { handleSubmit, formState: { isSubmitting, isValid } } = methods;

  // (3) Mutation to create the appointment
  const { mutateAsync } = useMutation({
    mutationFn: async (data: AppointmentFormData) => {
      // Turn date + time into an ISO string
      const isoString = formatAppointmentDate(data.appointment_date, data.appointment_time);

      // If the user selected "self", we do NOT pass a dependent_id
      // If they selected a real number for "who", that’s the dependent ID.
      let dependentId: number | undefined;
      if (data.who !== 'self') {
        dependentId = Number(data.who); // “21” => 21
      }

      // Build the payload (the backend expects `appointment: { ... }`)
      const payload = {
        appointment_time: isoString,
        dentist_id: Number(data.dentist_id),
        appointment_type_id: Number(data.appointment_type_id),
        notes: data.notes || '',
        // If dependentId is present, add it; else omit
        ...(dependentId ? { dependent_id: dependentId } : {}),
      };

      return createAppointment(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments']);
      navigate('/appointments');
    },
  });

  const onSubmit = async (formData: AppointmentFormData) => {
    await mutateAsync(formData);
  };

  // (4) Render
  if (depsLoading) {
    return <p className="text-gray-500">Loading dependents...</p>;
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-md rounded-lg p-8">
        <div className="space-y-6">

          {/* Patient selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Who is this appointment for?
            </label>
            <select
              {...methods.register('who')}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="self">Myself</option>
              {dependents.map(dep => (
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
