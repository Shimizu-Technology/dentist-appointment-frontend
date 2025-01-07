// File: /src/pages/Admin/Dashboard/DentistModal.tsx

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import Button from '../../../components/UI/Button';
import Input from '../../../components/UI/Input';
import { createDentist, updateDentist, uploadDentistImage } from '../../../lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { Dentist } from '../../../types';

interface DentistModalProps {
  isOpen: boolean;
  onClose: () => void;
  dentist: Dentist | null; // null => creating new, otherwise editing
}

interface FormData {
  firstName: string;
  lastName: string;
  specialtyId?: number;
  qualifications: string; // multiline text => we’ll convert to array by line
}

export default function DentistModal({ isOpen, onClose, dentist }: DentistModalProps) {
  const queryClient = useQueryClient();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      specialtyId: undefined,
      qualifications: '',
    },
  });

  // Fill form if editing an existing dentist
  useEffect(() => {
    if (!isOpen) return;
    if (dentist) {
      // Convert the array -> multiline string for editing
      const qualString = dentist.qualifications?.join('\n') || '';
      reset({
        firstName: dentist.firstName,
        lastName: dentist.lastName,
        // If you have the specialty as an ID, you’d put that here
        // specialtyId: ???,
        qualifications: qualString,
      });
    } else {
      // Creating new => blank form
      reset({
        firstName: '',
        lastName: '',
        specialtyId: undefined,
        qualifications: '',
      });
    }
    setSelectedFile(null);
  }, [isOpen, dentist, reset]);

  // CREATE or UPDATE
  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload: any = {
        first_name: data.firstName,
        last_name: data.lastName,
        // If you handle specialty:
        // specialty_id: data.specialtyId || null,
        qualifications: data.qualifications,
      };

      if (dentist) {
        // Update
        return updateDentist(dentist.id, payload);
      } else {
        // Create
        return createDentist(payload);
      }
    },
    onSuccess: async (response) => {
      // If we successfully created/updated, we might then handle the file upload
      const updatedDentist: Dentist = response.data;
      // If user selected a file => upload it
      if (selectedFile) {
        try {
          const uploadRes = await uploadDentistImage(updatedDentist.id, selectedFile);
          toast.success('Image uploaded successfully.');
        } catch (err: any) {
          toast.error(`Failed to upload image: ${err.message}`);
        }
      }

      // Refresh
      queryClient.invalidateQueries(['all-dentists']);
      toast.success(dentist ? 'Dentist updated!' : 'Dentist created!');
      onClose();
    },
    onError: (err: any) => {
      toast.error(`Failed to save dentist: ${err.message}`);
    },
  });

  const onSubmit = async (data: FormData) => {
    // Convert multiline qualifications -> array
    // The backend expects a string with `\n` newlines, which is fine.
    await saveMutation.mutateAsync(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-lg shadow-lg">
        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {dentist ? 'Edit Dentist' : 'Add Dentist'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          <div className="flex gap-4">
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

          {/* If you handle specialty IDs, do a <select> for them here. For now, we skip. */}
          {/* If needed:
          <select
            {...register('specialtyId')}
            className="border p-2 rounded w-full"
          >
            <option value="">Select Specialty (optional)</option>
            // Map your available specialties
          </select>
          */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Qualifications
            </label>
            <textarea
              rows={4}
              {...register('qualifications')}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="One qualification per line..."
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload New Image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setSelectedFile(e.target.files[0]);
                } else {
                  setSelectedFile(null);
                }
              }}
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={saveMutation.isLoading || isSubmitting}
              disabled={!isValid || saveMutation.isLoading || isSubmitting}
            >
              {dentist ? 'Save Changes' : 'Create Dentist'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
