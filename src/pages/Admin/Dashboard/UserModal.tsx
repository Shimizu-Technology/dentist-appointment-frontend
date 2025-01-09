// File: /src/pages/Admin/Dashboard/UserModal.tsx

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createUser, updateUser, deleteUser } from '../../../lib/api'; // removed promoteUser
import { useQueryClient } from '@tanstack/react-query';
import Button from '../../../components/UI/Button';
import Input from '../../../components/UI/Input';
import toast from 'react-hot-toast';
import type { User } from '../../../types';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingUser: User | null;  // if null => creating a new user
  afterSave?: () => void;     // callback after creation / update
}

/**
 * Admin can create or edit a user in this modal.
 * - Moves "Role" to the top, so that the admin chooses it first.
 * - Removes the "Promote to Admin" button in favor of just selecting "Admin" in the Role dropdown.
 */
export default function UserModal({
  isOpen,
  onClose,
  existingUser,
  afterSave,
}: UserModalProps) {
  const queryClient = useQueryClient();

  // Form fields
  const [role,      setRole]      = useState<'user' | 'admin' | 'phone_only'>('user');
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [phone,     setPhone]     = useState('');
  const [email,     setEmail]     = useState('');

  useEffect(() => {
    if (!isOpen) return;

    if (existingUser) {
      // Editing an existing user => populate fields
      setRole(existingUser.role as 'user' | 'admin' | 'phone_only');
      setFirstName(existingUser.firstName);
      setLastName(existingUser.lastName);
      setPhone(existingUser.phone || '');
      setEmail(existingUser.email || '');
    } else {
      // Creating new => blank fields
      setRole('user');
      setFirstName('');
      setLastName('');
      setPhone('');
      setEmail('');
    }
  }, [isOpen, existingUser]);

  const isEditing = !!existingUser;

  async function handleSave() {
    // Validate form
    if (!role) {
      toast.error('Role is required.');
      return;
    }
    if (!firstName.trim()) {
      toast.error('First name is required.');
      return;
    }
    if (!lastName.trim()) {
      toast.error('Last name is required.');
      return;
    }
    if (!phone.trim()) {
      toast.error('Phone number is required.');
      return;
    }
    if (!email.trim()) {
      toast.error('Email is required.');
      return;
    }

    try {
      if (isEditing && existingUser) {
        // Update existing user
        await updateUser(existingUser.id, {
          role,
          firstName,
          lastName,
          phone,
          email: email.trim(),
        });
        toast.success('User updated!');
      } else {
        // Create new user (invitation-based if email is provided)
        await createUser({
          role,
          firstName,
          lastName,
          phone,
          email: email.trim(),
        });
        toast.success('User created!');
      }

      // Refresh the users list
      queryClient.invalidateQueries(['users']);
      afterSave?.();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.errors?.join(', ') || err.message;
      toast.error(`Failed to save user: ${msg}`);
    }
  }

  async function handleDelete() {
    if (!existingUser) return;
    const yes = window.confirm('Are you sure you want to delete this user?');
    if (!yes) return;

    try {
      await deleteUser(existingUser.id);
      toast.success('User deleted!');
      queryClient.invalidateQueries(['users']);
      afterSave?.();
      onClose();
    } catch (err: any) {
      toast.error(`Failed to delete user: ${err.message}`);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-lg rounded-md shadow-md">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">
            {isEditing ? 'Edit User' : 'Create New User'}
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {/* Body: form fields */}
        <div className="p-4 space-y-4">
          {/* Role at the top */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              className="border w-full rounded-md px-3 py-2"
              value={role}
              onChange={(e) => setRole(e.target.value as 'user' | 'admin' | 'phone_only')}
            >
              <option value="user">Regular User</option>
              <option value="admin">Admin</option>
              <option value="phone_only">Phone-Only</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <Input
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <Input
            label="Phone (required)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Footer: action buttons */}
        <div className="flex justify-end items-center space-x-4 p-4 border-t">
          {/* If editing, show Delete */}
          {isEditing && (
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          )}

          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          <Button variant="primary" onClick={handleSave}>
            {isEditing ? 'Save Changes' : 'Create User'}
          </Button>
        </div>
      </div>
    </div>
  );
}
