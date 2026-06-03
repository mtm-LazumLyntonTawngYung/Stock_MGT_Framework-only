import type { User, Category, Month, MonthlyStockData, Purchase } from '@/lib/types';
import type { Product } from '@/data/defaultProducts';
import {
  mockLoginUser, mockLogoutUser, mockGetMe, mockChangePassword,
  mockGetUsers, mockCreateUser, mockUpdateUser, mockDeleteUser,
  mockGetCategories, mockCreateCategory, mockUpdateCategory, mockDeleteCategory,
  mockGetMonths, mockCreateMonth, mockDeleteMonth,
  mockGetProducts, mockCreateProduct, mockUpdateProduct, mockDeleteProduct,
  mockGetPurchases, mockCreatePurchase, mockUpdatePurchase, mockDeletePurchase,
  mockUpsertWeeklyCheck,
} from '@/data/mock-data';

export async function getUsers() { return mockGetUsers(); }
export async function createUser(data: { name: string; email: string; password: string; status: string }) { return mockCreateUser(data); }
export async function updateUser(id: number, data: { name: string; email: string; status: string }) { return mockUpdateUser(id, data); }
export async function deleteUser(id: number) { return mockDeleteUser(id); }

export async function getCategories() { return mockGetCategories(); }
export async function createCategory(data: { name: string; parentId?: number | null; minimumThreshold?: number; remark?: string }) { return mockCreateCategory(data); }
export async function updateCategory(id: number, data: { name: string; minimumThreshold?: number; remark?: string }) { return mockUpdateCategory(id, data); }
export async function deleteCategory(id: number) { return mockDeleteCategory(id); }

export async function getMonths() { return mockGetMonths(); }
export async function createMonth(data: { month: number; year: number }) { return mockCreateMonth(data); }
export async function deleteMonth(id: number) { return mockDeleteMonth(id); }

export async function getProducts(year: number, month: number) { return mockGetProducts(year, month); }
export async function createProduct(data: Record<string, unknown>) { return mockCreateProduct(data); }
export async function updateProduct(id: number, data: Record<string, unknown>) { return mockUpdateProduct(id, data); }
export async function deleteProduct(id: number) { return mockDeleteProduct(id); }

export async function getPurchases() { return mockGetPurchases(); }
export async function createPurchase(data: {
  category_id: number; purchase_date: string; quantity: number; unit_price: number; purchase_price: number;
  monthly_stock_id?: number | null;
  discount_price?: number; discount_amount?: number; quantity_per_unit?: number;
}) { return mockCreatePurchase(data); }
export async function updatePurchase(id: number, data: {
  category_id: number; purchase_date: string; quantity: number; unit_price: number; purchase_price: number;
  discount_price?: number; discount_amount?: number; quantity_per_unit?: number;
}) { return mockUpdatePurchase(id, data); }
export async function deletePurchase(id: number) { return mockDeletePurchase(id); }

export async function loginUser(email: string, password: string) { return mockLoginUser(email, password); }
export async function logoutUser() { return mockLogoutUser(); }
export async function getMe() { return mockGetMe(); }
export async function changePassword(currentPassword: string, newPassword: string) { return mockChangePassword(currentPassword, newPassword); }

export async function getWeeklyCheck(monthId: number, categoryId: number) {
  return { month_id: monthId, category_id: categoryId };
}

export async function upsertWeeklyCheck(data: {
  month_id: number; category_id: number;
  used_qty_1st_week?: number; used_qty_2nd_week?: number; used_qty_3rd_week?: number; used_qty_4th_week?: number; used_qty_5th_week?: number;
  checked_week_1?: boolean; checked_week_2?: boolean; checked_week_3?: boolean; checked_week_4?: boolean; checked_week_5?: boolean;
}) { return mockUpsertWeeklyCheck(data); }

