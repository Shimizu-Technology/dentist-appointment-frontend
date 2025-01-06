// src/hooks/useAuth.ts

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { login as loginApi, signup as signupApi } from '../lib/api';

export function useAuth() {
  const { setAuth, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await loginApi(email, password);
        const { user, jwt } = response.data;
        setAuth(user, jwt);

        console.log('token in localStorage after login:', localStorage.getItem('token'));
        console.log('user in localStorage after login:', localStorage.getItem('user'));

        navigate('/');
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }
    },
    [setAuth, navigate]
  );

  // UPDATED: Accept 'phone' as an optional fifth param
  const signup = useCallback(
    async (
      email: string,
      password: string,
      firstName: string,
      lastName: string,
      phone?: string
    ) => {
      try {
        // Adjust signupApi call to pass phone
        const response = await signupApi(email, password, firstName, lastName, phone);
        const { user, jwt } = response.data;
        setAuth(user, jwt);

        console.log('token in localStorage after signup:', localStorage.getItem('token'));
        console.log('user in localStorage after signup:', localStorage.getItem('user'));

        navigate('/');
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: 'Failed to create account',
        };
      }
    },
    [setAuth, navigate]
  );

  const logout = useCallback(() => {
    clearAuth();
    navigate('/login');
  }, [clearAuth, navigate]);

  return { login, signup, logout };
}
