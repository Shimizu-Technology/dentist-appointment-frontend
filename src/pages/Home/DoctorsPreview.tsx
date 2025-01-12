// File: src/pages/Home/DoctorsPreview.tsx

import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getDentists } from '../../lib/api';
import Button from '../../components/UI/Button';
import type { Dentist } from '../../types';

export default function DoctorsPreview() {
  // Fetch our dentists array via React Query
  const {
    data: dentistsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['dentists'],
    queryFn: async () => {
      const response = await getDentists(); // Expecting { data: [...] }
      return response.data; // So dentistsData is the array if all goes well
    },
  });

  // If the request is still loading
  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>Loading our dental team...</p>
        </div>
      </section>
    );
  }

  // If there was an error
  if (isError) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-red-600">
            Sorry, we couldn’t load the doctors at this time.
            <br />
            {String(error)}
          </p>
        </div>
      </section>
    );
  }

  // Safety-check: If the data is not an array, show a fallback
  if (!Array.isArray(dentistsData)) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>Unexpected data format. Please check again later.</p>
        </div>
      </section>
    );
  }

  // Now we’re safe to map the array
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Meet Our Doctors</h2>
          <p className="mt-4 text-lg text-gray-600">
            Expert dental care from our experienced team
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {dentistsData.map((doctor) => (
            <div key={doctor.id} className="flex items-center space-x-6">
              <img
                src={doctor.imageUrl}
                alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                className="w-24 h-24 rounded-full object-cover"
              />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Dr. {doctor.firstName} {doctor.lastName}
                </h3>
                <p className="text-blue-600">
                  {doctor.specialty === 'pediatric'
                    ? 'Pediatric Dentist'
                    : 'General Dentist'}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/doctors">
            <Button>Learn More About Our Team</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
