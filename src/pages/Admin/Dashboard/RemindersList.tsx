// File: /src/pages/Admin/Dashboard/RemindersList.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReminders, updateReminder } from '../../../lib/api';
import PaginationControls from '../../../components/UI/PaginationControls';
import Button from '../../../components/UI/Button';
import toast from 'react-hot-toast';

interface UserSummary {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface Reminder {
  id: number;
  appointmentId: number;
  status: string;
  phone: string | null;
  message: string | null;
  scheduledFor: string | null; // ISO8601
  sent: boolean;
  sentAt: string | null;
  appointment?: {
    id: number;
    shortRef?: string; // e.g. "#123"
  };
  user?: UserSummary; // <--- user info from the back end
}

interface PaginatedReminders {
  reminders: Reminder[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    perPage: number;
  };
}

/**
 * Helper to parse "2025-01-15T08:00:00Z" => "January 15, 2025, 8:00 AM"
 */
function formatDateTime(isoString?: string | null) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function RemindersList() {
  const queryClient = useQueryClient();

  // -------------------------------------
  // 1) PAGINATION & FILTER STATE
  // -------------------------------------
  const [page, setPage] = useState(1);

  // "tempSearch" is the immediate typed text; "debouncedTerm" is used for queries.
  const [tempSearch, setTempSearch] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');

  const [statusFilter, setStatusFilter] = useState('');
  const [forDate, setForDate] = useState('');

  // We'll keep track of whether the user has *manually* clicked away or not.
  // If not, we keep forcing focus on the input.
  const [isSearchFocused, setIsSearchFocused] = useState(true);

  // A ref for the search input so we can manage focus.
  const searchRef = useRef<HTMLInputElement>(null);

  // -------------------------------------
  // 2) FOCUS / BLUR BEHAVIOR
  // -------------------------------------
  useEffect(() => {
    // On every render, if we want to keep the input focused and user hasn't clicked away:
    if (isSearchFocused) {
      searchRef.current?.focus();
      // Move cursor to end, if you want:
      const inputEl = searchRef.current;
      if (inputEl) {
        const val = inputEl.value;
        inputEl.setSelectionRange(val.length, val.length);
      }
    }
  });

  // -------------------------------------
  // 3) DEBOUNCE the search text
  // -------------------------------------
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(tempSearch.trim());
      setPage(1); // reset to page 1 on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [tempSearch]);

  // -------------------------------------
  // 4) FETCH REMINDERS (react-query)
  // -------------------------------------
  const { data, isLoading, error } = useQuery<PaginatedReminders>({
    queryKey: ['reminders', page, debouncedTerm, statusFilter, forDate],
    queryFn: async () => {
      const params: Record<string, any> = {
        page,
        per_page: 10,
      };
      if (debouncedTerm) {
        params.q = debouncedTerm;
      }
      if (statusFilter) {
        params.status = statusFilter;
      }
      if (forDate) {
        params.for_date = forDate;
      }
      const res = await getReminders(params);
      return res.data; // shape: { reminders, meta }
    },
    keepPreviousData: true,
  });

  const reminders = data?.reminders || [];
  const meta = data?.meta;

  // -------------------------------------
  // 5) UPDATE REMINDER MUTATION
  // -------------------------------------
  const updateReminderMut = useMutation({
    mutationFn: (payload: {
      id: number;
      phone?: string;
      status?: string;
      message?: string;
      scheduledFor?: string;
    }) => updateReminder(payload),
    onSuccess: () => {
      toast.success('Reminder updated!');
      queryClient.invalidateQueries(['reminders']);
      setEditModalOpen(false);
      setEditingReminder(null);
    },
    onError: (err: any) => {
      toast.error(`Update failed: ${err.message}`);
    },
  });

  // -------------------------------------
  // 6) EDIT MODAL
  // -------------------------------------
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  function handleEditClick(r: Reminder) {
    setEditingReminder({ ...r });
    setEditModalOpen(true);
  }

  function handleSave() {
    if (!editingReminder) return;
    updateReminderMut.mutate({
      id: editingReminder.id,
      phone: editingReminder.phone || '',
      status: editingReminder.status,
      message: editingReminder.message || '',
      scheduledFor: editingReminder.scheduledFor || '',
    });
  }

  // -------------------------------------
  // 7) FILTER SUBMIT + CLEAR
  // -------------------------------------
  function handleFilterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
  }

  function handleClearFilters() {
    setTempSearch('');
    setDebouncedTerm('');
    setStatusFilter('');
    setForDate('');
    setPage(1);
    setIsSearchFocused(true);
  }

