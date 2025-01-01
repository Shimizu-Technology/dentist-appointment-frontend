import { useState } from 'react';
import { Shield } from 'lucide-react';
import InsuranceCard from '../../components/Insurance/InsuranceCard';

export default function InsuranceInfo() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <Shield className="w-6 h-6 text-blue-600 mr-2" />
        <h2 className="text-2xl font-semibold text-gray-900">Insurance Information</h2>
      </div>
      <InsuranceCard />
    </div>
  );
}