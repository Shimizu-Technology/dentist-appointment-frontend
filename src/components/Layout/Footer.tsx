import { MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <span className="text-2xl font-bold text-blue-500">ISA</span>
              <span className="text-2xl font-bold">DENTAL</span>
            </div>
            <p className="text-gray-400">
              Your trusted family dental center in Hagåtña, Guam.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white">Home</Link></li>
              <li><Link to="/services" className="text-gray-400 hover:text-white">Services</Link></li>
              <li><Link to="/doctors" className="text-gray-400 hover:text-white">Our Doctors</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-500" />
                <span className="text-gray-400">250 Route 4, Suite 101<br/>Hagåtña, Guam 96910</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-2 text-blue-500" />
                <a href="tel:671-646-7982" className="text-gray-400 hover:text-white">671-646-7982</a>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-2 text-blue-500" />
                <a href="mailto:contact@isadental.com" className="text-gray-400 hover:text-white">contact@isadental.com</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}