"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Save,
  ChevronDown,
  ChevronRight,
  Pencil,
  ArrowLeft,
  X,
  AlertTriangle,
  Bell,
  CheckCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getProducts, createProduct, updateProduct, deleteProduct, getCategories, getMonths, mapProductFromAPI, mapProductToAPI, mapCategoryFromAPI, upsertWeeklyCheck } from "@/lib/api";
import ConfirmModal from "@/components/ConfirmModal";
import type { Product } from "@/data/defaultProducts";
import type { Month } from "@/lib/types";
import { isMonthEditable, isMonthAddable, MONTH_READ_ONLY_MESSAGE } from "@/lib/stock-utils";
import { productFormSchema } from "@/lib/schemas";
import { formatZodErrors } from "@/lib/validate";

interface Category {
  id: string;
  name: string;
  children?: Category[];
}

export default function MonthStockPage() {
  const params = useParams();
  const router = useRouter();
  const year = params.year as string;
  const monthId = params.monthId as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [monthInfo, setMonthInfo] = useState<{ month: number; name: string } | null>(null);
  const [allMonths, setAllMonths] = useState<Month[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  function buildCategoryTree(flat: { id: string; name: string; parentId: string | null }[]): Category[] {
    const map = new Map<string, Category>();
    const roots: Category[] = [];
    flat.forEach((item) => {
      map.set(item.id, { ...item, children: [] });
    });
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

  const getAllCategoryIds = (cats: Category[]): Set<string> => {
    const ids = new Set<string>();
    const traverse = (nodes: Category[]) => {
      nodes.forEach((node) => {
        ids.add(node.id);
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      });
    };
    traverse(cats);
    return ids;
  };

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
      setExpandedCategories(getAllCategoryIds(tree));

      const currentMonth = monthsData.find((m) => String(m.id) === monthId);
      if (currentMonth) {
        setMonthInfo({ month: currentMonth.month, name: `${year}_${monthNames[currentMonth.month - 1]}` });
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

  useEffect(() => {
    loadData();
  }, [year, monthId]); // eslint-disable-line react-hooks/exhaustive-deps
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCheckingMode, setIsCheckingMode] = useState(false);
  const [purchaseCount, setPurchaseCount] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowNotification(true), 0);
    const hideTimer = setTimeout(() => setShowNotification(false), 5000);
    return () => { clearTimeout(timer); clearTimeout(hideTimer); };
  }, []);

  const isAtMinimumThreshold = (product: Product): boolean => {
    if (product.minimumThreshold === undefined || product.minimumThreshold === null) return false;
    const currentStock = product.closingQty ?? calculateClosingQty(product);
    return currentStock <= product.minimumThreshold;
  };

const [formData, setFormData] = useState({
     parentId: "",
     categoryId: "",
     itemDescription: "",
     openingQty: 0,
     purchaseQty1st: 0,
     quantityPerUnit1st: 0,
     unitPrice1st: 0,
     discountAmount1st: 0,
     price1st: 0,
     purchaseDate1st: "",
     purchaseQty2nd: 0,
     quantityPerUnit2nd: 0,
     unitPrice2nd: 0,
     discountAmount2nd: 0,
     price2nd: 0,
     purchaseDate2nd: "",
     purchaseQty3rd: 0,
     quantityPerUnit3rd: 0,
     unitPrice3rd: 0,
     discountAmount3rd: 0,
     price3rd: 0,
     purchaseDate3rd: "",
     usedQty1stWeek: 0,
     usedQty2ndWeek: 0,
     usedQty3rdWeek: 0,
     usedQty4thWeek: 0,
     usedQty5thWeek: 0,
   });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const canEdit = isMonthEditable(Number(monthId), allMonths);
  const canAdd = isMonthAddable(Number(monthId), allMonths);

  // Check if this month is a previous month (before current month)
  const isPreviousMonth = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // 1-12

    if (!monthInfo) return false;

    // If the year is in the past, it's a previous month
    if (Number(year) < currentYear) {
      return true;
    }

    // If it's the current year, check if the month is before current month
    if (Number(year) === currentYear && monthInfo.month < currentMonth) {
      return true;
    }

    return false;
  };

  // Check if a product can be deleted (only if total purchase and total used are both 0)
  const canDeleteProduct = (product: Product) => {
    if (!canEdit || isPreviousMonth()) return false;
    const totalPurchase = calculateTotalPurchase(product);
    const totalUsed = calculateTotalUsed(product);
    return totalPurchase === 0 && totalUsed === 0;
  };
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const monthStart = monthInfo ? `${year}-${String(monthInfo.month).padStart(2, '0')}-01` : '';
  const lastDayObj = monthInfo ? new Date(Number(year), monthInfo.month, 0) : null;
  const lastDay = lastDayObj ? `${lastDayObj.getFullYear()}-${String(lastDayObj.getMonth() + 1).padStart(2, '0')}-${String(lastDayObj.getDate()).padStart(2, '0')}` : '';
  const maxDate = monthInfo ? (lastDay < today ? lastDay : today) : today;

  const toggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

