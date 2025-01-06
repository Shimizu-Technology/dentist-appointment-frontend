// File: /src/pages/Admin/Dashboard/NextAvailableTool.tsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Button from '../../../components/UI/Button';
import { getNextAvailable, getDentists, getAppointmentTypes } from '../../../lib/api';
import type { Dentist, AppointmentType } from '../../../types';

/**
 * This component allows the admin to pick:
 * - Dentist (optional)
 * - Appointment Type (optional but recommended for correct duration)
 * - limit (how many slots to fetch)
 * Then calls GET /appointments/next_available and shows results.
 */
export default function NextAvailableTool() {
  const [dentistId, setDentistId] = useState<number | ''>('');
  const [appointmentTypeId, setAppointmentTypeId] = useState<number | ''>('');
  const [limit, setLimit] = useState<number>(3);

  const [slots, setSlots] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Query for dentist list
  const { data: dentistData } = useQuery<Dentist[]>({
    queryKey: ['dentists'],
    queryFn: async () => {
      const res = await getDentists();
      return res.data;
    },
  });

  // Query for appointment types
  const { data: typeData } = useQuery<AppointmentType[]>({
    queryKey: ['appointmentTypes'],
    queryFn: async () => {
      const res = await getAppointmentTypes();
      return res.data;
    },
  });

  async function handleSearch() {
    try {
      setIsLoadingSlots(true);
      setError(null);
      setSlots([]);

      const params: any = {};
      if (dentistId) {
        params.dentistId = dentistId;
      }
      if (appointmentTypeId) {
        params.appointmentTypeId = appointmentTypeId;
      }
      if (limit) {
        params.limit = limit;
      }

      const response = await getNextAvailable(params);
      // e.g. { data: { nextAvailableSlots: string[] } }
      const nextAvailableSlots: string[] = response.data.nextAvailableSlots || [];
      setSlots(nextAvailableSlots);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch next available slots');
    } finally {
      setIsLoadingSlots(false);
    }
  }

  return (
    <div className="bg-white shadow-md p-6 rounded-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Find Next Available Slot
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Dentist Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dentist (optional)
          </label>
          <select
            className="border border-gray-300 rounded-md px-3 py-2 w-full"
            value={dentistId}
            onChange={(e) => setDentistId(e.target.value ? Number(e.target.value) : '')}
          >
            <option value="">Any Dentist</option>
            {dentistData?.map((d) => (
              <option key={d.id} value={d.id}>
                Dr. {d.firstName} {d.lastName}
              </option>
            ))}
          </select>
        </div>

        {/* Appointment Type Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Appointment Type (optional)
          </label>
          <select
            className="border border-gray-300 rounded-md px-3 py-2 w-full"
            value={appointmentTypeId}
            onChange={(e) =>
              setAppointmentTypeId(e.target.value ? Number(e.target.value) : '')
            }
          >
            <option value="">No preference</option>
            {typeData?.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name} ({type.duration} min)
              </option>
            ))}
          </select>
        </div>

        {/* Limit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            How many slots?
          </label>
          <input
            type="number"
            className="border border-gray-300 rounded-md px-3 py-2 w-full"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            min={1}
          />
        </div>
      </div>

      {/* Search Button */}
      <Button onClick={handleSearch} isLoading={isLoadingSlots}>
        Find Next Available
      </Button>

      {/* Error */}
      {error && (
        <p className="text-red-600 mt-4">{error}</p>
      )}

      {/* Results */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Available Slots:
        </h3>
        {isLoadingSlots ? (
          <p>Loading...</p>
        ) : slots.length === 0 ? (
          <p className="text-gray-500">No slots found or none loaded yet.</p>
        ) : (
          <ul className="space-y-2">
            {slots.map((slot) => (
              <li key={slot} className="p-2 border border-gray-200 rounded">
                {slot}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
