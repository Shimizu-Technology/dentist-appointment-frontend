import { Link } from 'react-router-dom';
import { Phone } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function Navbar() {
  const { isAuthenticated, isAdmin, clearAuth } = useAuthStore();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">ISA</span>
              <span className="text-2xl font-bold text-gray-900">DENTAL</span>
            </Link>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600">
              Home
            </Link>
            <Link to="/services" className="text-gray-700 hover:text-blue-600">
              Services
            </Link>
            <Link to="/doctors" className="text-gray-700 hover:text-blue-600">
              Our Doctors
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-blue-600">
              Contact
            </Link>
            
            {isAuthenticated() ? (
              <>
                <Link to="/appointments" className="text-gray-700 hover:text-blue-600">
                  My Appointments
                </Link>
                {isAdmin() && (
                  <Link to="/admin" className="text-gray-700 hover:text-blue-600">
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => clearAuth()}
                  className="text-gray-700 hover:text-blue-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Sign In
              </Link>
            )}
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <a
              href="tel:671-646-7982"
              className="flex items-center text-blue-600 hover:text-blue-700"
            >
              <Phone className="w-4 h-4 mr-2" />
              <span>671-646-7982</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}