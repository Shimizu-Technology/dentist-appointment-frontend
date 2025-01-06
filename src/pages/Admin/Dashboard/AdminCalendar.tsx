// File: /src/pages/Admin/Dashboard/AdminCalendar.tsx

import { useRef, useState, useCallback } from 'react';
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
  openDays: number[];       // e.g. [0,1,2,3,4,5,6] or [1,2,3,4,5]
  closedDays?: any[];       // not strictly needed; we fetch them separately
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

  /** 1) FETCH the Schedules data (to get openDays, open/close times) */
  const { data: scheduleData } = useQuery<SchedulesResponse>({
    queryKey: ['schedule-data'],
    queryFn: async () => {
      const res = await getSchedules(); // GET /schedule
      return res.data;                 // { clinicOpenTime, clinicCloseTime, openDays, ... }
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
      // Convert selectedDentistId to a number if set, else show all
      const dentistIdNum = selectedDentistId ? parseInt(selectedDentistId, 10) : undefined;
      const response = await getAppointments(1, 200, dentistIdNum);
      return response.data; // shape: { appointments: [...], meta: {...} }
    },
  });

  /** 4) FETCH closed days so we can highlight them in gray */
  const { data: closedData = [] } = useQuery<ClosedDay[]>({
    queryKey: ['closed-days'],
    queryFn: async () => {
      const res = await getClosedDays();
      return res.data; // e.g. [{ id, date: "2025-01-10", reason: "Holiday" }, ...]
    },
  });

  // Build up the “normal” events from your appointments
  const appointments = apptData?.appointments || [];
  const events = appointments.map((appt) => {
    const start = new Date(appt.appointmentTime);
    // The duration from appt type, default 60 if missing
    const dur = appt.appointmentType?.duration ?? 60;
    const end = new Date(start.getTime() + dur * 60_000);

    // NEW, more tailored color palette for status:
    let backgroundColor = '#7dd3fc'; // "Scheduled" => a nice Tailwind blue-300
    if (appt.status === 'cancelled') {
      backgroundColor = '#f87171'; // Red-400
    } else if (appt.status === 'completed') {
      backgroundColor = '#4ade80'; // Green-400
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

  // Also add a “background event” for each closed day
  const closedEvents = closedData.map((cd) => ({
    // If date is "2025-01-15", treat it as an all-day block
    start: cd.date, // "YYYY-MM-DD"
    end: cd.date,
    allDay: true,
    display: 'background',
    // A lighter gray for closed blocks
    backgroundColor: '#e2e8f0', // Tailwind gray-200
    title: cd.reason || 'Closed Day',
    overlap: false, // so it won't overlap with appt events
  }));

  // Combine them
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
    if (clickInfo.event.display === 'background') {
      // That means user clicked a closed-day block => ignore or show a message
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
      // If background event => revert
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
      // Confirm with user
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
        toast.success(`Appointment #${appt.id} updated!`);
      } catch (err: any) {
        toast.error('Could not reschedule appointment.');
        dropInfo.revert();
      }
    },
    [queryClient, selectedDentistId]
  );

  const handleEventResize = useCallback((resizeInfo: EventResizeDoneArg) => {
    // If you want resizing to update the apt endTime => do so. Otherwise revert.
    resizeInfo.revert();
  }, []);

  // ─────────────────────────────────────────────────────────────────
  //    RENDER
  // ─────────────────────────────────────────────────────────────────
  if (apptError) {
    return (
      <div className="text-red-600 p-4">
        Failed to load appointments. Please try again later.
      </div>
    );
  }

  // Convenience: If the schedule hasn't loaded yet, default to Monday..Friday 09:00..17:00
  const openDays = scheduleData?.openDays ?? [1, 2, 3, 4, 5]; // Mon-Fri
  const openTime = scheduleData?.clinicOpenTime ?? '09:00';
  const closeTime = scheduleData?.clinicCloseTime ?? '17:00';

  // Little color dot for the legend
  function ColorDot({ color }: { color: string }) {
    return <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: color }} />;
  }

  return (
    <div className="space-y-4">
      {/* DENTIST FILTER */}
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

      {/* LEGEND */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <ColorDot color="#7dd3fc" />
          <span>Scheduled</span>
        </div>
        <div className="flex items-center gap-1">
          <ColorDot color="#f87171" />
          <span>Cancelled</span>
        </div>
        <div className="flex items-center gap-1">
          <ColorDot color="#4ade80" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1">
          <ColorDot color="#e2e8f0" />
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
        slotDuration="00:15:00"
        snapDuration="00:30:00"
        slotMinTime="08:00:00"
        slotMaxTime="21:00:00"
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
        displayEventTime
        events={allEvents}
        height="auto"
      />

      <AdminAppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingAppointment={editingAppointment}
        defaultDate={createDate}
      />
    </div>
  );
}
