"use client";

import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  CalendarDays,
  Package,
  DollarSign,
  ShoppingCart,
  Filter,
  BarChart3,
  Loader2,
} from "lucide-react";
import { getPurchases, getCategories, createPurchase, updatePurchase } from "@/lib/api";
import type { Category } from "@/lib/types";
import { purchaseFormSchema } from "@/lib/schemas";
import { formatZodErrors } from "@/lib/validate";

interface Purchase {
  id: string;
  purchase_date: string;
  quantity: number;
  purchase_price: number;
  unit_price: number;
  quantity_per_unit: number;
  discount_amount: number;
  discount_price: number;
  category_id: number;
  categoryName?: string;
  created_at: string;
}

interface ComparisonRow {
  categoryName: string;
  months: {
    label: string;
    quantity: number;
    quantity_per_unit: number;
    unit_price: number;
    discount_amount: number;
    total_price: number;
  }[];
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function getMonthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function getMonthLabel(year: number, month: number) {
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

function parseDate(dateStr: string) {
  const parts = dateStr.split('-');
  return { year: parseInt(parts[0]), month: parseInt(parts[1]) };
}

function calculateUnitPrice(quantity: number, quantityPerUnit: number, totalPrice: number): number {
  const totalItems = quantity * quantityPerUnit;
  if (totalItems <= 0) return 0;
  return totalPrice / totalItems;
}

function buildCategoryTree(flat: Category[]): Category[] {
  const map = new Map<number, Category>();
  const roots: Category[] = [];
  flat.forEach((item) => {
    map.set(Number(item.id), { ...item, children: [] });
  });
  flat.forEach((item) => {
    const node = map.get(Number(item.id))!;
    if (item.parent_id && map.has(Number(item.parent_id))) {
      map.get(Number(item.parent_id))!.children!.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedParentCategory, setSelectedParentCategory] = useState("");
  const [selectedCompareMonth, setSelectedCompareMonth] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const [purchasesData, categoriesData] = await Promise.all([
        getPurchases(),
        getCategories(),
      ]);
      setPurchases(purchasesData.map((p) => {
        const raw = p as unknown as Record<string, unknown>;
        return {
          ...p,
          id: String(p.id),
          quantity: Number(p.quantity),
          purchase_price: Number(raw.purchase_price ?? 0),
          unit_price: Number(p.unit_price),
          quantity_per_unit: Number(p.quantity_per_unit),
          discount_amount: Number(p.discount_amount),
          discount_price: Number(raw.discount_price ?? 0),
          category_id: Number(p.category_id),
        };
      }));
      setCategories(categoriesData);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);

  const allSubCategoryIds = useMemo(() => {
    const ids = new Set<number>();
    categories.forEach((c) => {
      if (c.parent_id) ids.add(Number(c.id));
    });
    return ids;
  }, [categories]);

  const subCategories = useMemo(() => {
    if (!selectedParentCategory) return [];
    const parent = categoryTree.find((c) => String(c.id) === selectedParentCategory);
    return parent?.children || [];
  }, [categoryTree, selectedParentCategory]);

  const flatPurchases = useMemo(() => {
    let result = [...purchases];
    if (selectedParentCategory) {
      const parentNum = Number(selectedParentCategory);
      const parent = categoryTree.find((c) => String(c.id) === selectedParentCategory);
      const childIds = parent?.children?.map((c) => c.id) || [];
      result = result.filter((p) => {
        if (p.category_id === parentNum) return true;
        if (!allSubCategoryIds.has(p.category_id)) return true;
        return childIds.includes(p.category_id);
      });
    }
    if (selectedCategory) {
      result = result.filter((p) => p.category_id === Number(selectedCategory));
    }
    const currentMonthKey = getMonthKey(new Date().getFullYear(), new Date().getMonth() + 1);
    result = result.filter((p) => {
      const { year, month } = parseDate(p.purchase_date);
      return getMonthKey(year, month) === currentMonthKey;
    });
    return result.sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime());
  }, [purchases, selectedParentCategory, selectedCategory, categoryTree, allSubCategoryIds]);

  const availableMonths = useMemo(() => {
    const now = new Date();
    const monthSet = new Set<string>();
    monthSet.add(getMonthKey(now.getFullYear(), now.getMonth() + 1));
    purchases.forEach((p) => {
      const { year, month } = parseDate(p.purchase_date);
      monthSet.add(getMonthKey(year, month));
    });
    return Array.from(monthSet).sort().map((key) => {
      const [y, m] = key.split("-").map(Number);
      return { key, year: y, month: m, label: getMonthLabel(y, m) };
    });
  }, [purchases]);

  const currentMonthKey = getMonthKey(new Date().getFullYear(), new Date().getMonth() + 1);

  const comparisonMonths = useMemo(() => {
    const months = [];
    const current = availableMonths.find((m) => m.key === currentMonthKey);
    if (current) months.push(current);
    if (selectedCompareMonth) {
      const found = availableMonths.find((m) => m.key === selectedCompareMonth);
      if (found) months.push(found);
    }
    return months;
  }, [selectedCompareMonth, availableMonths]);

  const isComparisonMode = comparisonMonths.length >= 2;

  const comparisonData = useMemo(() => {
    if (!isComparisonMode) return null;

    const monthKeys = comparisonMonths.map((m) => m.key);

    let base = purchases;
    if (selectedParentCategory) {
      const parentNum = Number(selectedParentCategory);
      const parent = categoryTree.find((c) => String(c.id) === selectedParentCategory);
      const childIds = parent?.children?.map((c) => c.id) || [];
      base = base.filter((p) => {
        if (p.category_id === parentNum) return true;
        if (!allSubCategoryIds.has(p.category_id)) return true;
        return childIds.includes(p.category_id);
      });
    }
    if (selectedCategory) {
      base = base.filter((p) => p.category_id === Number(selectedCategory));
    }

    const grouped: Record<string, Purchase[]> = {};
    base.forEach((p) => {
      const { year, month } = parseDate(p.purchase_date);
      const key = getMonthKey(year, month);
      if (monthKeys.includes(key)) {
        const catKey = p.categoryName || String(p.category_id);
        if (!grouped[catKey]) grouped[catKey] = [];
        grouped[catKey].push(p);
      }
    });

    const rows: ComparisonRow[] = Object.entries(grouped).map(([catKey, items]) => {
      const months = comparisonMonths.map((m) => {
        const mk = m.key;
        const monthItems = items.filter((i) => {
          const { year, month } = parseDate(i.purchase_date);
          return getMonthKey(year, month) === mk;
        });
        return {
          label: m.label,
          quantity: monthItems.reduce((s, i) => s + i.quantity, 0),
          quantity_per_unit: monthItems.reduce((s, i) => s + i.quantity_per_unit, 0),
          unit_price: monthItems.length > 0
            ? monthItems.reduce((s, i) => s + calculateUnitPrice(i.quantity, i.quantity_per_unit, i.discount_price), 0) / monthItems.length
            : 0,
          discount_amount: monthItems.reduce((s, i) => s + i.discount_amount, 0),
          total_price: monthItems.reduce((s, i) => s + i.discount_price, 0),
        };
      });
      return { categoryName: catKey, months };
    });

    return rows.sort((a, b) => a.categoryName.localeCompare(b.categoryName));
  }, [isComparisonMode, comparisonMonths, purchases, selectedCategory, selectedParentCategory, categoryTree, allSubCategoryIds]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    purchase_date: (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })(),
    quantity: "",
    unit_price: "",
    purchase_price: "",
    discount_price: "",
    discount_amount: "",
    quantity_per_unit: "",
  });

