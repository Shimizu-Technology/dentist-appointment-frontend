// File: /src/pages/Admin/Dashboard/UserModal.tsx
import { Fragment, useState, useEffect, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { createUser, updateUser, deleteUser } from '../../../lib/api';
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
  const queryClient  = useQueryClient();
  const isEditing    = !!existingUser;
  const hasInit      = useRef(false);

  // Basic fields
  const [role, setRole]             = useState<'user' | 'admin' | 'phone_only'>('user');
  const [firstName, setFirstName]   = useState('');
  const [lastName,  setLastName]    = useState('');
  const [phone,     setPhone]       = useState('');
  const [email,     setEmail]       = useState('');

  // Dependent logic
  const [isDependent, setIsDependent]          = useState(false);
  const [parentUserId, setParentUserId]        = useState<number | null>(null);
  const [parentUserName, setParentUserName]    = useState('');
  const [parentSelectOpen, setParentSelectOpen] = useState(false);

  // Manage Dependents (only for editing)
  const [dependentsModalOpen, setDependentsModalOpen] = useState(false);

  /**
   * Initialize fields when the modal first opens
   */
  useEffect(() => {
    if (!isOpen) {
      // If modal is closing, reset so next time it opens, we re-init
      hasInit.current = false;
      return;
    }
    if (isOpen && !hasInit.current) {
      hasInit.current = true;
      console.log('[UserModal] Opening. existingUser:', existingUser);

      if (existingUser) {
        // Editing an existing user
        console.log('[UserModal] Setting fields for EDIT user');
        setRole(existingUser.role);
        setFirstName(existingUser.firstName);
        setLastName(existingUser.lastName);
        setPhone(existingUser.phone || '');
        setEmail(existingUser.email || '');
        setIsDependent(!!existingUser.isDependent);

        setParentUserId(existingUser.parentUserId || null);
        setParentUserName(''); // If we need the parent's name, we can fetch it or pass it in
      } else {
        // Creating a new user
        console.log('[UserModal] Setting fields for NEW user');
        setRole('user');
        setFirstName('');
        setLastName('');
        setPhone('+1671'); // default prefix for new normal user
        setEmail('');
        setIsDependent(false);
        setParentUserId(null);
        setParentUserName('');
      }
    }
  }, [isOpen, existingUser]);

  /**
   * Called by ParentSelectModal after user picks a parent from the list
   * Now that we pass the full user object, we can show the parent's name.
   */
  function handleSelectParent(parentUser: User) {
    console.log('[UserModal] handleSelectParent => got parent user object:', parentUser);
    setParentUserId(parentUser.id);
    setParentUserName(`${parentUser.firstName} ${parentUser.lastName}`);
    setParentSelectOpen(false);
  }

  /**
   * Create or update user
   */
  async function handleSave() {
    console.log('[UserModal] handleSave =>', {
      isEditing,
      isDependent,
      role,
      firstName,
      lastName,
      phone,
      email,
      parentUserId,
      parentUserName,
    });

    // 1) Basic validation
    if (!firstName.trim()) {
      toast.error('First name is required.');
      return;
    }
    if (!lastName.trim()) {
      toast.error('Last name is required.');
      return;
    }

    // If dependent => must have a parent. No phone or email required.
    if (isDependent) {
      if (!parentUserId) {
        toast.error('Please select a parent user for this dependent.');
        console.log('[UserModal] No parent user selected => cannot save');
        return;
      }
    } else {
      // Normal user => phone required, email required if not phone_only
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
        // 2) Updating existing user
        console.log('[UserModal] Updating user ID=', existingUser.id);

        // If user is now a dependent, we override phone/email with blank
        const newPhone = isDependent ? '' : phone;
        const newEmail = isDependent ? '' : email.trim();

        await updateUser(existingUser.id, {
          role,
          firstName,
          lastName,
          phone: newPhone,
          email: newEmail,
          // If you allow changing from normal => dependent:
          is_dependent: isDependent,
          parent_user_id: isDependent ? parentUserId : null,
        });
        toast.success('User updated!');
      } else {
        // 3) Creating new
        if (isDependent) {
          // Force phone_only role for a brand-new dependent
          console.log('[UserModal] Creating new dependent...');
          await createUser({
            role: 'phone_only',
            firstName,
            lastName,
            phone: '',   // no phone
            email: '',   // no email
            is_dependent: true,
            parent_user_id: parentUserId!, // we know it's not null
          });
          toast.success('Dependent created!');
        } else {
          console.log('[UserModal] Creating new normal user...');
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
      console.error('[UserModal] handleSave() error =>', err);
      const msg = err?.response?.data?.errors?.join(', ') || err.message;
      toast.error(`Failed to save user: ${msg}`);
    }
  }

  /**
   * Delete user (only if editing)
   */
  async function handleDelete() {
    if (!existingUser) return;
    const yes = window.confirm('Are you sure you want to delete this user?');
    if (!yes) return;

    console.log('[UserModal] Deleting user ID=', existingUser.id);
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
                      onClick={() => {
                        console.log('[UserModal] Opening manageDependents...');
                        setDependentsModalOpen(true);
                      }}
                    >
                      Manage Dependents
                    </Button>
                  </div>
                )}

                {/* Show "Is this a Dependent?" only if creating new */}
                {!isEditing && (
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={isDependent}
                      onChange={(e) => {
                        console.log('[UserModal] Toggling isDependent =>', e.target.checked);
                        setIsDependent(e.target.checked);
                        if (!e.target.checked) {
                          setParentUserId(null);
                          setParentUserName('');
                        }
                      }}
                    />
                    <span className="text-sm">Is this a Dependent?</span>
                  </label>
                )}

                {/* If not dependent => show a role dropdown (only for brand-new user) */}
                {!isDependent && !isEditing && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="border w-full rounded-md px-3 py-2"
                      value={role}
                      onChange={(e) => {
                        console.log('[UserModal] Role changed =>', e.target.value);
                        setRole(e.target.value as 'user' | 'admin' | 'phone_only');
                      }}
                    >
                      <option value="user">Regular User</option>
                      <option value="admin">Admin</option>
                      <option value="phone_only">Phone-Only</option>
                    </select>
                  </div>
                )}

                {/* Names */}
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

                {/* If not dependent => show phone & maybe email */}
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

                {/* If dependent => must pick a parent */}
                {isDependent && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Select Parent User
                    </label>
                    <Button
                      variant="outline"
                      onClick={() => {
                        console.log('[UserModal] Opening parentSelect modal...');
                        setParentSelectOpen(true);
                      }}
                    >
                      {parentUserId
                        ? `Parent: ${parentUserName || '(Unknown)'}`
                        : 'Select Parent'
                      }
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

              {/* ParentSelectModal => pass handleSelectParent, which receives the *entire* user object */}
              {parentSelectOpen && (
                <ParentSelectModal
                  isOpen={parentSelectOpen}
                  onClose={() => setParentSelectOpen(false)}
                  onSelectParent={handleSelectParent}
                />
              )}

              {/* Manage Dependents => only if editing */}
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
