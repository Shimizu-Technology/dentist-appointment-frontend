// File: /src/pages/Admin/Dashboard/UserSearchSelect.tsx

import { useState, useEffect } from 'react';
import { api } from '../../../lib/api'; // Your Axios instance or similar

interface UserSearchSelectProps {
  /** Called when an admin selects an existing user from the results */
  onSelectUser: (userId: number) => void;
  /** Called when the admin wants to create a new user if none is found */
  onNeedToCreate: () => void;
}

interface UserType {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

export default function UserSearchSelect({
  onSelectUser,
  onNeedToCreate,
}: UserSearchSelectProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserType[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const delayId = setTimeout(async () => {
      try {
        // This hits /users/search?q=...
        const res = await api.get('/users/search', { params: { q: query } });
        setResults(res.data.users || []);
        setShowDropdown(true);
      } catch (error) {
        console.error('User search error:', error);
      }
    }, 300);

    return () => clearTimeout(delayId);
  }, [query]);

  function handleSelect(user: UserType) {
    // Fill the input with something like "Jane Doe (jane@example.com)"
    setQuery(`${user.firstName} ${user.lastName} (${user.email})`);
    onSelectUser(user.id);
    setShowDropdown(false);
  }

  return (
    <div className="relative">
      <input
        type="text"
        className="border px-3 py-2 rounded w-full"
        placeholder="Search user by name or email..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          if (results.length > 0) setShowDropdown(true);
        }}
      />

      {showDropdown && (
        <ul className="absolute z-10 left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
          {results.map((u) => (
            <li
              key={u.id}
              onClick={() => handleSelect(u)}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
            >
              {u.firstName} {u.lastName}{' '}
              <span className="text-gray-500">({u.email})</span>
            </li>
          ))}

          {/* 
            If no results and the user typed something (non-empty),
            show “Create user?” line 
          */}
          {results.length === 0 && query.trim() !== '' && (
            <li className="px-3 py-2 text-sm text-gray-600">
              No users found for &quot;{query}&quot;.
              <button
                type="button"
                onClick={() => onNeedToCreate()}
                className="text-blue-600 underline ml-2"
              >
                Create new user?
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