  // -------------------------------------
  // RENDER
  // -------------------------------------
  if (isLoading) {
    return <div>Loading reminders...</div>;
  }
  if (error) {
    return <div className="text-red-500">Error loading reminders!</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Appointment Reminders</h2>
      <p className="text-gray-600 text-sm">
        View and edit scheduled or sent reminders. Use filters below to search.
      </p>

      {/* FILTER FORM */}
      <form className="flex flex-wrap gap-3 items-end" onSubmit={handleFilterSubmit}>
        {/* SEARCH Input */}
        <div className="flex flex-col">
          <label className="text-sm font-medium">Search (User Name/Email)</label>
          <input
            ref={searchRef}
            type="text"
            className="border p-1"
            value={tempSearch}
            onChange={(e) => {
              setTempSearch(e.target.value);
              // keep focus
              setIsSearchFocused(true);
            }}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="e.g. John or john@example.com"
          />
        </div>

        {/* STATUS */}
        <div className="flex flex-col">
          <label className="text-sm font-medium">Status</label>
          <select
            className="border p-1"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option value="queued">Queued</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* DATE */}
        <div className="flex flex-col">
          <label className="text-sm font-medium">Scheduled Date</label>
          <input
            type="date"
            className="border p-1"
            value={forDate}
            onChange={(e) => {
              setForDate(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <Button variant="primary" type="submit">
          Apply Filters
        </Button>
        <Button variant="outline" onClick={handleClearFilters}>
          Clear
        </Button>
      </form>

      {/* TABLE */}
      <div className="overflow-auto">
        <table className="table-auto w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left">ID</th>
              <th className="border px-4 py-2 text-left">Appt #</th>
              <th className="border px-4 py-2 text-left">User</th>
              <th className="border px-4 py-2 text-left">Phone</th>
              <th className="border px-4 py-2 text-left">Status</th>
              <th className="border px-4 py-2 text-left">Scheduled For</th>
              <th className="border px-4 py-2 text-left">Sent At</th>
              <th className="border px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reminders.map((r) => {
              const userName = r.user
                ? `${r.user.firstName} ${r.user.lastName} (${r.user.email})`
                : '—';

              return (
                <tr key={r.id}>
                  <td className="border px-4 py-2">{r.id}</td>
                  <td className="border px-4 py-2">
                    {r.appointment?.shortRef || r.appointmentId}
                  </td>
                  <td className="border px-4 py-2">
                    {userName}
                  </td>
                  <td className="border px-4 py-2">{r.phone || '—'}</td>
                  <td className="border px-4 py-2 capitalize">{r.status}</td>
                  <td className="border px-4 py-2">{formatDateTime(r.scheduledFor)}</td>
                  <td className="border px-4 py-2">{formatDateTime(r.sentAt)}</td>
                  <td className="border px-4 py-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(r)}
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {meta && (
        <PaginationControls
          currentPage={meta.currentPage}
          totalPages={meta.totalPages}
          onPageChange={(p) => setPage(p)}
          showGoTo
          smooth
        />
      )}

      {/* EDIT MODAL */}
      {editModalOpen && editingReminder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-semibold mb-4">
              Edit Reminder #{editingReminder.id}
            </h3>

            {/* Phone */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                pattern="^\+?[1-9]\d{1,14}$"
                placeholder="+16715551234"
                className="border p-2 w-full"
                value={editingReminder.phone || ''}
                onChange={(e) =>
                  setEditingReminder((old) =>
                    old ? { ...old, phone: e.target.value } : old
                  )
                }
              />
            </div>

            {/* Status */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className="border p-2 w-full"
                value={editingReminder.status}
                onChange={(e) =>
                  setEditingReminder((old) =>
                    old ? { ...old, status: e.target.value } : old
                  )
                }
              >
                <option value="queued">Queued</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* ScheduledFor */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scheduled For
              </label>
              <input
                type="datetime-local"
                className="border p-2 w-full"
                value={
                  editingReminder.scheduledFor
                    ? editingReminder.scheduledFor.slice(0, 16)
                    : ''
                }
                onChange={(e) =>
                  setEditingReminder((old) =>
                    old ? { ...old, scheduledFor: e.target.value } : old
                  )
                }
              />
            </div>

            {/* Message */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                className="border p-2 w-full"
                rows={3}
                value={editingReminder.message || ''}
                onChange={(e) =>
                  setEditingReminder((old) =>
                    old ? { ...old, message: e.target.value } : old
                  )
                }
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button variant="secondary" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                isLoading={updateReminderMut.isLoading}
                onClick={handleSave}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
