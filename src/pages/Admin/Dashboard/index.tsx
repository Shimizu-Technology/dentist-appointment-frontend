// File: /src/pages/Admin/Dashboard/index.tsx

import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/UI/Tabs';
import AppointmentsList from './AppointmentsList';
import AppointmentTypes from './AppointmentTypes';
import UsersList from './UsersList';
import DashboardHeader from './DashboardHeader';
import AdminCalendar from './AdminCalendar';
import SchedulesList from './SchedulesList';
import DentistsList from './DentistsList';
import RemindersList from './RemindersList';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <Tabs defaultValue="appointments">
            <TabsList className="flex flex-wrap gap-2 justify-center md:justify-start">
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="appointment-types">Appt Types</TabsTrigger>
              <TabsTrigger value="schedules">Schedules</TabsTrigger>
              <TabsTrigger value="dentists">Dentists</TabsTrigger>
              <TabsTrigger value="reminders">Reminders</TabsTrigger>
            </TabsList>

            <TabsContent value="appointments">
              <AppointmentsList />
            </TabsContent>
            <TabsContent value="calendar">
              <AdminCalendar />
            </TabsContent>
            <TabsContent value="users">
              <UsersList />
            </TabsContent>
            <TabsContent value="appointment-types">
              <AppointmentTypes />
            </TabsContent>
            <TabsContent value="schedules">
              <SchedulesList />
            </TabsContent>
            <TabsContent value="dentists">
              <DentistsList />
            </TabsContent>
            <TabsContent value="reminders">
              <RemindersList />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
