import { Dentist } from '../../types';

export const mockDentists: Dentist[] = [
  {
    id: 1,
    firstName: 'Sarah',
    lastName: 'Johnson',
    specialty: 'general',
    imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
    qualifications: [
      'DDS, University of Washington',
      'Advanced Cosmetic Dentistry Certification',
      '15+ Years Experience'
    ]
  },
  {
    id: 2,
    firstName: 'Michael',
    lastName: 'Chen',
    specialty: 'pediatric',
    imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
    qualifications: [
      'DMD, Harvard School of Dental Medicine',
      'Pediatric Dentistry Specialist',
      'Board Certified'
    ]
  }
];