export function mapProductFromAPI(item: MonthlyStockData): Product {
  const data = item as unknown as Record<string, unknown>;
  const totalPurchase = (data.purchase_1st_qty as number ?? 0) + (data.purchase_2nd_qty as number ?? 0) + (data.purchase_3rd_qty as number ?? 0);
  const totalUsed = (data.used_qty_1st_week as number ?? 0) + (data.used_qty_2nd_week as number ?? 0) + (data.used_qty_3rd_week as number ?? 0) + (data.used_qty_4th_week as number ?? 0) + (data.used_qty_5th_week as number ?? 0);
  const calculatedClosingQty = (data.opening_qty as number ?? 0) + totalPurchase - totalUsed;
  
return {
      id: String(data.id),
      categoryId: String(data.category_id),
      categoryName: data.categoryName as string || '',
      itemDescription: data.itemDescription as string || '',
      quantityPerUnit: (data.quantity_per_unit as number) ?? 0,
      quantityPerUnit1st: (data.quantity_per_unit_1st as number) ?? data.quantity_per_unit,
      quantityPerUnit2nd: (data.purchase_2nd_qty as number) > 0 ? ((data.quantity_per_unit_2nd as number) ?? data.quantity_per_unit) : 0,
      quantityPerUnit3rd: (data.purchase_3rd_qty as number) > 0 ? ((data.quantity_per_unit_3rd as number) ?? data.quantity_per_unit) : 0,
      unitPrice: Number(data.unit_price ?? 0),
      unitPrice1st: Number(data.unit_price_1st ?? data.unit_price ?? 0),
      unitPrice2nd: Number(data.unit_price_2nd ?? data.unit_price ?? 0),
      unitPrice3rd: Number(data.unit_price_3rd ?? data.unit_price ?? 0),
      discountAmount: Number(data.discount_amount ?? 0),
      discountAmount1st: Number(data.discount_amount_1st ?? data.discount_amount ?? 0),
      discountAmount2nd: Number(data.discount_amount_2nd ?? data.discount_amount ?? 0),
      discountAmount3rd: Number(data.discount_amount_3rd ?? data.discount_amount ?? 0),
      price: Number(data.price ?? 0),
      price_1st: Number(data.price_1st ?? 0),
      price_2nd: Number(data.price_2nd ?? 0),
      price_3rd: Number(data.price_3rd ?? 0),
      openingQty: data.opening_qty as number ?? 0,
      closingQty: data.closing_qty as number ?? calculatedClosingQty,
      purchaseQty1st: data.purchase_1st_qty as number ?? 0,
      purchaseQty2nd: data.purchase_2nd_qty as number ?? 0,
      purchaseQty3rd: data.purchase_3rd_qty as number ?? 0,
      usedQty1stWeek: data.used_qty_1st_week as number ?? 0,
      usedQty2ndWeek: data.used_qty_2nd_week as number ?? 0,
      usedQty3rdWeek: data.used_qty_3rd_week as number ?? 0,
      usedQty4thWeek: data.used_qty_4th_week as number ?? 0,
       usedQty5thWeek: data.used_qty_5th_week as number ?? 0,
       purchaseDate1st: ((data.purchase_date_1st as string) || "").split('T')[0],
       purchaseDate2nd: ((data.purchase_date_2nd as string) || "").split('T')[0],
       purchaseDate3rd: ((data.purchase_date_3rd as string) || "").split('T')[0],
       minimumThreshold: data.minimum_threshold as number ?? 0,
      checkedWeek1: Boolean(data.checked_week_1),
      checkedWeek2: Boolean(data.checked_week_2),
      checkedWeek3: Boolean(data.checked_week_3),
      checkedWeek4: Boolean(data.checked_week_4),
      checkedWeek5: Boolean(data.checked_week_5),
    };
}

export interface ProductAPIData {
  quantityPerUnit?: number;
  unitPrice?: number;
  discountAmount?: number;
  price?: number;
  price_1st?: number;
  price_2nd?: number;
  price_3rd?: number;
  openingQty?: number;
  closingQty?: number;
  purchaseQty1st?: number;
  purchaseQty2nd?: number;
  purchaseQty3rd?: number;
  usedQty1stWeek?: number;
  usedQty2ndWeek?: number;
  usedQty3rdWeek?: number;
  usedQty4thWeek?: number;
  usedQty5thWeek?: number;
  checkedWeek1?: boolean;
  checkedWeek2?: boolean;
  checkedWeek3?: boolean;
  checkedWeek4?: boolean;
  checkedWeek5?: boolean;
  unitPrice1st?: number;
  unitPrice2nd?: number;
  unitPrice3rd?: number;
  discountAmount1st?: number;
  discountAmount2nd?: number;
  discountAmount3rd?: number;
   quantityPerUnit1st?: number;
   quantityPerUnit2nd?: number;
   quantityPerUnit3rd?: number;
   purchaseDate1st?: string;
   purchaseDate2nd?: string;
   purchaseDate3rd?: string;
 }

