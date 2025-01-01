import { mockUser, mockAdmin } from '../mockData';
import { delay } from '../utils';

export async function mockLogin(email: string, password: string) {
  await delay(500);
  
  if (email === 'admin@isadental.com' && password === 'admin123') {
    return { data: { user: mockAdmin, token: 'mock-admin-token' } };
  }
  
  if (email === 'test@example.com' && password === 'password123') {
    return { data: { user: mockUser, token: 'mock-jwt-token' } };
  }
  
  throw new Error('Invalid credentials');
}

export async function mockSignup(
  email: string, 
  password: string, 
  firstName: string, 
  lastName: string
) {
  await delay(500);
  
  const newUser = {
    id: Math.floor(Math.random() * 10000),
    email,
    role: 'user',
    firstName,
    lastName
  };
  
  return { data: { user: newUser, token: 'mock-jwt-token' } };
}