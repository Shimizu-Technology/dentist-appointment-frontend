import { mockDependents } from '../mockData';
import { delay } from '../utils';
import type { Dependent } from '../../types';

export async function mockGetDependents() {
  await delay(500);
  return { data: mockDependents };
}

export async function mockCreateDependent(data: Omit<Dependent, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
  await delay(500);
  const newDependent: Dependent = {
    id: Math.floor(Math.random() * 10000),
    userId: 1, // Mock user ID
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...data
  };
  mockDependents.push(newDependent);
  return { data: newDependent };
}

export async function mockUpdateDependent(
  id: number,
  data: Pick<Dependent, 'firstName' | 'lastName' | 'dateOfBirth'>
) {
  await delay(500);
  const index = mockDependents.findIndex(d => d.id === id);
  if (index === -1) {
    throw new Error('Dependent not found');
  }
  
  mockDependents[index] = {
    ...mockDependents[index],
    ...data,
    updatedAt: new Date().toISOString()
  };
  
  return { data: mockDependents[index] };
}