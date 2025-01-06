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

import { getAppointments, getDentists, updateAppointment } from '../../../lib/api';
import type { Appointment, Dentist } from '../../../types';
import AdminAppointmentModal from './AdminAppointmentModal';

function snapTo15(durationInMin: number) {
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
      const response = await getAppointments(1, 200, selectedDentistId);
      return response.data;
    },
  });

  const appointments = data?.appointments || [];

  const events = appointments.map((appt) => {
    const start = new Date(appt.appointmentTime);
    const rawDuration = appt.appointmentType?.duration ?? 60;
    const snapped = snapTo15(rawDuration);
    const end = new Date(start.getTime() + snapped * 60000);

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
        // If Rails returns { errors: [...] }, show them
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
    // If you want resizing to also patch the appointment’s new start/end, do so here.
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
        slotLabelInterval="00:30:00"
        snapDuration="00:15:00"
        slotMinTime="07:00:00"
        slotMaxTime="22:00:00"
        headerToolbar={{
          left: 'prev,today,next',
          center: 'title',
          right: 'timeGridWeek,dayGridMonth',
        }}
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
