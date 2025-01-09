// File: /src/App.tsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import Services from './pages/Services';
import Doctors from './pages/Doctors';
import Contact from './pages/Contact';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import Profile from './pages/Profile';
import Appointments from './pages/Appointments';
import AppointmentShow from './pages/Appointments/[id]';
import AppointmentEdit from './pages/Appointments/[id]/edit';
import NewAppointment from './pages/Appointments/New';
import AdminDashboard from './pages/Admin/Dashboard';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AdminRoute from './components/Auth/AdminRoute';
import FinishInvitation from './pages/FinishInvitation';
import BookingConfirmation from './pages/Appointments/New/Confirmation';

import ScrollToTop from './components/ScrollToTop';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        {/* Auto-scroll to top whenever route changes */}
        <ScrollToTop />

        <div className="flex flex-col min-h-screen">
          <Navbar />

          <div className="flex-grow bg-gray-50">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/doctors" element={<Doctors />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              <Route path="/finish-invitation" element={<FinishInvitation />} />

              {/* Protected routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/appointments"
                element={
                  <ProtectedRoute>
                    <Appointments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/appointments/new"
                element={
                  <ProtectedRoute>
                    <NewAppointment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/appointments/:id/edit"
                element={
                  <ProtectedRoute>
                    <AppointmentEdit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/appointments/:id"
                element={
                  <ProtectedRoute>
                    <AppointmentShow />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/appointments/new/confirmation"
                element={
                  <ProtectedRoute>
                    <BookingConfirmation />
                  </ProtectedRoute>
                }
              />

              {/* Admin routes */}
              <Route
                path="/admin/*"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
            </Routes>
          </div>

          <Footer />
        </div>
      </Router>
    </QueryClientProvider>
  );
}
