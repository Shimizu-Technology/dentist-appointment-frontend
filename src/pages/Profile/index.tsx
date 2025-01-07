// File: /src/pages/Profile/index.tsx

import { useState } from 'react';
import ProfileHeader from './ProfileHeader';
import EditProfileModal from './EditProfileModal';
import InsuranceCard from '../../components/Insurance/InsuranceCard';
import DependentsList from './DependentsList';
import { useAuthStore } from '../../store/authStore';

/**
 * The main "My Profile" page, reorganized for a cleaner flow.
 */
export default function Profile() {
  const { user } = useAuthStore();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* 1) Header at the top */}
      <ProfileHeader
        user={user}
        onEditProfile={() => setIsEditProfileOpen(true)}
      />

      {/* 2) Main content area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Two columns: Insurance on the left, Dependents on the right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <InsuranceCard />
          <DependentsList />
        </div>
      </div>

      {/* Edit Profile modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />
    </div>
  );
}
