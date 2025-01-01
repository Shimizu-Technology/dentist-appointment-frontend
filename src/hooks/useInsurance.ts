import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateInsurance } from '../lib/api';
import { useAuthStore } from '../store/authStore';

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
    }
  });

  return {
    updateInsurance: mutation.mutate,
    isUpdating: mutation.isPending,
    error: mutation.error
  };
}