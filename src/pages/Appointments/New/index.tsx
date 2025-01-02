import NewAppointmentHeader from './NewAppointmentHeader';
import NewAppointmentForm from './NewAppointmentForm';
import Footer from '../../../components/Layout/Footer';

export default function NewAppointment() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NewAppointmentHeader />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <NewAppointmentForm />
      </div>
    </div>
  );
}