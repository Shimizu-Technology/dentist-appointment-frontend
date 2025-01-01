// src/pages/Admin/Dashboard/AppointmentTypeModal.tsx
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import Button from '../../../components/UI/Button';
import Input from '../../../components/UI/Input';
import { AppointmentType } from '../../../types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAppointmentType, updateAppointmentType } from '../../../lib/api';

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

  // If we have an existing AppointmentType, pre-populate the form with those fields
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
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
        // Update existing appointment type
        return updateAppointmentType(appointmentType.id, data);
      } else {
        // Create a new appointment type
        return createAppointmentType(data);
      }
    },
    onSuccess: () => {
      // Refresh the list
      queryClient.invalidateQueries(['appointment-types']);
      onClose();
    },
    onError: (err: any) => {
      alert(`Error saving appointment type: ${err.message}`);
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
            <Button type="submit" isLoading={isSubmitting}>
              {appointmentType ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
