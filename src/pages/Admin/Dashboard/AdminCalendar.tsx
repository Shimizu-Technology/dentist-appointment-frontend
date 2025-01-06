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
  clinicOpenTime: string;  // e.g. "09:00"
  clinicCloseTime: string; // e.g. "17:00"
  openDays: number[];      // e.g. [1,2,3,4,5]
  closedDays?: any[];
  dentistUnavailabilities: any[];  // not used fully here
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

  // NEW: A piece of state for "searchDate" (YYYY-MM-DD)
  const [searchDate, setSearchDate] = useState('');

  /** 1) FETCH the Schedules data (openDays, open/close times, etc.) */
  const { data: scheduleData } = useQuery<SchedulesResponse>({
    queryKey: ['schedule-data'],
    queryFn: async () => {
      const res = await getSchedules();
      return res.data;
    },
  });

  /** 2) FETCH the list of Dentists (for the dropdown) */
  const { data: dentistData = [] } = useQuery<Dentist[]>({
    queryKey: ['dentists'],
    queryFn: async () => {
      const res = await getDentists();
      return res.data;
    },
  });

  /** 3) FETCH all Appointments (possibly filtered by dentist) */
  const { data: apptData, error: apptError } = useQuery<PaginatedAppointments>({
    queryKey: ['admin-appointments-for-calendar', selectedDentistId],
    queryFn: async () => {
      const dentistIdNum = selectedDentistId ? parseInt(selectedDentistId, 10) : undefined;
      const response = await getAppointments(1, 200, dentistIdNum);
      return response.data; // shape: { appointments, meta }
    },
  });

  /** 4) FETCH closed days so we can highlight them */
  const { data: closedData = [] } = useQuery<ClosedDay[]>({
    queryKey: ['closed-days'],
    queryFn: async () => {
      const res = await getClosedDays();
      return res.data;
    },
  });

  // Build up the “normal” events from appointments, filtering out CANCELLED if we want them hidden
  const appointments = apptData?.appointments || [];
  const activeAppointments = appointments.filter((appt) => appt.status !== 'cancelled');

  const events = activeAppointments.map((appt) => {
    const start = new Date(appt.appointmentTime);
    const dur = appt.appointmentType?.duration ?? 60;
    const end = new Date(start.getTime() + dur * 60_000);

    let backgroundColor = '#86efac'; // scheduled
    if (appt.status === 'completed') {
      backgroundColor = '#93c5fd'; // light blue
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

  // Also add “background event” for each closed day
  const closedEvents = closedData.map((cd) => ({
    start: cd.date, // treat as an all-day block
    end: cd.date,
    allDay: true,
    display: 'background',
    backgroundColor: '#d1d5db', // gray-300
    title: cd.reason || 'Closed Day',
    overlap: false,
  }));

  const allEvents = [...events, ...closedEvents];

  // ─────────────────────────────────────────────────────────────────
  //    FULLCALENDAR handlers
  // ─────────────────────────────────────────────────────────────────

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
    // If background event => closed day
    if (clickInfo.event.display === 'background') {
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
      // If background => revert
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
    // We do not support changing end times via drag-resize => revert
    resizeInfo.revert();
  }, []);

  if (apptError) {
    return (
      <div className="text-red-600 p-4">
        Failed to load appointments. Please try again later.
      </div>
    );
  }

  // If schedule not loaded, fall back to defaults
  const openDays = scheduleData?.openDays ?? [1, 2, 3, 4, 5];
  const openTime = scheduleData?.clinicOpenTime ?? '09:00';
  const closeTime = scheduleData?.clinicCloseTime ?? '17:00';

  // A little color dot for the legend
  function ColorDot({ color }: { color: string }) {
    return <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: color }} />;
  }

  // NEW: “Go to date” handler
  const handleGoToDate = (e: FormEvent) => {
    e.preventDefault();
    if (!searchDate) return;
    // e.g. "2025-06-05" => build a JS Date
    const parsed = new Date(searchDate);
    if (isNaN(parsed.getTime())) {
      alert(`Invalid date: ${searchDate}`);
      return;
    }
    // use FullCalendar's API
    calendarRef.current?.getApi().gotoDate(parsed);
  };

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
              <option key={d.id} value={d.id}>
                Dr. {d.firstName} {d.lastName}
              </option>
            ))}
          </select>
        </div>

        {/* NEW: “Go to Date” form */}
        <form onSubmit={handleGoToDate} className="flex items-center gap-2">
          <label className="font-medium text-gray-700">Go to date:</label>
          <input
            type="date"
            className="border px-3 py-2 rounded"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
          />
          <Button type="submit">
            Go
          </Button>
        </form>
      </div>

      {/* LEGEND */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <ColorDot color="#86efac" />
          <span>Scheduled</span>
        </div>
        <div className="flex items-center gap-1">
          <ColorDot color="#93c5fd" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1">
          <ColorDot color="#d1d5db" />
          <span>Closed Day</span>
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
        // Example: show from 6am - 9pm
        slotMinTime="06:00:00"
        slotMaxTime="21:00:00"
        slotDuration="00:15:00"
        snapDuration="00:15:00"
        displayEventTime
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
        height="auto"
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
