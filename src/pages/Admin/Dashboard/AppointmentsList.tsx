// File: src/pages/Admin/Dashboard/AppointmentsList.tsx
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';

import AdminAppointmentModal from './AdminAppointmentModal';
import AdminAppointmentCard from './AdminAppointmentCard';

import Button from '../../../components/UI/Button';
import type { Appointment } from '../../../types';
import { api } from '../../../lib/api'; 
  // or wherever you import your axios instance from
  // If you use "getAppointments" from /lib/api, you can adapt that function to accept the query params

interface PaginatedAppointments {
  appointments: Appointment[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    perPage: number;
  };
}

// Example helper to fetch the appointments from your updated Rails endpoint
async function fetchAppointments({
  page,
  status,
  searchTerm,
  dentistName,
  date,
}: {
  page: number;
  status: string;       // "scheduled", "completed", "cancelled", "past", or ""
  searchTerm: string;
  dentistName: string;
  date: string;
}) {
  const response = await api.get('/appointments', {
    params: {
      page,
      per_page: 10,
      status,
      q: searchTerm,
      dentist_name: dentistName,
      date,
    },
  });
  return response.data as PaginatedAppointments;
}

export default function AppointmentsList() {
  // Pagination
  const [page, setPage] = useState<number>(1);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [dentistName, setDentistName] = useState('');
  const [date, setDate] = useState('');

  // IMPORTANT: default to "scheduled"
  const [status, setStatus] = useState('scheduled');

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Scroll to top when changing pages
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  // Now, use React Query to fetch from the server, 
  // passing the current page & filters as part of the query key
  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery<PaginatedAppointments>({
    queryKey: ['admin-appointments', page, status, searchTerm, dentistName, date],
    queryFn: () =>
      fetchAppointments({ page, status, searchTerm, dentistName, date }),
    keepPreviousData: true, // Keep old data while fetching new
  });

  // If loading...
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  // If error...
  if (isError) {
    return (
      <div className="text-center py-12 text-red-600">
        Failed to load appointments: {String(error)}
      </div>
    );
  }

  if (!data) {
    return null; 
  }

  const { appointments, meta } = data;

  return (
    <div className="space-y-6">
      {/* Filter box */}
      <div className="bg-white p-6 rounded-md shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search (Name, Email, ID)
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder='e.g. "Jane", "user@example.com", "15"'
            />
          </div>

          {/* Dentist name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dentist
            </label>
            <input
              type="text"
              value={dentistName}
              onChange={(e) => {
                setDentistName(e.target.value);
                setPage(1);
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder='e.g. "Mary Smith"'
            />
          </div>

          {/* Date */}
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
              {/* Default to scheduled */}
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="past">Past</option>
              <option value="">All</option>
            </select>
          </div>
        </div>
      </div>

      {/* Create Appointment Button */}
      <div className="text-right">
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          New Appointment
        </Button>
      </div>

      {/* Results */}
      {appointments.length > 0 ? (
        appointments.map((appt) => (
          <AdminAppointmentCard key={appt.id} appointment={appt} />
        ))
      ) : (
        <p className="text-center text-gray-500 mt-6">No matching appointments found.</p>
      )}

      {/* Pagination */}
      <div className="flex justify-center items-center mt-8 space-x-4">
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

      {/* Create/Edit modal */}
      <AdminAppointmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        editingAppointment={null}
      />
    </div>
  );
}
