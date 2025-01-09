// File: /src/pages/Admin/Dashboard/AppointmentsList.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import Button from '../../../components/UI/Button';
import AdminAppointmentCard from './AdminAppointmentCard';
import AdminAppointmentModal from './AdminAppointmentModal';
import { api, getDentists } from '../../../lib/api'; // your API helpers
import type { Appointment, Dentist } from '../../../types';

// Shape of the paginated response
interface PaginatedAppointments {
  appointments: Appointment[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    perPage: number;
  };
}

/** 
 * Fetch appointments with optional filters:
 * - page
 * - status
 * - q (search query: forced to lowercase)
 * - dentist_id
 * - date (YYYY-MM-DD)
 */
async function fetchAppointments(
  page: number,
  status: string,
  q: string,
  dentistId: string,
  date: string
): Promise<PaginatedAppointments> {
  const params: any = {
    page,
    per_page: 10,
  };
  if (status)    params.status     = status;
  if (dentistId) params.dentist_id = dentistId;
  if (date)      params.date       = date;
  if (q.trim())  params.q          = q.toLowerCase();

  const response = await api.get('/appointments', { params });
  return response.data;
}

export default function AppointmentsList() {
  // ------------------------------------
  // PAGINATION & FILTER STATES
  // ------------------------------------
  const [page, setPage] = useState(1);

  // Search
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');

  // Dentist dropdown
  const [selectedDentistId, setSelectedDentistId] = useState('');

  // Date filter
  const [date, setDate] = useState('');

  // Status (scheduled, completed, etc.)
  const [status, setStatus] = useState('scheduled');

  // ------------------------------------
  // MODAL: Create Appointment
  // ------------------------------------
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // ------------------------------------
  // SEARCH INPUT FOCUS HANDLING
  // ------------------------------------
  const searchRef = useRef<HTMLInputElement>(null);

  // This boolean tracks whether the user is still "actively" in the search box
  // or wants it re-focused after re-renders. We'll set it false onBlur.
  const [isSearchFocused, setIsSearchFocused] = useState(true);

  // onChange => user typed => keep the search box focused
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
    // If the user typed, let’s keep focus
    setIsSearchFocused(true);
  };

  // onFocus => user is actively focusing the field
  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  // onBlur => user clicked away => do not auto-refocus
  const handleSearchBlur = () => {
    setIsSearchFocused(false);
  };

  // On every re-render, if we want to keep focus => do so
  useEffect(() => {
    if (isSearchFocused) {
      searchRef.current?.focus();
    }
  });

  // ------------------------------------
  // DEBOUNCE searchTerm => debouncedTerm
  // ------------------------------------
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ------------------------------------
  // FETCH DENTISTS (for the dropdown)
  // ------------------------------------
  const {
    data: dentistList,
    isLoading: isDentistLoading,
    error: dentistError,
  } = useQuery<Dentist[]>({
    queryKey: ['all-dentists'],
    queryFn: async () => {
      const res = await getDentists();
      return res.data; // array of Dentist
    },
  });

  // ------------------------------------
  // FETCH APPOINTMENTS
  // ------------------------------------
  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery<PaginatedAppointments>({
    queryKey: [
      'admin-appointments',
      page,
      status,
      debouncedTerm,
      selectedDentistId,
      date,
    ],
    queryFn: () =>
      fetchAppointments(page, status, debouncedTerm, selectedDentistId, date),
    keepPreviousData: true,
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full mx-auto"></div>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="text-center py-12 text-red-600">
        Failed to load appointments: {String(error)}
      </div>
    );
  }

  const { appointments, meta } = data || { appointments: [], meta: {} };

  // ------------------------------------
  // CLEAR FILTERS
  // ------------------------------------
  const handleClearFilters = () => {
    setSearchTerm('');
    setDebouncedTerm('');
    setSelectedDentistId('');
    setDate('');
    setStatus('scheduled');
    setPage(1);

    // We want to re-focus the search bar after clearing
    setIsSearchFocused(true);
  };

  return (
    <div className="space-y-6">
      {/* FILTERS */}
      <div className="bg-white p-6 rounded-md shadow-md space-y-4">
        {/* Row of inputs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              ref={searchRef}
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Name, Email, or ID"
            />
          </div>

          {/* Dentist dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dentist
            </label>
            <select
              value={selectedDentistId}
              onChange={(e) => {
                setSelectedDentistId(e.target.value);
                setPage(1);
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Dentists</option>
              {!isDentistLoading && dentistList?.map((dentist) => (
                <option key={dentist.id} value={String(dentist.id)}>
                  Dr. {dentist.firstName} {dentist.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Date filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date (YYYY-MM-DD)
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setPage(1);
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="past">Past</option>
              <option value="">All</option>
            </select>
          </div>
        </div>

        {/* Clear filters button */}
        <div className="text-right">
          <Button variant="outline" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        </div>
      </div>

      {/* New Appointment button */}
      <div className="text-right">
        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Appointment
        </Button>
      </div>

      {/* APPOINTMENTS LIST */}
      <div className="bg-white p-6 rounded-md shadow-md">
        {appointments && appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((appt) => (
              <AdminAppointmentCard key={appt.id} appointment={appt} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No matching appointments found.</p>
        )}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center items-center mt-6 space-x-4">
        <button
          onClick={() => setPage((old) => Math.max(old - 1, 1))}
          disabled={meta.currentPage === 1 || isFetching}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Previous
        </button>

        <span className="text-gray-600">
          Page {meta.currentPage} of {meta.totalPages}
        </span>

        <button
          onClick={() => {
            if (meta.currentPage < meta.totalPages) {
              setPage((old) => old + 1);
            }
          }}
          disabled={meta.currentPage === meta.totalPages || isFetching}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
      {isFetching && (
        <div className="text-center text-sm text-gray-500 mt-2">
          Loading...
        </div>
      )}

      {/* Create/Edit Appointment Modal */}
      <AdminAppointmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        editingAppointment={null}
      />
    </div>
  );
}
