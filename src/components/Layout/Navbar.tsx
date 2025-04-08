import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function Navbar() {
  const { isAuthenticated, isAdmin, clearAuth } = useAuthStore();

  // State for controlling the user dropdown
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Ref to the user menu wrapper
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleSignOut = () => {
    clearAuth();
    setUserMenuOpen(false); // close menu
  };

  // Close the user dropdown if user clicks outside of it
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        userMenuOpen &&
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">DENTAL</span>
              <span className="text-2xl font-bold text-gray-900">CARE</span>
            </Link>
          </div>

          {/* Center: Main nav links */}
          <div className="hidden sm:flex items-center space-x-8">
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
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Phone link (visible on sm+ screens) */}
            <div className="hidden sm:flex items-center">
              <a
                href="tel:671-646-7982"
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <Phone className="w-4 h-4 mr-2" />
                <span>671-646-7982</span>
              </a>
            </div>

            {/* If user is NOT authenticated: Show “Sign In” button */}
            {!isAuthenticated() && (
              <Link
                to="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Sign In
              </Link>
            )}

            {/* If user IS authenticated: Show user icon + dropdown */}
            {isAuthenticated() && (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center text-gray-700 hover:text-blue-600 focus:outline-none"
                >
                  <User className="w-6 h-6" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-2 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/appointments"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      My Appointments
                    </Link>
                    {isAdmin() && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
