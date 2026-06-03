"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Calendar, ChevronRight, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { getMonths, deleteMonth } from "@/lib/api";
import { setStockNavSource } from "@/lib/stock-nav";
import ConfirmModal from "@/components/ConfirmModal";

interface Year {
  id: string;
  year: number;
}

export default function StockPage() {
  const [years, setYears] = useState<Year[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    loadYears();
  }, []);

  async function loadYears() {
    try {
      setLoading(true);
      setError("");
      const months = await getMonths();
      const yearMap = new Map<number, Year>();
      months.forEach((m) => {
        if (!yearMap.has(m.year)) {
          yearMap.set(m.year, { id: String(m.id), year: m.year });
        }
      });
      setYears(Array.from(yearMap.values()).sort((a, b) => b.year - a.year));
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to load years");
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = (year: number) => {
    setConfirmDelete(year);
  };

  const confirmDeleteYear = async () => {
    if (confirmDelete === null) return;
    try {
      const months = await getMonths();
      const yearMonths = months.filter((m) => m.year === confirmDelete);
      for (const m of yearMonths) {
        await deleteMonth(m.id);
      }
      toast.success("Year deleted successfully");
      await loadYears();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to delete year");
    } finally {
      setConfirmDelete(null);
    }
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
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-2">Select a year to view monthly stock records</p>
          {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {years.map((year) => (
            <div
              key={year.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">{year.year}</h3>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(year.year)}
                    className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <Link
                  href={`/stock/${year.year}`}
                  onClick={() => setStockNavSource('dashboard')}
                  className="flex items-center justify-between w-full px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                >
                  <span className="text-sm font-medium text-gray-700">View Months</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {years.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No years yet</h3>
            <p className="text-gray-500">
              Create a month from the Stock Mgt tab to get started.
            </p>
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirmDelete !== null}
        title="Delete Year"
        message="Are you sure you want to delete this year? All associated months and data will be removed. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDeleteYear}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}