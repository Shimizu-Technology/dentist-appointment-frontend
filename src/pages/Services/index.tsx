import ServicesHero from './ServicesHero';
import ServicesList from './ServicesList';
import Footer from '../../components/Layout/Footer';

export default function Services() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ServicesHero />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <ServicesList />
      </div>
    </div>
  );
}