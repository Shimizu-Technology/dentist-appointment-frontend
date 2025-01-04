// File: /src/lib/api.ts

import axios from 'axios';
import type { ClosedDay } from '../../types';

/**
 * 1) Determine baseURL. Adjust if needed for your environment.
 */
const baseURL = import.meta.env.PROD
  ? import.meta.env.VITE_PROD_API_BASE_URL
  : import.meta.env.VITE_LOCAL_API_BASE_URL;

/**
 * 2) Export the axios instance (named `api`).
 */
export const api = axios.create({
  baseURL,
});

// Interceptor: attach JWT from localStorage if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * For ignoring the same appointment while rescheduling, 
 * your backend might accept:
 *   GET /appointments/day_appointments?dentist_id=X&date=YYYY-MM-DD&ignore_id=Y
 * So we add an optional `ignoreId` param here.
 */
export async function getDayAppointments(
  dentistId: number,
  date: string,
  ignoreId?: number
) {
  const params: any = {
    dentist_id: dentistId,
    date: date,
  };
  if (ignoreId) {
    params.ignore_id = ignoreId;
  }

  return api.get('/appointments/day_appointments', { params });
}

/** -- Additional Example endpoints: -- */

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
 * Update the current user (e.g., phone, email, etc.)
 */
export async function updateCurrentUser(data: {
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
}) {
  return api.patch('/users/current', {
    user: data,
  });
}

/**
 * DENTISTS
 */
export async function getDentists() {
  return api.get('/dentists');
}

export async function getDentistAvailability(dentistId: number) {
  return api.get(`/dentists/${dentistId}/availabilities`);
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
  return api.post('/appointments', { appointment: data });
}

export async function updateAppointment(appointmentId: number, data: any) {
  return api.patch(`/appointments/${appointmentId}`, { appointment: data });
}

export async function cancelAppointment(appointmentId: number) {
  return api.delete(`/appointments/${appointmentId}`);
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
  return api.patch('/users/current', {
    user: {
      provider_name: insuranceData.providerName,
      policy_number: insuranceData.policyNumber,
      plan_type: insuranceData.planType,
    },
  });
}

/**
 * USERS (Admin-only)
 */
export async function getUsers(page = 1, perPage = 10) {
  return api.get('/users', {
    params: { page, per_page: perPage },
  });
}

export async function promoteUser(userId: number) {
  return api.patch(`/users/${userId}/promote`);
}

/** 
 * Search users by name/email (Admin-only).
 * GET /users/search?q=...&page=...&per_page=...
 */
export async function searchUsers(query: string, page = 1, perPage = 10) {
  return api.get('/users/search', {
    params: { q: query, page, per_page: perPage },
  });
}

/**
 * CLOSED DAYS (new table + model + controller)
 * If your backend exposes /closed_days, 
 * you can fetch, create, and delete them like this:
 */

// Fetch all closed days
export async function getClosedDays() {
  return api.get<ClosedDay[]>('/closed_days');
}

// Create a new closed day
export async function createClosedDay(data: { date: string; reason?: string }) {
  return api.post('/closed_days', { closed_day: data });
}

// Delete a closed day by ID
export async function deleteClosedDay(id: number) {
  return api.delete(`/closed_days/${id}`);
}
