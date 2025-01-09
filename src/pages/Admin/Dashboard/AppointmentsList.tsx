// File: /src/pages/Admin/Dashboard/AppointmentsList.tsx
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import Button from '../../../components/UI/Button';
import AdminAppointmentCard from './AdminAppointmentCard';
import AdminAppointmentModal from './AdminAppointmentModal';
// Import your API helpers
import { api, getDentists } from '../../../lib/api'; 
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
 * We fetch appointments with optional filters:
 *  - page
 *  - status (scheduled, completed, etc.)
 *  - q (search query: can match name, email, or ID)
 *  - dentist_id
 *  - date (YYYY-MM-DD)
 */
async function fetchAppointments(
  page: number,
  status: string,
  q: string,
  dentistId: string,
  date: string
): Promise<PaginatedAppointments> {
  // Build the params object
  const params: any = {
    page,
    per_page: 10,
  };

  // Only include status if non-empty
  if (status) params.status = status;

  // If dentistId is not empty => pass it
  if (dentistId) params.dentist_id = dentistId;

  // If date => pass it
  if (date) params.date = date;

  // If q => pass it as all-lowercase
  if (q.trim()) params.q = q.toLowerCase();

  const response = await api.get('/appointments', { params });
  return response.data;
}

export default function AppointmentsList() {
  // Pagination
  const [page, setPage] = useState<number>(1);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  // We'll store the *debounced* searchTerm so we only re-query after a short delay
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const [selectedDentistId, setSelectedDentistId] = useState(''); // empty => all
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('scheduled');

  // Create-Appointment modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // ----------------------------------------------------------------
  // 1) Dentist list for the dropdown
  // ----------------------------------------------------------------
  const {
    data: dentistList,
    isLoading: isDentistLoading,
    error: dentistError,
  } = useQuery<Dentist[]>({
    queryKey: ['all-dentists'], // or any key
    queryFn: async () => {
      const res = await getDentists();
      return res.data; // array of Dentist
    },
  });

  // ----------------------------------------------------------------
  // 2) Debounce logic for searchTerm
  // ----------------------------------------------------------------
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ----------------------------------------------------------------
  // 3) Query for the appointments
  // ----------------------------------------------------------------
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
      debouncedSearchTerm,
      selectedDentistId,
      date,
    ],
    queryFn: () =>
      fetchAppointments(page, status, debouncedSearchTerm, selectedDentistId, date),
    keepPreviousData: true,
  });

  // If no data yet, handle loading / error states
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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

  // De-structure the returned object
  const { appointments, meta } = data || { appointments: [], meta: {} };

  // ----------------------------------------------------------------
  // 4) Clear filters
  // ----------------------------------------------------------------
  const handleClearFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setSelectedDentistId('');
    setDate('');
    setStatus('scheduled');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <div className="bg-white p-6 rounded-md shadow-md space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder='Name, Email, or ID'
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
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="past">Past</option>
              <option value="">All</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        <div className="text-right">
          <Button variant="outline" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Create New Appointment */}
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

      {/* Appointments List */}
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

      {/* Pagination */}
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

      {/* Create / Edit Appointment Modal */}
      <AdminAppointmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        editingAppointment={null} // null => create mode
      />
    </div>
  );
}
