// File: /src/pages/Admin/Dashboard/DentistCard.tsx

import { useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '../../../components/UI/Button';
import toast from 'react-hot-toast';
import { deleteDentist, buildFullImageUrl } from '../../../lib/api';
import type { Dentist } from '../../../types';

interface DentistCardProps {
  dentist: Dentist;
  onEdit: () => void; // Called when user clicks "Edit"
}

export default function DentistCard({ dentist, onEdit }: DentistCardProps) {
  const queryClient = useQueryClient();

  // Mutation for deleting a dentist
  const { mutate: handleDelete, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteDentist(dentist.id),
    onSuccess: () => {
      toast.success(`Dentist "${dentist.firstName} ${dentist.lastName}" removed.`);
      queryClient.invalidateQueries(['all-dentists']);
    },
    onError: (err: any) => {
      toast.error(`Failed to remove dentist: ${err.message}`);
    },
  });

  const confirmDelete = () => {
    const yes = window.confirm(
      `Are you sure you want to delete Dr. ${dentist.firstName} ${dentist.lastName}?`
    );
    if (yes) handleDelete();
  };

  // Convert the relative (or partial) path in dentist.imageUrl to a full URL
  const fullImageUrl = buildFullImageUrl(dentist.imageUrl);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      {/* Possibly display the dentist's image if available */}
      {fullImageUrl ? (
        <img
          src={fullImageUrl}
          alt={`Dr. ${dentist.firstName} ${dentist.lastName}`}
          className="w-full h-48 object-cover rounded-md"
        />
      ) : (
        <div className="flex items-center justify-center w-full h-48 bg-gray-200 rounded-md">
          <p className="text-gray-500">No image available</p>
        </div>
      )}

      <div>
        <h3 className="text-xl font-semibold text-gray-900">
          Dr. {dentist.firstName} {dentist.lastName}
        </h3>
        <p className="text-blue-600 text-sm">
          {dentist.specialty || 'General Dentist'}
        </p>
      </div>

      {dentist.qualifications && dentist.qualifications.length > 0 && (
        <div className="text-sm text-gray-600">
          <h4 className="font-medium mb-2">Education &amp; Qualifications</h4>
          <ul className="list-disc list-inside space-y-1">
            {dentist.qualifications.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex space-x-2 mt-4">
        <Button variant="outline" size="sm" onClick={onEdit}>
          Edit
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={confirmDelete}
          isLoading={isDeleting}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
