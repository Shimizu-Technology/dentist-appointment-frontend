// File: src/lib/api.ts

import axios from 'axios';

// Decide which base URL to use, depending on environment (dev or prod).
const baseURL = import.meta.env.PROD
  ? import.meta.env.VITE_PROD_API_BASE_URL
  : import.meta.env.VITE_LOCAL_API_BASE_URL;

// Create axios instance
const api = axios.create({
  baseURL,
});

// Interceptor to attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─────────────────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Log a user in. Returns a JWT plus user info on success.
 * @param email
 * @param password
 */
export async function login(email: string, password: string) {
  return api.post('/login', { email, password });
}

/**
 * Sign up a new user. If the current user is admin and `role === 'admin'` is passed,
 * the new user can be created as an admin. Otherwise, defaults to 'user'.
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
      role, // can be 'admin' if the current user is already admin
    },
  });
}

/**
 * Update the currently logged-in user's profile (firstName, lastName, phone, email).
 */
export async function updateCurrentUser(data: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
}) {
  return api.patch('/users/current', {
    user: data,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN FEATURES: Users
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get a paginated list of all users (admin-only).
 * @param page - which page to fetch
 * @param perPage - how many items per page
 */
export async function getUsers(page = 1, perPage = 10) {
  return api.get('/users', {
    params: {
      page,
      per_page: perPage,
    },
  });
}

/**
 * Promote a user (by ID) to admin role (admin-only).
 */
export async function promoteUser(userId: number) {
  return api.patch(`/users/${userId}/promote`);
}

// ─────────────────────────────────────────────────────────────────────────────
// DENTISTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch all dentists (public).
 */
export async function getDentists() {
  return api.get('/dentists');
}

/**
 * Fetch availability for a specific dentist.
 */
export async function getDentistAvailability(dentistId: number) {
  return api.get(`/dentists/${dentistId}/availabilities`);
}

// ─────────────────────────────────────────────────────────────────────────────
// APPOINTMENT TYPES
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// APPOINTMENTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get appointments. If admin, returns all; if regular user, returns own.
 * @param page - optional
 * @param perPage - optional
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

// ─────────────────────────────────────────────────────────────────────────────
// INSURANCE
// ─────────────────────────────────────────────────────────────────────────────

export async function updateInsurance(insuranceData: {
  providerName: string;
  policyNumber: string;
  planType: string;
}) {
  return api.patch('/users/current/insurance', {
    user: {
      provider_name: insuranceData.providerName,
      policy_number: insuranceData.policyNumber,
      plan_type: insuranceData.planType,
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// DEPENDENTS
// ─────────────────────────────────────────────────────────────────────────────

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
