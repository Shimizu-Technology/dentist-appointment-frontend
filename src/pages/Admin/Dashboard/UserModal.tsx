// File: /src/pages/Admin/Dashboard/UserModal.tsx

import { Fragment, useState, useEffect, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import {
  createUser,
  updateUser,
  deleteUser,
  getUser, // must return { user: {...} } from the backend
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
  const isEditing   = !!existingUser;
  const hasInit     = useRef(false);

  // Basic fields
  const [role,      setRole]      = useState<'user' | 'admin' | 'phone_only'>('user');
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [phone,     setPhone]     = useState('');
  const [email,     setEmail]     = useState('');

  // Dependent logic
  const [isDependent,       setIsDependent]       = useState(false);
  const [parentUserId,      setParentUserId]      = useState<number | null>(null);
  const [parentInfo,        setParentInfo]        = useState<User | null>(null);
  const [parentSelectOpen,  setParentSelectOpen]  = useState(false);

  // Manage Dependents (if editing user who is NOT a dependent)
  const [dependentsModalOpen, setDependentsModalOpen] = useState(false);

  // Initialize fields once per open
  useEffect(() => {
    if (!isOpen) {
      hasInit.current = false;
      return;
    }
    if (isOpen && !hasInit.current) {
      hasInit.current = true;

      if (existingUser) {
        // Editing existing user
        setRole(existingUser.role);
        setFirstName(existingUser.firstName);
        setLastName(existingUser.lastName);
        setPhone(existingUser.phone || '');
        setEmail(existingUser.email || '');
        setIsDependent(!!existingUser.isDependent);

        setParentUserId(existingUser.parentUserId || null);
        setParentInfo(null);
      } else {
        // Creating new
        setRole('user');
        setFirstName('');
        setLastName('');
        setPhone('+1671'); // default prefix for normal new user
        setEmail('');
        setIsDependent(false);

        setParentUserId(null);
        setParentInfo(null);
      }
    }
  }, [isOpen, existingUser]);

  // If editing a dependent with a parent, fetch parent's details
  useEffect(() => {
    async function fetchParent() {
      if (isEditing && isDependent && parentUserId) {
        try {
          const res = await getUser(parentUserId);
          // IMPORTANT: the backend returns { user: {...} },
          // so we must grab `res.data.user`
          const parent = res.data.user;
          setParentInfo(parent);
        } catch (err: any) {
          console.error('[UserModal] Could not fetch parent info =>', err);
          setParentInfo(null);
        }
      } else {
        setParentInfo(null);
      }
    }
    fetchParent();
  }, [isEditing, isDependent, parentUserId]);

  // Called by <ParentSelectModal> after picking a parent
  function handleSelectParent(parent: User) {
    setParentUserId(parent.id);
    setParentInfo(parent);
    setParentSelectOpen(false);
  }

  // Create or update
  async function handleSave() {
    if (!firstName.trim()) {
      toast.error('First name is required.');
      return;
    }
    if (!lastName.trim()) {
      toast.error('Last name is required.');
      return;
    }

    if (isDependent) {
      if (!parentUserId) {
        toast.error('Please select a parent user for this dependent.');
        return;
      }
    } else {
      // Normal user => phone required, maybe email
      if (!phone.trim()) {
        toast.error('Phone is required for a non-dependent user.');
        return;
      }
      if (role !== 'phone_only' && !email.trim()) {
        toast.error('Email is required for non-phone_only users.');
        return;
      }
    }

    try {
      if (isEditing && existingUser) {
        // Updating existing
        const newPhone = isDependent ? '' : phone;
        const newEmail = isDependent ? '' : email.trim();

        await updateUser(existingUser.id, {
          role,
          firstName,
          lastName,
          phone: newPhone,
          email: newEmail,
          is_dependent: isDependent,
          parent_user_id: isDependent ? parentUserId : null,
        });
        toast.success('User updated!');
      } else {
        // Creating new
        if (isDependent) {
          await createUser({
            role: 'phone_only',
            firstName,
            lastName,
            phone: '',  // no phone for child
            email: '',  // no email for child
            is_dependent: true,
            parent_user_id: parentUserId!,
          });
          toast.success('Dependent created!');
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

      // Done => close & refresh
      queryClient.invalidateQueries(['admin-users']);
      queryClient.invalidateQueries(['users']);
      onClose();
      afterSave?.();
    } catch (err: any) {
      console.error('[UserModal] handleSave() => error:', err);
      const msg = err?.response?.data?.errors?.join(', ') || err.message;
      toast.error(`Failed to save user: ${msg}`);
    }
  }

  // Delete user
  async function handleDelete() {
    if (!existingUser) return;
    const yes = window.confirm('Are you sure you want to delete this user?');
    if (!yes) return;

    try {
      await deleteUser(existingUser.id);
      toast.success('User deleted!');
      queryClient.invalidateQueries(['admin-users']);
      queryClient.invalidateQueries(['users']);
      onClose();
      afterSave?.();
    } catch (err: any) {
      console.error('[UserModal] Delete user error =>', err);
      toast.error(`Failed to delete user: ${err.message}`);
    }
  }

  // Show "Manage Dependents" only if editing an existing user who is NOT a dependent
  const canManageDependents = isEditing && !isDependent;

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment}>
          <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        </Transition.Child>

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
              <div className="p-4 space-y-6">
                {canManageDependents && (
                  <div className="text-right">
                    <Button
                      variant="outline"
                      onClick={() => setDependentsModalOpen(true)}
                    >
                      Manage Dependents
                    </Button>
                  </div>
                )}

                {/* If brand-new => "Is this a Dependent?" */}
                {!isEditing && (
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={isDependent}
                      onChange={(e) => {
                        setIsDependent(e.target.checked);
                        if (!e.target.checked) {
                          setParentUserId(null);
                          setParentInfo(null);
                        }
                      }}
                    />
                    <span className="text-sm">Is this a Dependent?</span>
                  </label>
                )}

                {/* If not dependent => show Role dropdown (only if brand-new user) */}
                {!isDependent && !isEditing && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
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
                )}

                {/* First & Last names */}
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

                {/* Normal user => phone & maybe email */}
                {!isDependent && (
                  <>
                    <Input
                      label="Phone (required)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                    {role !== 'phone_only' && (
                      <Input
                        label="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    )}
                  </>
                )}

                {/* Dependent => show parent's info */}
                {isDependent && (
                  <div className="space-y-2">
                    {/* If brand-new dependent => "Select Parent" button if none selected */}
                    {!isEditing && !parentUserId && (
                      <Button
                        variant="outline"
                        onClick={() => setParentSelectOpen(true)}
                      >
                        Select Parent
                      </Button>
                    )}

                    {/* Show parent's info if we have parentUserId or parentInfo */}
                    <div className="p-3 border border-gray-200 rounded-md bg-gray-50 text-sm space-y-1">
                      <h4 className="font-semibold text-gray-700 mb-1">
                        Parent’s Info
                      </h4>

                      {parentUserId && parentInfo ? (
                        <>
                          <p className="text-gray-900">
                            {parentInfo.firstName} {parentInfo.lastName}
                          </p>
                          {parentInfo.email && (
                            <p className="text-gray-600">{parentInfo.email}</p>
                          )}
                          {parentInfo.phone && (
                            <p className="text-gray-600">{parentInfo.phone}</p>
                          )}
                        </>
                      ) : (
                        <p className="text-gray-500">
                          {isEditing
                            ? 'No parent assigned.'
                            : 'Please select a parent.'}
                        </p>
                      )}
                    </div>
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

              {/* ParentSelectModal => only if brand-new dependent & user clicks "Select Parent" */}
              {parentSelectOpen && (
                <ParentSelectModal
                  isOpen={parentSelectOpen}
                  onClose={() => setParentSelectOpen(false)}
                  onSelectParent={handleSelectParent}
                />
              )}

              {/* Manage Dependents => only if editing & not a dependent */}
              {dependentsModalOpen && existingUser && !existingUser.isDependent && (
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
