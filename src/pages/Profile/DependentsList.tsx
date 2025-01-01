import { useState } from 'react';
import { Users, Plus } from 'lucide-react';
import Button from '../../components/UI/Button';
import DependentCard from './DependentCard';
import DependentModal from './DependentModal';
import { useQuery } from '@tanstack/react-query';
import { getDependents } from '../../lib/api';
import type { Dependent } from '../../types';

export default function DependentsList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDependent, setEditingDependent] = useState<Dependent | null>(null);

  const { data: dependents, isLoading } = useQuery<Dependent[]>({
    queryKey: ['dependents'],
    queryFn: async () => {
      const response = await getDependents();
      return response.data;
    }
  });

  const handleAdd = () => {
    setEditingDependent(null);
    setIsModalOpen(true);
  };

  const handleEdit = (dependent: Dependent) => {
    setEditingDependent(dependent);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center">
          <Users className="w-6 h-6 text-blue-600 mr-2" />
          <h2 className="text-2xl font-semibold text-gray-900">Dependents</h2>
        </div>
        <Button onClick={handleAdd} className="flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Add Dependent
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : dependents?.length ? (
        <div className="space-y-4">
          {dependents.map((dependent) => (
            <DependentCard
              key={dependent.id}
              dependent={dependent}
              onEdit={() => handleEdit(dependent)}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No dependents added yet</p>
      )}

      <DependentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dependent={editingDependent}
      />
    </div>
  );
}