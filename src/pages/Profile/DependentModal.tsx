import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import type { Dependent } from '../../types';

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
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: dependent ? {
      firstName: dependent.firstName,
      lastName: dependent.lastName,
      dateOfBirth: dependent.dateOfBirth.split('T')[0]
    } : undefined
  });

  const onSubmit = async (data: FormData) => {
    try {
      // TODO: Implement save/update logic
      console.log('Save dependent:', data);
      onClose();
    } catch (error) {
      console.error('Failed to save dependent:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
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
            {...register('firstName', { required: 'First name is required' })}
            error={errors.firstName?.message}
          />

          <Input
            label="Last Name"
            {...register('lastName', { required: 'Last name is required' })}
            error={errors.lastName?.message}
          />

          <Input
            type="date"
            label="Date of Birth"
            {...register('dateOfBirth', { required: 'Date of birth is required' })}
            error={errors.dateOfBirth?.message}
          />

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {dependent ? 'Update' : 'Add'} Dependent
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}