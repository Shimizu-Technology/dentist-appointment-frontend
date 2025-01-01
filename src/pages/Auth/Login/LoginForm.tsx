import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import Button from '../../../components/UI/Button';
import Input from '../../../components/UI/Input';
import { useAuth } from '../../../hooks/useAuth';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginForm() {
  const { login } = useAuth();
  const { 
    register, 
    handleSubmit,
    setError,
    formState: { errors, isSubmitting } 
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    const result = await login(data.email, data.password);
    if (!result.success) {
      setError('root', { message: result.error });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        label="Email"
        type="email"
        {...register('email', { 
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address'
          }
        })}
        error={errors.email?.message}
      />

      <Input
        label="Password"
        type="password"
        {...register('password', { 
          required: 'Password is required',
          minLength: {
            value: 6,
            message: 'Password must be at least 6 characters'
          }
        })}
        error={errors.password?.message}
      />

      {errors.root && (
        <p className="text-red-600 text-sm">{errors.root.message}</p>
      )}

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Sign In
      </Button>

      <p className="text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link to="/signup" className="text-blue-600 hover:text-blue-500">
          Sign up
        </Link>
      </p>
    </form>
  );
}