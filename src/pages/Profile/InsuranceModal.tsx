import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';

interface InsuranceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentInfo?: {
    providerName?: string;
    policyNumber?: string;
    planType?: string;
  };
}

interface FormData {
  providerName: string;
  policyNumber: string;
  planType: string;
}

export default function InsuranceModal({ isOpen, onClose, currentInfo }: InsuranceModalProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: currentInfo
  });

  const onSubmit = async (data: FormData) => {
    try {
      // TODO: Implement save logic
      console.log('Save insurance info:', data);
      onClose();
    } catch (error) {
      console.error('Failed to save insurance info:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {currentInfo ? 'Update' : 'Add'} Insurance Information
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <Input
            label="Insurance Provider"
            {...register('providerName', { required: 'Provider name is required' })}
            error={errors.providerName?.message}
          />

          <Input
            label="Policy Number"
            {...register('policyNumber', { required: 'Policy number is required' })}
            error={errors.policyNumber?.message}
          />

          <Input
            label="Plan Type"
            {...register('planType', { required: 'Plan type is required' })}
            placeholder="e.g., PPO, HMO"
            error={errors.planType?.message}
          />

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}