export function mapProductToAPI(product: ProductAPIData, month_id: number, category_id: number) {
  const totalPurchase = (product.purchaseQty1st ?? 0) + (product.purchaseQty2nd ?? 0) + (product.purchaseQty3rd ?? 0);
  const totalUsed = (product.usedQty1stWeek ?? 0) + (product.usedQty2ndWeek ?? 0) + (product.usedQty3rdWeek ?? 0) + (product.usedQty4thWeek ?? 0) + (product.usedQty5thWeek ?? 0);
  const closingQty = product.closingQty ?? (product.openingQty ?? 0) + totalPurchase - totalUsed;

  const up1 = product.unitPrice1st ?? product.unitPrice ?? 0;
  const up2 = product.unitPrice2nd ?? product.unitPrice ?? 0;
  const up3 = product.unitPrice3rd ?? product.unitPrice ?? 0;
  const qpu1 = product.quantityPerUnit1st ?? product.quantityPerUnit ?? 1;
  const qpu2 = product.quantityPerUnit2nd ?? product.quantityPerUnit ?? 1;
  const qpu3 = product.quantityPerUnit3rd ?? product.quantityPerUnit ?? 1;
  const da1 = product.discountAmount1st ?? product.discountAmount ?? 0;
  const da2 = product.discountAmount2nd ?? product.discountAmount ?? 0;
  const da3 = product.discountAmount3rd ?? product.discountAmount ?? 0;

  return {
    month_id,
    category_id,
    quantity_per_unit: product.quantityPerUnit ?? 1,
    unit_price: product.unitPrice ?? 0,
    discount_amount: product.discountAmount ?? 0,
    price: product.price ?? 0,
    price_1st: product.price_1st ?? 0,
    price_2nd: product.price_2nd ?? 0,
    price_3rd: product.price_3rd ?? 0,
    opening_qty: product.openingQty ?? 0,
    closing_qty: closingQty,
    purchase_1st_qty: product.purchaseQty1st ?? 0,
    purchase_2nd_qty: product.purchaseQty2nd ?? 0,
    purchase_3rd_qty: product.purchaseQty3rd ?? 0,
    used_qty_1st_week: product.usedQty1stWeek ?? 0,
    used_qty_2nd_week: product.usedQty2ndWeek ?? 0,
    used_qty_3rd_week: product.usedQty3rdWeek ?? 0,
    used_qty_4th_week: product.usedQty4thWeek ?? 0,
    used_qty_5th_week: product.usedQty5thWeek ?? 0,
    checked_week_1: product.checkedWeek1 ?? false,
    checked_week_2: product.checkedWeek2 ?? false,
    checked_week_3: product.checkedWeek3 ?? false,
    checked_week_4: product.checkedWeek4 ?? false,
    checked_week_5: product.checkedWeek5 ?? false,
    unit_price_1st: up1,
    unit_price_2nd: up2,
    unit_price_3rd: up3,
    discount_amount_1st: da1,
    discount_amount_2nd: da2,
    discount_amount_3rd: da3,
    quantity_per_unit_1st: qpu1,
    quantity_per_unit_2nd: qpu2,
    quantity_per_unit_3rd: qpu3,
    purchase_date_1st: product.purchaseDate1st || null,
    purchase_date_2nd: product.purchaseDate2nd || null,
    purchase_date_3rd: product.purchaseDate3rd || null,
  };
}

export interface FlatCategory {
  id: string;
  name: string;
  parentId: string | null;
  minimum_threshold?: number;
  remark?: string;
  children?: FlatCategory[];
}

export function mapCategoryFromAPI(item: Category): FlatCategory {
  return {
    id: String(item.id),
    name: item.name,
    parentId: item.parent_id ? String(item.parent_id) : null,
    minimum_threshold: item.minimum_threshold ?? 0,
    remark: item.remark || undefined,
    children: [],
  };
}

export interface FlatUser {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive";
  createdAt: Date;
  lastLogin?: Date;
}

export function mapUserFromAPI(item: User): FlatUser {
  return {
    id: String(item.id),
    name: item.name,
    email: item.email,
    status: item.status,
    createdAt: new Date(item.created_at),
    lastLogin: item.last_login ? new Date(item.last_login) : undefined,
  };
}
