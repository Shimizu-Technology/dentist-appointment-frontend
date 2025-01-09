// File: /src/components/Insurance/InsuranceForm.tsx
import { useForm } from 'react-hook-form';
import { useInsurance } from '../../hooks/useInsurance';
import Button from '../UI/Button';
import Input from '../UI/Input';
import toast from 'react-hot-toast';

interface InsuranceFormData {
  providerName: string;
  policyNumber: string;
  planType: string;
}

interface InsuranceFormProps {
  currentInfo?: {
    providerName?: string;
    policyNumber?: string;
    planType?: string;
  };
  onSuccess?: () => void;
}

export default function InsuranceForm({ currentInfo, onSuccess }: InsuranceFormProps) {
  const { updateInsurance, isUpdating } = useInsurance();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<InsuranceFormData>({
    mode: 'onChange',
    defaultValues: currentInfo,
  });

  const onSubmit = async (data: InsuranceFormData) => {
    updateInsurance(data, {
      onSuccess: () => {
        onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(`Failed to update insurance: ${error.message}`);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Insurance Provider"
        required
        {...register('providerName', { required: 'Provider name is required' })}
        error={errors.providerName?.message}
      />

      <Input
        label="Policy Number"
        required
        {...register('policyNumber', { required: 'Policy number is required' })}
        error={errors.policyNumber?.message}
      />

      <Input
        label="Plan Type"
        required
        {...register('planType', { required: 'Plan type is required' })}
        placeholder="e.g., PPO, HMO"
        error={errors.planType?.message}
      />

      <Button
        type="submit"
        isLoading={isUpdating}
        disabled={isUpdating || !isValid}
        className="w-full"
      >
        Save Insurance Information
      </Button>
    </form>
  );
}
