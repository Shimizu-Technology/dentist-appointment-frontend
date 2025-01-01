import { format } from 'date-fns';
import { Edit2, Calendar } from 'lucide-react';
import Button from '../../components/UI/Button';
import type { Dependent } from '../../types';

interface DependentCardProps {
  dependent: Dependent;
  onEdit: () => void;
}

export default function DependentCard({ dependent, onEdit }: DependentCardProps) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {dependent.firstName} {dependent.lastName}
          </h3>
          <div className="flex items-center text-gray-500 mt-2">
            <Calendar className="w-4 h-4 mr-2" />
            {format(new Date(dependent.dateOfBirth), 'MMMM d, yyyy')}
          </div>
        </div>
        <Button variant="outline" onClick={onEdit} className="flex items-center">
          <Edit2 className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </div>
    </div>
  );
}