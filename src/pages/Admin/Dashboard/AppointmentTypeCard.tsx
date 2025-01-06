// File: /src/pages/Admin/Dashboard/AppointmentTypeCard.tsx

import { Clock, Edit, Trash2 } from 'lucide-react';
import Button from '../../../components/UI/Button';
import type { AppointmentType } from '../../../types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAppointmentType } from '../../../lib/api';
import toast from 'react-hot-toast';

interface AppointmentTypeCardProps {
  type: AppointmentType;
  onEdit: () => void;
}

export default function AppointmentTypeCard({ type, onEdit }: AppointmentTypeCardProps) {
  const queryClient = useQueryClient();

  const { mutate: handleDelete, isLoading: isDeleting } = useMutation({
    mutationFn: () => deleteAppointmentType(type.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointment-types'] });
      toast.success('Appointment type deleted successfully!');
    },
    onError: (err: any) => {
      toast.error(`Failed to delete type: ${err.message}`);
    },
  });

  const confirmDelete = () => {
    const yes = window.confirm(`Are you sure you want to delete "${type.name}"?`);
    if (yes) handleDelete();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{type.name}</h3>
        </div>
        <div className="flex space-x-2">
          {/* Smaller outline Edit button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex items-center"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>

          {/* Smaller danger Delete button */}
          <Button
            variant="danger"
            size="sm"
            onClick={confirmDelete}
            isLoading={isDeleting}
            className="flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      <div className="flex items-center text-gray-600 mb-4">
        <Clock className="w-5 h-5 mr-2" />
        {type.duration} minutes
      </div>

      {type.description && (
        <p className="text-gray-600 text-sm">{type.description}</p>
      )}
    </div>
  );
}
