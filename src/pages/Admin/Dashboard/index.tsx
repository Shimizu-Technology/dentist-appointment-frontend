import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/UI/Tabs';
import AppointmentsList from './AppointmentsList';
import AppointmentTypes from './AppointmentTypes';
import DashboardHeader from './DashboardHeader';
import Footer from '../../../components/Layout/Footer';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs defaultValue="appointments">
          <TabsList>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="appointment-types">Appointment Types</TabsTrigger>
          </TabsList>
          
          <TabsContent value="appointments">
            <AppointmentsList />
          </TabsContent>
          
          <TabsContent value="appointment-types">
            <AppointmentTypes />
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}