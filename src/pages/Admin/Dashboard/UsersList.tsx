// File: /src/pages/Admin/Dashboard/UsersList.tsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUsers, promoteUser } from '../../../lib/api';
import type { User } from '../../../types';
import Button from '../../../components/UI/Button';

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

  // Query the backend for a single page of users
  const {
    data,
    isLoading,
    error,
    isFetching,
  } = useQuery<UsersApiResponse>({
    queryKey: ['users', page],
    queryFn: async () => {
      const response = await getUsers(page, 10); // 10 per page
      return response.data; // => { users: [...], meta: {...} }
    },
    keepPreviousData: true, // avoid flicker on page transitions
  });

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Failed to load users. Please try again later.
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { users, meta } = data;

  // Handler for “Promote to Admin”
  const handlePromote = async (userId: number) => {
    const yes = window.confirm('Are you sure you want to promote this user to admin?');
    if (!yes) return;
    try {
      await promoteUser(userId);
      // Force a re-fetch to reflect the updated role
      // Option 1: manually update local state
      // Option 2: just re-run the query
    } catch (err: any) {
      alert('Failed to promote user: ' + err.message);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">All Users</h2>

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

      {/* Pagination controls */}
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
