// File: /src/pages/Admin/Dashboard/DentistsList.tsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDentists } from '../../../lib/api';
import Button from '../../../components/UI/Button';
import DentistCard from './DentistCard';
import DentistModal from './DentistModal';
import type { Dentist } from '../../../types';

export default function DentistsList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDentist, setEditingDentist] = useState<Dentist | null>(null);

  // Fetch all dentists
  const { data, isLoading, error } = useQuery<Dentist[]>({
    queryKey: ['all-dentists'],
    queryFn: async () => {
      const res = await getDentists();
      return res.data;
    },
  });

  const handleAdd = () => {
    setEditingDentist(null);
    setIsModalOpen(true);
  };

  const handleEdit = (dentist: Dentist) => {
    setEditingDentist(dentist);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Dentists</h2>
        <Button onClick={handleAdd} className="flex items-center">
          + Add Dentist
        </Button>
      </div>

      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      )}
      {error && (
        <div className="text-center py-12 text-red-600">
          Failed to load dentists. Please try again later.
        </div>
      )}

      {data && data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((dentist) => (
            <DentistCard
              key={dentist.id}
              dentist={dentist}
              onEdit={() => handleEdit(dentist)}
            />
          ))}
        </div>
      ) : (
        !isLoading && data?.length === 0 && (
          <p className="text-gray-500">No dentists found.</p>
        )
      )}

      {/* The modal for creating/updating a dentist */}
      <DentistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dentist={editingDentist}  // if null => creating new
      />
    </div>
  );
}