const resetForm = () => {
     setFormData({
       parentId: "", categoryId: "", itemDescription: "",
       openingQty: 0,
       purchaseQty1st: 0, quantityPerUnit1st: 0, unitPrice1st: 0, discountAmount1st: 0, price1st: 0, purchaseDate1st: "",
       purchaseQty2nd: 0, quantityPerUnit2nd: 0, unitPrice2nd: 0, discountAmount2nd: 0, price2nd: 0, purchaseDate2nd: "",
       purchaseQty3rd: 0, quantityPerUnit3rd: 0, unitPrice3rd: 0, discountAmount3rd: 0, price3rd: 0, purchaseDate3rd: "",
       usedQty1stWeek: 0, usedQty2ndWeek: 0, usedQty3rdWeek: 0, usedQty4thWeek: 0, usedQty5thWeek: 0,
     });
     setPurchaseCount(1);
     setIsCheckingMode(false);
     setEditingProduct(null);
   };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const openAddModal = () => {
    if (!canAdd) {
      toast.error('New products can only be added to the current month.');
      return;
    }
    resetForm();
    setIsModalOpen(true);
  };

const openEditModal = (product: Product) => {
      if (!canEdit) return;
      const parent = categories.find((cat) =>
        cat.children?.some((child) => child.id === product.categoryId),
      );
      setFormData({
        parentId: parent?.id || "",
        categoryId: product.categoryId,
        itemDescription: product.itemDescription,
        openingQty: product.openingQty,
        purchaseQty1st: product.purchaseQty1st,
        quantityPerUnit1st: product.quantityPerUnit1st ?? product.quantityPerUnit,
        unitPrice1st: calculateUnitPrice(product.purchaseQty1st, product.quantityPerUnit1st ?? product.quantityPerUnit, product.discountAmount1st ?? product.discountAmount, product.price_1st),
        discountAmount1st: product.discountAmount1st ?? product.discountAmount,
        price1st: product.price_1st,
        purchaseDate1st: product.purchaseDate1st ?? "",
        purchaseQty2nd: product.purchaseQty2nd,
        quantityPerUnit2nd: product.quantityPerUnit2nd ?? product.quantityPerUnit,
        unitPrice2nd: calculateUnitPrice(product.purchaseQty2nd, product.quantityPerUnit2nd ?? product.quantityPerUnit, product.discountAmount2nd ?? product.discountAmount, product.price_2nd),
        discountAmount2nd: product.discountAmount2nd ?? product.discountAmount,
        price2nd: product.price_2nd,
        purchaseDate2nd: product.purchaseDate2nd ?? "",
        purchaseQty3rd: product.purchaseQty3rd,
        quantityPerUnit3rd: product.quantityPerUnit3rd ?? product.quantityPerUnit,
        unitPrice3rd: calculateUnitPrice(product.purchaseQty3rd, product.quantityPerUnit3rd ?? product.quantityPerUnit, product.discountAmount3rd ?? product.discountAmount, product.price_3rd),
        discountAmount3rd: product.discountAmount3rd ?? product.discountAmount,
        price3rd: product.price_3rd,
        purchaseDate3rd: product.purchaseDate3rd ?? "",
        usedQty1stWeek: product.usedQty1stWeek,
        usedQty2ndWeek: product.usedQty2ndWeek,
        usedQty3rdWeek: product.usedQty3rdWeek,
        usedQty4thWeek: product.usedQty4thWeek,
        usedQty5thWeek: product.usedQty5thWeek,
      });
      if (product.purchaseQty3rd > 0) setPurchaseCount(3);
      else if (product.purchaseQty2nd > 0) setPurchaseCount(2);
      else setPurchaseCount(1);
      setIsCheckingMode(false);
      setEditingProduct(product);
      setIsModalOpen(true);
    };

