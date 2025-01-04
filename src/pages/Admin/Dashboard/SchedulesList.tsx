// File: /src/pages/Admin/Dashboard/SchedulesList.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSchedules,       // GET /api/v1/schedules
  updateSchedules,    // PATCH /api/v1/schedules => { clinic_open_time, clinic_close_time }
  getClosedDays,      // existing calls or just rely on getSchedules() for closedDays
  createClosedDay,
  deleteClosedDay,
  getDentistAvailabilities, // or rely on getSchedules() for dentistAvailabilities
  createDentistAvailability,
  updateDentistAvailability,
  deleteDentistAvailability,
} from '../../../lib/api';
import Button from '../../../components/UI/Button';

export default function SchedulesList() {
  const queryClient = useQueryClient();

  // (A) Fetch all scheduling info from /api/v1/schedules
  const { data, isLoading, error } = useQuery({
    queryKey: ['schedules'],
    queryFn: async () => {
      const res = await getSchedules();
      return res.data; // shape: { clinicOpenTime, clinicCloseTime, closedDays, dentistAvailabilities }
    },
  });

  // Local states for editing the clinic open/close times
  const [newOpenTime, setNewOpenTime]   = useState('');
  const [newCloseTime, setNewCloseTime] = useState('');

  // Update clinic open/close times
  const updateSchedulesMut = useMutation({
    mutationFn: (payload: { clinic_open_time: string; clinic_close_time: string }) =>
      updateSchedules(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['schedules']);
      // reset local form if needed
      setNewOpenTime('');
      setNewCloseTime('');
    },
    onError: (err: any) => {
      alert(`Failed to update clinic hours: ${err.message}`);
    },
  });

  // For “Closed Days” creation
  const [closedDate, setClosedDate]   = useState('');
  const [closedReason, setClosedReason] = useState('');
  const createClosedDayMut = useMutation({
    mutationFn: (payload: { date: string; reason?: string }) => createClosedDay(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['schedules']);
      setClosedDate('');
      setClosedReason('');
    },
    onError: (err: any) => {
      alert(`Failed to create closed day: ${err.message}`);
    },
  });

  const deleteClosedDayMut = useMutation({
    mutationFn: (id: number) => deleteClosedDay(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['schedules']);
    },
    onError: (err: any) => {
      alert(`Failed to delete closed day: ${err.message}`);
    },
  });

  // For Dentist Availabilities
  const [selectedDentist, setSelectedDentist] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('1'); // default Monday
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime]     = useState('');

  const createAvailMut = useMutation({
    mutationFn: (payload: any) => createDentistAvailability(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['schedules']);
      setDayOfWeek('1');
      setStartTime('');
      setEndTime('');
    },
    onError: (err: any) => {
      alert(`Failed to create dentist availability: ${err.message}`);
    },
  });

  const deleteAvailMut = useMutation({
    mutationFn: (id: number) => deleteDentistAvailability(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['schedules']);
    },
    onError: (err: any) => {
      alert(`Failed to delete availability: ${err.message}`);
    },
  });

  if (isLoading) return <div>Loading schedules...</div>;
  if (error)     return <div className="text-red-600">Error loading schedules.</div>;
  if (!data)     return null;

  const {
    clinicOpenTime,
    clinicCloseTime,
    closedDays,
    dentistAvailabilities,
  } = data;

  // --- RENDER ---
  return (
    <div className="space-y-8">
      {/* ------------------------------------- */}
      {/* 1) Clinic Hours Section */}
      <section className="bg-white p-4 rounded shadow space-y-4">
        <h2 className="text-xl font-semibold">Clinic Hours (Global)</h2>
        <p>
          Currently: <strong>{clinicOpenTime}</strong> to <strong>{clinicCloseTime}</strong>
        </p>

        <div className="flex items-center space-x-2">
          <input
            type="time"
            placeholder="Open Time"
            value={newOpenTime}
            onChange={(e) => setNewOpenTime(e.target.value)}
            className="border p-1"
          />
          <input
            type="time"
            placeholder="Close Time"
            value={newCloseTime}
            onChange={(e) => setNewCloseTime(e.target.value)}
            className="border p-1"
          />
          <Button
            onClick={() => {
              if (!newOpenTime || !newCloseTime) {
                alert("Please enter open & close times");
                return;
              }
              updateSchedulesMut.mutate({
                clinic_open_time: newOpenTime,
                clinic_close_time: newCloseTime,
              });
            }}
            isLoading={updateSchedulesMut.isLoading}
          >
            Update Clinic Hours
          </Button>
        </div>
      </section>

      {/* ------------------------------------- */}
      {/* 2) Closed Days Section */}
      <section className="bg-white p-4 rounded shadow space-y-4">
        <h2 className="text-xl font-semibold">Closed Days</h2>

        {/* Create new closed day form */}
        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={closedDate}
            onChange={(e) => setClosedDate(e.target.value)}
            className="border p-1"
          />
          <input
            type="text"
            placeholder="Reason (optional)"
            value={closedReason}
            onChange={(e) => setClosedReason(e.target.value)}
            className="border p-1"
          />
          <Button
            onClick={() => {
              if (!closedDate) {
                alert("Please choose a date");
                return;
              }
              createClosedDayMut.mutate({
                date: closedDate,
                reason: closedReason || undefined,
              });
            }}
            isLoading={createClosedDayMut.isLoading}
          >
            Add Closed Day
          </Button>
        </div>

        {/* Existing closed days list */}
        {(!closedDays || closedDays.length === 0) ? (
          <p className="text-gray-500">No closed days currently.</p>
        ) : (
          <ul className="space-y-2">
            {closedDays.map((cd: any) => (
              <li key={cd.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <div>
                  <strong>{cd.date}</strong>{' '}
                  {cd.reason && <span className="text-gray-600">({cd.reason})</span>}
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => deleteClosedDayMut.mutate(cd.id)}
                  isLoading={deleteClosedDayMut.isLoading}
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ------------------------------------- */}
      {/* 3) Dentist Availabilities */}
      <section className="bg-white p-4 rounded shadow space-y-4">
        <h2 className="text-xl font-semibold">Dentist Availabilities</h2>

        {/* (A) Create new availability form */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="number"
            placeholder="Dentist ID"
            value={selectedDentist}
            onChange={(e) => setSelectedDentist(e.target.value)}
            className="border p-1 w-24"
          />
          <select
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(e.target.value)}
            className="border p-1"
          >
            <option value="0">Sunday</option>
            <option value="1">Monday</option>
            <option value="2">Tuesday</option>
            <option value="3">Wednesday</option>
            <option value="4">Thursday</option>
            <option value="5">Friday</option>
            <option value="6">Saturday</option>
          </select>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            placeholder="Start Time"
            className="border p-1"
          />
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            placeholder="End Time"
            className="border p-1"
          />
          <Button
            onClick={() => {
              if (!selectedDentist || !startTime || !endTime) {
                alert("Please fill Dentist ID, start time, end time");
                return;
              }
              createAvailMut.mutate({
                dentist_id: Number(selectedDentist),
                day_of_week: Number(dayOfWeek),
                start_time: startTime,
                end_time: endTime
              });
            }}
            isLoading={createAvailMut.isLoading}
          >
            Add Availability
          </Button>
        </div>

        {/* (B) List existing availabilities */}
        {(!dentistAvailabilities || dentistAvailabilities.length === 0) ? (
          <p className="text-gray-500">No dentist availabilities found.</p>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">Dentist ID</th>
                  <th className="border p-2">Day</th>
                  <th className="border p-2">Start</th>
                  <th className="border p-2">End</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dentistAvailabilities.map((av: any) => (
                  <tr key={av.id}>
                    <td className="border p-2">{av.dentistId}</td>
                    <td className="border p-2">{dayOfWeekName(av.dayOfWeek)}</td>
                    <td className="border p-2">{av.startTime}</td>
                    <td className="border p-2">{av.endTime}</td>
                    <td className="border p-2">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => deleteAvailMut.mutate(av.id)}
                        isLoading={deleteAvailMut.isLoading}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

// A simple helper for day-of-week integer to string
function dayOfWeekName(d: number) {
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  return days[d] || `Day ${d}`;
}
