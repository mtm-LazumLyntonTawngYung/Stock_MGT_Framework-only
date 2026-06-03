"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { ArrowLeft, Save, Pencil, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { getProducts, getCategories, getMonths, upsertWeeklyCheck, mapProductFromAPI, mapCategoryFromAPI } from "@/lib/api";
import type { Product } from "@/data/defaultProducts";
import type { Month } from "@/lib/types";
import { isMonthEditable, MONTH_READ_ONLY_MESSAGE } from "@/lib/stock-utils";
import { weeklyCheckFormSchema } from "@/lib/schemas";
import { formatZodErrors } from "@/lib/validate";

interface Category {
  id: string;
  name: string;
  children?: Category[];
}

export default function StockCheckPage() {
  const params = useParams();
  const router = useRouter();
  const year = params.year as string;
  const monthId = params.monthId as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [monthInfo, setMonthInfo] = useState<{ month: number; id: number; name: string } | null>(null);
  const [allMonths, setAllMonths] = useState<Month[]>([]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  useEffect(() => {
    loadData();
  }, [year, monthId]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [catsData, monthsData] = await Promise.all([
        getCategories(),
        getMonths(),
      ]);

      const mappedCats = catsData.map(mapCategoryFromAPI);
      const tree = buildCategoryTree(mappedCats);
      setCategories(tree);
      setAllMonths(monthsData);

      const currentMonth = monthsData.find((m) => String(m.id) === monthId);
      if (currentMonth) {
        setMonthInfo({ month: currentMonth.month, id: currentMonth.id, name: `${year}_${monthNames[currentMonth.month - 1]}` });
        const productsData = await getProducts(currentMonth.year, currentMonth.month);
        setProducts(productsData.map(mapProductFromAPI));
      } else {
        setError("Month not found");
      }
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  function buildCategoryTree(flat: { id: string; name: string; parentId: string | null; children?: Category[] }[]): Category[] {
    const map = new Map<string, Category>();
    const roots: Category[] = [];
    flat.forEach((item) => map.set(item.id, { ...item, children: [] }));
    flat.forEach((item) => {
      const node = map.get(item.id)!;
      if (item.parentId && map.has(item.parentId)) {
        map.get(item.parentId)!.children!.push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    usedQty1stWeek: 0,
    usedQty2ndWeek: 0,
    usedQty3rdWeek: 0,
    usedQty4thWeek: 0,
    usedQty5thWeek: 0,
    checkedWeek1: false,
    checkedWeek2: false,
    checkedWeek3: false,
    checkedWeek4: false,
    checkedWeek5: false,
  });

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const canEdit = isMonthEditable(Number(monthId), allMonths);

  const toggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) newExpanded.delete(categoryId);
    else newExpanded.add(categoryId);
    setExpandedCategories(newExpanded);
  };

  const groupedProducts = categories.map((category) => ({
    category,
    products: products.filter((p) => {
      if (category.children) return category.children.some((child) => child.id === p.categoryId);
      return p.categoryId === category.id;
    }),
  }));

  const openCheckModal = (product: Product) => {
    if (!canEdit) {
      toast.error(MONTH_READ_ONLY_MESSAGE);
      return;
    }
    setEditingProduct(product);
    setFormData({
      usedQty1stWeek: product.usedQty1stWeek,
      usedQty2ndWeek: product.usedQty2ndWeek,
      usedQty3rdWeek: product.usedQty3rdWeek,
      usedQty4thWeek: product.usedQty4thWeek,
      usedQty5thWeek: product.usedQty5thWeek,
      checkedWeek1: product.checkedWeek1 ?? false,
      checkedWeek2: product.checkedWeek2 ?? false,
      checkedWeek3: product.checkedWeek3 ?? false,
      checkedWeek4: product.checkedWeek4 ?? false,
      checkedWeek5: product.checkedWeek5 ?? false,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleCheckSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    if (!editingProduct || !monthInfo) {
      toast.error("No product selected for check");
      return;
    }
    if (!canEdit) {
      toast.error(MONTH_READ_ONLY_MESSAGE);
      return;
    }

    const result = weeklyCheckFormSchema.safeParse(formData);
    if (!result.success) {
      setFieldErrors(formatZodErrors(result.error));
      return;
    }

    const totalUsed = formData.usedQty1stWeek + formData.usedQty2ndWeek + formData.usedQty3rdWeek + formData.usedQty4thWeek + formData.usedQty5thWeek;
    const availableStock = editingProduct.openingQty + editingProduct.purchaseQty1st + editingProduct.purchaseQty2nd + editingProduct.purchaseQty3rd;
    if (totalUsed > availableStock) {
      toast.error('Total used quantity cannot exceed available stock (opening + purchases).');
      return;
    }

    try {
      setSaving(true);
      await upsertWeeklyCheck({
        month_id: monthInfo.id,
        category_id: parseInt(editingProduct.categoryId),
        used_qty_1st_week: formData.usedQty1stWeek,
        used_qty_2nd_week: formData.usedQty2ndWeek,
        used_qty_3rd_week: formData.usedQty3rdWeek,
        used_qty_4th_week: formData.usedQty4thWeek,
        used_qty_5th_week: formData.usedQty5thWeek,
        checked_week_1: formData.checkedWeek1,
        checked_week_2: formData.checkedWeek2,
        checked_week_3: formData.checkedWeek3,
        checked_week_4: formData.checkedWeek4,
        checked_week_5: formData.checkedWeek5,
      });
      closeModal();
      toast.success("Check saved successfully");
      await loadData();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to save check");
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

  if (error && !monthInfo) {
    return (
      <div className="p-8">
        <button onClick={() => router.push("/stock")} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4">
          <ArrowLeft className="w-5 h-5" /><span>Back to Stock</span>
        </button>
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-400 mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => router.push(`/stock/${year}/${monthId}`)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Stock Management</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Stock Check - {monthInfo?.name || year}</h1>
            <p className="text-gray-600 mt-1 text-sm">Review and update weekly usage / checking information</p>
          </div>
        </div>

        {!canEdit && allMonths.length > 0 && (
          <div className="mb-4 p-4 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 text-sm">
            {MONTH_READ_ONLY_MESSAGE} This month is view-only.
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full text-sm border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300 text-gray-700">
                <th className="px-3 py-3 text-center font-semibold text-xs border-r border-gray-300 w-12">Sr.</th>
                <th className="px-3 py-3 text-left font-semibold text-xs border-r border-gray-300">Item Description</th>
                <th className="px-2 py-2 text-center text-[11px] font-medium text-red-600 border-r border-gray-200">Used 1st Week</th>
                <th className="px-2 py-2 text-center text-[11px] font-medium text-red-600 border-r border-gray-200">Used 2nd Week</th>
                <th className="px-2 py-2 text-center text-[11px] font-medium text-red-600 border-r border-gray-200">Used 3rd Week</th>
                <th className="px-2 py-2 text-center text-[11px] font-medium text-red-600 border-r border-gray-200">Used 4th Week</th>
                <th className="px-2 py-2 text-center text-[11px] font-medium text-red-600 border-r border-gray-200">Used 5th Week</th>
                <th className="px-3 py-3 text-center font-semibold text-xs border-l border-gray-300 w-20">Action</th>
              </tr>
            </thead>
            <tbody>
              {groupedProducts.map(({ category, products: categoryProducts }) => {
                if (categoryProducts.length === 0) return null;
                const isExpanded = expandedCategories.has(category.id);
                return (
                  <React.Fragment key={category.id}>
                    <tr className="bg-gray-50 border-b border-gray-300 text-gray-800 font-medium">
                      <td className="px-3 py-2 border-r border-gray-200"></td>
                      <td className="px-3 py-2 border-r border-gray-200" colSpan={6}>
                        <button onClick={() => toggleExpand(category.id)} className="flex items-center gap-2 font-bold">
                          {isExpanded ? "▼" : "▶"} {category.name}
                        </button>
                      </td>
                      <td className="px-2 py-2 border-l border-gray-300"></td>
                    </tr>
                    {isExpanded && categoryProducts.map((product, index) => (
                      <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50 text-gray-700">
                        <td className="px-3 py-2 text-center border-r border-gray-200 text-gray-500">{index + 1}</td>
                        <td className="px-3 py-2 border-r border-gray-200 font-normal">{product.itemDescription}</td>
                        <td className={`px-3 py-2 text-center border-r border-gray-200 transition-colors ${product.checkedWeek1 ? 'bg-green-100 text-green-700 font-semibold' : ''}`}>{product.usedQty1stWeek}</td>
                        <td className={`px-3 py-2 text-center border-r border-gray-200 transition-colors ${product.checkedWeek2 ? 'bg-green-100 text-green-700 font-semibold' : ''}`}>{product.usedQty2ndWeek}</td>
                        <td className={`px-3 py-2 text-center border-r border-gray-200 transition-colors ${product.checkedWeek3 ? 'bg-green-100 text-green-700 font-semibold' : ''}`}>{product.usedQty3rdWeek}</td>
                        <td className={`px-3 py-2 text-center border-r border-gray-200 transition-colors ${product.checkedWeek4 ? 'bg-green-100 text-green-700 font-semibold' : ''}`}>{product.usedQty4thWeek}</td>
                        <td className={`px-3 py-2 text-center border-r border-gray-200 transition-colors ${product.checkedWeek5 ? 'bg-green-100 text-green-700 font-semibold' : ''}`}>{product.usedQty5thWeek}</td>
                        <td className="px-2 py-2 text-center border-l border-gray-300">
                          {canEdit ? (
                            <button onClick={() => openCheckModal(product)} className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-green-600" title="Edit Check">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">View only</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          {products.length === 0 && (
            <div className="p-8 text-center text-gray-500">No products to check.</div>
          )}
        </div>

        {isModalOpen && editingProduct && (
          <>
            <div className="fixed inset-0 z-40" onClick={closeModal} />
            <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
              <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg pointer-events-auto">
                <form onSubmit={handleCheckSubmit} className="p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Edit Check</h2>
                  <p className="text-sm text-gray-600 mb-6">{editingProduct.itemDescription}</p>

                  <div className="space-y-4 mb-5">
                      {[1, 2, 3, 4, 5].map((week) => {
                      const qtyKey = `usedQty${week === 1 ? "1st" : week === 2 ? "2nd" : week === 3 ? "3rd" : week === 4 ? "4th" : "5th"}Week` as keyof typeof formData;
                      const checkedKey = `checkedWeek${week}` as keyof typeof formData;

                      return (
                        <div key={week}>
                          <label className="block text-sm font-medium text-gray-700">
                            Used Qty {week}{week === 1 ? "st" : week === 2 ? "nd" : week === 3 ? "rd" : "th"} Week
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              value={formData[qtyKey] as number}
                              onChange={(e) => { setFormData({ ...formData, [qtyKey]: Number(e.target.value) }); setFieldErrors({}); }}
                              className={`flex-1 px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${fieldErrors[qtyKey as string] ? 'border-red-500' : 'border-gray-300'}`}
                              placeholder="0"
                            />
                            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={formData[checkedKey] as boolean}
                                onChange={(e) => setFormData({ ...formData, [checkedKey]: e.target.checked })}
                                className="w-4 h-4 accent-green-600"
                              />
                              <span className="text-green-700 font-medium">Checked</span>
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-3">
                    <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50" disabled={saving}>Cancel</button>
                    <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2" disabled={saving}>
                      {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                      <Save className="w-5 h-5" />
                      <span>Save Check</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
