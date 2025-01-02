// File: src/pages/Admin/Users/AdminUsers.tsx
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, promoteUser, signup } from '../../../lib/api'; 
import Button from '../../../components/UI/Button';
import Input from '../../../components/UI/Input';

interface AdminUsersProps {}
interface User {
  id: number;
  email: string;
  role: 'user' | 'admin';
  firstName: string;
  lastName: string;
}

export default function AdminUsers(_props: AdminUsersProps) {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await getUsers(); // GET /users
      return res.data as User[];
    },
  });

  const promoteMutation = useMutation({
    mutationFn: (id: number) => promoteUser(id), // PATCH /users/:id/promote
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      alert('User promoted to admin successfully!');
    },
    onError: (err: any) => {
      alert(`Failed to promote user: ${err.message}`);
    },
  });

  // Optional: a quick “Create Admin” form
  const [showCreateAdminForm, setShowCreateAdminForm] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminLastName, setAdminLastName] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const createAdminMutation = useMutation({
    // Reuse the normal "signup" call, but pass { role: 'admin' }
    mutationFn: async () => {
      return signup(adminEmail, adminPassword, adminFirstName, adminLastName, 'admin');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      alert('New admin created successfully!');
      setShowCreateAdminForm(false);
      setAdminEmail('');
      setAdminFirstName('');
      setAdminLastName('');
      setAdminPassword('');
    },
    onError: (err: any) => {
      alert(`Failed to create admin: ${err.message}`);
    },
  });

  if (isLoading) {
    return <div>Loading users...</div>;
  }
  if (error) {
    return <div className="text-red-600">Failed to load users.</div>;
  }

  const users = data || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">All Users</h2>
        <Button onClick={() => setShowCreateAdminForm((prev) => !prev)}>
          {showCreateAdminForm ? 'Cancel' : 'Add Admin User'}
        </Button>
      </div>

      {/* Optional "Create Admin" form */}
      {showCreateAdminForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createAdminMutation.mutate();
          }}
          className="p-4 mb-4 border border-gray-300 rounded-md space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={adminFirstName}
              onChange={(e) => setAdminFirstName(e.target.value)}
            />
            <Input
              label="Last Name"
              value={adminLastName}
              onChange={(e) => setAdminLastName(e.target.value)}
            />
          </div>
          <Input
            label="Email"
            type="email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
          />

          <Button
            type="submit"
            isLoading={createAdminMutation.isLoading}
            disabled={!adminEmail || !adminPassword || !adminFirstName || !adminLastName}
          >
            Create Admin
          </Button>
        </form>
      )}

      {users.length === 0 ? (
        <p className="text-gray-500">No users found.</p>
      ) : (
        <ul className="space-y-2">
          {users.map((u) => (
            <li key={u.id} className="p-4 border border-gray-200 rounded-md flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">
                  {u.firstName} {u.lastName} ({u.email})
                </p>
                <p className="text-sm text-gray-500">Role: {u.role}</p>
              </div>
              {u.role === 'admin' ? (
                <span className="text-green-600 font-semibold">Admin</span>
              ) : (
                <Button
                  onClick={() => promoteMutation.mutate(u.id)}
                  isLoading={promoteMutation.isLoading}
                >
                  Promote to Admin
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
