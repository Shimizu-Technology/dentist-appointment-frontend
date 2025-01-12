// File: /src/pages/Admin/Dashboard/UserDependentsModal.tsx

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getAdminChildren,
  createUser,
  deleteChildUser,
  updateAdminChildUser
} from '../../../lib/api';
import Button from '../../../components/UI/Button';
import toast from 'react-hot-toast';

interface ChildUser {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  parentUserId?: number;
  // etc. ...
}

interface UserDependentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;  // parent's user ID
}

export default function UserDependentsModal({
  isOpen,
  onClose,
  userId,
}: UserDependentsModalProps) {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery<ChildUser[]>({
    queryKey: ['adminChildren', userId],
    queryFn: async () => {
      const res = await getAdminChildren(userId);
      return res.data as ChildUser[];
    },
    enabled: isOpen,
  });

  const childUsers = data || [];

  // For adding a new child
  const [showAdd, setShowAdd] = useState(false);
  const [newFirst, setNewFirst] = useState('');
  const [newLast, setNewLast] = useState('');
  const [newDob, setNewDob] = useState('');

  // For editing an existing child
  const [editingChild, setEditingChild] = useState<ChildUser | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Create child => POST /api/v1/users
  const createChildMut = useMutation({
    mutationFn: async () => {
      return createUser({
        role: 'user',
        firstName: newFirst,
        lastName: newLast,
        date_of_birth: newDob || '2020-01-01',
        is_dependent: true,
        parent_user_id: userId
      });
    },
    onSuccess: () => {
      toast.success('Child user created!');
      queryClient.invalidateQueries(['adminChildren', userId]);
      setShowAdd(false);
      setNewFirst('');
      setNewLast('');
      setNewDob('');
    },
    onError: (err: any) => {
      toast.error(`Failed to create child user: ${err.message}`);
    },
  });

  // Delete child
  async function handleDeleteChild(childId: number) {
    const yes = window.confirm('Delete this child user?');
    if (!yes) return;
    try {
      await deleteChildUser(childId);
      toast.success('Child user removed!');
      queryClient.invalidateQueries(['adminChildren', userId]);
    } catch (err: any) {
      toast.error(`Failed to delete: ${err.message}`);
    }
  }

  // "Edit" button => open sub-modal
  function handleEditChild(child: ChildUser) {
    setEditingChild(child);
    setShowEditModal(true);
  }

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>

        <Transition.Child as={Fragment}>
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child as={Fragment}>
            <Dialog.Panel className="mx-auto w-full max-w-md bg-white rounded shadow-md p-4">
              <Dialog.Title className="text-lg font-semibold mb-4">
                Manage Child Users (Dependents)
              </Dialog.Title>

              {isLoading && <p>Loading...</p>}
              {isError && <p className="text-red-600">{String(error)}</p>}

              {!isLoading && childUsers.length === 0 && (
                <p className="text-gray-500">No child users found.</p>
              )}

              {childUsers.length > 0 && (
                <ul className="border rounded divide-y mb-3">
                  {childUsers.map((child) => (
                    <li
                      key={child.id}
                      className="p-2 flex justify-between items-center"
                    >
                      <div>
                        {child.firstName} {child.lastName}{' '}
                        <span className="text-xs text-gray-500">
                          (DOB: {child.dateOfBirth})
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditChild(child)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteChild(child.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/* "Add Child" form */}
              {!showAdd ? (
                <Button variant="outline" onClick={() => setShowAdd(true)}>
                  + Add Child User
                </Button>
              ) : (
                <div className="border p-2 rounded space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="border p-1 flex-1"
                      placeholder="First Name"
                      value={newFirst}
                      onChange={(e) => setNewFirst(e.target.value)}
                    />
                    <input
                      type="text"
                      className="border p-1 flex-1"
                      placeholder="Last Name"
                      value={newLast}
                      onChange={(e) => setNewLast(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm mr-2">DOB:</label>
                    <input
                      type="date"
                      className="border p-1"
                      value={newDob}
                      onChange={(e) => setNewDob(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setShowAdd(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => createChildMut.mutate()}
                      disabled={createChildMut.isLoading}
                    >
                      {createChildMut.isLoading ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-4 text-right">
                <Button variant="secondary" onClick={onClose}>
                  Close
                </Button>
              </div>

              {/* Sub-modal for "Edit" a child user */}
              {showEditModal && editingChild && (
                <EditChildModal
                  isOpen={showEditModal}
                  onClose={() => setShowEditModal(false)}
                  childUser={editingChild}
                  onSuccess={() => {
                    // refresh after editing
                    queryClient.invalidateQueries(['adminChildren', userId]);
                  }}
                />
              )}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

/** A small sub-component for editing a single child user */
function EditChildModal({
  isOpen,
  onClose,
  childUser,
  onSuccess
}: {
  isOpen: boolean;
  onClose: () => void;
  childUser: ChildUser;
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();
  const [firstName, setFirstName] = useState(childUser.firstName);
  const [lastName, setLastName]   = useState(childUser.lastName);
  const [dob, setDob]             = useState(childUser.dateOfBirth);

  const { mutate: updateMut, isLoading } = useMutation({
    mutationFn: async () => {
      // PATCH /api/v1/admin/children/:id
      return updateAdminChildUser(childUser.id, {
        firstName,
        lastName,
        dateOfBirth: dob
      });
    },
    onSuccess: () => {
      toast.success('Child updated!');
      onClose();
      onSuccess();
    },
    onError: (err: any) => {
      toast.error(`Failed to update child: ${err.message}`);
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-md rounded-md shadow-md p-4">
        <h2 className="text-xl font-semibold mb-4">Edit Dependent</h2>

        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">First Name</label>
            <input
              type="text"
              className="border w-full px-2 py-1"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Last Name</label>
            <input
              type="text"
              className="border w-full px-2 py-1"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Date of Birth</label>
            <input
              type="date"
              className="border w-full px-2 py-1"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => updateMut()} isLoading={isLoading}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
