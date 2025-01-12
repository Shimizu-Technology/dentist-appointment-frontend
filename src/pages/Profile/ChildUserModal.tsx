// File: /src/pages/Profile/ChildUserModal.tsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';

import {
  createMyChildUser,  // (A new function we’ll define in api.ts for normal user’s child creation)
  updateMyChildUser,
  deleteMyChildUser
} from '../../lib/api'; 
import toast from 'react-hot-toast';
import type { User } from '../../types';

interface ChildUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  childUser: User | null;
  onSuccess?: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

export default function ChildUserModal({
  isOpen,
  onClose,
  childUser,
  onSuccess,
}: ChildUserModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormData>({ mode: 'onChange' });

  useEffect(() => {
    if (!isOpen) return;
    if (childUser) {
      // Editing existing child
      reset({
        firstName:   childUser.firstName,
        lastName:    childUser.lastName,
        dateOfBirth: childUser.dateOfBirth || '',
      });
    } else {
      // Creating new child
      reset({
        firstName:   '',
        lastName:    '',
        dateOfBirth: '',
      });
    }
  }, [isOpen, childUser, reset]);

  async function onSubmit(data: FormData) {
    try {
      if (childUser) {
        // Update an existing child: PATCH /api/v1/users/my_children/:id
        await updateMyChildUser(childUser.id, data);
        toast.success('Child user updated!');
      } else {
        // Create new child: POST /api/v1/users/my_children
        await createMyChildUser(data);
        toast.success('Child user created!');
      }
      onSuccess?.(); // refresh parent list
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save child user');
    }
  }

  async function handleDelete() {
    if (!childUser) return;
    const yes = window.confirm('Are you sure you want to delete this child user?');
    if (!yes) return;
    try {
      // Delete child: DELETE /api/v1/users/my_children/:id
      await deleteMyChildUser(childUser.id);
      toast.success('Child user deleted!');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete');
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-md rounded-md shadow-md">
        {/* Header */}
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-semibold">
            {childUser ? 'Edit Child User' : 'Add Child User'}
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
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

          {/* Footer */}
          <div className="flex justify-end space-x-4 pt-4">
            {childUser && (
              <Button variant="danger" type="button" onClick={handleDelete}>
                Delete
              </Button>
            )}
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={!isValid || isSubmitting}
            >
              {childUser ? 'Save Changes' : 'Add Child'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
