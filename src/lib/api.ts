// File: /src/lib/api.ts

import axios from 'axios';
import type { ClosedDay } from '../../types';

const baseURL = import.meta.env.PROD
  ? import.meta.env.VITE_PROD_API_BASE_URL
  : import.meta.env.VITE_LOCAL_API_BASE_URL;

export const api = axios.create({ baseURL });

// Attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Build a full image URL if needed */
export function buildFullImageUrl(imagePath?: string): string {
  if (!imagePath) return '';
  const trimmedBase = baseURL.replace(/\/$/, '');
  const baseRoot = trimmedBase.replace(/\/api\/v1$/, '');
  if (imagePath.startsWith('http') || imagePath.startsWith('//')) {
    return imagePath;
  }
  return baseRoot + imagePath;
}

/** ----------------------------------------------------------------
 * AUTH
 * ----------------------------------------------------------------*/
export async function login(email: string, password: string) {
  return api.post('/login', { email, password });
}

export async function finishInvitation(token: string, password: string) {
  return api.patch('/invitations/finish', { token, password });
}

export async function signup(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  phone?: string,
  role?: string
) {
  return api.post('/signup', {
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
  return api.patch('/users/current', { user: data });
}

export async function updateInsurance(insuranceData: {
  providerName?: string;
  policyNumber?: string;
  planType?: string;
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
 * APPOINTMENTS
 * ----------------------------------------------------------------*/
export async function getAppointments(
  page?: number,
  perPage?: number,
  dentistId?: number,
  opts?: { onlyMine?: boolean }
) {
  const params: any = { page, per_page: perPage, dentist_id: dentistId };
  if (opts?.onlyMine) params.user_id = 'me';
  return api.get('/appointments', { params });
}

export async function getAppointment(appointmentId: number) {
  return api.get(`/appointments/${appointmentId}`);
}

export async function createAppointment(data: {
  appointment_time: string;
  dentist_id: number;
  appointment_type_id: number;
  notes?: string;
  child_user_id?: number;
}) {
  return api.post('/appointments', {
    appointment: {
      appointment_time:    data.appointment_time,
      dentist_id:          data.dentist_id,
      appointment_type_id: data.appointment_type_id,
      notes:               data.notes || '',
      child_user_id:       data.child_user_id,
    },
  });
}

export async function updateAppointment(appointmentId: number, data: Record<string, any>) {
  return api.patch(`/appointments/${appointmentId}`, { appointment: data });
}

export async function cancelAppointment(appointmentId: number) {
  return api.delete(`/appointments/${appointmentId}`);
}

export async function getDayAppointments(dentistId: number, date: string, ignoreId?: number) {
  const params: any = { dentist_id: dentistId, date };
  if (ignoreId) params.ignore_id = ignoreId;
  return api.get('/appointments/day_appointments', { params });
}

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
 * DENTISTS
 * ----------------------------------------------------------------*/
export async function getDentists() {
  return api.get('/dentists');
}

export async function getDentistAvailability(dentistId: number) {
  return api.get(`/dentists/${dentistId}/availabilities`);
}

export async function deleteDentist(dentistId: number) {
  return api.delete(`/dentists/${dentistId}`);
}

export async function createDentist(data: {
  first_name: string;
  last_name: string;
  specialty_id?: number | null;
  qualifications?: string;
}) {
  return api.post('/dentists', { dentist: data });
}

export async function updateDentist(dentistId: number, data: any) {
  return api.patch(`/dentists/${dentistId}`, { dentist: data });
}

export async function uploadDentistImage(dentistId: number, file: File) {
  const formData = new FormData();
  formData.append('image', file);
  return api.post(`/dentists/${dentistId}/upload_image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

/** ----------------------------------------------------------------
 * CHILD USERS (Normal user usage)
 * ----------------------------------------------------------------*/

// GET /users/my_children => current user's children
export async function getMyChildren() {
  return api.get('/users/my_children');
}

// POST /users/my_children => create child's user under me
export async function createMyChildUser(data: {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}) {
  return api.post('/users/my_children', {
    user: {
      first_name:   data.firstName,
      last_name:    data.lastName,
      date_of_birth: data.dateOfBirth
    },
  });
}

// PATCH /users/my_children/:childId => update child
export async function updateMyChildUser(
  childId: number,
  data: { firstName: string; lastName: string; dateOfBirth: string }
) {
  return api.patch(`/users/my_children/${childId}`, {
    user: {
      first_name:   data.firstName,
      last_name:    data.lastName,
      date_of_birth: data.dateOfBirth
    },
  });
}

// DELETE /users/my_children/:childId => remove child
export async function deleteMyChildUser(childId: number) {
  return api.delete(`/users/my_children/${childId}`);
}

/** ----------------------------------------------------------------
 * ADMIN: Manage child users via /api/v1/admin/children
 * ----------------------------------------------------------------*/

/**
 * GET /api/v1/admin/children?parent_user_id=XX
 */
export async function getAdminChildren(parentUserId: number) {
  return api.get('/admin/children', {
    params: { parent_user_id: parentUserId },
  });
}

// In your /src/lib/api.ts (admin section)

// PATCH /api/v1/admin/children/:childId => update a child user
export async function updateAdminChildUser(
  childId: number,
  payload: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    parent_user_id?: number;
    email?: string;
    phone?: string;
    role?: 'user' | 'admin' | 'phone_only';
  }
) {
  return api.patch(`/admin/children/${childId}`, {
    user: {
      first_name:     payload.firstName,
      last_name:      payload.lastName,
      date_of_birth:  payload.dateOfBirth,
      parent_user_id: payload.parent_user_id,
      email:          payload.email,
      phone:          payload.phone,
      role:           payload.role
    },
  });
}

/**
 * DELETE /api/v1/admin/children/:id => Remove a child user
 */
export async function deleteChildUser(childId: number) {
  return api.delete(`/admin/children/${childId}`);
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

export async function searchUsers(query: string, page = 1, perPage = 10) {
  return api.get('/users/search', { params: { q: query, page, per_page: perPage } });
}

/**
 * Admin: create a user (including child user if is_dependent + parent_user_id are set).
 */
export async function createUser(payload: {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  password?: string;
  role: 'user' | 'admin' | 'phone_only';
  is_dependent?: boolean;
  parent_user_id?: number;
  date_of_birth?: string;
}) {
  return api.post('/users', {
    user: {
      first_name:     payload.firstName,
      last_name:      payload.lastName,
      email:          payload.email,
      phone:          payload.phone,
      password:       payload.password,
      role:           payload.role,
      is_dependent:   payload.is_dependent,
      parent_user_id: payload.parent_user_id,
      date_of_birth:  payload.date_of_birth,
    },
  });
}

/** Admin: update any user */
export async function updateUser(
  userId: number,
  payload: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    password?: string;
    role?: 'user' | 'admin' | 'phone_only';
    is_dependent?: boolean;
    parent_user_id?: number;
    date_of_birth?: string;
  }
) {
  return api.patch(`/users/${userId}`, {
    user: {
      first_name:     payload.firstName,
      last_name:      payload.lastName,
      email:          payload.email,
      phone:          payload.phone,
      password:       payload.password,
      role:           payload.role,
      is_dependent:   payload.is_dependent,
      parent_user_id: payload.parent_user_id,
      date_of_birth:  payload.date_of_birth,
    },
  });
}

export async function deleteUser(userId: number) {
  return api.delete(`/users/${userId}`);
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

export async function updateSchedules(data: any) {
  return api.patch('/schedule', data);
}

/** ----------------------------------------------------------------
 * DENTIST UNAVAILABILITIES (Admin)
 * ----------------------------------------------------------------*/
export async function createDentistUnavailability(data: {
  dentist_id: number;
  date: string;
  start_time: string;
  end_time: string;
}) {
  return api.post('/dentist_unavailabilities', {
    dentist_unavailability: data,
  });
}

export async function updateDentistUnavailability(
  id: number,
  data: { date: string; start_time: string; end_time: string }
) {
  return api.patch(`/dentist_unavailabilities/${id}`, {
    dentist_unavailability: data,
  });
}

export async function deleteDentistUnavailability(id: number) {
  return api.delete(`/dentist_unavailabilities/${id}`);
}

/** ----------------------------------------------------------------
 * APPOINTMENT REMINDERS (Admin-only)
 * ----------------------------------------------------------------*/
export async function getReminders(params: Record<string, any>) {
  return api.get('/appointment_reminders', { params });
}

export async function updateReminder(payload: {
  id: number;
  phone?: string;
  status?: string;
  message?: string;
  scheduledFor?: string;
}) {
  const { id, ...body } = payload;
  return api.patch(`/appointment_reminders/${id}`, {
    appointment_reminder: body,
  });
}
