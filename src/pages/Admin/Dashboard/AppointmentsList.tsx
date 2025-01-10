// File: /src/pages/Admin/Dashboard/AppointmentsList.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import Button from '../../../components/UI/Button';
import AdminAppointmentCard from './AdminAppointmentCard';
import AdminAppointmentModal from './AdminAppointmentModal';
import { api, getDentists } from '../../../lib/api';
import PaginationControls from '../../../components/UI/PaginationControls';
import type { Appointment, Dentist } from '../../../types';

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
 * - q (search query)
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
  const params: any = { page, per_page: 10 };
  if (status)    params.status     = status;
  if (dentistId) params.dentist_id = dentistId;
  if (date)      params.date       = date;
  if (q.trim())  params.q          = q.toLowerCase();

  const response = await api.get('/appointments', { params });
  return response.data;
}

export default function AppointmentsList() {
  // PAGINATION & FILTERS
  const [page, setPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');

  const [selectedDentistId, setSelectedDentistId] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('scheduled');

  // Create Appointment Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // For focusing the search input
  const searchRef = useRef<HTMLInputElement>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(true);

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchTerm(e.target.value);
    setPage(1);
    setIsSearchFocused(true);
  }
  const handleSearchFocus = () => setIsSearchFocused(true);
  const handleSearchBlur = () => setIsSearchFocused(false);

  // Keep the search input focused if isSearchFocused is true
  useEffect(() => {
    if (isSearchFocused) {
      searchRef.current?.focus();
    }
  });

  // Debounce searchTerm => debouncedTerm
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // DENTISTS for the dropdown
  const {
    data: dentistList = [],
    isLoading: isDentistLoading,
    error: dentistError,
  } = useQuery<Dentist[]>({
    queryKey: ['all-dentists'],
    queryFn: async () => {
      const res = await getDentists();
      return res.data;
    },
  });

  // Fetch Appointments
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

  const { appointments = [], meta = { currentPage: 1, totalPages: 1 } } = data || {};

  // Clear filters
  function handleClearFilters() {
    setSearchTerm('');
    setDebouncedTerm('');
    setSelectedDentistId('');
    setDate('');
    setStatus('scheduled');
    setPage(1);
    setIsSearchFocused(true);
  }

  return (
    <div className="space-y-6">
      {/* FILTERS */}
      <div className="bg-white p-6 rounded-md shadow-md space-y-4">
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
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Dentists</option>
              {!isDentistLoading && dentistList.map((d) => (
                <option key={d.id} value={String(d.id)}>
                  Dr. {d.firstName} {d.lastName}
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
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="past">Past</option>
              <option value="">All</option>
            </select>
          </div>
        </div>

        <div className="text-right">
          <Button variant="outline" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        </div>
      </div>

      {/* NEW Appointment button */}
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
        {appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((appt) => (
              <AdminAppointmentCard key={appt.id} appointment={appt} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No matching appointments found.</p>
        )}
      </div>

      {/* PAGINATION CONTROLS (replaces old next/prev) */}
      <PaginationControls
        currentPage={meta.currentPage}
        totalPages={meta.totalPages}
        onPageChange={setPage}
        showGoTo
        smooth
      />

      {isFetching && (
        <div className="text-center text-sm text-gray-500 mt-2">
          Loading...
        </div>
      )}

      {/* AdminAppointmentModal => create new */}
      <AdminAppointmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        editingAppointment={null}
      />
    </div>
  );
}
