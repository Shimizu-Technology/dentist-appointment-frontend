// src/pages/Admin/Dashboard/AppointmentsList.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAppointments } from '../../../lib/api';
import AdminAppointmentCard from './AdminAppointmentCard';
import type { Appointment } from '../../../types';

export default function AppointmentsList() {
  const { data: appointments, isLoading, error } = useQuery<Appointment[]>({
    queryKey: ['admin-appointments'],
    queryFn: async () => {
      const response = await getAppointments();
      return response.data;
    },
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDentist, setFilterDentist] = useState('');
  const [filterDate, setFilterDate] = useState('');

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

  const filteredAppointments = (appointments || []).filter((appt) => {
    const search = searchTerm.toLowerCase().trim();
    const userName = (appt.userName || '').toLowerCase();
    const userIdStr = String(appt.userId);
    const userEmail = (appt.userEmail || '').toLowerCase();

    const matchesNameIdEmail =
      userName.includes(search) ||
      userIdStr === search ||
      userEmail.includes(search);

    const dentistName = appt.dentist
      ? `${appt.dentist.firstName} ${appt.dentist.lastName}`.toLowerCase()
      : '';
    const matchesDentist = filterDentist
      ? dentistName.includes(filterDentist.toLowerCase())
      : true;

    const apptDate = appt.appointmentTime?.split('T')[0] || '';
    const matchesDate = filterDate ? apptDate === filterDate : true;

    return matchesNameIdEmail && matchesDentist && matchesDate;
  });

  return (
    <div className="space-y-6">

      {/** Filter Container (styling improvement) */}
      <div className="bg-white p-6 rounded-md shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Single field for Name / ID / Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search by Name, ID, or Email
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/** Filtered Results */}
      {filteredAppointments.length > 0 ? (
        filteredAppointments.map((appointment) => (
          <AdminAppointmentCard key={appointment.id} appointment={appointment} />
        ))
      ) : (
        <p className="text-center text-gray-500 mt-6">
          No matching appointments found.
        </p>
      )}
    </div>
  );
}