// File: /src/pages/Profile/DependentModal.tsx

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import { Dependent } from '../../types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDependent, updateDependent } from '../../lib/api';

interface DependentModalProps {
  isOpen: boolean;
  onClose: () => void;
  dependent: Dependent | null; // null => "create" mode, otherwise => "edit" mode
}

/** The form data we expect. Note dateOfBirth is a *string* in "YYYY-MM-DD". */
interface FormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // e.g. "2000-01-02"
}

export default function DependentModal({ isOpen, onClose, dependent }: DependentModalProps) {
  const queryClient = useQueryClient();

  // Setup react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormData>({
    mode: 'onChange',
  });

  // On modal open or if `dependent` changes, set default form values:
  useEffect(() => {
    if (!isOpen) return;

    if (dependent) {
      // Editing existing => fill the form with the existing dependent data
      reset({
        firstName: dependent.firstName,
        lastName: dependent.lastName,
        /**
         * Ensure that `dependent.dateOfBirth` is something like "2025-01-02"
         * If it's null or blank, pass '' so the field is empty.
         */
        dateOfBirth: dependent.dateOfBirth || '',
      });
    } else {
      // Creating a new dependent => blank form
      reset({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
      });
    }
  }, [isOpen, dependent, reset]);

  // Create or update dependent
  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      if (dependent) {
        // Updating existing dependent
        return updateDependent(dependent.id, data);
      } else {
        // Creating a brand new dependent
        return createDependent(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['dependents']); // Refresh the list
      onClose();
    },
    onError: (err: any) => {
      alert(`Failed to save dependent: ${err.message}`);
    },
  });

  const onSubmit = (data: FormData) => {
    // data.dateOfBirth will be "YYYY-MM-DD" from the browser
    mutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {dependent ? 'Edit' : 'Add'} Dependent
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body (Form) */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <Input
            label="First Name"
            {...register('firstName', { required: 'First name is required' })}
            error={errors.firstName?.message}
          />

          <Input
            label="Last Name"
            {...register('lastName', { required: 'Last name is required' })}
            error={errors.lastName?.message}
          />

          <Input
            type="date" // KEY: ensures an ISO date string in "YYYY-MM-DD"
            label="Date of Birth"
            {...register('dateOfBirth', { required: 'Date of birth is required' })}
            error={errors.dateOfBirth?.message}
          />

          {/* Footer */}
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
