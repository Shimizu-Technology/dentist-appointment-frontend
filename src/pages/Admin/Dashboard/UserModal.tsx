// File: /src/pages/Admin/Dashboard/UserModal.tsx

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createUser, updateUser, deleteUser } from '../../../lib/api';
import { useQueryClient } from '@tanstack/react-query';
import Button from '../../../components/UI/Button';
import Input from '../../../components/UI/Input';
import toast from 'react-hot-toast';
import type { User } from '../../../types';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingUser: User | null;  // if null => creating a new user
}

/**
 * Admin can create or update a user. 
 * Password is *not* set by the admin. Instead, the user will get an invitation link.
 * 
 * - phone is required for all roles
 * - email is optional if phone_only
 * - if role != phone_only, email *should* be provided (they’ll get an invite)
 */
export default function UserModal({ isOpen, onClose, existingUser }: UserModalProps) {
  const queryClient = useQueryClient();

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [phone,     setPhone]     = useState('');
  const [email,     setEmail]     = useState('');
  const [role,      setRole]      = useState<'user' | 'admin' | 'phone_only'>('user');

  // On open, fill from existing user if editing
  useEffect(() => {
    if (!isOpen) return;

    if (existingUser) {
      // Editing
      setFirstName(existingUser.firstName);
      setLastName(existingUser.lastName);
      setPhone(existingUser.phone || '');
      setEmail(existingUser.email || '');
      setRole(existingUser.role);
    } else {
      // Creating new => blank out
      setFirstName('');
      setLastName('');
      setPhone('');
      setEmail('');
      setRole('user');
    }
  }, [isOpen, existingUser]);

  // For dynamic form: 
  // phone is always required  
  // if role === 'phone_only', email is optional
  // if role !== 'phone_only', we do strongly encourage an email

  async function handleSave() {
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

    // If user is NOT phone_only but no email given, we can either allow or fail.
    // Typically we want them to have an email so they can be invited to set password.
    if (role !== 'phone_only' && !email.trim()) {
      toast.error('Email is required unless user is phone_only.');
      return;
    }

    try {
      if (existingUser) {
        // Update existing
        await updateUser(existingUser.id, {
          firstName,
          lastName,
          phone,
          email: email.trim() || undefined,
          role,
        });
        toast.success('User updated!');
      } else {
        // Create new
        await createUser({
          firstName,
          lastName,
          phone,
          email: email.trim() || undefined,
          // NO password => back end sends invite link 
          role,
        });
        toast.success('User created! (Invitation email sent if email was provided.)');
      }
      queryClient.invalidateQueries(['users']);
      onClose();
    } catch (err: any) {
      toast.error(`Failed to save user: ${err.message}`);
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
      onClose();
    } catch (err: any) {
      toast.error(`Failed to delete user: ${err.message}`);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-lg rounded-md shadow-md">
        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">
            {existingUser ? 'Edit User' : 'Create New User'}
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-4 space-y-4">
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

          {/** If role != phone_only, we want to encourage an email. */}
          {role !== 'phone_only' && (
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="(required for normal or admin users)"
            />
          )}

          {/** If role == phone_only, we hide the email field. 
               But we also want an option to see the difference in the UI. */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              className="border w-full rounded-md px-3 py-2"
              value={role}
              onChange={(e) =>
                setRole(e.target.value as 'user' | 'admin' | 'phone_only')
              }
            >
              <option value="user">Regular User</option>
              <option value="admin">Admin</option>
              <option value="phone_only">Phone-Only</option>
            </select>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex justify-end items-center space-x-4 p-4 border-t">
          {existingUser && (
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {existingUser ? 'Save Changes' : 'Create User'}
          </Button>
        </div>
      </div>
    </div>
  );
}
