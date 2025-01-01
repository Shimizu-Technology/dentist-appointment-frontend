import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import Button from '../../../components/UI/Button';
import Input from '../../../components/UI/Input';
import { useAuth } from '../../../hooks/useAuth';

interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export default function SignupForm() {
  const { signup } = useAuth();
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<SignupFormData>();

  const onSubmit = async (data: SignupFormData) => {
    const result = await signup(
      data.email,
      data.password,
      data.firstName,
      data.lastName
    );
    if (!result.success) {
      setError('root', { message: result.error });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="First Name"
          {...register('firstName', { required: 'First name is required' })}
          error={errors.firstName?.message}
        />
        <Input
          label="Last Name"
          {...register('lastName', { required: 'Last name is required' })}
          error={errors.lastName?.message}
        />
      </div>

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

      <Input
        label="Confirm Password"
        type="password"
        {...register('confirmPassword', {
          required: 'Please confirm your password',
          validate: (value) =>
            value === watch('password') || 'Passwords do not match'
        })}
        error={errors.confirmPassword?.message}
      />

      {errors.root && (
        <p className="text-red-600 text-sm">{errors.root.message}</p>
      )}

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Create Account
      </Button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 hover:text-blue-500">
          Sign in
        </Link>
      </p>
    </form>
  );
}