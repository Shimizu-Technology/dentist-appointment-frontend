import { mockDentists } from '../mockData';
import { delay } from '../utils';

export async function mockGetDentists() {
  await delay(300);
  return { data: mockDentists };
}