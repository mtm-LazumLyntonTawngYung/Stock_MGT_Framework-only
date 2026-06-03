"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { ArrowLeft, Calendar, ChevronDown, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { getProducts, getMonths } from "@/lib/api";
import { mapProductFromAPI } from "@/lib/api";
import type { Product } from "@/data/defaultProducts";

interface MonthData {
  year: string;
  monthId: string;
  monthName: string;
  products: Product[];
}

interface ComparisonData {
  parentCategory: string;
  itemDescription: string;
  months: {
    totalPurchase: number;
    totalUsed: number;
    price: number;
  }[];
}

const MONTHS = [
  { id: "01", name: "January" },
  { id: "02", name: "February" },
  { id: "03", name: "March" },
  { id: "04", name: "April" },
  { id: "05", name: "May" },
  { id: "06", name: "June" },
  { id: "07", name: "July" },
  { id: "08", name: "August" },
  { id: "09", name: "September" },
  { id: "10", name: "October" },
  { id: "11", name: "November" },
  { id: "12", name: "December" },
];

export default function CompareStockPage() {
  const router = useRouter();
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const [years, setYears] = useState<number[]>([]);

  // Default: current month and previous month
  const defaultPrev = new Date(currentYear, currentMonth - 1, 1);
  const defaultPrevYear = defaultPrev.getFullYear();
  const defaultPrevMonth = defaultPrev.getMonth() + 1;

  const [month1Year, setMonth1Year] = useState<string>(String(defaultPrevYear));
  const [month1Month, setMonth1Month] = useState<string>(String(defaultPrevMonth).padStart(2, "0"));
  const [month2Year, setMonth2Year] = useState<string>(String(currentYear));
  const [month2Month, setMonth2Month] = useState<string>(String(currentMonth + 1).padStart(2, "0"));

  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<MonthData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    getMonths().then((data) => {
      const yearSet = new Set<number>();
      data.forEach((m) => yearSet.add(m.year));
      setYears(Array.from(yearSet).sort());
    }).catch((err: unknown) => {
      toast.error((err as Error).message || 'Failed to load available years');
    });
  }, []);

  const calculateTotalPurchase = (p: Product) =>
    p.purchaseQty1st + p.purchaseQty2nd + p.purchaseQty3rd;

  const calculateTotalUsed = (p: Product) =>
    p.usedQty1stWeek + p.usedQty2ndWeek + p.usedQty3rdWeek + p.usedQty4thWeek + p.usedQty5thWeek;

  const getSelectedMonths = (): { year: string; monthId: string; monthName: string }[] => {
    const m1 = { year: month1Year, monthId: month1Month, monthName: MONTHS.find((m) => m.id === month1Month)?.name || "" };
    const m2 = { year: month2Year, monthId: month2Month, monthName: MONTHS.find((m) => m.id === month2Month)?.name || "" };
    const isDup = m1.year === m2.year && m1.monthId === m2.monthId;
    return isDup ? [m1] : [m1, m2];
  };

  const handleCompare = async () => {
    setIsLoading(true);
    const months = getSelectedMonths();
    if (months.length < 2) {
      toast.error("Please select two different months to compare.");
      setIsLoading(false);
      return;
    }

    try {
      const monthsDataPromises = months.map(async (month) => {
        const productsData = await getProducts(parseInt(month.year), parseInt(month.monthId));
        return {
          year: month.year,
          monthId: month.monthId,
          monthName: month.monthName,
          products: productsData.map(mapProductFromAPI),
        };
      });

      const monthsData = await Promise.all(monthsDataPromises);
      setSelectedMonths(monthsData);

      const itemMap = new Map<string, ComparisonData>();
      monthsData.forEach((monthData, monthIndex) => {
        monthData.products.forEach((product) => {
          const key = `${product.categoryName}_${product.itemDescription}`;
          if (!itemMap.has(key)) {
            itemMap.set(key, {
              parentCategory: product.categoryName || "Uncategorized",
              itemDescription: product.itemDescription,
              months: monthsData.map(() => ({ totalPurchase: 0, totalUsed: 0, price: 0 })),
            });
          }
          const item = itemMap.get(key)!;
          item.months[monthIndex] = {
            totalPurchase: calculateTotalPurchase(product),
            totalUsed: calculateTotalUsed(product),
            price: product.price,
          };
        });
      });
      setComparisonData(Array.from(itemMap.values()));
      const allCategories = new Set(itemMap.keys().map(key => key.split('_')[0]));
      setExpandedCategories(allCategories);
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to load comparison data");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-load comparison on page load
  useEffect(() => {
    const months = getSelectedMonths();
    if (months.length < 2) return;
    Promise.all(months.map(async (month) => {
      const productsData = await getProducts(parseInt(month.year), parseInt(month.monthId));
      return {
        year: month.year,
        monthId: month.monthId,
        monthName: month.monthName,
        products: productsData.map(mapProductFromAPI),
      };
    })).then((monthsData) => {
      setSelectedMonths(monthsData);
      const itemMap = new Map<string, ComparisonData>();
      monthsData.forEach((monthData, monthIndex) => {
        monthData.products.forEach((product) => {
          const key = `${product.categoryName}_${product.itemDescription}`;
          if (!itemMap.has(key)) {
            itemMap.set(key, {
              parentCategory: product.categoryName || "Uncategorized",
              itemDescription: product.itemDescription,
              months: monthsData.map(() => ({ totalPurchase: 0, totalUsed: 0, price: 0 })),
            });
          }
          const item = itemMap.get(key)!;
          item.months[monthIndex] = {
            totalPurchase: calculateTotalPurchase(product),
            totalUsed: calculateTotalUsed(product),
            price: product.price,
          };
        });
      });
      setComparisonData(Array.from(itemMap.values()));
      const allCategories = new Set(itemMap.keys().map(key => key.split('_')[0]));
      setExpandedCategories(allCategories);
    }).catch((err: unknown) => {
      toast.error((err as Error).message || "Failed to load comparison data");
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const groupedData = comparisonData.reduce(
    (acc, item) => {
      if (!acc[item.parentCategory]) acc[item.parentCategory] = [];
      acc[item.parentCategory].push(item);
      return acc;
    },
    {} as Record<string, ComparisonData[]>,
  );

  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) newExpanded.delete(categoryName);
    else newExpanded.add(categoryName);
    setExpandedCategories(newExpanded);
  };

  return (
    <div className="p-8">
      <div className="max-w-400 mx-auto">
        <div className="mb-6">
          <button onClick={() => router.push("/stock")} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-2">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Stock</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Compare Stock</h1>
          <p className="text-gray-600 mt-2">Select two months to compare stock data side by side</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Select Date Range
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-end gap-4">
            <div className="flex-1 max-w-sm">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Month 1</label>
              <div className="grid grid-cols-5 gap-2">
                <select value={month1Year} onChange={(e) => setMonth1Year(e.target.value)} className="col-span-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                  {years.map((year) => <option key={year} value={year}>{year}</option>)}
                </select>
                <select value={month1Month} onChange={(e) => setMonth1Month(e.target.value)} className="col-span-3 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                  {MONTHS.map((month) => <option key={month.id} value={month.id}>{month.name}</option>)}
                </select>
              </div>
            </div>

            <div className="flex-1 max-w-sm">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Month 2</label>
              <div className="grid grid-cols-5 gap-2">
                <select value={month2Year} onChange={(e) => setMonth2Year(e.target.value)} className="col-span-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                  {years.map((year) => <option key={year} value={year}>{year}</option>)}
                </select>
                <select value={month2Month} onChange={(e) => setMonth2Month(e.target.value)} className="col-span-3 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                  {MONTHS.map((month) => <option key={month.id} value={month.id}>{month.name}</option>)}
                </select>
              </div>
            </div>

            <div className="w-full lg:w-auto mt-2 lg:mt-0">
              <button
                onClick={handleCompare}
                disabled={isLoading}
                className="w-full lg:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed font-medium text-sm h-11"
              >
                {isLoading ? "Loading..." : "Compare"}
              </button>
            </div>
          </div>
        </div>

        {selectedMonths.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-white">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-lg font-bold text-gray-900">Comparison Results</h2>
                <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Comparing {selectedMonths.length} months
                </div>
              </div>
            </div>

            <div className="overflow-x-auto relative">
              <div className="min-w-max">
                <table className="w-full text-sm border-collapse relative">
                  <thead className="sticky top-0 z-30 bg-white">
                    <tr className="bg-gray-100 border-b border-gray-300">
                      <th rowSpan={2} className="px-4 py-3 text-left font-semibold text-gray-700 border-r-2 border-gray-400 sticky left-0 bg-gray-100 z-40 min-w-15">No</th>
                      <th rowSpan={2} className="px-4 py-3 text-left font-semibold text-gray-700 border-r-2 border-gray-400 sticky left-15 bg-gray-100 z-40 min-w-62.5">Item Description</th>
                      {selectedMonths.map((month, index) => (
                        <th key={index} colSpan={3} className="px-4 py-3 text-center font-semibold text-gray-700 border-r-2 border-gray-400 bg-linear-to-b from-blue-50 to-gray-50">
                          <div className="font-bold text-base">{month.monthName}</div>
                          <div className="text-xs font-normal text-gray-500">{month.year}</div>
                        </th>
                      ))}
                    </tr>
                    <tr className="bg-gray-50 border-b-2 border-gray-400">
                      {selectedMonths.map((month, monthIndex) => (
                        <React.Fragment key={monthIndex}>
                          <th className="px-3 py-2 text-center text-xs font-semibold text-red-700 border-r border-gray-300 bg-red-50 min-w-22.5"><span>📉</span> Used Qty</th>
                          <th className="px-3 py-2 text-center text-xs font-semibold text-blue-700 border-r border-gray-300 bg-blue-50 min-w-22.5"><span>📦</span> Purchase Qty</th>
                          <th className="px-3 py-2 text-center text-xs font-semibold text-green-700 border-r-2 border-gray-400 bg-green-50 min-w-25"><span>💰</span>Purchase Price</th>
                        </React.Fragment>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(groupedData).length === 0 ? (
                      <tr>
                        <td colSpan={2 + selectedMonths.length * 3} className="px-4 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center gap-2">
                            <Calendar className="w-12 h-12 text-gray-400" />
                            <p>No data available for the selected date range</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      Object.entries(groupedData).map(([parentCategory, items]) => {
                        const isExpanded = expandedCategories.has(parentCategory);
                        return (
                          <React.Fragment key={parentCategory}>
                            <tr className="bg-linear-to-r from-blue-100 to-blue-50 border-b-2 border-blue-300 hover:from-blue-200 hover:to-blue-100 transition-colors">
                              <td className="px-4 py-3 sticky left-0 z-20 bg-linear-to-r from-blue-100 to-blue-50 border-r border-gray-300">
                                <button onClick={() => toggleCategory(parentCategory)} className="flex items-center gap-2 font-bold text-gray-800 text-base">
                                  {isExpanded ? <ChevronDown className="w-5 h-5 text-blue-600" /> : <ChevronRight className="w-5 h-5 text-blue-600" />}
                                </button>
                              </td>
                              <td className="px-4 py-3 sticky left-15 z-20 bg-linear-to-r from-blue-100 to-blue-50 border-r-2 border-gray-400">
                                <span className="font-bold text-blue-900">{parentCategory}</span>
                              </td>
                              <td colSpan={selectedMonths.length * 3} className="bg-linear-to-r from-blue-100 to-blue-50"></td>
                            </tr>
                            {isExpanded && items.map((item, itemIndex) => (
                              <tr key={`${parentCategory}_${itemIndex}`} className="border-b border-gray-200 hover:bg-blue-50/20 transition-colors">
                                <td className="px-4 py-3 text-center text-gray-600 border-r border-gray-300 sticky left-0 bg-white z-10 font-medium">{itemIndex + 1}</td>
                                <td className="px-4 py-3 text-gray-800 border-r-2 border-gray-400 sticky left-15 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                  <div className="font-semibold">{item.itemDescription}</div>
                                </td>
                                {item.months.map((monthData, monthIndex) => (
                                  <React.Fragment key={monthIndex}>
                                    <td className="px-3 py-3 text-center border-r border-gray-300 bg-white">
                                      {monthData.totalUsed > 0 ? <span className="font-semibold text-red-700">{monthData.totalUsed}</span> : <span className="text-gray-400">-</span>}
                                    </td>
                                    <td className="px-3 py-3 text-center border-r border-gray-300 bg-white">
                                      {monthData.totalPurchase > 0 ? <span className="font-semibold text-blue-700">{monthData.totalPurchase}</span> : <span className="text-gray-400">-</span>}
                                    </td>
                                    <td className="px-3 py-3 text-center border-r-2 border-gray-400 bg-white">
                                      {monthData.price > 0 ? <span className="font-semibold text-green-700">{monthData.price.toLocaleString()}</span> : <span className="text-gray-400">-</span>}
                                    </td>
                                  </React.Fragment>
                                ))}
                              </tr>
                            ))}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {Object.keys(groupedData).length > 0 && (
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600"><strong>{Object.keys(groupedData).length}</strong> categories</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600"><strong>{comparisonData.length}</strong> items</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-100 rounded"></div><span className="text-gray-600">Used</span></div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-100 rounded"></div><span className="text-gray-600">Purchase</span></div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-100 rounded"></div><span className="text-gray-600">Price</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {selectedMonths.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Comparison Yet</h3>
            <p className="text-gray-500">Select a date range above and click &quot;Compare&quot; to view stock comparison</p>
          </div>
        )}
      </div>
    </div>
  );
}
