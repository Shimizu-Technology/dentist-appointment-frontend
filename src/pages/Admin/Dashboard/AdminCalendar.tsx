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
 * A small helper to snap durations to 15-minute increments:
 * - e.g. 15 -> 15, 20 -> 30, 32 -> 45, 50 -> 60, etc.
 */
function snapTo15(durationInMin: number) {
  const remainder = durationInMin % 15;
  if (remainder === 0) {
    return durationInMin;
  }
  return durationInMin + (15 - remainder);
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

  // Control the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  // For creating a new appointment (date/time preselected)
  const [createDate, setCreateDate] = useState<Date | null>(null);

  // Fetch your appointments (200 for example)
  const { data, isLoading, error } = useQuery<PaginatedAppointments>({
    queryKey: ['admin-appointments-for-calendar'],
    queryFn: async () => {
      const response = await getAppointments(1, 200);
      return response.data;
    },
  });

  /**
   * Convert each Appointment to a FullCalendar event.
   * We use the appointment_type.duration (if available), or default to 60.
   * Then we “snap” that duration to 15-minute increments if you want to show partial blocks
   * or rounding. If you want EXACT partial times, do not snap, just use the real duration.
   */
  const appointments = data?.appointments || [];
  const events = appointments.map((appt) => {
    const start = new Date(appt.appointmentTime);

    // 1) Get the “real” duration from the DB. If undefined, default 60.
    const rawDuration = appt.appointmentType?.duration ?? 60;

    // 2) If you want strict rounding:
    const snappedDuration = snapTo15(rawDuration);

    // 3) End time = start + snappedDuration
    const end = new Date(start.getTime() + snappedDuration * 60_000);

    return {
      id: String(appt.id),
      title: appt.appointmentType?.name
        ? `${appt.appointmentType.name} (#${appt.id})`
        : `Appt #${appt.id}`,
      start,
      end,
      extendedProps: { appointment: appt },
    };
  });

  // ──────────────────────────────────────────────
  // FULLCALENDAR EVENT HANDLERS
  // ──────────────────────────────────────────────

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
      const newStart = event.start;
      const oldAppt = event.extendedProps.appointment as Appointment;

      if (!oldAppt || !newStart) {
        dropInfo.revert();
        return;
      }

      const yes = window.confirm(
        `Move appointment #${oldAppt.id} to ${newStart.toLocaleString()}?`
      );
      if (!yes) {
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

  // If you allow resizing in the calendar, handle it similarly:
  const handleEventResize = useCallback((resizeInfo: EventResizeDoneArg) => {
    // e.g. confirm or revert
    resizeInfo.revert();
  }, []);

  // Basic loading/error states
  if (isLoading) return <div className="py-6 text-center">Loading calendar...</div>;
  if (error) return <div className="py-6 text-red-600 text-center">Failed to load appointments.</div>;

  // Optional date nav
  const goPrev = () => calendarRef.current?.getApi().prev();
  const goNext = () => calendarRef.current?.getApi().next();

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

        // Here are the slot settings to show partial blocks
        // every 15 minutes (snap to 15 but label every 30):
        slotDuration="00:15:00"
        slotLabelInterval="00:30:00"
        snapDuration="00:15:00"

        events={events}
        height="auto"
      />

      {/* Combined create/edit modal */}
      <AdminAppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingAppointment={editingAppointment}
        defaultDate={createDate}
      />
    </div>
  );
}
