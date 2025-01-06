// File: /src/hooks/useInsurance.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateInsurance } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export function useInsurance() {
  const queryClient = useQueryClient();
  const { user, setAuth } = useAuthStore();

  const mutation = useMutation({
    mutationFn: updateInsurance,
    onSuccess: (response) => {
      // Update the user in auth store with new insurance info
      if (user) {
        setAuth(
          { ...user, insuranceInfo: response.data.insuranceInfo },
          localStorage.getItem('token') || ''
        );
      }
      // Invalidate any relevant queries
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Insurance information updated!');
    },
    onError: (err: any) => {
      toast.error(`Failed to update insurance: ${err.message}`);
    },
  });

  return {
    updateInsurance: mutation.mutate,
    isUpdating: mutation.isPending,
    error: mutation.error
  };
}
