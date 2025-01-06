// File: /src/pages/Admin/Dashboard/AppointmentTypeModal.tsx

import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import Button from '../../../components/UI/Button';
import Input from '../../../components/UI/Input';
import { AppointmentType } from '../../../types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAppointmentType, updateAppointmentType } from '../../../lib/api';
import toast from 'react-hot-toast';

interface AppointmentTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentType: AppointmentType | null;
}

interface FormData {
  name: string;
  duration: number;
  description: string;
}

export default function AppointmentTypeModal({
  isOpen,
  onClose,
  appointmentType,
}: AppointmentTypeModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: appointmentType
      ? {
          name: appointmentType.name,
          duration: appointmentType.duration,
          description: appointmentType.description || '',
        }
      : undefined,
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      if (appointmentType) {
        // Update existing
        return updateAppointmentType(appointmentType.id, data);
      } else {
        // Create new
        return createAppointmentType(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['appointment-types']);
      toast.success(
        appointmentType ? 'Appointment type updated!' : 'New appointment type created!'
      );
      onClose();
    },
    onError: (err: any) => {
      const errors = err?.response?.data?.errors;
      if (Array.isArray(errors) && errors.length) {
        toast.error(`Failed to save type: ${errors.join(', ')}`);
      } else {
        toast.error(`Failed to save type: ${err.message}`);
      }
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {appointmentType ? 'Edit' : 'Add'} Appointment Type
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <Input
            label="Name"
            {...register('name', { required: 'Name is required' })}
            error={errors.name?.message}
          />

          <Input
            type="number"
            label="Duration (minutes)"
            {...register('duration', {
              required: 'Duration is required',
              min: { value: 15, message: 'Minimum is 15' },
              max: { value: 180, message: 'Maximum is 180' },
            })}
            error={errors.duration?.message}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Optional description..."
            />
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={mutation.isLoading || isSubmitting}
              disabled={mutation.isLoading || isSubmitting || !isValid}
            >
              {appointmentType ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
