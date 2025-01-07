// File: /src/pages/Admin/Dashboard/AdminCalendar.tsx

import { useRef, useState, useCallback, FormEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, {
  DateClickArg,
  EventClickArg,
  EventDropArg,
  EventResizeDoneArg,
  SelectArg,
} from '@fullcalendar/interaction';

import {
  getAppointments,
  getDentists,
  getSchedules,
  getClosedDays,
  updateAppointment,
} from '../../../lib/api';
import type { Appointment, Dentist, ClosedDay } from '../../../types';
import AdminAppointmentModal from './AdminAppointmentModal';
import Button from '../../../components/UI/Button';
import toast from 'react-hot-toast';

interface PaginatedAppointments {
  appointments: Appointment[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    perPage: number;
  };
}

/** The shape of your schedule response. Adjust if needed. */
interface SchedulesResponse {
  clinicOpenTime: string;   // e.g. "09:00"
  clinicCloseTime: string;  // e.g. "17:00"
  openDays: number[];       // e.g. [1,2,3,4,5]
  closedDays?: any[];
  dentistUnavailabilities?: any[];
}

export default function AdminCalendar() {
  const queryClient = useQueryClient();
  const calendarRef = useRef<FullCalendar>(null);

  // For filtering by dentist
  const [selectedDentistId, setSelectedDentistId] = useState<string>('');

  // For the appointment modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [createDate, setCreateDate] = useState<Date | null>(null);

  // “Go to date” feature
  const [searchDate, setSearchDate] = useState('');

  // 1) FETCH Schedules data
  const { data: scheduleData } = useQuery<SchedulesResponse>({
    queryKey: ['schedule-data'],
    queryFn: async () => {
      const res = await getSchedules();
      return res.data;
    },
  });

  // 2) FETCH Dentists for the dropdown
  const { data: dentistData = [] } = useQuery<Dentist[]>({
    queryKey: ['dentists'],
    queryFn: async () => {
      const res = await getDentists();
      return res.data;
    },
  });

  // 3) FETCH appointments (with or without dentist filter)
  const { data: apptData, error: apptError } = useQuery<PaginatedAppointments>({
    queryKey: ['admin-appointments-for-calendar', selectedDentistId],
    queryFn: async () => {
      const dentistIdNum = selectedDentistId ? parseInt(selectedDentistId, 10) : undefined;
      // Request a large number of appointments so they all display in the calendar
      const response = await getAppointments(1, 300, dentistIdNum);
      return response.data; // shape: { appointments: [...], meta: {...} }
    },
  });

  // 4) FETCH closed days (so we can highlight them in the calendar)
  const { data: closedData = [] } = useQuery<ClosedDay[]>({
    queryKey: ['closed-days'],
    queryFn: async () => {
      const res = await getClosedDays();
      return res.data;
    },
  });

  // Build the events from appointments:
  const appointments = apptData?.appointments || [];
  // If you only want to see “non-cancelled,” you could filter, but typically
  // you might want to see them all. Let’s show them all for now:
  const events = appointments.map((appt) => {
    const start = new Date(appt.appointmentTime);
    // If you store a duration in the appointment_type, we can compute an end:
    const dur = appt.appointmentType?.duration ?? 60;
    const end = new Date(start.getTime() + dur * 60_000);

    // Pick a color based on status:
    let backgroundColor = '#86efac'; // default for "scheduled"
    if (appt.status === 'completed') {
      backgroundColor = '#93c5fd'; // light blue
    } else if (appt.status === 'cancelled') {
      backgroundColor = '#fca5a5'; // light red
    }

    // Possibly highlight “checkedIn”
    if (appt.checkedIn) {
      backgroundColor = '#fcd34d'; // gold, for example
    }

    return {
      id: String(appt.id),
      title: appt.appointmentType?.name
        ? `${appt.appointmentType.name} (#${appt.id})`
        : `Appt #${appt.id}`,
      start,
      end,
      backgroundColor,
      borderColor: backgroundColor,
      extendedProps: { appointment: appt },
    };
  });

  // Build “background events” for closed days
  const closedEvents = closedData.map((cd) => ({
    start: cd.date,
    end: cd.date,
    allDay: true,
    display: 'background',
    backgroundColor: '#d1d5db', // gray-300
    title: cd.reason || 'Closed Day',
    overlap: false,
  }));

  const allEvents = [...events, ...closedEvents];

  // FULLCALENDAR handlers
  const handleSelect = useCallback((selectInfo: SelectArg) => {
    setEditingAppointment(null);
    setCreateDate(selectInfo.start);
    setIsModalOpen(true);
  }, []);

  const handleDateClick = useCallback((arg: DateClickArg) => {
    setEditingAppointment(null);
    setCreateDate(arg.date);
    setIsModalOpen(true);
  }, []);

  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    if (clickInfo.event.display === 'background') {
      // That’s a closed-day background event
      return;
    }
    const appt = clickInfo.event.extendedProps.appointment as Appointment;
    if (appt) {
      setEditingAppointment(appt);
      setCreateDate(null);
      setIsModalOpen(true);
    }
  }, []);

  const handleEventDrop = useCallback(
    async (dropInfo: EventDropArg) => {
      if (dropInfo.event.display === 'background') {
        dropInfo.revert();
        return;
      }
      const { event } = dropInfo;
      const appt = event.extendedProps.appointment as Appointment;
      if (!appt || !event.start) {
        dropInfo.revert();
        return;
      }
      const yes = window.confirm(
        `Move appointment #${appt.id} to ${event.start.toLocaleString()}?`
      );
      if (!yes) {
        dropInfo.revert();
        return;
      }
      try {
        await updateAppointment(appt.id, {
          appointment_time: event.start.toISOString(),
        });
        queryClient.invalidateQueries(['admin-appointments-for-calendar', selectedDentistId]);
      } catch (err: any) {
        toast.error('Could not reschedule appointment.');
        dropInfo.revert();
      }
    },
    [queryClient, selectedDentistId]
  );

  const handleEventResize = useCallback((resizeInfo: EventResizeDoneArg) => {
    // Not supporting changing end time via drag-resize => revert
    resizeInfo.revert();
  }, []);

  // If we got an error from the appointments query
  if (apptError) {
    return (
      <div className="text-red-600 p-4">
        Failed to load appointments. Please try again later.
      </div>
    );
  }

  const openDays = scheduleData?.openDays ?? [1, 2, 3, 4, 5];
  const openTime = scheduleData?.clinicOpenTime ?? '09:00';
  const closeTime = scheduleData?.clinicCloseTime ?? '17:00';

  // “Go to date” handler
  function handleGoToDate(e: FormEvent) {
    e.preventDefault();
    if (!searchDate) return;
    const parsed = new Date(searchDate);
    if (isNaN(parsed.getTime())) {
      alert(`Invalid date: ${searchDate}`);
      return;
    }
    calendarRef.current?.getApi().gotoDate(parsed);
  }

  return (
    <div className="space-y-6">
      {/* TOP BAR: Dentist filter, date search, legend, etc. */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Dentist Filter */}
        <div className="flex items-center gap-2">
          <label className="font-medium text-gray-700">Filter by Dentist:</label>
          <select
            className="border px-3 py-2 rounded"
            value={selectedDentistId}
            onChange={(e) => setSelectedDentistId(e.target.value)}
          >
            <option value="">All Dentists</option>
            {dentistData.map((d) => (
              <option key={d.id} value={String(d.id)}>
                Dr. {d.firstName} {d.lastName}
              </option>
            ))}
          </select>
        </div>

        {/* “Go to Date” form */}
        <form onSubmit={handleGoToDate} className="flex items-center gap-2">
          <label className="font-medium text-gray-700">Go to date:</label>
          <input
            type="date"
            className="border px-3 py-2 rounded"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
          />
          <Button type="submit">Go</Button>
        </form>
      </div>

      {/* LEGEND */}
      <div className="flex items-center gap-6 flex-wrap text-sm mt-2">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#86efac' }} />
          Scheduled
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#93c5fd' }} />
          Completed
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#fca5a5' }} />
          Cancelled
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#fcd34d' }} />
          Checked In
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-gray-300" />
          Closed Day
        </div>
      </div>

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        selectable
        select={handleSelect}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        editable
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
        // Show from 7am - 7pm for example
        slotMinTime="07:00:00"
        slotMaxTime="19:00:00"
        slotDuration="00:15:00"
        snapDuration="00:15:00"
        displayEventTime
        height="auto"
        headerToolbar={{
          left: 'prev,today,next',
          center: 'title',
          right: 'timeGridWeek,dayGridMonth',
        }}
        businessHours={{
          daysOfWeek: openDays,
          startTime: openTime,
          endTime: closeTime,
        }}
        events={allEvents}
      />

      {/* AdminAppointmentModal => create/update appointment */}
      <AdminAppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingAppointment={editingAppointment}
        defaultDate={createDate}
      />
    </div>
  );
}
