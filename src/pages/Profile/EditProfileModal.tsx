// File: /src/pages/Profile/EditProfileModal.tsx

import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import { useAuthStore } from '../../store/authStore';
import { updateCurrentUser } from '../../lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string; // New field
}

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user, setAuth } = useAuthStore();
  const queryClient = useQueryClient();

  // Safely handle defaults (if user is null, it means not logged in)
  const defaultPhone = user?.phone && user.phone.trim() !== '' ? user.phone : '+1671';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
  } = useForm<ProfileFormData>({
    mode: 'onChange',
    defaultValues: {
      firstName:    user?.firstName || '',
      lastName:     user?.lastName || '',
      email:        user?.email || '',
      phone:        defaultPhone,
      dateOfBirth:  user?.dateOfBirth || '', 
    },
  });

  // If the modal is opened/closed, we can reset the form to the user’s current data
  // (In case user re-opens modal without refreshing)
  // This is optional but can be helpful:
  // useEffect(() => {
  //   if (isOpen && user) {
  //     reset({ ... });
  //   }
  // }, [isOpen, user, reset]);

  const mutation = useMutation({
    mutationFn: (data: ProfileFormData) => {
      return updateCurrentUser({
        first_name:    data.firstName,
        last_name:     data.lastName,
        email:         data.email,
        phone:         data.phone,
        date_of_birth: data.dateOfBirth || undefined,
      });
    },
    onSuccess: (response) => {
      const updatedUser = response.data;
      setAuth(updatedUser, localStorage.getItem('token') || '');
      queryClient.invalidateQueries(['user']);
      toast.success('Profile updated successfully!');
      onClose();
    },
    onError: (err: any) => {
      toast.error(`Failed to update profile: ${err.message}`);
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    mutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center 
                    justify-center p-4 z-50"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Update Your Profile
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          <Input
            label="Email"
            type="email"
            required
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$/i,
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

          {/* NEW: Date of Birth */}
          <Input
            label="Date of Birth"
            type="date"
            {...register('dateOfBirth')}
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
