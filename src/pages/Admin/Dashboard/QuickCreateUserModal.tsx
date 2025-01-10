// File: /src/pages/Admin/Dashboard/QuickCreateUserModal.tsx

import { useState } from 'react';
import { createUser } from '../../../lib/api'; // Our admin user creation API
import Button from '../../../components/UI/Button';
import toast from 'react-hot-toast';

interface QuickCreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: (newUser: any) => void;  // adjust to your user type as needed
}

export default function QuickCreateUserModal({
  isOpen,
  onClose,
  onUserCreated,
}: QuickCreateUserModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [phone,     setPhone]     = useState('');
  const [isSaving,  setIsSaving]  = useState(false);

  if (!isOpen) return null;

  async function handleSave() {
    setIsSaving(true);
    try {
      const payload = {
        firstName,
        lastName,
        email,
        phone,
        role: 'user', // or let them pick admin/phone_only if needed
      };
      const response = await createUser(payload);
      const newUser = response.data.user; // depends on your backend shape
      toast.success('User created successfully!');
      onUserCreated(newUser);
      onClose();
    } catch (err: any) {
      toast.error(`Failed to create user: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Create User</h2>

        <div className="space-y-3 mb-4">
          <input
            type="text"
            className="border w-full px-3 py-2 rounded"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            type="text"
            className="border w-full px-3 py-2 rounded"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <input
            type="email"
            className="border w-full px-3 py-2 rounded"
            placeholder="Email (optional if phone_only?)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="tel"
            className="border w-full px-3 py-2 rounded"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="flex space-x-3 justify-end">
          <Button variant="secondary" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
