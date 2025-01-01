import { User } from '../../types';

export const mockUser: User = {
  id: 1,
  email: 'test@example.com',
  role: 'user',
  firstName: 'John',
  lastName: 'Doe',
  insuranceInfo: {
    providerName: 'Blue Cross',
    policyNumber: '12345-BC',
    planType: 'PPO'
  }
};

export const mockAdmin: User = {
  id: 2,
  email: 'admin@isadental.com',
  role: 'admin',
  firstName: 'Admin',
  lastName: 'User'
};