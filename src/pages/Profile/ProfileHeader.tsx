// File: /src/pages/Profile/ProfileHeader.tsx
import { User } from '../../types';

interface ProfileHeaderProps {
  user: User | null;
  onEditProfile: () => void;
}

export default function ProfileHeader({ user, onEditProfile }: ProfileHeaderProps) {
  if (!user) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-10 text-center text-white">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="mt-2 text-blue-100">You are not logged in.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center md:justify-between">
        {/* Left side: name and email */}
        <div className="mb-4 md:mb-0">
          <h1 className="text-3xl font-bold text-white">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-blue-100 text-sm mt-1">{user.email}</p>
        </div>

        {/* Right side: Edit Profile button */}
        <button
          onClick={onEditProfile}
          className="bg-white text-blue-600 px-5 py-2 rounded-md font-semibold hover:bg-gray-100 transition-colors"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
}
