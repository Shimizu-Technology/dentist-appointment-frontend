// File: /src/lib/api.ts

import axios from 'axios';

// Decide which base URL to use, depending on environment (dev or prod)
const baseURL = import.meta.env.PROD
  ? import.meta.env.VITE_PROD_API_BASE_URL
  : import.meta.env.VITE_LOCAL_API_BASE_URL;

// Create axios instance
const api = axios.create({
  baseURL,
});

// Interceptor to attach token (if any) from localStorage
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
 * Corresponds to POST /api/v1/login
 */
export async function login(email: string, password: string) {
  return api.post('/login', { email, password });
}

/**
 * Sign up a new user. If the current user is admin and `role === 'admin'` is passed,
 * the new user can be created as an admin. Otherwise, defaults to 'user'.
 * Corresponds to POST /api/v1/users
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
      role, // If the current user is admin, this can be 'admin'; otherwise ignored by the backend.
    },
  });
}

/**
 * Update the currently logged-in user's profile (firstName, lastName, phone, email).
 * Corresponds to PATCH /api/v1/users/current
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
// NEW ADMIN FEATURES (Users management)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get a list of all users (admin-only).
 * Corresponds to GET /api/v1/users
 */
export async function getUsers() {
  return api.get('/users');
}

/**
 * Promote a user (by ID) to admin role (admin-only).
 * Corresponds to PATCH /api/v1/users/:id/promote
 */
export async function promoteUser(userId: number) {
  return api.patch(`/users/${userId}/promote`);
}

// (If you add a demote action in the backend, you could do something like:
// export async function demoteUser(userId: number) {
//   return api.patch(`/users/${userId}/demote`);
// })

// ─────────────────────────────────────────────────────────────────────────────
// DENTISTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch all dentists (public).
 * Corresponds to GET /api/v1/dentists
 */
export async function getDentists() {
  return api.get('/dentists');
}

/**
 * Fetch availability for a specific dentist.
 * Corresponds to GET /api/v1/dentists/:id/availabilities
 */
export async function getDentistAvailability(dentistId: number) {
  return api.get(`/dentists/${dentistId}/availabilities`);
}

// ─────────────────────────────────────────────────────────────────────────────
// APPOINTMENT TYPES (Admin can create, update, delete; public can read)
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
 * Get appointments:
 *  - Admin sees all
 *  - Regular user sees only their own
 * Supports pagination via `page` and `perPage`.
 * Corresponds to GET /api/v1/appointments
 */
export async function getAppointments(page?: number, perPage?: number) {
  return api.get('/appointments', {
    params: {
      page,
      per_page: perPage,
    },
  });
}

/**
 * Create an appointment for the current user (or their dependent).
 * Corresponds to POST /api/v1/appointments
 */
export async function createAppointment(data: any) {
  return api.post('/appointments', { appointment: data });
}

/**
 * Update an existing appointment.
 * Corresponds to PATCH /api/v1/appointments/:id
 */
export async function updateAppointment(appointmentId: number, data: any) {
  return api.patch(`/appointments/${appointmentId}`, { appointment: data });
}

/**
 * Cancel (delete) an appointment by ID.
 * Corresponds to DELETE /api/v1/appointments/:id
 */
export async function cancelAppointment(appointmentId: number) {
  return api.delete(`/appointments/${appointmentId}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// INSURANCE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Update insurance info for the current user.
 * Corresponds to PATCH /api/v1/users/current/insurance
 */
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
