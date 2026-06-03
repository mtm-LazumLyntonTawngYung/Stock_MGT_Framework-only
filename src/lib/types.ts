export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  status: 'active' | 'inactive';
  last_login?: string | null;
  created_at: string;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface Category {
  id: number;
  name: string;
  minimum_threshold: number;
  remark?: string | null;
  parent_id?: number | null;
  children?: Category[];
  created_at: string;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface Month {
  id: number;
  month: number;
  year: number;
  created_at: string;
}

export interface MonthlyStockData {
  id: number;
  month_id: number;
  category_id: number;
  opening_qty: number;
  closing_qty: number;
  minimum_threshold?: number;
  created_by?: number | null;
  updated_by?: number | null;
  created_at: string;
  updated_at?: string | null;
  deleted_at?: string | null;
  itemDescription?: string;
  categoryName?: string;
}

export interface WeeklyStockCheck {
  id: number;
  month_id: number;
  category_id: number;
  used_qty_1st_week: number;
  used_qty_2nd_week: number;
  used_qty_3rd_week: number;
  used_qty_4th_week: number;
  used_qty_5th_week: number;
  checked_week_1: boolean;
  checked_week_2: boolean;
  checked_week_3: boolean;
  checked_week_4: boolean;
  checked_week_5: boolean;
  created_by?: number | null;
  updated_by?: number | null;
  created_at: string;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface Purchase {
  id: number;
  monthly_stock_id?: number | null;
  category_id: number;
  purchase_date: string;
  quantity: number;
  purchase_price: number;
  unit_price: number;
  quantity_per_unit: number;
  discount_amount: number;
  discount_price: number;
  created_by?: number | null;
  updated_by?: number | null;
  created_at: string;
  updated_at?: string | null;
  categoryName?: string;
}
