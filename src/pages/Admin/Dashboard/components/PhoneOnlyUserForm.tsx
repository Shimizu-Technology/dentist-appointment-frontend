// File: /src/pages/Admin/Dashboard/components/PhoneOnlyUserForm.tsx
import { useState } from 'react';
import { api } from '../../../../lib/api';
import Button from '../../../../components/UI/Button';
import toast from 'react-hot-toast';

interface PhoneOnlyUserFormProps {
  onCreateSuccess: (userId: number) => void;
  onCancel: () => void;
}

export default function PhoneOnlyUserForm({ onCreateSuccess, onCancel }: PhoneOnlyUserFormProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [phone,     setPhone]     = useState('');
  const [isSaving,  setIsSaving]  = useState(false);

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const payload = {
        user: {
          role: 'phone_only',
          first_name: firstName,
          last_name:  lastName,
          phone
        }
      };
      const response = await api.post('/users', payload);
      const newUser = response.data.user;
      toast.success(`Created phone-only user #${newUser.id}`);
      onCreateSuccess(newUser.id);
    } catch (err: any) {
      toast.error(`Failed to create phone-only user: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="border border-gray-200 p-4 rounded-md mt-4 space-y-3">
      <h4 className="text-base font-semibold text-gray-900">Create Phone-Only User</h4>

      <div>
        <label className="block text-sm font-medium text-gray-700">First Name</label>
        <input
          type="text"
          className="mt-1 block w-full border rounded-md px-3 py-2 text-sm"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Last Name</label>
        <input
          type="text"
          className="mt-1 block w-full border rounded-md px-3 py-2 text-sm"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Phone</label>
        <input
          type="text"
          className="mt-1 block w-full border rounded-md px-3 py-2 text-sm"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} isLoading={isSaving}>
          Save
        </Button>
      </div>
    </div>
  );
}
