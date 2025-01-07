// File: /src/pages/Admin/Dashboard/UsersList.tsx

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchUsers, getUsers } from '../../../lib/api';
import type { User } from '../../../types';
import Button from '../../../components/UI/Button';
import UserModal from './UserModal';
import toast from 'react-hot-toast';

interface UsersApiResponse {
  users: User[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    perPage: number;
  };
}

export default function UsersList() {
  // Pagination & search
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  // Debounce the search input
  const [debouncedTerm, setDebouncedTerm] = useState('');

  // Manage our “New User / Edit User” modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedTerm(searchTerm), 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Query the user list (filtered by name/email if `debouncedTerm`)
  const {
    data,
    isLoading,
    error,
    isFetching,
  } = useQuery<UsersApiResponse>({
    queryKey: ['users', page, debouncedTerm],
    queryFn: async () => {
      if (debouncedTerm.trim()) {
        const response = await searchUsers(debouncedTerm.trim(), page, 10);
        return response.data;
      } else {
        const response = await getUsers(page, 10);
        return response.data;
      }
    },
    keepPreviousData: true,
  });

  // If loading or error
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        Failed to load users. Please try again later.
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-12">No user data found.</div>;
  }

  const { users, meta } = data;

  // Handlers
  function openCreateModal() {
    setEditingUser(null);
    setIsModalOpen(true);
  }

  function openEditModal(user: User) {
    setEditingUser(user);
    setIsModalOpen(true);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">All Users</h2>

      {/* SEARCH BAR */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Search by Name or Email
        </label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setPage(1);
            setSearchTerm(e.target.value);
          }}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder='e.g. "Jane", "user@example.com"'
        />
      </div>

      {/* CREATE NEW USER BUTTON */}
      <div className="text-right">
        <Button onClick={openCreateModal} variant="primary">
          + Create New User
        </Button>
      </div>

      {/* USER LIST */}
      <div className="space-y-4">
        {users.map((u) => (
          <div
            key={u.id}
            onClick={() => openEditModal(u)}
            className="border rounded-md p-4 flex items-center justify-between
                       hover:shadow-sm transition-shadow cursor-pointer"
          >
            <div>
              <p className="font-medium text-gray-900">
                {u.firstName} {u.lastName}
                {u.email ? ` (${u.email})` : ''}
              </p>
              <p className="text-sm text-gray-500">Role: {u.role}</p>
              {/* If phone is present */}
              {u.phone && (
                <p className="text-sm text-gray-500">Phone: {u.phone}</p>
              )}
            </div>
            {/* On hover, you could show an arrow or an icon indicating “click to edit” */}
          </div>
        ))}
      </div>

      {/* PAGINATION CONTROLS */}
      <div className="flex justify-center items-center mt-8 space-x-4">
        <Button
          variant="outline"
          onClick={() => setPage((old) => Math.max(old - 1, 1))}
          disabled={meta.currentPage === 1 || isFetching}
        >
          Previous
        </Button>

        <span className="text-gray-600">
          Page {meta.currentPage} of {meta.totalPages}
        </span>

        <Button
          variant="outline"
          onClick={() => {
            if (meta.currentPage < meta.totalPages) {
              setPage((old) => old + 1);
            }
          }}
          disabled={meta.currentPage === meta.totalPages || isFetching}
        >
          Next
        </Button>
      </div>

      {isFetching && (
        <div className="text-center text-sm text-gray-500 mt-2">
          Loading...
        </div>
      )}

      {/* CREATE / EDIT USER MODAL */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        existingUser={editingUser}
      />
    </div>
  );
}
