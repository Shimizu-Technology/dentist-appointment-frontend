// src/pages/Profile/ProfileHeader.tsx
import { UserCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function ProfileHeader() {
  const { user } = useAuthStore();

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4">
          <UserCircle className="w-16 h-16 text-white" />
          <div>
            <h1 className="text-4xl font-bold text-white">
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-xl text-blue-100">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
