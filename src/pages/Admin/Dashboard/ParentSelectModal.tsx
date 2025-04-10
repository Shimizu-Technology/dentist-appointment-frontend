// File: /src/pages/Admin/Dashboard/ParentSelectModal.tsx

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { searchUsers } from '../../../lib/api';
import { useQuery } from '@tanstack/react-query';
import Button from '../../../components/UI/Button';
import toast from 'react-hot-toast';
import type { User } from '../../../types';

interface ParentSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Instead of just passing back an ID, we'll pass the *whole* user object
  onSelectParent: (parentUser: User) => void;
}

export default function ParentSelectModal({
  isOpen,
  onClose,
  onSelectParent,
}: ParentSelectModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debounced, setDebounced]   = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Query for users based on the search
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['parent-user-search', debounced],
    queryFn: async () => {
      if (!debounced) {
        return { users: [], meta: {} };
      }
      const res = await searchUsers(debounced, 1, 10);
      return res.data; // shape: { users, meta }
    },
    enabled: isOpen && debounced.length > 0,
  });

  const users: User[] = data?.users || [];

  function handleSelect(u: User) {
    // We pass the entire user object back to onSelectParent
    console.log('[ParentSelectModal] handleSelect => user:', u);
    onSelectParent(u);
  }

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Overlay */}
        <Transition.Child as={Fragment}>
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child as={Fragment}>
            <Dialog.Panel className="mx-auto w-full max-w-md bg-white rounded shadow-lg p-4">
              <Dialog.Title className="text-lg font-semibold mb-2">
                Select Parent User
              </Dialog.Title>

              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">
                  Search by name or email
                </label>
                <input
                  type="text"
                  className="border px-2 py-1 w-full rounded"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {isLoading && <p className="text-sm">Searching...</p>}
              {isError && (
                <p className="text-sm text-red-600">Error: {String(error)}</p>
              )}

              {/* RESULTS LIST */}
              <ul className="max-h-40 overflow-auto border rounded divide-y text-sm">
                {users.map((user) => (
                  <li
                    key={user.id}
                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
                    onClick={() => handleSelect(user)}
                  >
                    <strong>
                      {user.firstName} {user.lastName}
                    </strong>{' '}
                    {user.email && (
                      <span className="text-gray-600 ml-1">({user.email})</span>
                    )}
                  </li>
                ))}
                {!isLoading && users.length === 0 && (
                  <li className="p-2 text-gray-500">No results</li>
                )}
              </ul>

              <div className="text-right mt-4">
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
