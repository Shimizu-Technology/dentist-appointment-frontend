import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/UI/Button';

export default function ContactSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Contact Us</h2>
          <p className="mt-4 text-lg text-gray-600">
            We're here to help with all your dental care needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-4" />
            <h3 className="font-medium text-gray-900 mb-2">Location</h3>
            <p className="text-gray-600">
              250 Route 4, Suite 101<br />
              Hagåtña, Guam 96910
            </p>
          </div>

          <div className="text-center">
            <Phone className="w-8 h-8 text-blue-600 mx-auto mb-4" />
            <h3 className="font-medium text-gray-900 mb-2">Phone</h3>
            <a href="tel:671-646-7982" className="text-gray-600 hover:text-blue-600">
              671-646-7982
            </a>
          </div>

          <div className="text-center">
            <Mail className="w-8 h-8 text-blue-600 mx-auto mb-4" />
            <h3 className="font-medium text-gray-900 mb-2">Email</h3>
            <a href="mailto:contact@dentalcare.com" className="text-gray-600 hover:text-blue-600">
              contact@dentalcare.com
            </a>
          </div>

          <div className="text-center">
            <Clock className="w-8 h-8 text-blue-600 mx-auto mb-4" />
            <h3 className="font-medium text-gray-900 mb-2">Hours</h3>
            <p className="text-gray-600">
              Mon-Fri: 9AM - 6PM<br />
              Sat: 9AM - 2PM
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link to="/contact">
            <Button>Get in Touch</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}