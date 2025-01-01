import { 
  Stethoscope, 
  Baby, 
  Users, 
  HeartPulse, 
  Sparkles, 
  PhoneCall 
} from 'lucide-react';
import ServiceCard from './ServiceCard';

const services = [
  {
    title: 'General Dentistry',
    description: 'Comprehensive dental care for adults including preventive care and treatments.',
    Icon: Stethoscope,
    features: [
      'Regular check-ups and cleanings',
      'Fillings and cavity treatment',
      'Root canal therapy',
      'Gum disease treatment'
    ]
  },
  {
    title: 'Pediatric Dentistry',
    description: 'Specialized dental care for children in a comfortable and friendly environment.',
    Icon: Baby,
    features: [
      'Child-friendly environment',
      'Preventive care',
      'Early orthodontic assessment',
      'Dental education for parents'
    ]
  },
  {
    title: 'Family Dental Care',
    description: 'Complete dental services for your entire family under one roof.',
    Icon: Users,
    features: [
      'Flexible scheduling for families',
      'Multiple family members per visit',
      'Comprehensive treatment plans',
      'Family dental education'
    ]
  },
  {
    title: 'Preventive Care',
    description: 'Stop dental problems before they start with our preventive services.',
    Icon: HeartPulse,
    features: [
      'Regular cleanings',
      'Fluoride treatments',
      'Dental sealants',
      'Oral cancer screenings'
    ]
  },
  {
    title: 'Cosmetic Dentistry',
    description: 'Enhance your smile with our cosmetic dental procedures.',
    Icon: Sparkles,
    features: [
      'Teeth whitening',
      'Dental veneers',
      'Cosmetic bonding',
      'Smile makeovers'
    ]
  },
  {
    title: 'Emergency Care',
    description: 'Quick response dental care when you need it most.',
    Icon: PhoneCall,
    features: [
      'Same-day appointments',
      'Emergency tooth repair',
      'Pain management',
      '24/7 emergency contact'
    ]
  }
];

export default function ServicesList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {services.map((service) => (
        <ServiceCard key={service.title} {...service} />
      ))}
    </div>
  );
}