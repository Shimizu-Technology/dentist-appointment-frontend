// File: /src/pages/Profile/index.tsx

import { useState } from 'react';
import ProfileHeader from './ProfileHeader';
import EditProfileModal from './EditProfileModal';
import InsuranceCard from '../../components/Insurance/InsuranceCard';
// import DependentsList from './DependentsList'; // (REMOVED)
import ChildUsersList from './ChildUsersList';
import { useAuthStore } from '../../store/authStore';

export default function Profile() {
  const { user } = useAuthStore();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  return (
    <div className="bg-gray-50 min-h-screen">
      <ProfileHeader
        user={user}
        onEditProfile={() => setIsEditProfileOpen(true)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <InsuranceCard />
          {/* Now we show our new ChildUsersList */}
          <ChildUsersList />
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />
    </div>
  );
}
