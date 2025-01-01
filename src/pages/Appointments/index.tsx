import AppointmentsHeader from './AppointmentsHeader';
import AppointmentsList from './AppointmentsList';
import NewAppointmentButton from './NewAppointmentButton';
import Footer from '../../components/Layout/Footer';

export default function Appointments() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppointmentsHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <NewAppointmentButton />
        </div>
        <AppointmentsList />
      </div>
      <Footer />
    </div>
  );
}