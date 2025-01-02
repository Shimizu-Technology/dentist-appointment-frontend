import Hero from '../../components/Home/Hero';
import ServicesOverview from '../../components/Home/ServicesOverview';
import DoctorsPreview from './DoctorsPreview';
import ContactSection from './ContactSection';
import Footer from '../../components/Layout/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Hero />
      <ServicesOverview />
      <DoctorsPreview />
      <ContactSection />
    </div>
  );
}