const _openCheckingModal = (product: Product) => { // eslint-disable-line @typescript-eslint/no-unused-vars
      const parent = categories.find((cat) =>
        cat.children?.some((child) => child.id === product.categoryId),
      );
      setFormData({
        parentId: parent?.id || "",
        categoryId: product.categoryId,
        itemDescription: product.itemDescription,
        openingQty: product.openingQty,
        purchaseQty1st: product.purchaseQty1st,
        quantityPerUnit1st: product.quantityPerUnit,
        unitPrice1st: calculateUnitPrice(product.purchaseQty1st, product.quantityPerUnit, product.discountAmount1st ?? product.discountAmount, product.price_1st),
        discountAmount1st: product.discountAmount1st ?? product.discountAmount,
        price1st: product.price_1st,
        purchaseDate1st: product.purchaseDate1st ?? "",
        purchaseQty2nd: product.purchaseQty2nd,
        quantityPerUnit2nd: product.quantityPerUnit2nd ?? product.quantityPerUnit,
        unitPrice2nd: calculateUnitPrice(product.purchaseQty2nd, product.quantityPerUnit2nd ?? product.quantityPerUnit, product.discountAmount2nd ?? product.discountAmount, product.price_2nd),
        discountAmount2nd: product.discountAmount2nd ?? product.discountAmount,
        price2nd: product.price_2nd,
        purchaseDate2nd: product.purchaseDate2nd ?? "",
        purchaseQty3rd: product.purchaseQty3rd,
        quantityPerUnit3rd: product.quantityPerUnit3rd ?? product.quantityPerUnit,
        unitPrice3rd: calculateUnitPrice(product.purchaseQty3rd, product.quantityPerUnit3rd ?? product.quantityPerUnit, product.discountAmount3rd ?? product.discountAmount, product.price_3rd),
        discountAmount3rd: product.discountAmount3rd ?? product.discountAmount,
        price3rd: product.price_3rd,
        purchaseDate3rd: product.purchaseDate3rd ?? "",
        usedQty1stWeek: product.usedQty1stWeek,
        usedQty2ndWeek: product.usedQty2ndWeek,
        usedQty3rdWeek: product.usedQty3rdWeek,
        usedQty4thWeek: product.usedQty4thWeek,
        usedQty5thWeek: product.usedQty5thWeek,
      });
      if (product.purchaseQty3rd > 0) setPurchaseCount(3);
      else if (product.purchaseQty2nd > 0) setPurchaseCount(2);
      else setPurchaseCount(1);
      setIsCheckingMode(true);
      setEditingProduct(product);
      setIsModalOpen(true);
    };

  const getAllCategories = (): Category[] => {
    const result: Category[] = [];
    categories.forEach((cat) => {
      result.push(cat);
      if (cat.children) result.push(...cat.children);
    });
    return result;
  };

  const getCategoryName = (categoryId: string): string => {
    const allCats = getAllCategories();
    return allCats.find((c) => c.id === categoryId)?.name || "";
  };

  const getCategoryIdNumber = (categoryId: string): number => {
    return parseInt(categoryId) || 0;
  };

  const totalPurchase = formData.purchaseQty1st + formData.purchaseQty2nd + formData.purchaseQty3rd;
  const totalUsed = formData.usedQty1stWeek + formData.usedQty2ndWeek + formData.usedQty3rdWeek + formData.usedQty4thWeek + formData.usedQty5thWeek;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    if (editingProduct) {
      if (!canEdit) {
        toast.error(MONTH_READ_ONLY_MESSAGE);
        return;
      }
    } else {
      if (!canAdd) {
        toast.error('New products can only be added to the current month.');
        return;
      }
    }

    const result = productFormSchema.safeParse(formData);
    if (!result.success) {
      setFieldErrors(formatZodErrors(result.error));
      return;
    }

    const totalPurchase = formData.purchaseQty1st + formData.purchaseQty2nd + formData.purchaseQty3rd;
    const totalUsed = formData.usedQty1stWeek + formData.usedQty2ndWeek + formData.usedQty3rdWeek + formData.usedQty4thWeek + formData.usedQty5thWeek;
    if (totalUsed > formData.openingQty + totalPurchase) {
      toast.error('Total used quantity cannot exceed opening stock plus purchases.');
      return;
    }

