import { useState } from 'react';
import { Shield } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import InsuranceDisplay from './InsuranceDisplay';
import InsuranceModal from './InsuranceModal';

export default function InsuranceCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuthStore();
  const { insuranceInfo } = user || {};

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <Shield className="w-6 h-6 text-blue-600 mr-2" />
        <h2 className="text-2xl font-semibold text-gray-900">Insurance Information</h2>
      </div>

      <InsuranceDisplay
        insuranceInfo={insuranceInfo}
        onEdit={() => setIsModalOpen(true)}
      />

      <InsuranceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentInfo={insuranceInfo}
      />
    </div>
  );
}