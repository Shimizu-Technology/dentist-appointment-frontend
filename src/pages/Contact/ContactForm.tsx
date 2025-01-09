// File: /src/pages/Contact/ContactForm.tsx
import { useForm } from 'react-hook-form';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export default function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ContactFormData>({
    mode: 'onChange',
  });

  const onSubmit = async (data: ContactFormData) => {
    // TODO: Implement contact form submission
    console.log(data);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Send us a Message</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Full Name"
          required
          {...register('name', { required: 'Name is required' })}
          error={errors.name?.message}
        />

        <Input
          label="Email"
          type="email"
          required
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
          error={errors.email?.message}
        />

        <Input
          label="Phone"
          type="tel"
          required
          {...register('phone', {
            required: 'Phone number is required',
            pattern: {
              value: /^\+?[\d\s-]+$/,
              message: 'Invalid phone number',
            },
          })}
          error={errors.phone?.message}
        />

        {/* For textarea, we don’t have a custom <Input>—just do the asterisk manually */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message <span className="text-red-500 ml-1">*</span>
          </label>
          <textarea
            {...register('message', { required: 'Message is required' })}
            rows={4}
            className={`
              w-full px-3 py-2 border rounded-md shadow-sm
              focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
              ${errors.message ? 'border-red-500' : 'border-gray-300'}
            `}
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
          )}
        </div>

        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={isSubmitting || !isValid}
          className="w-full"
        >
          Send Message
        </Button>
      </form>
    </div>
  );
}
