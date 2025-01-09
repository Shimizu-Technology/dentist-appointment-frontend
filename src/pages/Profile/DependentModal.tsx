// File: /src/pages/Profile/DependentModal.tsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import { Dependent } from '../../types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDependent, updateDependent } from '../../lib/api';
import toast from 'react-hot-toast';

interface DependentModalProps {
  isOpen: boolean;
  onClose: () => void;
  dependent: Dependent | null;
}

interface FormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

export default function DependentModal({ isOpen, onClose, dependent }: DependentModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormData>({ mode: 'onChange' });

  useEffect(() => {
    if (!isOpen) return;
    if (dependent) {
      reset({
        firstName: dependent.firstName,
        lastName: dependent.lastName,
        dateOfBirth: dependent.dateOfBirth || '',
      });
    } else {
      reset({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
      });
    }
  }, [isOpen, dependent, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      if (dependent) {
        return updateDependent(dependent.id, data);
      } else {
        return createDependent(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['dependents']);
      toast.success(dependent ? 'Dependent updated!' : 'Dependent added!');
      onClose();
    },
    onError: (err: any) => {
      toast.error(`Failed to save dependent: ${err.message}`);
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {dependent ? 'Edit' : 'Add'} Dependent
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <Input
            label="First Name"
            required
            {...register('firstName', { required: 'First name is required' })}
            error={errors.firstName?.message}
          />
          <Input
            label="Last Name"
            required
            {...register('lastName', { required: 'Last name is required' })}
            error={errors.lastName?.message}
          />
          <Input
            label="Date of Birth"
            type="date"
            required
            {...register('dateOfBirth', { required: 'Date of birth is required' })}
            error={errors.dateOfBirth?.message}
          />

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={!isValid || isSubmitting}
            >
              {dependent ? 'Update Dependent' : 'Add Dependent'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
