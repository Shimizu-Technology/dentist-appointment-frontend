// src/pages/Profile/EditProfileModal.tsx
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import { useAuthStore } from '../../store/authStore';
import { updateCurrentUser } from '../../lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user, setAuth } = useAuthStore();
  const queryClient = useQueryClient();

  // react-hook-form setup, pre-fill with current user data
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ProfileFormData>({
    mode: 'onChange',
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  // mutation: calls updateCurrentUser
  const mutation = useMutation({
    mutationFn: (data: ProfileFormData) => updateCurrentUser(data),
    onSuccess: (response) => {
      // response.data is the updated user object
      const updatedUser = response.data;
      setAuth(updatedUser, localStorage.getItem('token') || '');
      // optionally re-fetch queries if needed
      queryClient.invalidateQueries(['user']); 
      onClose();
    },
    onError: (err: any) => {
      alert(`Failed to update profile: ${err.message}`);
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    mutation.mutate(data);
  };

  // If not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <Input
            label="First Name"
            {...register('firstName', {
              required: 'First name is required',
            })}
            error={errors.firstName?.message}
          />

          <Input
            label="Last Name"
            {...register('lastName', {
              required: 'Last name is required',
            })}
            error={errors.lastName?.message}
          />

          <Input
            label="Email"
            type="email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
            error={errors.email?.message}
          />

          <Input
            label="Phone"
            type="tel"
            {...register('phone', {
              pattern: {
                value: /^\+?[\d\s-]+$/,
                message: 'Invalid phone number',
              },
            })}
            error={errors.phone?.message}
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
              isLoading={mutation.isLoading || isSubmitting}
              disabled={mutation.isLoading || isSubmitting || !isValid}
            >
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
