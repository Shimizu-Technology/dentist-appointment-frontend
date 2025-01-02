// src/pages/Profile/index.tsx
import { useState } from 'react';
import ProfileHeader from './ProfileHeader';
import InsuranceInfo from './InsuranceInfo';
import DependentsList from './DependentsList';
import Footer from '../../components/Layout/Footer';
import EditProfileModal from './EditProfileModal';

export default function Profile() {
  // State to open/close the modal
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileHeader />

      {/* Optional: place this button wherever you like */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="flex justify-end">
          <button
            onClick={() => setIsEditProfileOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Edit Profile
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <InsuranceInfo />
          <DependentsList />
        </div>
      </div>

      <Footer />

      {/* The modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />
    </div>
  );
}
