import { useQuery } from '@tanstack/react-query';
import { getDentists } from '../../lib/api';
import DoctorCard from './DoctorCard';
import DoctorsHero from './DoctorsHero'; // optional heading component

export default function Doctors() {
  // 1) Use the *object* form for v5
  const {
    data: dentistResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['dentists'],
    queryFn: getDentists, 
  });

  // 2) Handle loading or error states
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading doctors...</p>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">
          Failed to load doctors: {String(error)}
        </p>
      </div>
    );
  }

  // 3) The array of dentists is typically in `dentistResponse.data`
  const dentists = dentistResponse?.data || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorsHero />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Meet Our Doctors</h2>
          <p className="mt-4 text-lg text-gray-600">
            Our experienced team of dental professionals is dedicated 
            to providing you with the highest quality care in a comfortable environment.
          </p>
        </div>

        {/* Map over the actual dentist data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dentists.map((doctor: any) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      </div>
    </div>
  );
}
