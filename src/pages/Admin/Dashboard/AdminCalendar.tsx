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

import { getAppointments, updateAppointment } from '../../../lib/api';
import type { Appointment } from '../../../types';
import AdminAppointmentModal from './AdminAppointmentModal';

/** 
 * Matches how your backend returns appointments in a paginated response:
 * {
 *   appointments: [...],
 *   meta: { currentPage, totalPages, ... }
 * }
 */
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

  // Control the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  // In “create” mode, we store the date/time that the admin clicked or selected
  // so we can pre-fill the form
  const [createDate, setCreateDate] = useState<Date | null>(null);

  // Fetch a large chunk of appointments
  const { data, isLoading, error } = useQuery<PaginatedAppointments>({
    queryKey: ['admin-appointments-for-calendar'],
    queryFn: async () => {
      // For demonstration, fetch 200 appointments on one page
      const response = await getAppointments(1, 200);
      return response.data;
    },
  });

  // Convert each Appointment to a FullCalendar event
  const appointments = data?.appointments || [];
  const events = appointments.map((appt) => {
    const start = new Date(appt.appointmentTime);
    // If you have a known duration, compute end. For now, assume +1 hour:
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    return {
      id: String(appt.id),
      title: appt.appointmentType?.name
        ? `${appt.appointmentType.name} (#${appt.id})`
        : `Appointment #${appt.id}`,
      start,
      end,
      // Store entire Appointment in extendedProps
      extendedProps: { appointment: appt },
    };
  });

  // ──────────────────────────────────────────────────────────────────────────
  // FULLCALENDAR EVENT HANDLERS
  // ──────────────────────────────────────────────────────────────────────────

  // Called when user drags or clicks an empty slot (if `selectable=true`)
  const handleSelect = useCallback((info: SelectArg) => {
    setEditingAppointment(null);        // New appointment, no existing data
    setCreateDate(info.start);          // Start date/time
    setIsModalOpen(true);
    // info.view.calendar.unselect() if you want to remove highlight
  }, []);

  // Called when user single-clicks an empty slot (if `dateClick` is used).
  // If you prefer only drag-select, you can remove this or replicate logic:
  const handleDateClick = useCallback((arg: DateClickArg) => {
    setEditingAppointment(null);
    setCreateDate(arg.date);
    setIsModalOpen(true);
  }, []);

  // Called when user clicks on an existing event
  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    const appt = clickInfo.event.extendedProps.appointment as Appointment;
    if (appt) {
      setEditingAppointment(appt);
      setCreateDate(null);
      setIsModalOpen(true);
    }
  }, []);

  // Called when user drags an existing event to a new time
  const handleEventDrop = useCallback(
    async (dropInfo: EventDropArg) => {
      const { event } = dropInfo;
      const newStart = event.start;
      const oldAppt = event.extendedProps.appointment as Appointment;
      if (!oldAppt || !newStart) {
        dropInfo.revert();
        return;
      }
      const confirmMove = window.confirm(
        `Move appointment #${oldAppt.id} to ${newStart.toLocaleString()}?`
      );
      if (!confirmMove) {
        dropInfo.revert();
        return;
      }
      try {
        await updateAppointment(oldAppt.id, {
          appointment_time: newStart.toISOString(),
        });
        queryClient.invalidateQueries(['admin-appointments-for-calendar']);
      } catch (err) {
        alert('Failed to update on server. Reverting...');
        dropInfo.revert();
      }
    },
    [queryClient]
  );

  // Called if you allow event resizing from the bottom edge
  const handleEventResize = useCallback((resizeInfo: EventResizeDoneArg) => {
    // Example: revert always. Or handle similarly to handleEventDrop
    resizeInfo.revert();
  }, []);

  // Basic loading/error states
  if (isLoading) return <div className="py-6 text-center">Loading calendar...</div>;
  if (error) return <div className="py-6 text-red-600 text-center">Failed to load appointments.</div>;

  // Optional: date nav
  const goNext = () => calendarRef.current?.getApi().next();
  const goPrev = () => calendarRef.current?.getApi().prev();

  return (
    <div>
      <div className="mb-4 flex space-x-3">
        <button onClick={goPrev} className="px-3 py-1 border rounded">
          Prev
        </button>
        <button onClick={goNext} className="px-3 py-1 border rounded">
          Next
        </button>
      </div>

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        selectable={true}
        select={handleSelect}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        editable={true}
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
        events={events}
        height="auto"
      />

      {/* Our combined create/edit modal */}
      <AdminAppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingAppointment={editingAppointment}
        defaultDate={createDate}
      />
    </div>
  );
}
