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
  user: null,
  token: localStorage.getItem('token'),
  
  setAuth: (user: User, token: string) => {
    localStorage.setItem('token', token);
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