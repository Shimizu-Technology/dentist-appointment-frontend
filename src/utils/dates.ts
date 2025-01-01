export function formatAppointmentDate(date: string, time: string): string {
  const [hours, minutes] = time.split(':');
  const appointmentDate = new Date(date);
  appointmentDate.setHours(parseInt(hours), parseInt(minutes));
  return appointmentDate.toISOString();
}