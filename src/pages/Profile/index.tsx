// File: /src/pages/Profile/index.tsx

import { useState } from 'react';
import Footer from '../../components/Layout/Footer';
import { useAuthStore } from '../../store/authStore';
import EditProfileModal from './EditProfileModal';
import InsuranceCard from '../../components/Insurance/InsuranceCard';
import DependentsList from './DependentsList';

export default function Profile() {
  const { user } = useAuthStore();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  return (
    // Removed "min-h-screen" here; now just "bg-gray-50"
    <div className="bg-gray-50">
      {/* Header / Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center md:justify-between">
          {/* User’s name + email */}
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-white">
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-blue-100">{user?.email}</p>
          </div>

          {/* Edit Profile Button */}
          <button
            onClick={() => setIsEditProfileOpen(true)}
            className="bg-white text-blue-600 px-5 py-2 rounded-md font-semibold hover:bg-gray-100 transition-colors"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Insurance Info */}
          <InsuranceCard />

          {/* Dependents */}
          <DependentsList />
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />
    </div>
  );
}