const productData = {
        categoryId: formData.categoryId,
        categoryName: getCategoryName(formData.categoryId),
        itemDescription: formData.itemDescription,
        quantityPerUnit: formData.quantityPerUnit1st,
        unitPrice: formData.unitPrice1st,
        discountAmount: formData.discountAmount1st,
        price: formData.price1st + formData.price2nd + formData.price3rd,
        price_1st: formData.price1st,
        price_2nd: formData.price2nd,
        price_3rd: formData.price3rd,
        openingQty: formData.openingQty,
        closingQty: formData.openingQty + totalPurchase - totalUsed,
        purchaseQty1st: formData.purchaseQty1st,
        purchaseQty2nd: formData.purchaseQty2nd,
        purchaseQty3rd: formData.purchaseQty3rd,
        usedQty1stWeek: formData.usedQty1stWeek,
        usedQty2ndWeek: formData.usedQty2ndWeek,
        usedQty3rdWeek: formData.usedQty3rdWeek,
        usedQty4thWeek: formData.usedQty4thWeek,
        usedQty5thWeek: formData.usedQty5thWeek,
        unitPrice1st: formData.unitPrice1st,
        unitPrice2nd: formData.unitPrice2nd,
        unitPrice3rd: formData.unitPrice3rd,
        discountAmount1st: formData.discountAmount1st,
        discountAmount2nd: formData.discountAmount2nd,
        discountAmount3rd: formData.discountAmount3rd,
        quantityPerUnit1st: formData.quantityPerUnit1st,
        quantityPerUnit2nd: formData.quantityPerUnit2nd,
        quantityPerUnit3rd: formData.quantityPerUnit3rd,
        purchaseDate1st: formData.purchaseDate1st,
        purchaseDate2nd: formData.purchaseDate2nd,
        purchaseDate3rd: formData.purchaseDate3rd,
      };

     try {
       setSaving(true);
       if (editingProduct) {
         await updateProduct(Number(editingProduct.id), {
           ...mapProductToAPI(productData, 0, getCategoryIdNumber(formData.categoryId)),
         });
       } else {
         const monthsData = await getMonths();
         const currentMonth = monthsData.find((m) => String(m.id) === monthId);
         if (currentMonth) {
           await createProduct(mapProductToAPI(productData, currentMonth.id, getCategoryIdNumber(formData.categoryId)));
         }
       }
       closeModal();
       toast.success(editingProduct ? "Product updated successfully" : "Product created successfully");
       await loadData();
     } catch (err: unknown) {
       toast.error((err as Error).message || "Failed to save product");
     } finally {
       setSaving(false);
     }
   };

  const calculateTotalPurchase = (p: Product) =>
    p.purchaseQty1st + p.purchaseQty2nd + p.purchaseQty3rd;

  const calculateTotalUsed = (p: Product) =>
    p.usedQty1stWeek + p.usedQty2ndWeek + p.usedQty3rdWeek + p.usedQty4thWeek + p.usedQty5thWeek;

  const calculateClosingQty = (p: Product) =>
    p.openingQty + calculateTotalPurchase(p) - calculateTotalUsed(p);

  const calculateUnitPrice = (purchaseQty: number, qpu: number, discountAmount: number, price: number): number => {
    const totalItems = purchaseQty * qpu;
    if (totalItems <= 0) return 0;
    return Math.round(((price - discountAmount) / totalItems) * 100) / 100;
  };

  const groupedProducts = categories.map((category) => ({
    category,
    products: products.filter((p) => {
      if (category.children) {
        return category.children.some((child) => child.id === p.categoryId);
      }
      return p.categoryId === category.id;
    }),
  }));

  const handleDelete = async (productId: string) => {
    if (!canEdit) {
      toast.error(MONTH_READ_ONLY_MESSAGE);
      return;
    }
    setConfirmDelete(productId);
  };

  const confirmDeleteProduct = async () => {
    if (!confirmDelete) return;
    if (!canEdit) {
      toast.error(MONTH_READ_ONLY_MESSAGE);
      setConfirmDelete(null);
      return;
    }
    try {
      await deleteProduct(Number(confirmDelete));
      toast.success("Product deleted successfully");
      await loadData();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to delete product");
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

  if (error && !monthInfo) {
    return (
      <div className="p-8">
        <button onClick={() => router.push("/stock")} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Stock</span>
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
        {!canEdit && allMonths.length > 0 && (
          <div className="mb-4 p-4 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 text-sm">
            {MONTH_READ_ONLY_MESSAGE} This month is view-only.
          </div>
        )}
        {showNotification && products.some(isAtMinimumThreshold) && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
            <Bell className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-800">
              Warning: Some products have current stock at or below minimum threshold.
            </span>
          </div>
        )}
        <div className={isModalOpen ? "blur-sm transition-blur duration-200" : ""}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <button
                onClick={() => router.push(`/stock/${year}`)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Months</span>
              </button>
              <h1 className="text-3xl font-bold text-gray-800">
                Stock Management - {monthInfo?.name || year}
              </h1>
            </div>
            {canEdit && (
              <div className="flex items-center gap-3">
                <Link href={`/stock/${year}/${monthId}/check`}>
                  <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <CheckCircle className="w-5 h-5" />
                    <span>Stock Check</span>
                  </button>
                </Link>
                {canAdd && (
                  <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Product</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={isModalOpen ? "blur-sm transition-blur duration-200" : ""}>
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="w-full text-sm border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300 text-gray-700">
<th className="px-3 py-3 text-center font-semibold text-xs border-r border-gray-300" rowSpan={2}>Sr.</th>
                   <th className="px-3 py-3 text-left font-semibold text-xs border-r border-gray-300" rowSpan={2}>Item Description</th>
                   <th className="px-3 py-3 text-center font-semibold text-xs border-r border-gray-300" rowSpan={2}>Price</th>
                   <th className="px-3 py-3 text-center font-semibold text-xs border-r border-gray-300" rowSpan={2}>Opening Qty</th>
                   <th className="px-3 py-2 text-center font-semibold text-xs bg-blue-50 border-r border-gray-300" colSpan={3}>Purchasing Information</th>
                   <th className="px-3 py-2 text-center font-semibold text-xs bg-gray-50 border-r border-gray-300" colSpan={6}>Checking Information</th>
                   <th className="px-3 py-2 text-center font-semibold text-xs bg-yellow-50 border-r border-gray-300" colSpan={2}>Closing Information</th>
                   <th className="px-3 py-3 text-center font-semibold text-xs border-l border-gray-300" rowSpan={2}>Action</th>
                </tr>
<tr className="bg-gray-50 border-b border-gray-300 text-gray-600">
                   <th className="px-2 py-2 text-center text-[11px] font-medium bg-blue-50 text-blue-600 border-r border-gray-200 leading-tight">1st time:<br/>Purchase Qty</th>
                   <th className="px-2 py-2 text-center text-[11px] font-medium bg-blue-50 text-blue-600 border-r border-gray-200 leading-tight">2nd time:<br/>Purchase Qty</th>
                   <th className="px-2 py-2 text-center text-[11px] font-medium bg-blue-50 text-blue-600 border-r border-gray-200 leading-tight">3rd time:<br/>Purchase Qty</th>
                   <th className="px-2 py-2 text-center text-[11px] font-semibold bg-yellow-100 text-gray-800 border-r border-gray-300 leading-tight">Total<br/>Purchase<br/>For This Month</th>
                   <th className="px-2 py-2 text-center text-[11px] font-medium text-red-600 border-r border-gray-200 leading-tight">Used<br/>Qty<br/>1st Week</th>
                   <th className="px-2 py-2 text-center text-[11px] font-medium text-red-600 border-r border-gray-200 leading-tight">Used<br/>Qty<br/>2nd Week</th>
                   <th className="px-2 py-2 text-center text-[11px] font-medium text-red-600 border-r border-gray-200 leading-tight">Used<br/>Qty<br/>3rd Week</th>
                   <th className="px-2 py-2 text-center text-[11px] font-medium text-red-600 border-r border-gray-200 leading-tight">Used<br/>Qty<br/>4th Week</th>
                   <th className="px-2 py-2 text-center text-[11px] font-medium text-red-600 border-r border-gray-200 leading-tight">Used<br/>Qty<br/>5th Week</th>
                   <th className="px-2 py-2 text-center text-[11px] font-semibold bg-yellow-100 text-gray-800 border-r border-gray-300 leading-tight">Total<br/>Used Qty</th>
                   <th className="px-2 py-2 text-center text-[11px] font-semibold bg-yellow-100 text-gray-800 border-r border-gray-300 leading-tight">Closing<br/>Qty</th>
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
                         <td className="px-3 py-2 border-r border-gray-200">
                           <button onClick={() => toggleExpand(category.id)} className="flex items-center gap-2 font-bold text-gray-800">
                             {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                             {category.name}
                           </button>
                         </td>
                         <td className="px-3 py-2 border-r border-gray-200"></td>
                          <td className="px-3 py-2 text-center font-semibold border-r border-gray-200"></td>
                          <td className="px-3 py-2 text-center text-gray-600 border-r border-gray-200"></td>
                          <td className="px-3 py-2 text-center text-gray-600 border-r border-gray-200"></td>
                          <td className="px-3 py-2 text-center text-gray-600 border-r border-gray-200"></td>
                          <td className="px-3 py-2 text-center font-bold text-red-600 bg-yellow-50 border-r border-gray-300"></td>
                          <td className="px-3 py-2 text-center text-gray-600 border-r border-gray-200"></td>
                          <td className="px-3 py-2 text-center text-gray-600 border-r border-gray-200"></td>
                          <td className="px-3 py-2 text-center text-gray-600 border-r border-gray-200"></td>
                          <td className="px-3 py-2 text-center text-gray-600 border-r border-gray-200"></td>
                          <td className="px-3 py-2 text-center text-gray-600 border-r border-gray-200"></td>
                          <td className="px-3 py-2 text-center font-bold text-red-600 bg-yellow-50 border-r border-gray-300"></td>
                          <td className="px-3 py-2 text-center font-bold text-red-600 bg-yellow-50 border-r border-gray-300"></td>
                          <td className="px-2 py-2 text-center border-l border-gray-300 align-middle"></td>
                        </tr>
                      {isExpanded && categoryProducts.map((product, index) => (
                        <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50 text-gray-700">
                          <td className="px-3 py-2 text-center border-r border-gray-200 text-gray-500">{index + 1}</td>
                          <td className="px-3 py-2 border-r border-gray-200 font-normal relative group">
                            <div className="flex items-center gap-2">
                              {product.itemDescription}
                              {isAtMinimumThreshold(product) && <AlertTriangle className="w-4 h-4 text-yellow-600 cursor-help" />}
                            </div>
                            {isAtMinimumThreshold(product) && (
                              <div className="absolute left-0 top-full mt-1 px-3 py-2 bg-yellow-100 border border-yellow-300 rounded-lg text-xs text-yellow-800 whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                Current stock matches the minimum threshold
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2 text-center border-r border-gray-200 font-bold text-blue-600">
                            {product.price.toLocaleString()}
                          </td>
<td className="px-3 py-2 text-center border-r border-gray-200">{product.openingQty}</td>
                            <td className="px-3 py-2 text-center border-r border-gray-200 text-gray-600">{product.purchaseQty1st}</td>
                            <td className="px-3 py-2 text-center border-r border-gray-200 text-gray-600">{product.purchaseQty2nd}</td>
                            <td className="px-3 py-2 text-center border-r border-gray-200 text-gray-600">{product.purchaseQty3rd}</td>
                           <td className="px-3 py-2 text-center font-bold text-red-600 bg-yellow-50 border-r border-gray-300">{calculateTotalPurchase(product)}</td>
                           <td className={`px-3 py-2 text-center border-r border-gray-200 text-gray-600 transition-colors ${product.checkedWeek1 ? "bg-green-100 text-green-700 font-semibold" : ""}`}>{product.usedQty1stWeek}</td>
                           <td className={`px-3 py-2 text-center border-r border-gray-200 text-gray-600 transition-colors ${product.checkedWeek2 ? "bg-green-100 text-green-700 font-semibold" : ""}`}>{product.usedQty2ndWeek}</td>
                           <td className={`px-3 py-2 text-center border-r border-gray-200 text-gray-600 transition-colors ${product.checkedWeek3 ? "bg-green-100 text-green-700 font-semibold" : ""}`}>{product.usedQty3rdWeek}</td>
                           <td className={`px-3 py-2 text-center border-r border-gray-200 text-gray-600 transition-colors ${product.checkedWeek4 ? "bg-green-100 text-green-700 font-semibold" : ""}`}>{product.usedQty4thWeek}</td>
                           <td className={`px-3 py-2 text-center border-r border-gray-200 text-gray-600 transition-colors ${product.checkedWeek5 ? "bg-green-100 text-green-700 font-semibold" : ""}`}>{product.usedQty5thWeek}</td>
                           <td className="px-3 py-2 text-center font-bold text-red-600 bg-yellow-50 border-r border-gray-300">{calculateTotalUsed(product)}</td>
                           <td className="px-3 py-2 text-center font-bold text-red-600 bg-yellow-50 border-r border-gray-300">{product.closingQty ?? calculateClosingQty(product)}</td>
                           <td className="px-2 py-2 text-center border-l border-gray-300 align-middle">
                            {canEdit ? (
                              <div className="flex items-center justify-center gap-1">
                                <button type="button" onClick={() => openEditModal(product)} className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-blue-600" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(product.id)} 
                                  disabled={!canDeleteProduct(product)}
                                  className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-500" 
                                  title={canDeleteProduct(product) ? "Delete" : "Cannot delete: Product has purchase or usage data"}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
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
              <div className="p-8 text-center text-gray-500">No products added.</div>
            )}
          </div>
        </div>

        {isModalOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={closeModal} />
            <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
              <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto pointer-events-auto">
                <form onSubmit={handleSubmit} className="p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    {isCheckingMode ? "Check Product" : editingProduct ? "Edit Product" : "Add Product"}
                  </h2>

                  <div className="grid grid-cols-2 gap-2 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                      <select
                        value={formData.parentId}
                        onChange={(e) => { setFormData({ ...formData, parentId: e.target.value, categoryId: "", itemDescription: "" }); setFieldErrors({}); }}
                        disabled={editingProduct !== null || isCheckingMode}
                        className={`w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${fieldErrors.parentId ? 'border-red-500' : 'border-gray-300'}`}
                      >
                        <option value="">Select Parent Category</option>
                        {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                      </select>
                      {fieldErrors.parentId && <p className="text-red-500 text-xs mt-1">{fieldErrors.parentId}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category *</label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) => {
                          const subId = e.target.value;
                          const parent = categories.find((c) => c.id === formData.parentId);
                          const child = parent?.children?.find((ch) => ch.id === subId);
                          setFormData({ ...formData, categoryId: subId, itemDescription: child ? child.name : "" });
                        }}
                        className={`w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${fieldErrors.categoryId ? 'border-red-500' : 'border-gray-300'}`}
                        required
                        disabled={!formData.parentId || editingProduct !== null || isCheckingMode}
                      >
                        <option value="">Select Sub Category</option>
                        {categories.find((c) => c.id === formData.parentId)?.children?.map((child) => (
                          <option key={child.id} value={child.id}>{child.name}</option>
                        ))}
                      </select>
                      {fieldErrors.categoryId && <p className="text-red-500 text-xs mt-1">{fieldErrors.categoryId}</p>}
                    </div>

                    {!isCheckingMode && (
                      <>
                        <div className="col-span-2 mt-4">
                          <div className="flex items-center justify-between mb-3 border-b pb-2">
                            <h3 className="text-lg font-semibold text-gray-700">Purchasing Information</h3>
                            {purchaseCount < 3 && (
                              <button type="button" onClick={() => setPurchaseCount(purchaseCount + 1)} className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                                <Plus className="w-4 h-4" /><span>Add Purchase</span>
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="col-span-2 border border-gray-200 rounded-lg p-3 mb-2">
                          <h4 className="text-sm font-semibold text-gray-600 mb-2">1st Purchase</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Qty *</label>
                        <input type="number" value={formData.purchaseQty1st} onChange={(e) => {
                          const qty = Number(e.target.value);
                          const unitPrice = calculateUnitPrice(qty, formData.quantityPerUnit1st, formData.discountAmount1st, formData.price1st);
                          setFormData({ ...formData, purchaseQty1st: qty, unitPrice1st: unitPrice }); setFieldErrors({});
                        }} className={`w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.purchaseQty1st ? 'border-red-500' : 'border-gray-300'}`} required />
                              {fieldErrors.purchaseQty1st && <p className="text-red-500 text-xs mt-1">{fieldErrors.purchaseQty1st}</p>}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Price (1st purchase) *</label>
                              <input type="number" value={formData.price1st} onChange={(e) => {
                                const price = Number(e.target.value);
                                const unitPrice = calculateUnitPrice(formData.purchaseQty1st, formData.quantityPerUnit1st, formData.discountAmount1st, price);
                                setFormData({ ...formData, price1st: price, unitPrice1st: unitPrice });
                               }} className={`w-full px-3 py-2 border text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.price1st ? 'border-red-500' : 'border-gray-300'}`} required />
                              {fieldErrors.price1st && <p className="text-red-500 text-xs mt-1">{fieldErrors.price1st}</p>}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Per Unit</label>
                              <input type="number" value={formData.quantityPerUnit1st} onChange={(e) => {
                                const qpu = Number(e.target.value);
                                const unitPrice = calculateUnitPrice(formData.purchaseQty1st, qpu, formData.discountAmount1st, formData.price1st);
                                setFormData({ ...formData, quantityPerUnit1st: qpu, unitPrice1st: unitPrice });
                              }} className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                              <div className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg bg-gray-100">{formData.unitPrice1st.toFixed(2)}</div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Amount</label>
                              <input type="number" value={formData.discountAmount1st} onChange={(e) => {
                                const disc = Number(e.target.value);
                                const unitPrice = calculateUnitPrice(formData.purchaseQty1st, formData.quantityPerUnit1st, disc, formData.price1st);
                                setFormData({ ...formData, discountAmount1st: disc, unitPrice1st: unitPrice });
                              }} className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            </div>
                            <div>
                               <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                               <input type="date" value={formData.purchaseDate1st} min={monthStart} max={maxDate} onChange={(e) => setFormData({ ...formData, purchaseDate1st: e.target.value })} className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                             </div>
                           </div>
                         </div>

                         {purchaseCount >= 2 && (
                          <div className="col-span-2 border border-gray-200 rounded-lg p-3 mb-2">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-semibold text-gray-600">2nd Purchase</h4>
                              {(!editingProduct || editingProduct.purchaseQty2nd === 0) && (
                              <button type="button" onClick={() => { setPurchaseCount(1); setFormData({ ...formData, purchaseQty2nd: 0, quantityPerUnit2nd: 0, unitPrice2nd: 0, discountAmount2nd: 0, price2nd: 0, purchaseDate2nd: "", purchaseQty3rd: 0, quantityPerUnit3rd: 0, unitPrice3rd: 0, discountAmount3rd: 0, price3rd: 0, purchaseDate3rd: "" }); }} className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">
                                <X className="w-3 h-3" /><span>Remove</span>
                              </button>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Qty</label>
                                <input type="number" value={formData.purchaseQty2nd} onChange={(e) => {
                                  const qty = Number(e.target.value);
                                  const unitPrice = calculateUnitPrice(qty, formData.quantityPerUnit2nd, formData.discountAmount2nd, formData.price2nd);
                                  setFormData({ ...formData, purchaseQty2nd: qty, unitPrice2nd: unitPrice });
                                }} className={`w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.purchaseQty2nd ? 'border-red-500' : 'border-gray-300'}`} />
                              {fieldErrors.purchaseQty2nd && <p className="text-red-500 text-xs mt-1">{fieldErrors.purchaseQty2nd}</p>}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price (2nd purchase)</label>
                                <input type="number" value={formData.price2nd} onChange={(e) => {
                                  const price = Number(e.target.value);
                                  const unitPrice = calculateUnitPrice(formData.purchaseQty2nd, formData.quantityPerUnit2nd, formData.discountAmount2nd, price);
                                  setFormData({ ...formData, price2nd: price, unitPrice2nd: unitPrice });
                                }} className={`w-full px-3 py-2 border text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.price2nd ? 'border-red-500' : 'border-gray-300'}`} />
                              {fieldErrors.price2nd && <p className="text-red-500 text-xs mt-1">{fieldErrors.price2nd}</p>}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Per Unit</label>
                                <input type="number" value={formData.quantityPerUnit2nd} onChange={(e) => {
                                  const qpu = Number(e.target.value);
                                  const unitPrice = calculateUnitPrice(formData.purchaseQty2nd, qpu, formData.discountAmount2nd, formData.price2nd);
                                  setFormData({ ...formData, quantityPerUnit2nd: qpu, unitPrice2nd: unitPrice });
                                }} className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                                <div className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg bg-gray-100">{formData.unitPrice2nd.toFixed(2)}</div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Amount</label>
                                <input type="number" value={formData.discountAmount2nd} onChange={(e) => {
                                  const disc = Number(e.target.value);
                                  const unitPrice = calculateUnitPrice(formData.purchaseQty2nd, formData.quantityPerUnit2nd, disc, formData.price2nd);
                                  setFormData({ ...formData, discountAmount2nd: disc, unitPrice2nd: unitPrice });
                                }} className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                                 <input type="date" value={formData.purchaseDate2nd} min={monthStart} max={maxDate} onChange={(e) => setFormData({ ...formData, purchaseDate2nd: e.target.value })} className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                              </div>
                            </div>
                          </div>
                        )}

                        {purchaseCount >= 3 && (
                          <div className="col-span-2 border border-gray-200 rounded-lg p-3 mb-2">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-semibold text-gray-600">3rd Purchase</h4>
                              {(!editingProduct || editingProduct.purchaseQty3rd === 0) && (
                              <button type="button" onClick={() => { setPurchaseCount(2); setFormData({ ...formData, purchaseQty3rd: 0, quantityPerUnit3rd: 0, unitPrice3rd: 0, discountAmount3rd: 0, price3rd: 0, purchaseDate3rd: "" }); }} className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">
                                <X className="w-3 h-3" /><span>Remove</span>
                              </button>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Qty</label>
                                <input type="number" value={formData.purchaseQty3rd} onChange={(e) => {
                                  const qty = Number(e.target.value);
                                  const unitPrice = calculateUnitPrice(qty, formData.quantityPerUnit3rd, formData.discountAmount3rd, formData.price3rd);
                                  setFormData({ ...formData, purchaseQty3rd: qty, unitPrice3rd: unitPrice });
                                }} className={`w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.purchaseQty3rd ? 'border-red-500' : 'border-gray-300'}`} />
                              {fieldErrors.purchaseQty3rd && <p className="text-red-500 text-xs mt-1">{fieldErrors.purchaseQty3rd}</p>}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price (3rd purchase)</label>
                                <input type="number" value={formData.price3rd} onChange={(e) => {
                                  const price = Number(e.target.value);
                                  const unitPrice = calculateUnitPrice(formData.purchaseQty3rd, formData.quantityPerUnit3rd, formData.discountAmount3rd, price);
                                  setFormData({ ...formData, price3rd: price, unitPrice3rd: unitPrice });
                                }} className={`w-full px-3 py-2 border text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.price3rd ? 'border-red-500' : 'border-gray-300'}`} />
                              {fieldErrors.price3rd && <p className="text-red-500 text-xs mt-1">{fieldErrors.price3rd}</p>}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Per Unit</label>
                                <input type="number" value={formData.quantityPerUnit3rd} onChange={(e) => {
                                  const qpu = Number(e.target.value);
                                  const unitPrice = calculateUnitPrice(formData.purchaseQty3rd, qpu, formData.discountAmount3rd, formData.price3rd);
                                  setFormData({ ...formData, quantityPerUnit3rd: qpu, unitPrice3rd: unitPrice });
                                }} className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                                <div className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg bg-gray-100">{formData.unitPrice3rd.toFixed(2)}</div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Amount</label>
                                <input type="number" value={formData.discountAmount3rd} onChange={(e) => {
                                  const disc = Number(e.target.value);
                                  const unitPrice = calculateUnitPrice(formData.purchaseQty3rd, formData.quantityPerUnit3rd, disc, formData.price3rd);
                                  setFormData({ ...formData, discountAmount3rd: disc, unitPrice3rd: unitPrice });
                                }} className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                                 <input type="date" value={formData.purchaseDate3rd} min={monthStart} max={maxDate} onChange={(e) => setFormData({ ...formData, purchaseDate3rd: e.target.value })} className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {isCheckingMode && (
                      <>
                        <div className="col-span-2 mt-4">
                          <h3 className="text-lg font-semibold text-green-700 mb-3 border-b pb-2">Checking Information (Weekly Usage)</h3>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Used Qty 1st Week</label>
                          <input type="number" value={formData.usedQty1stWeek} onChange={(e) => setFormData({ ...formData, usedQty1stWeek: Number(e.target.value) })} className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Used Qty 2nd Week</label>
                          <input type="number" value={formData.usedQty2ndWeek} onChange={(e) => setFormData({ ...formData, usedQty2ndWeek: Number(e.target.value) })} className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Used Qty 3rd Week</label>
                          <input type="number" value={formData.usedQty3rdWeek} onChange={(e) => setFormData({ ...formData, usedQty3rdWeek: Number(e.target.value) })} className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Used Qty 4th Week</label>
                          <input type="number" value={formData.usedQty4thWeek} onChange={(e) => setFormData({ ...formData, usedQty4thWeek: Number(e.target.value) })} className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Used Qty 5th Week</label>
                          <input type="number" value={formData.usedQty5thWeek} onChange={(e) => setFormData({ ...formData, usedQty5thWeek: Number(e.target.value) })} className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors" disabled={saving}>Cancel</button>
                    <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2" disabled={saving}>
                      {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                      <Save className="w-5 h-5" />
                      <span>Save</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}

        <ConfirmModal
          open={confirmDelete !== null}
          title="Delete Product"
          message="Are you sure you want to delete this product? This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={confirmDeleteProduct}
          onCancel={() => setConfirmDelete(null)}
        />
      </div>
    </div>
  );
}