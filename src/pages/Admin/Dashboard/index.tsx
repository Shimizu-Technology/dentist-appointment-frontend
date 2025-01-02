// File: /src/pages/Admin/Dashboard/index.tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/UI/Tabs';
import AppointmentsList from './AppointmentsList';
import AppointmentTypes from './AppointmentTypes';
import UsersList from './UsersList';
import DashboardHeader from './DashboardHeader';
import AdminCalendar from './AdminCalendar';

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

            {/* The new calendar tab: */}
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>

          {/* Render the “Appointments” section only when value="appointments” is active */}
          <TabsContent value="appointments">
            <AppointmentsList />
          </TabsContent>

          {/* Render the “Appointment Types” section only when value="appointment-types” is active */}
          <TabsContent value="appointment-types">
            <AppointmentTypes />
          </TabsContent>

          {/* Render the “Users” section only when value="users” is active */}
          <TabsContent value="users">
            <UsersList />
          </TabsContent>

          {/* Render the Calendar */}
          <TabsContent value="calendar">
            <AdminCalendar />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
