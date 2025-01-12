// File: /src/pages/Profile/ChildUsersList.tsx
import { useState, useEffect } from 'react';
import { Users, Plus } from 'lucide-react';
import Button from '../../components/UI/Button';
import ChildUserCard from './ChildUserCard';
import ChildUserModal from './ChildUserModal';
import { useAuthStore } from '../../store/authStore';
import { getMyChildren } from '../../lib/api';  // your new function
import type { User } from '../../types';

export default function ChildUsersList() {
  const { user } = useAuthStore();
  const [childUsers, setChildUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingChild, setEditingChild] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  async function fetchChildUsers() {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await getMyChildren(); 
      setChildUsers(res.data || []);
    } catch (err) {
      console.error('Error fetching child users:', err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchChildUsers();
    // eslint-disable-next-line
  }, [user]);

  function handleAdd() {
    setEditingChild(null);
    setModalOpen(true);
  }
  function handleEdit(child: User) {
    setEditingChild(child);
    setModalOpen(true);
  }
  function closeModalAndRefresh() {
    setModalOpen(false);
    fetchChildUsers();
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center">
          <Users className="w-6 h-6 text-blue-600 mr-2" />
          <h2 className="text-2xl font-semibold text-gray-900">Child Users</h2>
        </div>
        <Button onClick={handleAdd} className="flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Add Child
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : childUsers.length ? (
        <div className="space-y-4">
          {childUsers.map((child) => (
            <ChildUserCard
              key={child.id}
              childUser={child}
              onEdit={() => handleEdit(child)}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No child users added yet.</p>
      )}

      <ChildUserModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        childUser={editingChild}
        onSuccess={closeModalAndRefresh}
      />
    </div>
  );
}
