// File: /src/pages/Admin/Dashboard/UsersList.tsx

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchUsers, getUsers } from '../../../lib/api';
import type { User } from '../../../types';
import Button from '../../../components/UI/Button';
import UserModal from './UserModal';
import PaginationControls from '../../../components/UI/PaginationControls'; // <-- NEW
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
  const [page, setPage] = useState(1);

  // Search
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Search input focus
  const searchRef = useRef<HTMLInputElement>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(true);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPage(1);
    setSearchTerm(e.target.value);
    setIsSearchFocused(true);
  };
  const handleSearchFocus = () => setIsSearchFocused(true);
  const handleSearchBlur = () => setIsSearchFocused(false);

  useEffect(() => {
    if (isSearchFocused) {
      searchRef.current?.focus();
    }
  }, [isSearchFocused]);

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedTerm(searchTerm), 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const { data, isLoading, error, isFetching, refetch } = useQuery<UsersApiResponse>({
    queryKey: ['users', page, debouncedTerm],
    queryFn: async () => {
      if (debouncedTerm.trim()) {
        const response = await searchUsers(debouncedTerm.toLowerCase(), page, 10);
        return response.data;
      } else {
        const response = await getUsers(page, 10);
        return response.data;
      }
    },
    keepPreviousData: true,
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full mx-auto"></div>
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

  function openCreateModal() {
    setEditingUser(null);
    setIsModalOpen(true);
  }
  function openEditModal(u: User) {
    setEditingUser(u);
    setIsModalOpen(true);
  }

  function handleClearSearch() {
    setSearchTerm('');
    setDebouncedTerm('');
    setPage(1);
    setIsSearchFocused(true);
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
          ref={searchRef}
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g. 'Jane', 'user@example.com'"
        />

        <div className="mt-2">
          <Button variant="outline" onClick={handleClearSearch}>
            Clear Search
          </Button>
        </div>
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
            className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {u.firstName} {u.lastName}
              </h3>
              <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                {u.role}
              </span>
            </div>
            {u.email && <p className="text-gray-600 text-sm mb-1">{u.email}</p>}
            {u.phone && <p className="text-gray-500 text-sm mb-1">{u.phone}</p>}
          </div>
        ))}
      </div>

      {/* PAGINATION CONTROLS */}
      <PaginationControls
        currentPage={meta.currentPage}
        totalPages={meta.totalPages}
        onPageChange={setPage}
        showGoTo
        smooth
      />

      {isFetching && (
        <div className="text-center text-sm text-gray-500 mt-2">
          Loading...
        </div>
      )}

      {/* CREATE/EDIT USER MODAL */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        existingUser={editingUser}
        afterSave={() => refetch()}
      />
    </div>
  );
}
