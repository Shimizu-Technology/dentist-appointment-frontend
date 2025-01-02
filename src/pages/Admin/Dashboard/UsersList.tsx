// /src/pages/Admin/Dashboard/UsersList.tsx
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, promoteUser } from '../../../lib/api';
import Button from '../../../components/UI/Button';

interface User {
  id: number;
  email: string;
  role: 'user' | 'admin';
  firstName: string;
  lastName: string;
  phone?: string;
}

export default function UsersList() {
  const queryClient = useQueryClient();

  // 1) Fetch list of all users (admin-only)
  const { data: users, isLoading, isError } = useQuery<User[]>({
    queryKey: ['all-users'],
    queryFn: async () => {
      const response = await getUsers(); // GET /users
      return response.data; // Return the array of user objects
    }
  });

  // 2) Mutation to promote a user to admin
  const { mutate: handlePromote, isLoading: isPromoting } = useMutation({
    mutationFn: promoteUser, // e.g. promoteUser(userId)
    onSuccess: () => {
      // Re-fetch the list of users to show updated roles
      queryClient.invalidateQueries(['all-users']);
    },
    onError: (error: any) => {
      alert(`Failed to update user role: ${error.message}`);
    }
  });

  // 3) [Optional] If you want to demote an admin back to user, 
  //    you'd need a separate endpoint on the backend like PATCH /users/:id/demote
  //    Then you can do something like handleDemote(user.id).

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-red-500">
        Failed to load users. Please try again.
      </div>
    );
  }

  if (!users || users.length === 0) {
    return <p className="text-gray-500">No users found.</p>;
  }

  return (
    <div className="space-y-6">
      {users.map((user) => (
        <div key={user.id} className="p-4 bg-white shadow rounded flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-800">
              {user.firstName} {user.lastName} ({user.email})
            </p>
            <p className="text-sm text-gray-600">Role: {user.role}</p>
          </div>

          <div>
            {/* If user is already admin, show "Demote" button or similar */}
            {user.role === 'admin' ? (
              <Button variant="outline" size="sm" disabled>
                Admin
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handlePromote(user.id)}
                isLoading={isPromoting}
              >
                Promote to Admin
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
