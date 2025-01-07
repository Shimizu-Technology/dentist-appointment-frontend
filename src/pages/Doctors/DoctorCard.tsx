// File: /src/pages/Doctors/DoctorCard.tsx
import { GraduationCap, Award, Stethoscope, Calendar } from 'lucide-react';
import type { Dentist } from '../../types';
import { buildFullImageUrl } from '../../lib/api';

// A small helper if you store relative paths in the DB
// e.g. "/uploads/dentists/dentist_1.jpg"
function getAvailabilityString(dentist: Dentist): string {
  // If you store an explicit “availability” field, or if you want to
  // combine “clinicSetting.openDays” with “dentistUnavailabilities”:
  // For simplicity, assume dentist.availability is in the DB
  if (dentist.availability) {
    return dentist.availability; // e.g. "Mon-Fri: 10AM - 6PM"
  }
  return 'No schedule set'; 
}

interface DoctorCardProps {
  doctor: Dentist; // The object you get from your /dentists endpoint
}

export default function DoctorCard({ doctor }: DoctorCardProps) {
  // Convert dentist.imageUrl to a full absolute URL (if needed)
  const fullImageUrl = buildFullImageUrl(doctor.imageUrl);

  // Possibly compute the final availability string
  const availability = getAvailabilityString(doctor);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Optional "aspect-w-16 aspect-h-9" wrapper if you want a 16:9 ratio */}
      <div className="aspect-w-16 aspect-h-9">
        {fullImageUrl ? (
          <img
            src={fullImageUrl}
            alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
            className="w-full h-64 object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-64 bg-gray-200">
            <p className="text-gray-500">No image available</p>
          </div>
        )}
      </div>

      <div className="p-8">
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
          Dr. {doctor.firstName} {doctor.lastName}
        </h3>
        
        <div className="flex items-center text-blue-600 mb-6">
          <Stethoscope className="w-5 h-5 mr-2" />
          <span className="font-medium">
            {doctor.specialty || 'General Dentist'}
          </span>
        </div>

        <div className="space-y-6">
          {/* Education & Qualifications */}
          {doctor.qualifications && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
                Education &amp; Qualifications
              </h4>
              <ul className="space-y-2 text-gray-600">
                {doctor.qualifications.map((qualification, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2" />
                    {qualification}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Specializations */}
          {doctor.specialties?.length ? (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <Award className="w-5 h-5 mr-2 text-blue-600" />
                Specializations
              </h4>
              <ul className="space-y-2 text-gray-600">
                {doctor.specialties.map((spec: string, idx: number) => (
                  <li key={idx} className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2" />
                    {spec}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Availability (using a simplified function) */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Availability
            </h4>
            <p className="text-gray-600">
              {availability}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
