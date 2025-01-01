import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/UI/Button';

export default function NewAppointmentButton() {
  return (
    <Link to="/appointments/new">
      <Button className="flex items-center">
        <Plus className="w-5 h-5 mr-2" />
        Book New Appointment
      </Button>
    </Link>
  );
}