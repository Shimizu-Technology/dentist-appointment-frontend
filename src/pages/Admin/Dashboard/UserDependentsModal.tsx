// File: /src/pages/Admin/Dashboard/UserDependentsModal.tsx

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDependents, createDependent, deleteDependent } from '../../../lib/api';
import Button from '../../../components/UI/Button';
import toast from 'react-hot-toast';

interface Dependent {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  userId: number;
}

interface UserDependentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
}

export default function UserDependentsModal({
  isOpen,
  onClose,
  userId,
}: UserDependentsModalProps) {
  const queryClient = useQueryClient();

  // Load all dependents (this example fetches all, then filters by userId).
  const { data, isLoading, isError, error } = useQuery<Dependent[]>({
    queryKey: ['dependents', userId],
    queryFn: async () => {
      const res = await getDependents();
      // Filter for just those belonging to userId
      return res.data.filter((d: Dependent) => d.userId === userId);
    },
    enabled: isOpen,
  });

  const dependents = data || [];

  // For adding a new dependent
  const [showAdd, setShowAdd] = useState(false);
  const [newFirst, setNewFirst] = useState('');
  const [newLast, setNewLast] = useState('');
  const [newDob, setNewDob] = useState('');

  // Create a dependent (we assume you’re associating it with userId behind the scenes)
  const createDepMut = useMutation({
    mutationFn: async () => {
      const payload = {
        firstName: newFirst,
        lastName: newLast,
        dateOfBirth: newDob || '2020-01-01',
      };
      // If your backend requires "POST /users/:user_id/dependents"
      // you might call a specialized function instead, e.g. "createDependentForUser(userId, payload)"
      return createDependent(payload, userId);
    },
    onSuccess: () => {
      toast.success('Dependent created!');
      queryClient.invalidateQueries(['dependents', userId]);
      setShowAdd(false);
      setNewFirst('');
      setNewLast('');
      setNewDob('');
    },
    onError: (err: any) => {
      toast.error(`Failed to create dependent: ${err.message}`);
    },
  });

  async function handleDelete(depId: number) {
    const yes = window.confirm('Delete this dependent?');
    if (!yes) return;
    try {
      await deleteDependent(depId);
      toast.success('Dependent removed!');
      queryClient.invalidateQueries(['dependents', userId]);
    } catch (err: any) {
      toast.error(`Failed to delete dependent: ${err.message}`);
    }
  }

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Overlay */}
        <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child as={Fragment}
            enter="ease-out duration-200" enterFrom="opacity-0 translate-y-4 scale-95"
            enterTo="opacity-100 translate-y-0 scale-100"
            leave="ease-in duration-150" leaveFrom="opacity-100 translate-y-0 scale-100"
            leaveTo="opacity-0 translate-y-4 scale-95"
          >
            <Dialog.Panel className="mx-auto w-full max-w-md bg-white rounded shadow-lg p-4">
              <Dialog.Title className="text-lg font-semibold mb-2">
                Manage Dependents
              </Dialog.Title>

              {isLoading && <p className="text-sm">Loading dependents...</p>}
              {isError && (
                <p className="text-sm text-red-600">
                  Error: {String(error)}
                </p>
              )}

              {!isLoading && dependents.length === 0 && (
                <p className="text-sm text-gray-500">No dependents found.</p>
              )}
              <ul className="divide-y border rounded mb-3">
                {dependents.map((dep) => (
                  <li key={dep.id} className="p-2 flex justify-between items-center">
                    <div>
                      {dep.firstName} {dep.lastName}{' '}
                      <span className="text-xs text-gray-500">
                        (DOB: {dep.dateOfBirth})
                      </span>
                    </div>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(dep.id)}>
                      Delete
                    </Button>
                  </li>
                ))}
              </ul>

              {/* Add Dependent Form */}
              {!showAdd ? (
                <Button variant="outline" onClick={() => setShowAdd(true)}>
                  + Add Dependent
                </Button>
              ) : (
                <div className="border rounded p-2">
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="First Name"
                      className="border p-1 flex-1"
                      value={newFirst}
                      onChange={(e) => setNewFirst(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      className="border p-1 flex-1"
                      value={newLast}
                      onChange={(e) => setNewLast(e.target.value)}
                    />
                  </div>
                  <div className="mb-2">
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
                    <Button variant="primary" onClick={() => createDepMut.mutate()}>
                      Save
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-4 text-right">
                <Button variant="secondary" onClick={onClose}>
                  Close
                </Button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
