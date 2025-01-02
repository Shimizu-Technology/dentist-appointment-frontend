import { Edit2, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelAppointment } from '../../lib/api';
import Button from '../UI/Button';
import { canManageAppointment } from '../../utils/appointments';
import type { Appointment } from '../../types';

interface AppointmentActionsProps {
  appointment: Appointment;
  onEdit: () => void;
}

export default function AppointmentActions({ appointment, onEdit }: AppointmentActionsProps) {
  const queryClient = useQueryClient();
  const { mutate: handleCancel, isPending: isCancelling } = useMutation({
    mutationFn: () => cancelAppointment(appointment.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  if (!canManageAppointment(appointment)) {
    return null;
  }

  const onCancelClick = () => {
    const yes = window.confirm('Are you sure you want to cancel this appointment?');
    if (!yes) return;
    handleCancel();
  };

  return (
    <div className="flex space-x-4">
      <Button variant="outline" onClick={onEdit} className="flex items-center">
        <Edit2 className="w-4 h-4 mr-2" />
        Reschedule
      </Button>

      <Button
        variant="secondary"
        onClick={onCancelClick}
        isLoading={isCancelling}
        className="flex items-center text-red-600 hover:text-red-700"
      >
        <X className="w-4 h-4 mr-2" />
        Cancel
      </Button>
    </div>
  );
}
