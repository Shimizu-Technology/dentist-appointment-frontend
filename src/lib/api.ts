// src/lib/api.ts
import axios from 'axios';

// We'll read API_BASE_URL from .env
const baseURL = import.meta.env.API_BASE_URL || 'http://localhost:3000/api/v1';

// Create a single axios instance
const api = axios.create({
  baseURL,
  // Optionally set default headers, e.g.:
  // headers: { 'Content-Type': 'application/json' },
});

// Then define real methods calling the Rails endpoints:
export async function login(email: string, password: string) {
  const response = await api.post('/login', { email, password });
  return response;
}

export async function signup(email: string, password: string, firstName: string, lastName: string) {
  // Suppose you have a POST /users or /signup
  const response = await api.post('/users', {
    email,
    password,
    first_name: firstName,
    last_name: lastName
  });
  return response;
}

// Example of calling GET /dentists
export async function getDentists() {
  const response = await api.get('/dentists');
  return response;
}

// Similarly for appointment types:
export async function getAppointmentTypes() {
  const response = await api.get('/appointment_types');
  return response;
}

// For appointments
export async function getAppointments() {
  const response = await api.get('/appointments');
  return response;
}
export async function createAppointment(data: any) {
  const response = await api.post('/appointments', { appointment: data });
  return response;
}
export async function updateAppointment(appointmentId: number, data: any) {
  const response = await api.patch(`/appointments/${appointmentId}`, { appointment: data });
  return response;
}
export async function cancelAppointment(appointmentId: number) {
  const response = await api.delete(`/appointments/${appointmentId}`);
  return response;
}

// For Insurance
export async function updateInsurance(insuranceData: {
  providerName: string;
  policyNumber: string;
  planType: string;
}) {
  // Suppose the backend allows PATCH /users/current or similar
  const response = await api.patch('/users/current/insurance', {
    user: {
      provider_name: insuranceData.providerName,
      policy_number: insuranceData.policyNumber,
      plan_type: insuranceData.planType
    }
  });
  return response;
}

// For dependents
export async function getDependents() {
  const response = await api.get('/dependents');
  return response;
}
export async function createDependent(data: { firstName: string; lastName: string; dateOfBirth: string; }) {
  const response = await api.post('/dependents', { dependent: data });
  return response;
}
export async function updateDependent(
  dependentId: number,
  data: { firstName: string; lastName: string; dateOfBirth: string }
) {
  const response = await api.patch(`/dependents/${dependentId}`, { dependent: data });
  return response;
}

// ...
