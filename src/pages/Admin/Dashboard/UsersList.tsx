// File: /src/pages/Admin/Dashboard/UsersList.tsx

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUsers, searchUsers } from '../../../lib/api';
import type { User } from '../../../types';
import Button from '../../../components/UI/Button';
import UserModal from './UserModal';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [page, setPage] = useState(1);

  // Searching
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');

  // Whenever searchTerm changes, wait 500ms before committing to debouncedTerm
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm.trim());
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // For opening our new user modal (create vs. edit)
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null); // null => create

  // Query
  const { data, isLoading, error, isFetching } = useQuery<UsersApiResponse>({
    queryKey: ['users', page, debouncedTerm],
    queryFn: async () => {
      if (debouncedTerm.length > 0) {
        const response = await searchUsers(debouncedTerm, page, 10);
        return response.data;
      } else {
        const response = await getUsers(page, 10);
        return response.data;
      }
    },
    keepPreviousData: true,
  });

  const handleOpenCreate = () => {
    setEditingUser(null);   // create mode
    setShowModal(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setShowModal(true);
  };

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
    return null;
  }

  const { users, meta } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
        <h2 className="text-2xl font-semibold text-gray-900">All Users</h2>

        {/* The new "Create User" button */}
        <Button variant="primary" onClick={handleOpenCreate}>
          + Create New User
        </Button>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-md shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Search by Name or Email
        </label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder='e.g. "Jane", "user@example.com"'
          value={searchTerm}
          onChange={(e) => {
            setPage(1);
            setSearchTerm(e.target.value);
          }}
        />
      </div>

      {/* LIST OF USERS */}
      <div className="space-y-4">
        {users.map((u) => (
          <div
            key={u.id}
            onClick={() => handleOpenEdit(u)}
            className="bg-white p-4 rounded-md shadow flex items-center justify-between 
                       hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div>
              <p className="font-medium text-gray-900">
                {u.firstName} {u.lastName} ({u.email})
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Role: {u.role}
              </p>
            </div>
            <span className="text-sm text-blue-500 font-medium">
              Edit &raquo;
            </span>
          </div>
        ))}
        {users.length === 0 && (
          <p className="text-gray-500 text-center py-4">
            No matching users found.
          </p>
        )}
      </div>

      {/* PAGINATION */}
      {meta.totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 space-x-4">
          <Button
            variant="outline"
            onClick={() => setPage((old) => Math.max(old - 1, 1))}
            disabled={meta.currentPage === 1 || isFetching}
            className="flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
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
            className="flex items-center"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {isFetching && (
        <div className="text-center text-sm text-gray-500 mt-2">
          Loading...
        </div>
      )}

      {/* The new "UserModal" for create/edit */}
      <UserModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        user={editingUser}
      />
    </div>
  );
}
