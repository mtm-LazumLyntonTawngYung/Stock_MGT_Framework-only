"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Calendar, ChevronRight, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getMonths, deleteMonth } from "@/lib/api";
import { setStockNavSource } from "@/lib/stock-nav";
import ConfirmModal from "@/components/ConfirmModal";

interface Month {
  id: string;
  name: string;
  month: number;
}

export default function YearMonthsPage() {
  const params = useParams();
  const router = useRouter();
  const year = params.year as string;

  const [months, setMonths] = useState<Month[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  useEffect(() => {
    loadMonths();
  }, [year]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadMonths() {
    try {
      setLoading(true);
      setError("");
      const data = await getMonths();
      const yearMonths = data
        .filter((m) => m.year === parseInt(year))
        .map((m) => ({
          id: String(m.id),
          name: `${year}_${monthNames[m.month - 1]}`,
          month: m.month,
        }))
        .sort((a: Month, b: Month) => a.month - b.month);
      setMonths(yearMonths);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to load months");
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (monthId: string) => {
    setConfirmDelete(monthId);
  };

  const confirmDeleteMonth = async () => {
    if (!confirmDelete) return;
    try {
      await deleteMonth(Number(confirmDelete));
      toast.success("Month deleted successfully");
      await loadMonths();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to delete month");
    } finally {
      setConfirmDelete(null);
    }
  };

  // Check if a month is a previous month (before current month)
  const isPreviousMonth = (month: Month) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const monthYear = parseInt(year);

    // If the year is in the past, it's a previous month
    if (monthYear < currentYear) {
      return true;
    }

    // If it's the current year, check if the month is before current month
    if (monthYear === currentYear && month.month < currentMonth) {
      return true;
    }

    return false;
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.push("/stock")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Years</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-800">{year} - Months</h1>
          <p className="text-gray-600 mt-2">Select a month to view stock records</p>
          {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {months.map((month) => (
            <div
              key={month.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Calendar className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{month.name}</h3>
                      <p className="text-sm text-gray-500">{monthNames[month.month - 1]}</p>
                    </div>
                  </div>
                  {!isPreviousMonth(month) && (
                    <button
                      onClick={() => handleDelete(month.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <Link
                  href={`/stock/${year}/${month.id}`}
                  onClick={() => setStockNavSource('dashboard')}
                  className="flex items-center justify-between w-full px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                >
                  <span className="text-sm font-medium text-gray-700">Manage Stock</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {months.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No months for {year}</h3>
            <p className="text-gray-500">
              Create a month from the Stock Mgt tab to add records for this year.
            </p>
          </div>
        )}

        <ConfirmModal
          open={confirmDelete !== null}
          title="Delete Month"
          message="Are you sure you want to delete this month? All associated stock data will be removed. This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={confirmDeleteMonth}
          onCancel={() => setConfirmDelete(null)}
        />
      </div>
    </div>
  );
}
