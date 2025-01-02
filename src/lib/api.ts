import axios from 'axios';

// Decide which base URL to use, depending on environment (dev or prod)
const baseURL = import.meta.env.PROD
  ? import.meta.env.VITE_PROD_API_BASE_URL
  : import.meta.env.VITE_LOCAL_API_BASE_URL

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

// Auth
export async function login(email: string, password: string) {
  return api.post('/login', { email, password });
}

export async function signup(
  email: string,
  password: string,
  firstName: string,
  lastName: string
) {
  return api.post('/users', {
    user: {
      email,
      password,
      first_name: firstName,
      last_name: lastName,
    },
  });
}

// Dentists
export async function getDentists() {
  return api.get('/dentists');
}

// Appointment Types
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

// Appointments
// -- Updated to accept page + perPage
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

// Availabilities
export async function getDentistAvailability(dentistId: number) {
  return api.get(`/dentists/${dentistId}/availabilities`);
}

// Insurance
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

// Dependents
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
