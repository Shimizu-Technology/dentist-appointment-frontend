// File: /src/pages/Admin/Dashboard/DentistPhotoUploadModal.tsx
import { useState } from 'react';
import { X } from 'lucide-react'; // or any icon
import Button from '../../../components/UI/Button';
import { uploadDentistImage } from '../../../lib/api';
import toast from 'react-hot-toast';

interface DentistPhotoUploadModalProps {
  dentistId: number;
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: () => void;
}

export default function DentistPhotoUploadModal({
  dentistId,
  isOpen,
  onClose,
  onUploadSuccess,
}: DentistPhotoUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select an image file first');
      return;
    }

    setIsUploading(true);
    try {
      await uploadDentistImage(dentistId, selectedFile);
      toast.success('Image uploaded successfully');
      onClose();
      onUploadSuccess?.();
    } catch (err: any) {
      toast.error(`Failed to upload: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-md w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Upload Dentist Photo</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <input type="file" accept="image/*" onChange={handleFileChange} />

          {selectedFile && (
            <p className="text-gray-600">Selected file: {selectedFile.name}</p>
          )}

          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpload}
              disabled={isUploading || !selectedFile}
              isLoading={isUploading}
            >
              Upload
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
