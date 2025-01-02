// File: /src/pages/Admin/Dashboard/UserSearchSelect.tsx

import { useState, useRef, useEffect } from 'react';
import { api } from '../../../lib/api'; // <-- Import the named export `api`
import { useOnClickOutside } from '../../../hooks/useOnClickOutside';

interface UserSearchSelectProps {
  /** Fired when the admin picks a user */
  onSelectUser: (userId: number) => void;
}

interface UserType {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

export default function UserSearchSelect({ onSelectUser }: UserSearchSelectProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserType[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Ref to the user menu wrapper
  const containerRef = useRef<HTMLDivElement | null>(null);

  // If you want the dropdown to close if user clicks outside:
  useOnClickOutside(containerRef, () => setShowDropdown(false));

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const delayId = setTimeout(async () => {
      try {
        // Admin-only search: GET /users/search?q=...
        // This must exist in your backend with a `search` action for admin
        const res = await api.get('/users/search', {
          params: { q: query },
        });

        // The response is expected to be: { users: [...array of users...] }
        setResults(res.data.users || []);
        setShowDropdown(true);
      } catch (err) {
        console.error('User search error:', err);
      }
    }, 300);

    return () => clearTimeout(delayId);
  }, [query]);

  const handleSelect = (user: UserType) => {
    // Fill the input with the user’s name/email
    setQuery(`${user.firstName} ${user.lastName} (${user.email})`);
    // Notify the parent
    onSelectUser(user.id);
    // Hide dropdown
    setShowDropdown(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        className="w-full border border-gray-300 rounded-md px-3 py-2
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        placeholder="Search user by name or email..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          if (results.length > 0) setShowDropdown(true);
        }}
      />

      {showDropdown && results.length > 0 && (
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
        </ul>
      )}
    </div>
  );
}
