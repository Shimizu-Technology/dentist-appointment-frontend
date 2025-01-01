import { Appointment } from '../../types';
import { mockAppointments } from '../mockData';
import { delay } from '../utils';
import { canManageAppointment } from '../../utils/appointments';

export async function mockGetAppointments() {
  await delay(500);
  return { data: mockAppointments };
}

export async function mockCreateAppointment(data: Partial<Appointment>) {
  await delay(500);
  
  const newAppointment: Appointment = {
    id: Math.floor(Math.random() * 10000),
    userId: 1, // Default to current user
    dentistId: data.dentistId!,
    appointmentTypeId: data.appointmentTypeId!,
    appointmentTime: data.appointmentTime!,
    status: 'scheduled',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...data
  };

  mockAppointments.push(newAppointment);
  return { data: newAppointment };
}

export async function mockUpdateAppointment(id: number, data: Partial<Appointment>) {
  await delay(500);
  
  const appointmentIndex = mockAppointments.findIndex(a => a.id === id);
  if (appointmentIndex === -1) {
    throw new Error('Appointment not found');
  }

  const appointment = mockAppointments[appointmentIndex];
  if (!canManageAppointment(appointment)) {
    throw new Error('Cannot modify this appointment');
  }

  const updatedAppointment = {
    ...appointment,
    ...data,
    updatedAt: new Date().toISOString()
  };

  mockAppointments[appointmentIndex] = updatedAppointment;
  return { data: updatedAppointment };
}

export async function mockCancelAppointment(id: number) {
  await delay(500);
  
  const appointmentIndex = mockAppointments.findIndex(a => a.id === id);
  if (appointmentIndex === -1) {
    throw new Error('Appointment not found');
  }

  const appointment = mockAppointments[appointmentIndex];
  if (!canManageAppointment(appointment)) {
    throw new Error('Cannot cancel this appointment');
  }

  const updatedAppointment = {
    ...appointment,
    status: 'cancelled',
    updatedAt: new Date().toISOString()
  };

  mockAppointments[appointmentIndex] = updatedAppointment;
  return { data: updatedAppointment };
}