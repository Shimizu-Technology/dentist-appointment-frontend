// File: /src/pages/Admin/Dashboard/SchedulesList.tsx
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSchedules,
  updateSchedules,
  createClosedDay,
  deleteClosedDay,
  createDentistUnavailability,
  updateDentistUnavailability,
  deleteDentistUnavailability,
  getDentists,
} from '../../../lib/api';
import Button from '../../../components/UI/Button';
import { format, addDays } from 'date-fns';
import toast from 'react-hot-toast';

export default function SchedulesList() {
  const queryClient = useQueryClient();

  // 1) FETCH SCHEDULES
  const { data, isLoading, error } = useQuery({
    queryKey: ['schedules'],
    queryFn: async () => {
      const res = await getSchedules();
      return res.data;
    },
  });

  // Also fetch Dentists so we can show them in a dropdown
  const {
    data: dentistList = [],
    isLoading: dentistLoading,
    error: dentistError,
  } = useQuery({
    queryKey: ['all-dentists'],
    queryFn: async () => {
      const res = await getDentists();
      return res.data;
    },
  });

  // ----------------------------------------------------------------
  // 2) CLINIC HOURS + OPEN DAYS
  // ----------------------------------------------------------------
  const [newOpenTime, setNewOpenTime] = useState('');
  const [newCloseTime, setNewCloseTime] = useState('');
  // We'll store openDays as a set of numbers {0,1,2,3,4,5,6}
  const [openDays, setOpenDays] = useState<Set<number>>(new Set([1,2,3,4,5]));

  // Once data loads, initialize state with existing values
  useEffect(() => {
    if (data) {
      setNewOpenTime(data.clinicOpenTime || '');
      setNewCloseTime(data.clinicCloseTime || '');
      if (Array.isArray(data.openDays)) {
        setOpenDays(new Set(data.openDays)); 
      }
    }
  }, [data]);

  const updateSchedulesMut = useMutation({
    mutationFn: (payload: {
      clinic_open_time: string;
      clinic_close_time: string;
      open_days: number[];
    }) => updateSchedules(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['schedules']);
      toast.success('Clinic schedule updated!');
    },
    onError: (err: any) => {
      toast.error(`Failed to update clinic hours: ${err.message}`);
    },
  });

  function handleToggleDay(day: number) {
    // If day is in the set, remove it; else add it
    setOpenDays(prev => {
      const copy = new Set(prev);
      if (copy.has(day)) copy.delete(day);
      else copy.add(day);
      return copy;
    });
  }

  // ----------------------------------------------------------------
  // 3) CLOSED DAYS: SINGLE + MULTI-DAY
  // ----------------------------------------------------------------
  const [closedDate, setClosedDate] = useState('');
  const [closedReason, setClosedReason] = useState('');
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');

  const createClosedDayMut = useMutation({
    mutationFn: (payload: { date: string; reason?: string }) => createClosedDay(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['schedules']);
      toast.success('Closed day added!');
    },
    onError: (err: any) => {
      toast.error(`Failed to create closed day: ${err.message}`);
    },
  });

  const deleteClosedDayMut = useMutation({
    mutationFn: (id: number) => deleteClosedDay(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['schedules']);
      toast.success('Closed day deleted!');
    },
    onError: (err: any) => {
      toast.error(`Failed to delete closed day: ${err.message}`);
    },
  });

  function handleAddClosedDay() {
    if (!closedDate) {
      toast.error('Please choose a date');
      return;
    }
    createClosedDayMut.mutate({
      date: closedDate,
      reason: closedReason || undefined,
    });
    setClosedDate('');
    setClosedReason('');
  }

  async function handleAddClosedDayRange() {
    if (!rangeStart || !rangeEnd) {
      toast.error('Please pick a start and end date');
      return;
    }
    const start = new Date(rangeStart);
    const end = new Date(rangeEnd);

    if (start > end) {
      toast.error('Start date must be <= End date');
      return;
    }

    // Loop from start to end, day by day
    let curr = start;
    while (curr <= end) {
      const dateStr = format(curr, 'yyyy-MM-dd');
      await createClosedDayMut.mutateAsync({
        date: dateStr,
        reason: closedReason || undefined
      });
      curr = addDays(curr, 1);
    }

    // Clear form
    setRangeStart('');
    setRangeEnd('');
    setClosedReason('');
  }

  // ----------------------------------------------------------------
  // 4) DENTIST UNAVAILABILITIES - CREATE
  // ----------------------------------------------------------------
  const [selectedDentist, setSelectedDentist] = useState('');
  const [dayOfWeek /* now unused in this approach */, setDayOfWeek] = useState('1');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [dateString, setDateString] = useState(''); // if you want a date instead of dayOfWeek

  const createAvailMut = useMutation({
    mutationFn: (payload: {
      dentist_id: number;
      date: string;        // "YYYY-MM-DD"
      start_time: string;  // "HH:mm"
      end_time: string;    // "HH:mm"
    }) => createDentistUnavailability(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['schedules']);
      toast.success('Dentist unavailability created!');
    },
    onError: (err: any) => {
      toast.error(`Failed to create dentist availability: ${err.message}`);
    },
  });

  function handleAddAvailability() {
    if (!selectedDentist || !dateString || !startTime || !endTime) {
      toast.error('Please select a dentist, date & start/end times');
      return;
    }
    createAvailMut.mutate({
      dentist_id: parseInt(selectedDentist, 10),
      date: dateString,
      start_time: startTime,
      end_time: endTime,
    });
    setSelectedDentist('');
    setDayOfWeek('1');
    setDateString('');
    setStartTime('');
    setEndTime('');
  }

  // ----------------------------------------------------------------
  // 5) DENTIST UNAVAILABILITIES - EDIT (Modal)
  // ----------------------------------------------------------------
  const [editAvailModalOpen, setEditAvailModalOpen] = useState(false);
  const [editingAvail, setEditingAvail] = useState<{
    id: number;
    dentist_id: number;
    date: string;       // "YYYY-MM-DD"
    start_time: string; // "HH:mm"
    end_time: string;   // "HH:mm"
  } | null>(null);

  function handleEditClick(av: any) {
    setEditingAvail({
      id: av.id,
      dentist_id: av.dentistId,
      date: av.date,
      start_time: av.startTime,
      end_time: av.endTime,
    });
    setEditAvailModalOpen(true);
  }

  const updateAvailMut = useMutation({
    mutationFn: (payload: {
      id: number;
      date: string;
      start_time: string;
      end_time: string;
    }) => updateDentistUnavailability(payload.id, {
      date: payload.date,
      start_time: payload.start_time,
      end_time: payload.end_time,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['schedules']);
      setEditAvailModalOpen(false);
      setEditingAvail(null);
      toast.success('Dentist unavailability updated!');
    },
    onError: (err: any) => {
      toast.error(`Failed to update availability: ${err.message}`);
    },
  });

  function handleEditSubmit() {
    if (!editingAvail) return;
    updateAvailMut.mutate({
      id: editingAvail.id,
      date: editingAvail.date,
      start_time: editingAvail.start_time,
      end_time: editingAvail.end_time,
    });
  }

  // ----------------------------------------------------------------
  // 6) DENTIST UNAVAILABILITIES - DELETE
  // ----------------------------------------------------------------
  const deleteAvailMut = useMutation({
    mutationFn: (id: number) => deleteDentistUnavailability(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['schedules']);
      toast.success('Dentist unavailability deleted!');
    },
    onError: (err: any) => {
      toast.error(`Failed to delete availability: ${err.message}`);
    },
  });

  // ----------------------------------------------------------------
  // 7) RENDER LOADING/ERROR STATES
  // ----------------------------------------------------------------
  if (isLoading) return <div>Loading schedules...</div>;
  if (error) return <div className="text-red-600">Error loading schedules.</div>;
  if (!data) return null;

  // *** KEY CHANGE: We destructure "dentistUnavailabilities" instead of "dentistAvailabilities" ***
  const { 
    closedDays = [],
    dentistUnavailabilities = [],
  } = data;

  // Helper: find dentist name
  function dentistName(dentistId: number) {
    const d = dentistList.find((doc: any) => doc.id === dentistId);
    if (!d) return `Dentist #${dentistId}`;
    return `Dr. ${d.firstName} ${d.lastName}`;
  }

  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  // ----------------------------------------------------------------
  // UI RETURN
  // ----------------------------------------------------------------
  return (
    <div className="space-y-8">
      {/* CLINIC HOURS + OPEN DAYS */}
      <section className="bg-white p-4 rounded shadow space-y-4">
        <h2 className="text-xl font-semibold">Clinic Hours (Global)</h2>
        <p>
          Currently: <strong>{data.clinicOpenTime}</strong> to <strong>{data.clinicCloseTime}</strong>
        </p>

        {/* Open/Close Time */}
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
        </div>

        {/* Open Days checkboxes */}
        <div className="mt-2">
          <p className="font-medium">Clinic Open Days:</p>
          <div className="flex flex-wrap gap-3 mt-1">
            {dayNames.map((dn, index) => {
              const checked = openDays.has(index);
              return (
                <label key={index} className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggleDay(index)}
                  />
                  <span>{dn}</span>
                </label>
              );
            })}
          </div>
        </div>

        <Button
          onClick={() => {
            if (!newOpenTime || !newCloseTime) {
              toast.error('Please enter open & close times');
              return;
            }
            updateSchedulesMut.mutate({
              clinic_open_time: newOpenTime,
              clinic_close_time: newCloseTime,
              open_days: Array.from(openDays), // convert Set to array
            });
          }}
          isLoading={updateSchedulesMut.isLoading}
        >
          Update Clinic Hours
        </Button>
      </section>

      {/* CLOSED DAYS */}
      <section className="bg-white p-4 rounded shadow space-y-4">
        <h2 className="text-xl font-semibold">Closed Days</h2>

        {/* Single-day */}
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
            onClick={handleAddClosedDay}
            isLoading={createClosedDayMut.isLoading}
          >
            Add Single Closed Day
          </Button>
        </div>

        {/* Multi-day range */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-col">
            <label className="text-sm font-medium">Range Start</label>
            <input
              type="date"
              value={rangeStart}
              onChange={(e) => setRangeStart(e.target.value)}
              className="border p-1"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium">Range End</label>
            <input
              type="date"
              value={rangeEnd}
              onChange={(e) => setRangeEnd(e.target.value)}
              className="border p-1"
            />
          </div>
          <Button
            onClick={handleAddClosedDayRange}
            isLoading={createClosedDayMut.isLoading}
          >
            Add Range of Closed Days
          </Button>
        </div>

        {(!closedDays || closedDays.length === 0) ? (
          <p className="text-gray-500">No closed days currently.</p>
        ) : (
          <ul className="space-y-2">
            {closedDays.map((cd: any) => (
              <li
                key={cd.id}
                className="flex items-center justify-between bg-gray-50 p-2 rounded"
              >
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

      {/* DENTIST “UNAVAILABILITIES” (the code calls it Availabilities, but they are the blocks) */}
      <section className="bg-white p-4 rounded shadow space-y-4">
        <h2 className="text-xl font-semibold">Dentist Unavailabilities</h2>
        {/* CREATE form */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedDentist}
            onChange={(e) => setSelectedDentist(e.target.value)}
            className="border p-1 w-52"
          >
            <option value="">Select Dentist</option>
            {dentistList.map((d: any) => (
              <option key={d.id} value={d.id}>
                Dr. {d.firstName} {d.lastName}
              </option>
            ))}
          </select>
          {/* If you want a date-based approach: */}
          <input
            type="date"
            value={dateString}
            onChange={(e) => setDateString(e.target.value)}
            className="border p-1"
          />
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
            onClick={handleAddAvailability}
            isLoading={createAvailMut.isLoading}
          >
            Add Unavailability
          </Button>
        </div>

        {/* TABLE of existing unavailabilities */}
        {(!dentistUnavailabilities || dentistUnavailabilities.length === 0) ? (
          <p className="text-gray-500">No dentist unavailabilities found.</p>
        ) : (
          <div className="overflow-auto">
            <table className="table-auto w-full text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2 text-left">Dentist</th>
                  <th className="border px-4 py-2 text-center">Date</th>
                  <th className="border px-4 py-2 text-center">Start</th>
                  <th className="border px-4 py-2 text-center">End</th>
                  <th className="border px-4 py-2 text-center" style={{ width: '220px' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {dentistUnavailabilities.map((av: any) => (
                  <tr key={av.id}>
                    <td className="border px-4 py-2">{dentistName(av.dentistId)}</td>
                    <td className="border px-4 py-2 text-center">{av.date}</td>
                    <td className="border px-4 py-2 text-center">{av.startTime}</td>
                    <td className="border px-4 py-2 text-center">{av.endTime}</td>
                    <td className="border px-4 py-2 text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(av)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => deleteAvailMut.mutate(av.id)}
                          isLoading={deleteAvailMut.isLoading}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* EDIT AVAILABILITY MODAL */}
      {editAvailModalOpen && editingAvail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-semibold mb-4">Edit Availability</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dentist
              </label>
              <input
                type="text"
                readOnly
                className="border p-2 w-full bg-gray-100"
                value={dentistName(editingAvail.dentist_id)}
              />
            </div>

            {/* date */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                className="border p-2 w-full"
                value={editingAvail.date}
                onChange={(e) =>
                  setEditingAvail((old) =>
                    old ? { ...old, date: e.target.value } : null
                  )
                }
              />
            </div>

            {/* start_time */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                className="border p-2 w-full"
                value={editingAvail.start_time}
                onChange={(e) =>
                  setEditingAvail((old) =>
                    old ? { ...old, start_time: e.target.value } : null
                  )
                }
              />
            </div>

            {/* end_time */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                className="border p-2 w-full"
                value={editingAvail.end_time}
                onChange={(e) =>
                  setEditingAvail((old) =>
                    old ? { ...old, end_time: e.target.value } : null
                  )
                }
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button variant="secondary" onClick={() => setEditAvailModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                isLoading={updateAvailMut.isLoading}
                onClick={handleEditSubmit}
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
