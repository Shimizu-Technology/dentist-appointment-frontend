import { X } from 'lucide-react';
import Button from '../UI/Button';
import InsuranceForm from './InsuranceForm';

interface InsuranceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentInfo?: {
    providerName?: string;
    policyNumber?: string;
    planType?: string;
  };
}

export default function InsuranceModal({ isOpen, onClose, currentInfo }: InsuranceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {currentInfo ? 'Update' : 'Add'} Insurance Information
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <InsuranceForm 
            currentInfo={currentInfo} 
            onSuccess={onClose}
          />
        </div>
      </div>
    </div>
  );
}