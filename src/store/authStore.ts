// File: /src/store/authStore.ts

import { create } from 'zustand';
import { User } from '../types';
import { getCurrentUser } from '../lib/api';  // <-- We'll define this in api.ts

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;

  // NEW: fetch the current user from the server, store in Zustand
  refreshCurrentUser: () => Promise<void>;
}

// Attempt to load user from localStorage if it exists
const storedUser = localStorage.getItem('user');
const initialUser = storedUser ? (JSON.parse(storedUser) as User) : null;
const initialToken = localStorage.getItem('token') || null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialUser,
  token: initialToken,

  setAuth: (user: User, token: string) => {
    // Save both token and user to localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    // Update Zustand state
    set({ user, token });
  },

  clearAuth: () => {
    // Remove both token and user from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Reset state in the store
    set({ user: null, token: null });
  },

  isAuthenticated: () => {
    return !!get().token;
  },

  isAdmin: () => {
    return get().user?.role === 'admin';
  },

  refreshCurrentUser: async () => {
    const { token } = get();
    if (!token) {
      console.log('[authStore] refreshCurrentUser => no token, skipping');
      return;
    }
    console.log('[authStore] refreshCurrentUser => token found, calling getCurrentUser()...');

    try {
      const res = await getCurrentUser();
      // Expect the server to return { user: {...} }
      const freshUser = res.data.user;
      console.log('[authStore] refreshCurrentUser => got user:', freshUser);

      // Update store and localStorage
      set({ user: freshUser });
      localStorage.setItem('user', JSON.stringify(freshUser));
    } catch (err) {
      console.error('[authStore] refreshCurrentUser failed =>', err);
    }
  },
}));
