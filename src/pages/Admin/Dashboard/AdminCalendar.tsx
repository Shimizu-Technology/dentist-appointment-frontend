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
  EventMountArg,
} from '@fullcalendar/interaction';

import {
  getAppointments,
  getDentists,
  getSchedules,
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

interface ClinicDaySetting {
  id: number;
  dayOfWeek: number;  // 0=Sun..6=Sat
  isOpen: boolean;
  openTime: string;   // e.g. "09:00"
  closeTime: string;  // e.g. "17:00"
}

export default function AdminCalendar() {
  const queryClient = useQueryClient();
  const calendarRef = useRef<FullCalendar>(null);

  // Dentist filter
  const [selectedDentistId, setSelectedDentistId] = useState<string>('');
  // “Go to date” feature
  const [searchDate, setSearchDate] = useState('');

  // Appointment modal (create/edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [createDate, setCreateDate] = useState<Date | null>(null);

  // 1) Fetch schedules (clinicDaySettings + closedDays)
  const { data: scheduleData } = useQuery({
    queryKey: ['schedules'],
    queryFn: async () => {
      const res = await getSchedules();
      return res.data; // => { clinicDaySettings, closedDays, dentistUnavailabilities, ... }
    },
  });
  const daySettings: ClinicDaySetting[] = scheduleData?.clinicDaySettings || [];
  const closedData: ClosedDay[] = scheduleData?.closedDays || [];

  // 2) Fetch Dentists for the dropdown filter
  const { data: dentistData = [] } = useQuery<Dentist[]>({
    queryKey: ['dentists'],
    queryFn: async () => {
      const res = await getDentists();
      return res.data;
    },
  });

  // 3) Fetch appointments for the calendar
  const { data: apptData, error: apptError } = useQuery<PaginatedAppointments>({
    queryKey: ['admin-appointments-for-calendar', selectedDentistId],
    queryFn: async () => {
      const dentistIdNum = selectedDentistId ? parseInt(selectedDentistId, 10) : undefined;
      // fetch a high limit so the calendar has everything
      const response = await getAppointments(1, 9999, dentistIdNum);
      return response.data;
    },
  });

  // Filter out canceled appointments
  let appointments = apptData?.appointments || [];
  appointments = appointments.filter((a) => a.status !== 'cancelled');

  // Build FullCalendar events
  const events = appointments.map((appt) => {
    const start = new Date(appt.appointmentTime);
    const dur = appt.appointmentType?.duration ?? 60; // default 60 minutes
    const end = new Date(start.getTime() + dur * 60000);

    // Simple color logic
    let backgroundColor = '#86efac'; // green for scheduled
    if (appt.status === 'completed') backgroundColor = '#93c5fd'; // light blue
    if (appt.checkedIn) backgroundColor = '#fcd34d'; // yellow if checked in

    // Show who the appointment is for
    const patientName = appt.user
      ? `${appt.user.firstName} ${appt.user.lastName}`
      : 'Unknown';

    // Example: "Jane Doe (#123)" or "Jane Doe (Cleaning #123)"
    const displayedTitle = appt.appointmentType
      ? `${patientName} (${appt.appointmentType.name} #${appt.id})`
      : `${patientName} (#${appt.id})`;

    return {
      id: String(appt.id),
      title: displayedTitle,
      start,
      end,
      backgroundColor,
      borderColor: backgroundColor,
      extendedProps: { appointment: appt },
    };
  });

  // Mark closed days as background events
  const closedEvents = closedData.map((cd) => ({
    start: cd.date,
    end: cd.date,
    allDay: true,
    display: 'background',
    backgroundColor: '#d1d5db', // gray
    title: cd.reason || 'Closed Day',
    overlap: false,
  }));

  const allEvents = [...events, ...closedEvents];

  // Convert daySettings => businessHours
  const businessHours = daySettings
    .filter((ds) => ds.isOpen)
    .map((ds) => ({
      daysOfWeek: [ds.dayOfWeek],
      startTime: ds.openTime,
      endTime: ds.closeTime,
    }));

  // =============== FULLCALENDAR HANDLERS ===============
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
    if (clickInfo.event.display === 'background') return;
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
    // Not allowing drag-resize => revert
    resizeInfo.revert();
  }, []);

  // Show a tooltip on hover + fix text overflow
  const handleEventMount = useCallback((mountInfo: EventMountArg) => {
    const appt = mountInfo.event.extendedProps.appointment as Appointment;
    if (!appt) return;

    const patientName = appt.user
      ? `${appt.user.firstName} ${appt.user.lastName}`
      : 'Unknown User';
    const typeName = appt.appointmentType?.name || 'Appointment';
    mountInfo.el.title = `${patientName}\n${typeName} (#${appt.id})`;

    // Let text wrap
    mountInfo.el.style.whiteSpace = 'normal';
  }, []);

  // "Go to date" logic
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

  // If the appointments request had an error
  if (apptError) {
    return (
      <div className="text-red-600 p-4">
        Failed to load appointments. Please try again later.
      </div>
    );
  }

  // =============== RENDER ===============
  return (
    <div className="space-y-6">
      {/* TOP CONTROLS: Filter + Go-to-date */}
      <div className="bg-white p-4 rounded-md shadow space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
        {/* Dentist Filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <label className="font-medium text-gray-700 whitespace-nowrap">
            Filter by Dentist:
          </label>
          <select
            className="border px-3 py-2 rounded text-sm w-full sm:w-auto
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

        {/* Go-to-date Form */}
        <form
          onSubmit={handleGoToDate}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-2"
        >
          <label className="font-medium text-gray-700 whitespace-nowrap">Go to date:</label>
          <input
            type="date"
            className="border px-3 py-2 rounded text-sm w-full sm:w-auto
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
          />
          <Button type="submit" variant="primary" className="whitespace-nowrap">
            Go
          </Button>
        </form>
      </div>

      {/* LEGEND */}
      <div className="bg-white p-4 rounded-md shadow flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#86efac' }} />
          <span>Scheduled</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#93c5fd' }} />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#fcd34d' }} />
          <span>Checked In</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-gray-300" />
          <span>Closed Day</span>
        </div>
      </div>

      {/* FULLCALENDAR CONTAINER */}
      <div className="bg-white p-4 rounded-md shadow overflow-x-auto">
        <div className="min-w-[320px]">
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
            slotMinTime="07:00:00"
            slotMaxTime="19:00:00"
            businessHours={businessHours}
            slotDuration="00:15:00"
            snapDuration="00:15:00"
            displayEventTime
            height="auto"
            headerToolbar={{
              left: 'prev,today,next',
              center: 'title',
              right: 'timeGridDay,timeGridWeek,dayGridMonth',
            }}
            // The event feed
            events={allEvents}
            // Show events in a block style (helps avoid text cut-off)
            eventDisplay="block"
            // Hook to add a tooltip and fix overflow
            eventDidMount={handleEventMount}
            // for current time indicator:
            nowIndicator
          />
        </div>
      </div>

      {/* CREATE/EDIT APPOINTMENT MODAL */}
      <AdminAppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingAppointment={editingAppointment}
        defaultDate={createDate}
      />
    </div>
  );
}
