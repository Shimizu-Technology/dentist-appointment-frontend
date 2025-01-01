// src/store/authStore.ts

import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initialize user to null, token from localStorage
  user: null,
  token: localStorage.getItem('token'),

  setAuth: (user: User, token: string) => {
    // Save token to localStorage
    localStorage.setItem('token', token);
    // Set Zustand state
    set({ user, token });
  },

  clearAuth: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  isAuthenticated: () => {
    return !!get().token;
  },

  isAdmin: () => {
    return get().user?.role === 'admin';
  },
}));
