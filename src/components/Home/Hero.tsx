import { Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 text-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative z-10">
          <h1 className="text-5xl font-bold mb-4">Welcome to Dental Care Center</h1>
          <p className="text-xl mb-8">Your Family Dental Center in Hagåtña, Guam</p>
          <div className="flex flex-wrap gap-4">
            <a
              href="tel:671-646-7982"
              className="bg-white text-blue-600 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors"
            >
              <span className="flex items-center">
                <Phone className="w-5 h-5 mr-2" />
                Call Now
              </span>
            </a>
            <Link
              to="/appointments"
              className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-md font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Book Appointment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}