// src/pages/Admin/Dashboard/AppointmentsList.tsx
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAppointments } from '../../../lib/api';
import AdminAppointmentCard from './AdminAppointmentCard';
import type { Appointment } from '../../../types';

interface PaginatedAppointments {
  appointments: Appointment[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    perPage: number;
  };
}

export default function AppointmentsList() {
  // Pagination state
  const [page, setPage] = useState(1);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDentist, setFilterDentist] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Smoothly scroll to top whenever `page` changes.
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [page]);

  // Fetch paginated appointments with React Query
  const {
    data,
    isLoading,
    error,
    isFetching,
  } = useQuery<PaginatedAppointments>({
    queryKey: ['admin-appointments', page],
    queryFn: async () => {
      const response = await getAppointments(page, 10); // fetch page=page, per_page=10
      return response.data; // shape: { appointments: [...], meta: {...} }
    },
    keepPreviousData: true, // avoid flicker when changing pages
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        Failed to load appointments. Please try again later.
      </div>
    );
  }

  if (!data) {
    return null; // or handle gracefully
  }

  const { appointments, meta } = data;

  // In-memory filter on the CURRENT page's appointments:
  const filteredAppointments = appointments.filter((appt) => {
    const search = searchTerm.toLowerCase().trim();
    const userName = (appt.userName || '').toLowerCase();
    const userIdStr = String(appt.userId);
    const userEmail = (appt.userEmail || '').toLowerCase();

    // Match if searchTerm is found in name, ID, or email
    const matchesNameIdEmail =
      userName.includes(search) ||
      userIdStr === search ||
      userEmail.includes(search);

    // Dentist name
    const dentistName = appt.dentist
      ? `${appt.dentist.firstName} ${appt.dentist.lastName}`.toLowerCase()
      : '';
    const matchesDentist = filterDentist
      ? dentistName.includes(filterDentist.toLowerCase())
      : true;

    // Filter date
    const apptDate = appt.appointmentTime?.split('T')[0] || '';
    const matchesDate = filterDate ? apptDate === filterDate : true;

    return matchesNameIdEmail && matchesDentist && matchesDate;
  });

  // Sort from earliest date to latest date
  filteredAppointments.sort((a, b) => {
    const dateA = new Date(a.appointmentTime).getTime();
    const dateB = new Date(b.appointmentTime).getTime();
    return dateA - dateB;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-6 rounded-md shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Combined search input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search by Name, ID, or Email
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder='e.g. "Jane Doe", "15", or "user@example.com"'
            />
          </div>

          {/* Filter by Dentist */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Dentist
            </label>
            <input
              type="text"
              value={filterDentist}
              onChange={(e) => setFilterDentist(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder='e.g. "Mary Smith"'
            />
          </div>

          {/* Filter by Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Date (YYYY-MM-DD)
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Filtered results */}
      {filteredAppointments.length > 0 ? (
        filteredAppointments.map((appt) => (
          <AdminAppointmentCard key={appt.id} appointment={appt} />
        ))
      ) : (
        <p className="text-center text-gray-500 mt-6">
          No matching appointments found.
        </p>
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
        <div className="text-center text-sm text-gray-500">Loading...</div>
      )}
    </div>
  );
}
