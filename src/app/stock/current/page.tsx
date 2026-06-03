'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getMonths, createMonth } from '@/lib/api';
import { setStockNavSource } from '@/lib/stock-nav';
import { createMonthSchema } from '@/lib/schemas';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function CurrentStockPage() {
  const router = useRouter();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [months, setMonths] = useState<Awaited<ReturnType<typeof getMonths>>>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    year: currentYear,
    month: currentMonth,
  });

  useEffect(() => {
    getMonths()
      .then((data) => {
        setMonths(data);
        const match = data.find(
          (m) => m.year === currentYear && m.month === currentMonth,
        );
        if (match) {
          setStockNavSource('stock-mgt');
          router.replace(`/stock/${currentYear}/${match.id}`);
        }
      })
      .catch((err: unknown) => {
        setLoadError((err as Error).message || 'Failed to load months');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router, currentYear, currentMonth]);

  const monthExists = months.some(
    (m) => m.year === formData.year && m.month === formData.month,
  );

  const openModal = () => {
    setFormData({ year: currentYear, month: currentMonth });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (monthExists) {
      toast.error('This year and month already exists!');
      return;
    }

    const result = createMonthSchema.safeParse(formData);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    try {
      setSaving(true);
      const result = await createMonth({ month: formData.month, year: formData.year });
      closeModal();
      setStockNavSource('stock-mgt');
      router.replace(`/stock/${formData.year}/${result.id}`);
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to create month');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-600 text-center max-w-md">{loadError}</p>
      </div>
    );
  }

  const hasCurrentMonth = months.some(
    (m) => m.year === currentYear && m.month === currentMonth,
  );

  if (hasCurrentMonth) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-screen gap-6">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Stock Management</h1>
        <p className="text-gray-600">
          No stock record for{' '}
          <span className="font-semibold">
            {monthNames[currentMonth - 1]} {currentYear}
          </span>
          . Create a month to start managing stock.
        </p>
      </div>
      <button
        onClick={openModal}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus className="w-5 h-5" />
        <span>Create Month</span>
      </button>

      {isModalOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={closeModal} />
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md pointer-events-auto">
              <form onSubmit={handleSubmit} className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Month</h2>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                    <select
                      value={formData.year}
                      onChange={(e) =>
                        setFormData({ ...formData, year: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() + i - 5;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Month *</label>
                    <select
                      value={formData.month}
                      onChange={(e) =>
                        setFormData({ ...formData, month: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {monthNames.map((name, index) => (
                        <option key={name} value={index + 1}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Record name:</span>{' '}
                      <span className="text-blue-600">
                        {formData.year}_{monthNames[formData.month - 1]}
                      </span>
                    </p>
                    {monthExists && (
                      <p className="text-xs text-red-600 mt-2">
                        This year and month already exists.
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    disabled={saving || monthExists}
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
