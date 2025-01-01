import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { login as loginApi, signup as signupApi } from '../lib/api';

export function useAuth() {
  const { setAuth, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await loginApi(email, password);
      const { user, token } = response.data;
      setAuth(user, token);
      navigate('/');
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: 'Invalid email or password' 
      };
    }
  }, [setAuth, navigate]);

  const signup = useCallback(async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string
  ) => {
    try {
      const response = await signupApi(email, password, firstName, lastName);
      const { user, token } = response.data;
      setAuth(user, token);
      navigate('/');
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: 'Failed to create account' 
      };
    }
  }, [setAuth, navigate]);

  const logout = useCallback(() => {
    clearAuth();
    navigate('/login');
  }, [clearAuth, navigate]);

  return { login, signup, logout };
}