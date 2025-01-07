// File: /src/pages/Admin/Dashboard/UserModal.tsx

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import Button from '../../../components/UI/Button';
import Input from '../../../components/UI/Input';
import {
  createUser,
  updateUser,
  deleteUser,
} from '../../../lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import type { User } from '../../../types';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null; // null => create mode, otherwise edit mode
}

interface FormData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  password?: string;
  role: 'user' | 'admin' | 'phone_only';
}

export default function UserModal({ isOpen, onClose, user }: UserModalProps) {
  const queryClient = useQueryClient();
  const isEditMode = !!user;

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormData>({
    mode: 'onChange',
  });

  // When the modal opens, fill the form if editing
  useEffect(() => {
    if (!isOpen) return;

    if (isEditMode && user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        // Don’t show password
        role: user.role, // could be 'user', 'admin', or 'phone_only'
      });
    } else {
      // Creating new => blank
      reset({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        role: 'user', // default
      });
    }
  }, [isOpen, isEditMode, user, reset]);

  // CREATE or UPDATE
  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (isEditMode && user) {
        // Update
        return updateUser(user.id, {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          password: data.password, // if changing password
          role: data.role,
        });
      } else {
        // Create new
        return createUser({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          password: data.password,
          role: data.role,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success(isEditMode ? 'User updated!' : 'User created!');
      onClose();
    },
    onError: (err: any) => {
      toast.error(`Failed to save user: ${err.message}`);
    },
  });

  const onSubmit = (formData: FormData) => {
    // If “phone_only,” we can skip requiring email/password, etc.
    // But that’s optional logic — you could enforce validations in `react-hook-form`.
    mutation.mutate(formData);
  };

  // DELETE (only if editing)
  const deleteMutation = useMutation({
    mutationFn: () => deleteUser(user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('User deleted.');
      onClose();
    },
    onError: (err: any) => {
      toast.error(`Failed to delete user: ${err.message}`);
    },
  });

  const handleDelete = () => {
    if (!user) return;
    const yes = window.confirm(`Are you sure you want to delete ${user.email}?`);
    if (yes) {
      deleteMutation.mutate();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditMode ? 'Edit User' : 'Create New User'}
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              {...register('firstName', { required: 'Required' })}
              error={errors.firstName?.message}
            />
            <Input
              label="Last Name"
              {...register('lastName', { required: 'Required' })}
              error={errors.lastName?.message}
            />
          </div>

          <Input
            label="Email (for regular user/admin)"
            type="email"
            {...register('email')}
            error={errors.email?.message}
          />

          <Input
            label="Phone (optional for normal user, required if phone_only)"
            type="text"
            {...register('phone')}
            error={errors.phone?.message}
          />

          {/* Password only if creating a brand-new user or if admin wants to set a new one */}
          {!isEditMode && (
            <Input
              label="Password (only if not phone_only)"
              type="password"
              {...register('password')}
              error={errors.password?.message}
            />
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              className="border-gray-300 rounded-md w-full px-3 py-2
                         focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              {...register('role', { required: 'Role is required' })}
            >
              <option value="user">Regular User</option>
              <option value="admin">Admin</option>
              <option value="phone_only">Phone-Only</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600">
                {errors.role.message as string}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            {/* If editing, show Delete button */}
            {isEditMode && (
              <Button
                variant="danger"
                type="button"
                onClick={handleDelete}
                isLoading={deleteMutation.isLoading}
              >
                Delete
              </Button>
            )}
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={!isValid || isSubmitting}
              isLoading={mutation.isLoading || isSubmitting}
            >
              {isEditMode ? 'Save' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
