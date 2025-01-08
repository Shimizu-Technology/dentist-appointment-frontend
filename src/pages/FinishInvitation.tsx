// File: /src/pages/FinishInvitation.tsx

import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import { finishInvitation } from '../lib/api';  // The function we added in api.ts
import { useAuthStore } from '../store/authStore'; // or wherever you keep global auth

export default function FinishInvitation() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const { setAuth } = useAuthStore();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If no token, show error
  useEffect(() => {
    if (!token) {
      setError('No invitation token provided. Please check your link.');
    }
  }, [token]);

  async function handleFinishInvitation(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // PATCH /invitations/finish => { token, password }
      const response = await finishInvitation(token, password);
      // Should return { jwt, user } if success
      const { jwt, user } = response.data;

      // Store in your auth store (Zustand, Redux, etc.)
      setAuth(user, jwt);

      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to finish invitation.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="max-w-md mx-auto mt-16 px-4">
        <h1 className="text-2xl font-bold mb-4">Finish Invitation</h1>
        <p className="text-red-600">{error || 'Missing token.'}</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Finish Invitation</h1>
        <p className="text-green-600 mb-6">
          Your account is now set up and you are logged in!
        </p>
        <Button variant="primary" onClick={() => navigate('/profile')}>
          Go to My Profile
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16 px-4">
      <h1 className="text-2xl font-bold mb-6">Finish Invitation</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <p className="mb-4 text-gray-700">
        Please set a new password to complete your account setup:
      </p>

      <form onSubmit={handleFinishInvitation} className="space-y-4">
        <Input
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Choose a strong password"
        />

        <Button
          variant="primary"
          type="submit"
          disabled={isSubmitting || !password}
          isLoading={isSubmitting}
        >
          Finish Invitation
        </Button>
      </form>
    </div>
  );
}
