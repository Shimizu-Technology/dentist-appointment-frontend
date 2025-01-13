// File: /src/pages/Profile/EditProfileModal.tsx
import { useEffect } from 'react';
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
  firstName:    string;
  lastName:     string;
  email:        string;
  phone:        string;
  dateOfBirth:  string; // "YYYY-MM-DD" for <input type="date" />
}

/**
 * Convert "MM/DD/YYYY" => "YYYY-MM-DD" for <input type="date" /> usage.
 * If user.dateOfBirth is already "YYYY-MM-DD", we just return it.
 * Logs each step for debugging.
 */
function parseToInputDate(dob?: string | null): string {
  console.log('[parseToInputDate] incoming dob =', dob);
  if (!dob) {
    console.log('[parseToInputDate] => returning empty (no DOB)');
    return '';
  }

  const trimmed = dob.trim();

  // If the string is already in "YYYY-MM-DD", we’ll just return it.
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    console.log('[parseToInputDate] => recognized as "YYYY-MM-DD", returning it directly:', trimmed);
    return trimmed;
  }

  // Otherwise, we attempt to parse "MM/DD/YYYY"
  const parts = trimmed.split('/');
  if (parts.length === 3) {
    const [mm, dd, yyyy] = parts;
    const y = (yyyy || '').padStart(4, '0');
    const m = (mm    || '').padStart(2, '0');
    const d = (dd    || '').padStart(2, '0');
    const result = `${y}-${m}-${d}`;
    console.log('[parseToInputDate] => recognized as "MM/DD/YYYY", returning =>', result);
    return result;
  }

  console.log('[parseToInputDate] => unrecognized format, returning empty string');
  return '';
}

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user, setAuth } = useAuthStore();
  const queryClient       = useQueryClient();

  // We'll set up react-hook-form with a "reset" in useEffect, so minimal defaults here:
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
  } = useForm<ProfileFormData>({
    mode: 'onChange',
    defaultValues: {
      firstName:   '',
      lastName:    '',
      email:       '',
      phone:       '+1671',
      dateOfBirth: '',
    },
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    console.log('[EditProfileModal] user =>', user);

    if (user) {
      // If we do have a user, parse the date into "YYYY-MM-DD"
      const parsedDOB = parseToInputDate(user.dateOfBirth);
      reset({
        firstName:   user.firstName   || '',
        lastName:    user.lastName    || '',
        email:       user.email       || '',
        phone:       user.phone       || '+1671',
        dateOfBirth: parsedDOB,
      });
      console.log('[EditProfileModal] after parse, dateOfBirth =>', parsedDOB);
    }
  }, [isOpen, user, reset]);

  const mutation = useMutation({
    mutationFn: (data: ProfileFormData) => {
      console.log('[EditProfileModal] onSubmit => data:', data);
      return updateCurrentUser({
        first_name:    data.firstName,
        last_name:     data.lastName,
        email:         data.email,
        phone:         data.phone,
        date_of_birth: data.dateOfBirth || undefined, // if empty, pass undefined
      });
    },
    onSuccess: (response) => {
      console.log('[EditProfileModal] updateCurrentUser success =>', response.data);
      setAuth(response.data, localStorage.getItem('token') || '');
      queryClient.invalidateQueries(['user']);
      toast.success('Profile updated successfully!');
      onClose();
    },
    onError: (err: any) => {
      console.error('[EditProfileModal] updateCurrentUser error =>', err);
      toast.error(`Failed to update profile: ${err.message}`);
    },
  });

  function onSubmit(formData: ProfileFormData) {
    mutation.mutate(formData);
  }

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
          {/* First & Last names */}
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

          {/* Email */}
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

          {/* Phone */}
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

          {/* DOB => "YYYY-MM-DD" */}
          <Input
            label="Date of Birth"
            type="date"
            {...register('dateOfBirth')}
            error={errors.dateOfBirth?.message}
          />

          {/* Footer buttons */}
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
