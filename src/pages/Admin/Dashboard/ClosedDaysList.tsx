// File: /src/pages/Admin/Dashboard/ClosedDaysList.tsx

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClosedDays, createClosedDay, deleteClosedDay } from '../../../lib/api';
import type { ClosedDay } from '../../../types';
import Button from '../../../components/UI/Button';
import toast from 'react-hot-toast';

export default function ClosedDaysList() {
  const queryClient = useQueryClient();

  // Local state for “add new closed day” form
  const [formDate, setFormDate] = useState('');
  const [formReason, setFormReason] = useState('');

  // Query: fetch closed days
  const { data, isLoading, error } = useQuery<ClosedDay[]>({
    queryKey: ['closed-days'],
    queryFn: async () => {
      const response = await getClosedDays();
      return response.data; 
    },
  });

  // CREATE
  const createMutation = useMutation({
    mutationFn: (payload: { date: string; reason?: string }) => createClosedDay(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['closed-days'] });
      setFormDate('');
      setFormReason('');
      toast.success('Closed day added!');
    },
    onError: (err: any) => {
      toast.error(`Failed to create closed day: ${err.message}`);
    },
  });

  // DELETE
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteClosedDay(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['closed-days'] });
      toast.success('Closed day removed!');
    },
    onError: (err: any) => {
      toast.error(`Failed to delete closed day: ${err.message}`);
    },
  });

  // Handler: create new closed day
  const handleAddClosedDay = () => {
    if (!formDate) {
      toast.error('Please enter a valid date.');
      return;
    }
    createMutation.mutate({
      date: formDate,
      reason: formReason.trim() || undefined,
    });
  };

  if (isLoading) {
    return <div>Loading closed days...</div>;
  }
  if (error) {
    return <div className="text-red-600">Error loading closed days.</div>;
  }
  if (!data) {
    return null; 
  }

  // Sort the closed days by date ascending
  const sortedClosedDays = [...data].sort((a, b) => {
    const aDate = new Date(a.date).getTime();
    const bDate = new Date(b.date).getTime();
    return aDate - bDate;
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Closed Days</h2>

      {/* Add new closed day */}
      <div className="bg-white p-4 rounded-md shadow space-y-4 max-w-md">
        <h3 className="text-lg font-medium text-gray-800">Add New Closed Day</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            value={formDate}
            onChange={(e) => setFormDate(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none 
                       focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason (optional)
          </label>
          <input
            type="text"
            value={formReason}
            onChange={(e) => setFormReason(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none 
                       focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="e.g. Holiday, Maintenance, etc."
          />
        </div>

        <Button
          variant="primary"
          onClick={handleAddClosedDay}
          isLoading={createMutation.isLoading}
        >
          Add Closed Day
        </Button>
      </div>

      {/* Existing closed days list */}
      <div className="bg-white p-4 rounded-md shadow space-y-4">
        <h3 className="text-lg font-medium text-gray-800">Existing Closed Days</h3>

        {sortedClosedDays.length === 0 ? (
          <p className="text-gray-500">No closed days found.</p>
        ) : (
          <ul className="space-y-3">
            {sortedClosedDays.map((cd) => (
              <li
                key={cd.id}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
              >
                <div>
                  <p className="font-medium text-gray-900">{cd.date}</p>
                  {cd.reason && (
                    <p className="text-sm text-gray-500">Reason: {cd.reason}</p>
                  )}
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => deleteMutation.mutate(cd.id)}
                  isLoading={deleteMutation.isLoading}
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
