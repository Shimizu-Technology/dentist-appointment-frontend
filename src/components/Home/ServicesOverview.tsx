import { Stethoscope, Baby, Users } from 'lucide-react';
import ServiceCard from './ServiceCard';

export default function ServicesOverview() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Our Services</h2>
          <p className="mt-4 text-lg text-gray-600">
            Comprehensive dental care for your entire family
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ServiceCard
            title="General Dentistry"
            description="Comprehensive dental care for adults including cleanings, fillings, and preventive care."
            Icon={Stethoscope}
          />
          <ServiceCard
            title="Pediatric Dentistry"
            description="Specialized dental care for children in a comfortable and friendly environment."
            Icon={Baby}
          />
          <ServiceCard
            title="Family Dental Care"
            description="Complete dental services for your entire family under one roof."
            Icon={Users}
          />
        </div>
      </div>
    </section>
  );
}