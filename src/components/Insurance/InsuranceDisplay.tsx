import { Shield, Edit } from 'lucide-react';
import Button from '../UI/Button';

interface InsuranceDisplayProps {
  insuranceInfo?: {
    providerName: string;
    policyNumber: string;
    planType: string;
  };
  onEdit: () => void;
}

export default function InsuranceDisplay({ insuranceInfo, onEdit }: InsuranceDisplayProps) {
  if (!insuranceInfo) {
    return (
      <div className="text-center py-8">
        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">No insurance information provided</p>
        <Button onClick={onEdit}>Add Insurance Information</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Provider</h3>
          <p className="mt-1 text-lg text-gray-900">{insuranceInfo.providerName}</p>
        </div>
        <Button variant="outline" onClick={onEdit} className="flex items-center">
          <Edit className="w-4 h-4 mr-2" />
          Update
        </Button>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-500">Policy Number</h3>
        <p className="mt-1 text-lg text-gray-900">{insuranceInfo.policyNumber}</p>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-500">Plan Type</h3>
        <p className="mt-1 text-lg text-gray-900">{insuranceInfo.planType}</p>
      </div>
    </div>
  );
}