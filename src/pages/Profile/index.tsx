// File: /src/pages/Profile/index.tsx

import { useEffect, useState } from 'react';
import ProfileHeader from './ProfileHeader';
import EditProfileModal from './EditProfileModal';
import InsuranceCard from '../../components/Insurance/InsuranceCard';
import ChildUsersList from './ChildUsersList';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, isAuthenticated, refreshCurrentUser } = useAuthStore();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If not logged in, redirect to /login (or wherever you want)
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Force a fresh fetch from server so we get updated DOB, etc.
    console.log('[Profile] useEffect => calling refreshCurrentUser()');
    refreshCurrentUser();
  }, [isAuthenticated, refreshCurrentUser, navigate]);

  if (!user) {
    // Optional: show a loader or a message
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <p>Loading user profile...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <ProfileHeader
        user={user}
        onEditProfile={() => setIsEditProfileOpen(true)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <InsuranceCard />
          <ChildUsersList />
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
