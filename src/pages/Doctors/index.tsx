import DoctorsHero from './DoctorsHero';
import DoctorsList from './DoctorsList';
import Footer from '../../components/Layout/Footer';

export default function Doctors() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorsHero />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <DoctorsList />
      </div>
      <Footer />
    </div>
  );
}