import { Clock, Edit } from 'lucide-react';
import Button from '../../../components/UI/Button';
import type { AppointmentType } from '../../../types';

interface AppointmentTypeCardProps {
  type: AppointmentType;
  onEdit: () => void;
}

export default function AppointmentTypeCard({ type, onEdit }: AppointmentTypeCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{type.name}</h3>
        <Button
          variant="outline"
          onClick={onEdit}
          className="flex items-center text-sm"
        >
          <Edit className="w-4 h-4 mr-1" />
          Edit
        </Button>
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