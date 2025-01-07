// File: /src/lib/api.ts

import axios from 'axios';
import type { ClosedDay } from '../../types';

/**
 * 1) Determine baseURL for API calls, based on environment:
 *    - VITE_LOCAL_API_BASE_URL => e.g. http://localhost:3000/api/v1
 *    - VITE_PROD_API_BASE_URL  => e.g. https://yourdomain.com/api/v1
 */
const baseURL = import.meta.env.PROD
  ? import.meta.env.VITE_PROD_API_BASE_URL
  : import.meta.env.VITE_LOCAL_API_BASE_URL;

// 2) Export the axios instance with attached baseURL
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
 * (Optional) A helper function for building a “full” absolute URL for images.
 * If your DB stores something like "/uploads/dentists/dentist_1_123.jpg"
 * and you need "http://localhost:3000/uploads/dentists/...", you can use this.
 *
 * Explanation:
 * - We start with the `baseURL`, which might be "http://localhost:3000/api/v1"
 * - We remove the trailing "/api/v1" to get just "http://localhost:3000"
 * - We then append the relative path stored in the DB.
 */
export function buildFullImageUrl(imagePath?: string): string {
  if (!imagePath) return '';

  // 1) Remove trailing slash if any
  const trimmedBase = baseURL.replace(/\/$/, '');

  // 2) Remove "/api/v1" at the end if present
  //    That yields "http://localhost:3000" in dev, or your production domain
  const baseRoot = trimmedBase.replace(/\/api\/v1$/, '');

  // 3) If the stored path is already absolute (starts with http or //), just return it
  if (imagePath.startsWith('http') || imagePath.startsWith('//')) {
    return imagePath;
  }

  // 4) Otherwise, it’s probably a relative path like "/uploads/..."
  return baseRoot + imagePath;
}


/** ----------------------------------------------------------------
 * DAY APPOINTMENTS
 * ----------------------------------------------------------------*/
export async function getDayAppointments(
  dentistId: number,
  date: string,
  ignoreId?: number
) {
  const params: any = { dentist_id: dentistId, date };
  if (ignoreId) {
    params.ignore_id = ignoreId;
  }
  return api.get('/appointments/day_appointments', { params });
}


/** ----------------------------------------------------------------
 * AUTH / SESSIONS
 * ----------------------------------------------------------------*/
export async function login(email: string, password: string) {
  return api.post('/login', { email, password });
}

// Accepts phone as an optional fifth parameter
export async function signup(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  phone?: string,
  role?: string
) {
  return api.post('/users', {
    user: {
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      phone,
      role,
    },
  });
}


/** ----------------------------------------------------------------
 * CURRENT USER
 * ----------------------------------------------------------------*/
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


/** ----------------------------------------------------------------
 * DENTISTS
 * ----------------------------------------------------------------*/
export async function getDentists() {
  // GET /api/v1/dentists
  return api.get('/dentists');
}

export async function getDentistAvailability(dentistId: number) {
  // GET /api/v1/dentists/:id/availabilities
  return api.get(`/dentists/${dentistId}/availabilities`);
}

// CREATE (Admin) => POST /api/v1/dentists
export async function createDentist(data: {
  first_name: string;
  last_name: string;
  specialty_id?: number | null;
  qualifications?: string;
}) {
  return api.post('/dentists', { dentist: data });
}

// UPDATE (Admin) => PATCH /api/v1/dentists/:id
export async function updateDentist(dentistId: number, data: any) {
  return api.patch(`/dentists/${dentistId}`, { dentist: data });
}

// DELETE (Admin) => DELETE /api/v1/dentists/:id
export async function deleteDentist(dentistId: number) {
  return api.delete(`/dentists/${dentistId}`);
}


/** ----------------------------------------------------------------
 * APPOINTMENTS
 * ----------------------------------------------------------------*/
export async function getAppointments(
  page?: number,
  perPage?: number,
  dentistId?: number,
  opts?: { onlyMine?: boolean }
) {
  const params: any = { page, per_page: perPage, dentist_id: dentistId };

  if (opts?.onlyMine) {
    params.user_id = 'me';
  }

  return api.get('/appointments', { params });
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

// NEXT AVAILABLE: e.g. GET /appointments/next_available?dentistId=...
export async function getNextAvailable(params: {
  dentistId?: number;
  appointmentTypeId?: number;
  limit?: number;
}) {
  return api.get('/appointments/next_available', { params });
}


/** ----------------------------------------------------------------
 * APPOINTMENT TYPES
 * ----------------------------------------------------------------*/
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


/** ----------------------------------------------------------------
 * DEPENDENTS
 * ----------------------------------------------------------------*/
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


/** ----------------------------------------------------------------
 * INSURANCE (User updates)
 * ----------------------------------------------------------------*/
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


/** ----------------------------------------------------------------
 * USERS (Admin-only)
 * ----------------------------------------------------------------*/
export async function getUsers(page = 1, perPage = 10) {
  return api.get('/users', { params: { page, per_page: perPage } });
}

export async function promoteUser(userId: number) {
  return api.patch(`/users/${userId}/promote`);
}

// GET /users/search?q=...&page=...&per_page=...
export async function searchUsers(query: string, page = 1, perPage = 10) {
  return api.get('/users/search', { params: { q: query, page, per_page: perPage } });
}


/** ----------------------------------------------------------------
 * CLOSED DAYS
 * ----------------------------------------------------------------*/
export async function getClosedDays() {
  return api.get<ClosedDay[]>('/closed_days');
}

export async function createClosedDay(data: { date: string; reason?: string }) {
  return api.post('/closed_days', { closed_day: data });
}

export async function deleteClosedDay(id: number) {
  return api.delete(`/closed_days/${id}`);
}


/** ----------------------------------------------------------------
 * SCHEDULES (Admin-only)
 * ----------------------------------------------------------------*/
export async function getSchedules() {
  return api.get('/schedule');
}

export async function updateSchedules(data: {
  clinic_open_time: string;
  clinic_close_time: string;
  open_days?: number[];
}) {
  return api.patch('/schedule', data);
}


/** ----------------------------------------------------------------
 * DENTIST UNAVAILABILITIES (Admin)
 * ----------------------------------------------------------------*/
export async function createDentistUnavailability(data: {
  dentist_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
}) {
  return api.post('/dentist_unavailabilities', {
    dentist_unavailability: data,
  });
}

export async function updateDentistUnavailability(
  id: number,
  data: {
    day_of_week: number;
    start_time: string;
    end_time: string;
  }
) {
  return api.patch(`/dentist_unavailabilities/${id}`, {
    dentist_unavailability: data,
  });
}

export async function deleteDentistUnavailability(id: number) {
  return api.delete(`/dentist_unavailabilities/${id}`);
}


/** ----------------------------------------------------------------
 * DENTIST IMAGE UPLOAD (Admin-only)
 * ----------------------------------------------------------------*/
export async function uploadDentistImage(dentistId: number, file: File) {
  const formData = new FormData();
  formData.append('image', file);

  // POST /dentists/:id/upload_image
  return api.post(`/dentists/${dentistId}/upload_image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}
