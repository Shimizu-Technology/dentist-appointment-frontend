// File: /src/pages/Admin/Dashboard/UsersList.tsx

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUsers, promoteUser, searchUsers } from '../../../lib/api';
import Button from '../../../components/UI/Button';
import type { User } from '../../../types';

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

  // `searchTerm` holds the immediate user input
  const [searchTerm, setSearchTerm] = useState('');

  // `debouncedTerm` changes only after a timeout
  const [debouncedTerm, setDebouncedTerm] = useState('');

  // Whenever `searchTerm` changes, schedule an update to `debouncedTerm`
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 500); // 500ms delay (you can adjust as needed)

    // Cleanup if user types again before 500ms is up
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Use `debouncedTerm` in the query key & logic
  const { data, isLoading, error, isFetching } = useQuery<UsersApiResponse>({
    queryKey: ['users', page, debouncedTerm],
    queryFn: async () => {
      const query = debouncedTerm.trim();
      if (query.length > 0) {
        const response = await searchUsers(query, page, 10);
        return response.data;
      } else {
        const response = await getUsers(page, 10);
        return response.data;
      }
    },
    keepPreviousData: true, // Keep old data while fetching next page
  });

  async function handlePromote(userId: number) {
    const yes = window.confirm('Are you sure you want to promote this user to admin?');
    if (!yes) return;

    try {
      await promoteUser(userId);
      // Optionally trigger a refetch or rely on the existing data refresh
    } catch (err: any) {
      alert(`Failed to promote user: ${err.message}`);
    }
  }

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
            setPage(1); // Reset to first page when user starts typing
            setSearchTerm(e.target.value);
          }}
          className="w-full border border-gray-300 rounded-md px-3 py-2
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          placeholder='e.g. "Jane", "user@example.com"'
        />
      </div>

      {/* LIST OF USERS */}
      <div className="space-y-4">
        {users.map((u) => (
          <div
            key={u.id}
            className="border rounded-md p-4 flex items-center justify-between"
          >
            <div>
              <p className="font-medium text-gray-900">
                {u.firstName} {u.lastName} ({u.email})
              </p>
              <p className="text-sm text-gray-500">Role: {u.role}</p>
            </div>

            {u.role === 'admin' ? (
              <span className="text-blue-600 font-semibold">Admin</span>
            ) : (
              <Button
                onClick={() => handlePromote(u.id)}
                variant="outline"
                size="sm"
              >
                Promote to Admin
              </Button>
            )}
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
    </div>
  );
}
