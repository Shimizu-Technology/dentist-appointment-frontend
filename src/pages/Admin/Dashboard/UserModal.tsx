// File: /src/pages/Admin/Dashboard/UserModal.tsx
import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import {
  createUser,
  updateUser,
  deleteUser,
} from '../../../lib/api';
import { useQueryClient } from '@tanstack/react-query';
import Button from '../../../components/UI/Button';
import Input from '../../../components/UI/Input';
import toast from 'react-hot-toast';
import type { User } from '../../../types';
import ParentSelectModal from './ParentSelectModal';
import UserDependentsModal from './UserDependentsModal';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingUser: User | null;
  afterSave?: () => void;
}

export default function UserModal({
  isOpen,
  onClose,
  existingUser,
  afterSave,
}: UserModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!existingUser;

  const [role, setRole] = useState<'user' | 'admin' | 'phone_only'>('user');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // “Dependent” logic for a brand-new user
  const [isDependent, setIsDependent] = useState(false);
  const [parentUserId, setParentUserId] = useState<number | null>(null);
  const [parentSelectOpen, setParentSelectOpen] = useState(false);

  // Manage Dependents button if editing
  const [dependentsModalOpen, setDependentsModalOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (existingUser) {
      // Editing existing user
      setRole(existingUser.role);
      setFirstName(existingUser.firstName);
      setLastName(existingUser.lastName);
      setPhone(existingUser.phone || ''); // if their phone is blank, it remains blank
      setEmail(existingUser.email || '');
      setIsDependent(false);
      setParentUserId(null);
    } else {
      // Creating new user
      setRole('user');
      setFirstName('');
      setLastName('');
      setPhone('+1671'); // Default to +1671 if creating new user
      setEmail('');
      setIsDependent(false);
      setParentUserId(null);
    }
  }, [isOpen, existingUser]);

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
      toast.error('Phone is required.');
      return;
    }
    if (!isDependent && role !== 'phone_only' && !email.trim()) {
      toast.error('Email is required for non-phone_only users.');
      return;
    }

    try {
      if (isEditing && existingUser) {
        // Update existing
        await updateUser(existingUser.id, {
          role,
          firstName,
          lastName,
          phone,
          email: role !== 'phone_only' ? email.trim() : '',
        });
        toast.success('User updated!');
      } else {
        // Create new user
        if (isDependent) {
          if (!parentUserId) {
            toast.error('Please select a parent user for this dependent.');
            return;
          }
          await createUser({
            role: 'phone_only',
            firstName,
            lastName,
            phone,
            email: '',
            is_dependent: true,
            parent_user_id: parentUserId,
          });
          toast.success('Dependent (child user) created!');
        } else {
          await createUser({
            role,
            firstName,
            lastName,
            phone,
            email: role !== 'phone_only' ? email.trim() : '',
          });
          toast.success('User created!');
        }
      }

      queryClient.invalidateQueries(['admin-users']);
      queryClient.invalidateQueries(['users']);
      onClose();
      afterSave?.();
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
      queryClient.invalidateQueries(['admin-users']);
      onClose();
      afterSave?.();
    } catch (err: any) {
      toast.error(`Failed to delete user: ${err.message}`);
    }
  }

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Overlay */}
        <Transition.Child as={Fragment}>
          <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        </Transition.Child>

        {/* Panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child as={Fragment}>
            <Dialog.Panel className="mx-auto w-full max-w-lg rounded-md bg-white shadow-lg">
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b">
                <Dialog.Title className="text-xl font-semibold">
                  {isEditing ? 'Edit User' : 'Create New User'}
                </Dialog.Title>
                <button onClick={onClose}>
                  <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 space-y-4">
                {isEditing && (
                  <div className="text-right">
                    <Button
                      variant="outline"
                      onClick={() => setDependentsModalOpen(true)}
                    >
                      Manage Dependents
                    </Button>
                  </div>
                )}

                {!isEditing && (
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={isDependent}
                      onChange={(e) => {
                        setIsDependent(e.target.checked);
                        if (!e.target.checked) setParentUserId(null);
                      }}
                    />
                    <span className="text-sm">Is this a Dependent?</span>
                  </label>
                )}

                {!isDependent && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Role <span className="text-red-500">*</span>
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
                )}

                <div className="grid grid-cols-2 gap-4">
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

                {!isDependent && role !== 'phone_only' && (
                  <Input
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                )}

                {isDependent && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">Select Parent User</p>
                    <Button
                      variant="outline"
                      onClick={() => setParentSelectOpen(true)}
                    >
                      {parentUserId
                        ? `Parent User ID: ${parentUserId}`
                        : 'Select Parent'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end space-x-4 p-4 border-t">
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

              {/* ParentSelectModal */}
              {parentSelectOpen && (
                <ParentSelectModal
                  isOpen={parentSelectOpen}
                  onClose={() => setParentSelectOpen(false)}
                  onSelectParent={(pid) => {
                    setParentUserId(pid);
                    setParentSelectOpen(false);
                  }}
                />
              )}

              {/* Manage Dependents */}
              {dependentsModalOpen && existingUser && (
                <UserDependentsModal
                  isOpen={dependentsModalOpen}
                  onClose={() => setDependentsModalOpen(false)}
                  userId={existingUser.id}
                />
              )}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
