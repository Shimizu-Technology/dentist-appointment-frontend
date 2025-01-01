import { mockAppointmentTypes } from '../mockData';
import { delay } from '../utils';

export async function mockGetAppointmentTypes() {
  await delay(300);
  return { data: mockAppointmentTypes };
}