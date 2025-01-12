// File: /src/pages/Profile/ChildUserCard.tsx
import { Calendar, Edit2 } from 'lucide-react';
import Button from '../../components/UI/Button';
import { format } from 'date-fns';
import type { User } from '../../types';

interface ChildUserCardProps {
  childUser: User;
  onEdit: () => void;
}

export default function ChildUserCard({ childUser, onEdit }: ChildUserCardProps) {
  const dob = childUser.dateOfBirth;
  let dobString = 'No date of birth set';
  try {
    if (dob) {
      const parsed = new Date(dob);
      dobString = format(parsed, 'MMMM d, yyyy');
    }
  } catch {
    // no-op
  }

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {childUser.firstName} {childUser.lastName}
          </h3>
          {dob && (
            <div className="flex items-center text-gray-500 mt-2">
              <Calendar className="w-4 h-4 mr-2" />
              {dobString}
            </div>
          )}
        </div>
        <Button variant="outline" onClick={onEdit} className="flex items-center">
          <Edit2 className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </div>
    </div>
  );
}
