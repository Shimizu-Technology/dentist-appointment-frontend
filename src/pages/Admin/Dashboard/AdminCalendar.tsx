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
  getClosedDays,
  updateAppointment,
} from '../../../lib/api';
import type { Appointment, Dentist, ClosedDay } from '../../../types';
import AdminAppointmentModal from './AdminAppointmentModal';
import Button from '../../../components/UI/Button';

function snapTo15(durationInMin: number) {
  // Round to nearest 15 min
  const remainder = durationInMin % 15;
  return remainder === 0 ? durationInMin : durationInMin + (15 - remainder);
}

interface PaginatedAppointments {
  appointments: Appointment[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    perPage: number;
  };
}

export default function AdminCalendar() {
  const calendarRef = useRef<FullCalendar>(null);
  const queryClient = useQueryClient();

  const [selectedDentistId, setSelectedDentistId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [createDate, setCreateDate] = useState<Date | null>(null);

  // 1) Fetch dentist list for the filter dropdown
  const { data: dentistData = [] } = useQuery<Dentist[]>({
    queryKey: ['dentists'],
    queryFn: async () => {
      const res = await getDentists();
      return res.data;
    },
  });

  // 2) Fetch appointments (filtered by dentist if `selectedDentistId` is set)
  const { data, error } = useQuery<PaginatedAppointments>({
    queryKey: ['admin-appointments-for-calendar', selectedDentistId],
    queryFn: async () => {
      // If empty, means “all dentists”
      const response = await getAppointments(1, 300, selectedDentistId ? +selectedDentistId : undefined);
      return response.data;
    },
  });

  // 3) Fetch closed days to mark them on the calendar as “gray” background
  const { data: closedData } = useQuery<ClosedDay[]>({
    queryKey: ['closedDays'],
    queryFn: async () => {
      const res = await getClosedDays();
      return res.data; // array of { id, date, reason? }
    },
  });

  const appointments = data?.appointments || [];
  const closedDays = closedData || [];

  // Convert appointments => calendar events
  const apptEvents = appointments.map((appt) => {
    const start = new Date(appt.appointmentTime);
    // Snap to 15-minute increments for the event’s *end* time
    const rawDuration = appt.appointmentType?.duration ?? 60;
    const snapped = snapTo15(rawDuration);
    const end = new Date(start.getTime() + snapped * 60000);

    let backgroundColor = '#86efac'; // default green (scheduled)
    if (appt.status === 'cancelled') {
      backgroundColor = '#fca5a5'; // red
    } else if (appt.status === 'completed') {
      backgroundColor = '#93c5fd'; // blue (example for completed)
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

  // Convert closedDays => background events (all-day, gray)
  const closedEvents = closedDays.map((cd) => ({
    start: cd.date,         // "YYYY-MM-DD"
    end: cd.date,           // same day => effectively an all-day
    overlap: false,
    display: 'background',  // means it shows a background highlight
    allDay: true,
    backgroundColor: '#d1d5db', // gray-300
    // You can optionally add a "title" if you want it to say "Closed" on that day
    title: cd.reason || 'Closed Day',
  }));

  // Combine both sets of events
  const events = [...apptEvents, ...closedEvents];

  // ───────────── FULLCALENDAR HANDLERS ─────────────
  const handleSelect = useCallback((info: SelectArg) => {
    setEditingAppointment(null);
    setCreateDate(info.start);
    setIsModalOpen(true);
  }, []);

  const handleDateClick = useCallback((arg: DateClickArg) => {
    setEditingAppointment(null);
    setCreateDate(arg.date);
    setIsModalOpen(true);
  }, []);

  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    // If it's a background event (closed day), ignore or handle differently
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
      const { event } = dropInfo;
      if (event.display === 'background') {
        // Probably was a closed-day background event => revert
        dropInfo.revert();
        return;
      }
      const newStart = event.start;
      const oldAppt = event.extendedProps.appointment as Appointment;

      if (!oldAppt || !newStart) {
        dropInfo.revert();
        return;
      }

      // Confirm with user
      const yes = window.confirm(
        `Move appointment #${oldAppt.id} to ${newStart.toLocaleString()}?`
      );
      if (!yes) {
        dropInfo.revert();
        return;
      }

      try {
        // Attempt to patch the appointment
        await updateAppointment(oldAppt.id, {
          appointment_time: newStart.toISOString(),
        });
        // Refresh
        queryClient.invalidateQueries(['admin-appointments-for-calendar', selectedDentistId]);
      } catch (err: any) {
        if (err.response?.data?.errors) {
          alert(`Could not reschedule: ${err.response.data.errors.join(' ')}`);
        } else {
          alert(`Could not reschedule due to a server error. Please try again.`);
        }
        dropInfo.revert();
      }
    },
    [queryClient, selectedDentistId]
  );

  const handleEventResize = useCallback((resizeInfo: EventResizeDoneArg) => {
    // If you want resizing to patch the appointment’s new start/end, do so here.
    // For now, we revert any resizing:
    resizeInfo.revert();
  }, []);

  // ───────────── RENDER ─────────────
  if (error) {
    return (
      <div className="p-4 text-red-600">
        Failed to load appointments. Please try again later.
      </div>
    );
  }

  // Helper for the legend color dot
  function ColorDot({ color }: { color: string }) {
    return (
      <span
        className="inline-block w-3 h-3 rounded-full"
        style={{ backgroundColor: color }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* DENTIST FILTER */}
      <div className="flex items-center space-x-3">
        <label className="font-medium text-gray-700">Filter by Dentist:</label>
        <select
          className="border rounded-md px-3 py-2"
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
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <ColorDot color="#86efac" />
          <span>Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <ColorDot color="#fca5a5" />
          <span>Cancelled</span>
        </div>
        <div className="flex items-center gap-2">
          <ColorDot color="#93c5fd" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: '#d1d5db' }}
          />
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
        slotDuration="00:15:00"            // how large each “slot” is
        slotLabelInterval="00:30:00"
        snapDuration="00:15:00"
        // Set visible times on the calendar (7 AM -> 10 PM, for example)
        slotMinTime="07:00:00"
        slotMaxTime="22:00:00"
        headerToolbar={{
          left: 'prev,today,next',
          center: 'title',
          right: 'timeGridWeek,dayGridMonth',
        }}
        // businessHours: which days and times are “open” (shown in a lighter color)
        // The “off” times will appear slightly grayed out.
        businessHours={{
          daysOfWeek: [1, 2, 3, 4, 5],   // Monday=1..Friday=5
          startTime: '09:00',           // or from your scheduleData
          endTime: '17:00',
        }}
        // Display the "businessHours" shading
        displayEventTime
        events={events}
        height="auto"
      />

      {/* Appointment Modal (create/edit) */}
      <AdminAppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingAppointment={editingAppointment}
        defaultDate={createDate}
      />
    </div>
  );
}