  const stats = useMemo(() => {
    const visiblePurchases = isComparisonMode ? purchases : flatPurchases;
    const totalPurchases = visiblePurchases.length;
    const totalValue = visiblePurchases.reduce((sum, p) => sum + p.discount_price, 0);
    const totalQuantity = visiblePurchases.reduce((sum, p) => sum + p.quantity, 0);
    const avgPrice = visiblePurchases.length > 0
      ? visiblePurchases.reduce((sum, p) => sum + calculateUnitPrice(p.quantity, p.quantity_per_unit, p.discount_price), 0) / visiblePurchases.length
      : 0;
    return { totalPurchases, totalValue, totalQuantity, avgPrice };
  }, [purchases, flatPurchases, isComparisonMode]);

  const openModal = (purchase?: Purchase) => {
    if (purchase) {
      setEditingPurchase(purchase);
      setFormData({
        purchase_date: purchase.purchase_date,
        quantity: purchase.quantity.toString(),
        unit_price: purchase.unit_price.toString(),
        purchase_price: purchase.purchase_price.toString(),
        discount_price: purchase.discount_price.toString(),
        discount_amount: purchase.discount_amount.toString(),
        quantity_per_unit: purchase.quantity_per_unit.toString(),
      });
    } else {
      setEditingPurchase(null);
      setFormData({
    purchase_date: (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })(),
        quantity: "",
        unit_price: "",
        purchase_price: "",
        discount_price: "",
        discount_amount: "",
        quantity_per_unit: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPurchase(null);
    setFormData({ purchase_date: (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })(), quantity: "", unit_price: "", purchase_price: "", discount_price: "", discount_amount: "", quantity_per_unit: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const quantity = parseFloat(formData.quantity);
    const unitPrice = parseFloat(formData.unit_price);
    const purchasePrice = parseFloat(formData.purchase_price) || 0;
    const discountPrice = parseFloat(formData.discount_price) || 0;
    const discountAmount = parseFloat(formData.discount_amount) || 0;
    const quantityPerUnit = parseFloat(formData.quantity_per_unit) || 1;

    const result = purchaseFormSchema.safeParse({
      purchase_date: formData.purchase_date,
      quantity,
      unit_price: unitPrice,
      purchase_price: purchasePrice,
      discount_price: discountPrice,
      discount_amount: discountAmount,
      quantity_per_unit: quantityPerUnit,
    });
    if (!result.success) {
      setFieldErrors(formatZodErrors(result.error));
      return;
    }

    try {
      setSaving(true);
      if (editingPurchase) {
        await updatePurchase(Number(editingPurchase.id), {
          category_id: editingPurchase.category_id,
          purchase_date: formData.purchase_date,
          quantity,
          unit_price: unitPrice,
          purchase_price: purchasePrice,
          discount_price: discountPrice,
          discount_amount: discountAmount,
          quantity_per_unit: quantityPerUnit,
        });
      } else {
        await createPurchase({
          category_id: 0,
          purchase_date: formData.purchase_date,
          quantity,
          unit_price: unitPrice,
          purchase_price: purchasePrice,
          discount_price: discountPrice,
          discount_amount: discountAmount,
          quantity_per_unit: quantityPerUnit,
        });
      }
      closeModal();
      await loadData();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to save purchase");
    } finally {
      setSaving(false);
    }
  };

  const calculateTotal = () => {
    const purchasePrice = parseFloat(formData.purchase_price);
    if (!isNaN(purchasePrice) && purchasePrice > 0) return purchasePrice.toFixed(2);
    if (formData.quantity && formData.unit_price) {
      return (parseFloat(formData.quantity) * parseFloat(formData.unit_price)).toFixed(2);
    }
    return "0.00";
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Purchase History</h1>
            <p className="text-gray-600 mt-1">Track and manage all purchase transactions</p>
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg"><ShoppingCart className="w-6 h-6 text-blue-600" /></div>
              <div><p className="text-sm text-gray-500">Total Purchases</p><p className="text-2xl font-bold text-gray-900">{stats.totalPurchases}</p></div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg"><DollarSign className="w-6 h-6 text-green-600" /></div>
              <div><p className="text-sm text-gray-500">Total Value</p><p className="text-2xl font-bold text-gray-900">{Math.round(stats.totalValue).toLocaleString()} kyats</p></div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg"><Package className="w-6 h-6 text-purple-600" /></div>
              <div><p className="text-sm text-gray-500">Total Quantity</p><p className="text-2xl font-bold text-gray-900">{stats.totalQuantity}</p></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filters</span>
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Category</label>
              <select
                value={selectedParentCategory}
                onChange={(e) => { setSelectedParentCategory(e.target.value); setSelectedCategory(""); }}
                className="px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[200px]"
              >
                <option value="">All Categories</option>
                {categoryTree.map((c) => (
                  <option key={c.id} value={String(c.id)}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Sub Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[200px]"
                disabled={!selectedParentCategory}
              >
                <option value="">{selectedParentCategory ? "All Sub Categories" : "Select category first"}</option>
                {subCategories.map((c) => (
                  <option key={c.id} value={String(c.id)}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Compare with Current Month</span>
                {selectedCompareMonth && (
                  <span className="text-gray-400">(1 selected)</span>
                )}
              </div>
              <select
                value={selectedCompareMonth}
                onChange={(e) => setSelectedCompareMonth(e.target.value)}
                className="px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[200px]"
              >
                <option value="">Select month to compare...</option>
                {availableMonths
                  .filter((m) => m.key !== currentMonthKey)
                  .map((m) => (
                    <option key={m.key} value={m.key}>
                      {m.label}
                    </option>
                  ))}
              </select>
            </div>
            <button
              onClick={() => { setSelectedParentCategory(""); setSelectedCategory(""); setSelectedCompareMonth(""); }}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">Purchase Records</h2>
          </div>

          {isComparisonMode && comparisonData ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r">Month</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Qty</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Qty/Unit</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Unit Price</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Discount</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {comparisonData.map((row) =>
                    row.months.map((m) => (
                      <tr key={`${row.categoryName}|${m.label}`} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-800 border-r">{row.categoryName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-r">{m.label}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 text-right">{m.quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 text-right">{Math.round(m.quantity_per_unit)}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 text-right whitespace-nowrap">{m.unit_price.toFixed(2)} kyts</td>
                        <td className="px-4 py-3 text-sm text-gray-700 text-right whitespace-nowrap">{Math.round(m.discount_amount).toLocaleString()} kyts</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right whitespace-nowrap">{Math.round(m.total_price).toLocaleString()} kyts</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : flatPurchases.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No purchases recorded</h3>
              <p className="text-gray-500">Add your first purchase to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Qty/Unit</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Unit Price</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Price</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Discount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {flatPurchases.map((purchase) => (
                    <tr key={purchase.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <CalendarDays className="w-4 h-4 text-gray-400" />
                          {new Date(purchase.purchase_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 text-right">{purchase.quantity}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 text-right">{purchase.quantity_per_unit}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 text-right">
                        {calculateUnitPrice(
                          purchase.quantity,
                          purchase.quantity_per_unit,
                          purchase.discount_price
                        ).toFixed(2)} kyts
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 text-right">{Math.round(purchase.discount_price).toLocaleString()} kyts</td>
                      <td className="px-6 py-4 text-sm text-gray-700 text-right">{Math.round(purchase.discount_amount).toLocaleString()} kyts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={closeModal} />
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg pointer-events-auto">
              <form onSubmit={handleSubmit} className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {editingPurchase ? "Edit Purchase" : "Add New Purchase"}
                </h2>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Date *</label>
                    <input type="date" value={formData.purchase_date} onChange={(e) => { setFormData({ ...formData, purchase_date: e.target.value }); setFieldErrors({}); }} className={`w-full px-4 py-2.5 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.purchase_date ? 'border-red-500' : 'border-gray-300'}`} required />
                    {fieldErrors.purchase_date && <p className="text-red-500 text-xs mt-1">{fieldErrors.purchase_date}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                    <input type="number" step="any" min="0" value={formData.quantity} onChange={(e) => { setFormData({ ...formData, quantity: e.target.value }); setFieldErrors({}); }} className={`w-full px-4 py-2.5 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.quantity ? 'border-red-500' : 'border-gray-300'}`} placeholder="0" required />
                    {fieldErrors.quantity && <p className="text-red-500 text-xs mt-1">{fieldErrors.quantity}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price *</label>
                    <input type="number" step="any" min="0" value={formData.unit_price} onChange={(e) => { setFormData({ ...formData, unit_price: e.target.value }); setFieldErrors({}); }} className={`w-full px-4 py-2.5 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.unit_price ? 'border-red-500' : 'border-gray-300'}`} placeholder="0.00" required />
                    {fieldErrors.unit_price && <p className="text-red-500 text-xs mt-1">{fieldErrors.unit_price}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Price *</label>
                    <input type="number" step="any" min="0" value={formData.purchase_price} onChange={(e) => { setFormData({ ...formData, purchase_price: e.target.value }); setFieldErrors({}); }} className={`w-full px-4 py-2.5 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.purchase_price ? 'border-red-500' : 'border-gray-300'}`} placeholder="0.00" required />
                    {fieldErrors.purchase_price && <p className="text-red-500 text-xs mt-1">{fieldErrors.purchase_price}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount Price</label>
                    <input type="number" step="any" min="0" value={formData.discount_price} onChange={(e) => { setFormData({ ...formData, discount_price: e.target.value }); setFieldErrors({}); }} className={`w-full px-4 py-2.5 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.discount_price ? 'border-red-500' : 'border-gray-300'}`} placeholder="0.00" />
                    {fieldErrors.discount_price && <p className="text-red-500 text-xs mt-1">{fieldErrors.discount_price}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Discount Amount *</label>
                      <input type="number" step="any" min="0" value={formData.discount_amount} onChange={(e) => { setFormData({ ...formData, discount_amount: e.target.value }); setFieldErrors({}); }} className={`w-full px-4 py-2.5 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.discount_amount ? 'border-red-500' : 'border-gray-300'}`} placeholder="0.00" required />
                      {fieldErrors.discount_amount && <p className="text-red-500 text-xs mt-1">{fieldErrors.discount_amount}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quantity Per Unit *</label>
                      <input type="number" step="any" min="1" value={formData.quantity_per_unit} onChange={(e) => { setFormData({ ...formData, quantity_per_unit: e.target.value }); setFieldErrors({}); }} className={`w-full px-4 py-2.5 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.quantity_per_unit ? 'border-red-500' : 'border-gray-300'}`} placeholder="1" required />
                      {fieldErrors.quantity_per_unit && <p className="text-red-500 text-xs mt-1">{fieldErrors.quantity_per_unit}</p>}
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Total Amount</span>
                      <span className="text-xl font-bold text-blue-600">${calculateTotal()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium" disabled={saving}>Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2" disabled={saving}>
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingPurchase ? "Update" : "Create"}
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
