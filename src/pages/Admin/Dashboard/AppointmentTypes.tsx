import { useState } from 'react';
import { Plus } from 'lucide-react';
import Button from '../../../components/UI/Button';
import AppointmentTypeCard from './AppointmentTypeCard';
import AppointmentTypeModal from './AppointmentTypeModal';
import { useQuery } from '@tanstack/react-query';
import { getAppointmentTypes } from '../../../lib/api';
import type { AppointmentType } from '../../../types';

export default function AppointmentTypes() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<AppointmentType | null>(null);

  const { data: appointmentTypes, isLoading } = useQuery<AppointmentType[]>({
    queryKey: ['appointment-types'],
    queryFn: async () => {
      const response = await getAppointmentTypes();
      return response.data;
    }
  });

  const handleEdit = (type: AppointmentType) => {
    setEditingType(type);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingType(null);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Appointment Types</h2>
        <Button onClick={handleAdd} className="flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Add New Type
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appointmentTypes?.map((type) => (
          <AppointmentTypeCard
            key={type.id}
            type={type}
            onEdit={() => handleEdit(type)}
          />
        ))}
      </div>

      <AppointmentTypeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        appointmentType={editingType}
      />
    </div>
  );
}