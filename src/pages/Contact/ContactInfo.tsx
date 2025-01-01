import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function ContactInfo() {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Office Information</h2>
      
      <div className="space-y-6">
        <div className="flex items-start">
          <MapPin className="w-6 h-6 text-blue-600 mt-1 mr-4" />
          <div>
            <h3 className="font-medium text-gray-900">Location</h3>
            <p className="text-gray-600 mt-1">
              250 Route 4, Suite 101<br />
              Hagåtña, Guam 96910
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <Phone className="w-6 h-6 text-blue-600 mt-1 mr-4" />
          <div>
            <h3 className="font-medium text-gray-900">Phone</h3>
            <a 
              href="tel:671-646-7982" 
              className="text-gray-600 hover:text-blue-600 mt-1 block"
            >
              671-646-7982
            </a>
          </div>
        </div>

        <div className="flex items-start">
          <Mail className="w-6 h-6 text-blue-600 mt-1 mr-4" />
          <div>
            <h3 className="font-medium text-gray-900">Email</h3>
            <a 
              href="mailto:contact@isadental.com"
              className="text-gray-600 hover:text-blue-600 mt-1 block"
            >
              contact@isadental.com
            </a>
          </div>
        </div>

        <div className="flex items-start">
          <Clock className="w-6 h-6 text-blue-600 mt-1 mr-4" />
          <div>
            <h3 className="font-medium text-gray-900">Office Hours</h3>
            <div className="text-gray-600 mt-1">
              <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
              <p>Saturday: 9:00 AM - 2:00 PM</p>
              <p>Sunday: Closed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}