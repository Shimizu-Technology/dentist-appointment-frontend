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
        {/* Container with white card */}
        <div className="bg-white rounded-md shadow-md p-4 sm:p-6">
          <Tabs defaultValue="appointments">
            {/* TabsList with improved styling and spacing. */}
            <TabsList className="flex flex-wrap gap-2 justify-center md:justify-start mb-6 border-b border-gray-200">
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="appointment-types">Appt Types</TabsTrigger>
              <TabsTrigger value="schedules">Schedules</TabsTrigger>
              <TabsTrigger value="dentists">Dentists</TabsTrigger>
              <TabsTrigger value="reminders">Reminders</TabsTrigger>
            </TabsList>

            {/* Each tab’s content can have consistent padding. */}
            <TabsContent value="appointments" className="pt-4">
              <AppointmentsList />
            </TabsContent>
            <TabsContent value="calendar" className="pt-4">
              <AdminCalendar />
            </TabsContent>
            <TabsContent value="users" className="pt-4">
              <UsersList />
            </TabsContent>
            <TabsContent value="appointment-types" className="pt-4">
              <AppointmentTypes />
            </TabsContent>
            <TabsContent value="schedules" className="pt-4">
              <SchedulesList />
            </TabsContent>
            <TabsContent value="dentists" className="pt-4">
              <DentistsList />
            </TabsContent>
            <TabsContent value="reminders" className="pt-4">
              <RemindersList />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
