// File: /src/lib/api.ts

import axios from 'axios';

/**
 * Determine which base URL to use
 * (Development vs. Production).
 */
const baseURL = import.meta.env.PROD
  ? import.meta.env.VITE_PROD_API_BASE_URL
  : import.meta.env.VITE_LOCAL_API_BASE_URL;

// Create an axios instance for our API
const api = axios.create({
  baseURL,
});

// Interceptor to attach token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * LOGIN / SESSIONS
 */
export async function login(email: string, password: string) {
  return api.post('/login', { email, password });
}

/**
 * SIGNUP
 */
export async function signup(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role?: string
) {
  // “role” only works if the current user is admin (per your backend’s logic).
  return api.post('/users', {
    user: {
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      role,
    },
  });
}

/**
 * Update the current logged-in user
 */
export async function updateCurrentUser(data: {
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
}) {
  // PATCH /api/v1/users/current
  return api.patch('/users/current', {
    user: data,
  });
}

/**
 * GET Users (Admin-only)
 */
export async function getUsers(page = 1, perPage = 10) {
  return api.get('/users', {
    params: { page, per_page: perPage },
  });
}

/**
 * Promote user to admin (Admin-only)
 */
export async function promoteUser(userId: number) {
  return api.patch(`/users/${userId}/promote`);
}

/**
 * DENTISTS
 */
export async function getDentists() {
  return api.get('/dentists');
}

export async function getDentistAvailability(dentistId: number) {
  // GET /dentists/:id/availabilities
  return api.get(`/dentists/${dentistId}/availabilities`);
}

/**
 * APPOINTMENT TYPES
 */
export async function getAppointmentTypes() {
  return api.get('/appointment_types');
}
export async function createAppointmentType(data: {
  name: string;
  duration: number;
  description: string;
}) {
  return api.post('/appointment_types', { appointment_type: data });
}
export async function updateAppointmentType(
  id: number,
  data: { name: string; duration: number; description: string }
) {
  return api.patch(`/appointment_types/${id}`, { appointment_type: data });
}
export async function deleteAppointmentType(id: number) {
  return api.delete(`/appointment_types/${id}`);
}

/**
 * APPOINTMENTS
 */
export async function getAppointments(page?: number, perPage?: number) {
  return api.get('/appointments', {
    params: {
      page,
      per_page: perPage,
    },
  });
}

export async function createAppointment(data: any) {
  // For your Rails backend, you must wrap it in { appointment: { ... } }
  return api.post('/appointments', { appointment: data });
}

export async function updateAppointment(appointmentId: number, data: any) {
  return api.patch(`/appointments/${appointmentId}`, { appointment: data });
}

export async function cancelAppointment(appointmentId: number) {
  // Your backend does a full DELETE to remove the appointment
  return api.delete(`/appointments/${appointmentId}`);
}

/**
 * DEPENDENTS
 */
export async function getDependents() {
  return api.get('/dependents');
}

export async function createDependent(data: {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}) {
  return api.post('/dependents', { dependent: data });
}

export async function updateDependent(
  dependentId: number,
  data: { firstName: string; lastName: string; dateOfBirth: string }
) {
  return api.patch(`/dependents/${dependentId}`, { dependent: data });
}

/**
 * INSURANCE
 */
export async function updateInsurance(insuranceData: {
  providerName: string;
  policyNumber: string;
  planType: string;
}) {
  // Patch /users/current/insurance is one approach; your code uses /users/current
  // so you might pass the insurance fields as part of user object.
  // Adjust as needed if your backend is different.
  return api.patch('/users/current', {
    user: {
      provider_name: insuranceData.providerName,
      policy_number: insuranceData.policyNumber,
      plan_type: insuranceData.planType,
    },
  });
}
