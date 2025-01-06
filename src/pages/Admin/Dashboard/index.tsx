// File: /src/pages/Admin/Dashboard/index.tsx

import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/UI/Tabs';
import AppointmentsList from './AppointmentsList';
import AppointmentTypes from './AppointmentTypes';
import UsersList from './UsersList';
import DashboardHeader from './DashboardHeader';
import AdminCalendar from './AdminCalendar';
import SchedulesList from './SchedulesList';

// NEW IMPORT
import NextAvailableTool from './NextAvailableTool'; // We'll define this component next

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto px=4 sm:px-6 lg:px-8 py-12">
        <Tabs defaultValue="appointments">
          <TabsList>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="appointment-types">Appointment Types</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="schedules">Schedules</TabsTrigger>

            {/* NEW TAB: Next Available */}
            <TabsTrigger value="next-available">Next Available</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments">
            <AppointmentsList />
          </TabsContent>

          <TabsContent value="appointment-types">
            <AppointmentTypes />
          </TabsContent>

          <TabsContent value="users">
            <UsersList />
          </TabsContent>

          <TabsContent value="calendar">
            <AdminCalendar />
          </TabsContent>

          <TabsContent value="schedules">
            <SchedulesList />
          </TabsContent>

          <TabsContent value="next-available">
            <NextAvailableTool />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
