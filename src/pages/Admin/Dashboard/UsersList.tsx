// File: /src/pages/Admin/Dashboard/UsersList.tsx

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchUsers, getUsers } from '../../../lib/api';
import PaginationControls from '../../../components/UI/PaginationControls';
import Button from '../../../components/UI/Button';
import UserModal from './UserModal';
import type { User } from '../../../types';
import toast from 'react-hot-toast';

interface PaginatedUsers {
  users: User[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    perPage: number;
  };
}

export default function UsersList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [page, setPage] = useState(1);

  // For UserModal
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Debounce the search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedTerm(searchTerm.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Query => load users (paginated)
  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery<PaginatedUsers>({
    queryKey: ['admin-users', debouncedTerm, page],
    queryFn: async () => {
      if (debouncedTerm) {
        const res = await searchUsers(debouncedTerm, page, 10);
        return res.data; // { users, meta }
      } else {
        const res = await getUsers(page, 10);
        return res.data; // { users, meta }
      }
    },
    keepPreviousData: true,
  });

  const users = data?.users || [];
  const meta = data?.meta;

  function handleClearSearch() {
    setSearchTerm('');
    setDebouncedTerm('');
    setPage(1);
  }

  function handleCreateUser() {
    setEditingUser(null);
    setUserModalOpen(true);
  }

  function handleEditUser(u: User) {
    setEditingUser(u);
    setUserModalOpen(true);
  }

  // A helper for color-coded role badges:
  function roleBadgeClass(role: string) {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'user':
        return 'bg-green-100 text-green-800';
      case 'phone_only':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">All Users</h1>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Search</label>
          <input
            type="text"
            className="border rounded px-2 py-1"
            placeholder="Name or Email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Button variant="outline" onClick={handleClearSearch} className="mt-5">
          Clear Search
        </Button>

        <div className="flex-1" />

        <Button variant="primary" onClick={handleCreateUser} className="mt-5">
          + Create New User
        </Button>
      </div>

      {isLoading ? (
        <p>Loading users...</p>
      ) : isError ? (
        <p className="text-red-600">Error loading users: {String(error)}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {users.map((u) => (
            <div
              key={u.id}
              className="p-4 bg-white rounded shadow hover:shadow-md cursor-pointer"
              onClick={() => handleEditUser(u)}
            >
              <h2 className="font-semibold text-lg">
                {u.firstName} {u.lastName}
              </h2>
              {u.email && <p className="text-gray-600 text-sm">{u.email}</p>}
              {u.phone && <p className="text-sm text-gray-500">{u.phone}</p>}

              {/* role badge */}
              <span
                className={`inline-block mt-2 px-2 py-1 text-xs font-semibold rounded-full ${roleBadgeClass(u.role)}`}
              >
                {u.role}
              </span>
            </div>
          ))}
        </div>
      )}

      {meta && (
        <PaginationControls
          currentPage={meta.currentPage}
          totalPages={meta.totalPages}
          onPageChange={setPage}
          showGoTo
          smooth
        />
      )}

      {isFetching && <p className="text-sm text-gray-500">Updating...</p>}

      {/* USER MODAL */}
      {userModalOpen && (
        <UserModal
          isOpen={userModalOpen}
          onClose={() => setUserModalOpen(false)}
          existingUser={editingUser}
          afterSave={() => {
            // do nothing or refetch
          }}
        />
      )}
    </div>
  );
}
