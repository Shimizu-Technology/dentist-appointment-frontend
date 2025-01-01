import { GraduationCap, Award, Stethoscope, Calendar } from 'lucide-react';
import type { Dentist } from '../../types';

interface DoctorCardProps {
  doctor: Dentist;
}

export default function DoctorCard({ doctor }: DoctorCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="aspect-w-16 aspect-h-9">
        <img
          src={doctor.imageUrl}
          alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
          className="w-full h-64 object-cover"
        />
      </div>
      <div className="p-8">
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
          Dr. {doctor.firstName} {doctor.lastName}
        </h3>
        
        <div className="flex items-center text-blue-600 mb-6">
          <Stethoscope className="w-5 h-5 mr-2" />
          <span className="font-medium">
            {doctor.specialty === 'pediatric' ? 'Pediatric Dentist' : 'General Dentist'}
          </span>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
              Education & Qualifications
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

          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <Award className="w-5 h-5 mr-2 text-blue-600" />
              Specializations
            </h4>
            <ul className="space-y-2 text-gray-600">
              {doctor.specialty === 'pediatric' ? (
                <>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2" />
                    Child-focused dental care
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2" />
                    Pediatric oral health education
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2" />
                    Early orthodontic assessment
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2" />
                    Comprehensive dental care
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2" />
                    Cosmetic dentistry
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2" />
                    Preventive care
                  </li>
                </>
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Availability
            </h4>
            <p className="text-gray-600">
              {doctor.specialty === 'pediatric' ? 
                'Monday - Friday: 10:00 AM - 6:00 PM' : 
                'Monday - Friday: 9:00 AM - 5:00 PM'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}