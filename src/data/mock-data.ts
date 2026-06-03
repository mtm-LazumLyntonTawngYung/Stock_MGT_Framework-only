import type { User, Category, Month, MonthlyStockData, WeeklyStockCheck, Purchase } from '@/lib/types';

interface MockStore {
  users: User[];
  categories: Category[];
  months: Month[];
  stockData: (MonthlyStockData & Record<string, unknown>)[];
  weeklyChecks: (WeeklyStockCheck & Record<string, unknown>)[];
  purchases: (Purchase & Record<string, unknown>)[];
}

let nextId = { users: 6, categories: 13, months: 6, stockData: 51, weeklyChecks: 46, purchases: 33 };

let currentUser: { id: number; name: string; email: string } | null = null;

const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

const store: MockStore = {
  users: [
    { id: 1, name: 'Admin User', email: 'admin@example.com', password: 'password', status: 'active', last_login: null, created_at: '2026-01-01 00:00:00', updated_at: null, deleted_at: null },
    { id: 2, name: 'Manager User', email: 'manager@example.com', password: 'password', status: 'active', last_login: null, created_at: '2026-01-01 00:00:00', updated_at: null, deleted_at: null },
    { id: 3, name: 'John Doe', email: 'john@example.com', password: 'password', status: 'active', last_login: null, created_at: '2026-01-01 00:00:00', updated_at: null, deleted_at: null },
    { id: 4, name: 'Jane Smith', email: 'jane@example.com', password: 'password', status: 'active', last_login: null, created_at: '2026-01-01 00:00:00', updated_at: null, deleted_at: null },
    { id: 5, name: 'Bob Wilson', email: 'bob@example.com', password: 'password', status: 'inactive', last_login: null, created_at: '2026-01-01 00:00:00', updated_at: null, deleted_at: null },
  ],
  categories: [
    { id: 1, name: 'Meal Allowance', minimum_threshold: 0, remark: 'Monthly meal provisions for staff', parent_id: null, children: [], created_at: '2026-01-01 00:00:00', updated_at: null, deleted_at: null },
    { id: 2, name: 'Premier Coffee Original 3 in 1', minimum_threshold: 10, remark: 'တစ်ပါကင်မှာ ၃၀ ထုပ် (၁ပုံးမှာ 32 ပါကင်)', parent_id: 1, children: [], created_at: '2026-01-01 00:00:00', updated_at: null, deleted_at: null },
    { id: 3, name: 'Premier Coffee Expresso', minimum_threshold: 10, remark: 'Expresso coffee packets', parent_id: 1, children: [], created_at: '2026-01-01 00:00:00', updated_at: null, deleted_at: null },
    { id: 4, name: 'Premier Coffee 2 plus 1', minimum_threshold: 3, remark: '2-in-1 coffee sachets', parent_id: 1, children: [], created_at: '2026-01-01 00:00:00', updated_at: null, deleted_at: null },
    { id: 5, name: 'Sugar', minimum_threshold: 15, remark: 'ဝမ်းဗိုက် (bulk sugar supply)', parent_id: 1, children: [], created_at: '2026-01-01 00:00:00', updated_at: null, deleted_at: null },
    { id: 6, name: 'Dry Tea', minimum_threshold: 5, remark: 'အသင့် (tea leaves for daily use)', parent_id: 1, children: [], created_at: '2026-01-01 00:00:00', updated_at: null, deleted_at: null },
    { id: 7, name: 'Office Supplies', minimum_threshold: 0, remark: 'General office consumables', parent_id: null, children: [], created_at: '2026-01-01 00:00:00', updated_at: null, deleted_at: null },
    { id: 8, name: 'Table Tissue (OK Happy Rose)', minimum_threshold: 5, remark: '10ထုပ်ပါတစ်ဆွဲ (၁၅ဆွဲပါ ၁ထုပ်)', parent_id: 7, children: [], created_at: '2026-01-01 00:00:00', updated_at: null, deleted_at: null },
    { id: 9, name: 'Table Tissue (Diva)', minimum_threshold: 5, remark: 'Diva brand table napkins', parent_id: 7, children: [], created_at: '2026-01-01 00:00:00', updated_at: null, deleted_at: null },
    { id: 10, name: 'Toilet Tissue (Snow White SP)', minimum_threshold: 5, remark: '16 လုံးပါ ၁ပုံး', parent_id: 7, children: [], created_at: '2026-01-01 00:00:00', updated_at: null, deleted_at: null },
    { id: 11, name: 'A4 Paper Ream', minimum_threshold: 3, remark: '500 sheets per ream', parent_id: 7, children: [], created_at: '2026-01-01 00:00:00', updated_at: null, deleted_at: null },
    { id: 12, name: 'Ballpoint Pens', minimum_threshold: 10, remark: 'Box of 12 pens', parent_id: 7, children: [], created_at: '2026-01-01 00:00:00', updated_at: null, deleted_at: null },
  ],
  months: [
    { id: 1, month: 1, year: 2026, created_at: '2026-01-01 00:00:00' },
    { id: 2, month: 2, year: 2026, created_at: '2026-02-01 00:00:00' },
    { id: 3, month: 3, year: 2026, created_at: '2026-03-01 00:00:00' },
    { id: 4, month: 4, year: 2026, created_at: '2026-04-01 00:00:00' },
    { id: 5, month: 5, year: 2026, created_at: '2026-05-01 00:00:00' },
  ],
  stockData: [
    { id: 1, month_id: 1, category_id: 2, opening_qty: 6, closing_qty: 25, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Premier Coffee Original 3 in 1', itemDescription: 'Premier Coffee Original 3 in 1', minimum_threshold: 10, purchase_1st_qty: 32, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 3, used_qty_2nd_week: 4, used_qty_3rd_week: 6, used_qty_4th_week: 4, used_qty_5th_week: 3, checked_week_1: true, checked_week_2: true, checked_week_3: true, checked_week_4: true, checked_week_5: true, price: 5000, price_1st: 5000, price_2nd: 0, price_3rd: 0, unit_price: 5000, unit_price_1st: 5000, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: '2026-01-05', purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 2, month_id: 1, category_id: 3, opening_qty: 0, closing_qty: 0, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Premier Coffee Expresso', itemDescription: 'Premier Coffee Expresso', minimum_threshold: 10, purchase_1st_qty: 0, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 0, used_qty_2nd_week: 0, used_qty_3rd_week: 0, used_qty_4th_week: 0, used_qty_5th_week: 0, checked_week_1: false, checked_week_2: false, checked_week_3: false, checked_week_4: false, checked_week_5: false, price: 0, price_1st: 0, price_2nd: 0, price_3rd: 0, unit_price: 0, unit_price_1st: 0, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: null, purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 3, month_id: 1, category_id: 4, opening_qty: 7, closing_qty: 12, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Premier Coffee 2 plus 1', itemDescription: 'Premier Coffee 2 plus 1', minimum_threshold: 3, purchase_1st_qty: 10, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 0, used_qty_2nd_week: 0, used_qty_3rd_week: 3, used_qty_4th_week: 2, used_qty_5th_week: 0, checked_week_1: false, checked_week_2: false, checked_week_3: true, checked_week_4: true, checked_week_5: false, price: 4500, price_1st: 4500, price_2nd: 0, price_3rd: 0, unit_price: 4500, unit_price_1st: 4500, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: '2026-01-08', purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 4, month_id: 1, category_id: 5, opening_qty: 22, closing_qty: 22, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Sugar', itemDescription: 'Sugar ( ဝမ်းဗိုက် )', minimum_threshold: 15, purchase_1st_qty: 0, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 0, used_qty_2nd_week: 0, used_qty_3rd_week: 0, used_qty_4th_week: 0, used_qty_5th_week: 0, checked_week_1: false, checked_week_2: false, checked_week_3: false, checked_week_4: false, checked_week_5: false, price: 0, price_1st: 0, price_2nd: 0, price_3rd: 0, unit_price: 0, unit_price_1st: 0, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: null, purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 5, month_id: 1, category_id: 6, opening_qty: 4, closing_qty: 1, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Dry Tea', itemDescription: 'Dry Tea', minimum_threshold: 5, purchase_1st_qty: 0, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 0, used_qty_2nd_week: 2, used_qty_3rd_week: 1, used_qty_4th_week: 0, used_qty_5th_week: 0, checked_week_1: false, checked_week_2: true, checked_week_3: true, checked_week_4: false, checked_week_5: false, price: 0, price_1st: 0, price_2nd: 0, price_3rd: 0, unit_price: 0, unit_price_1st: 0, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: null, purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 6, month_id: 1, category_id: 8, opening_qty: 10, closing_qty: 5, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Table Tissue (OK Happy Rose)', itemDescription: 'Table Tissue (OK Happy Rose)', minimum_threshold: 5, purchase_1st_qty: 15, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 2, used_qty_2nd_week: 3, used_qty_3rd_week: 3, used_qty_4th_week: 2, used_qty_5th_week: 0, checked_week_1: true, checked_week_2: true, checked_week_3: true, checked_week_4: true, checked_week_5: false, price: 2500, price_1st: 2500, price_2nd: 0, price_3rd: 0, unit_price: 2500, unit_price_1st: 2500, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: '2026-01-10', purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 7, month_id: 1, category_id: 9, opening_qty: 5, closing_qty: 5, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Table Tissue (Diva)', itemDescription: 'Table Tissue (Diva)', minimum_threshold: 5, purchase_1st_qty: 10, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 1, used_qty_2nd_week: 1, used_qty_3rd_week: 2, used_qty_4th_week: 1, used_qty_5th_week: 0, checked_week_1: true, checked_week_2: true, checked_week_3: true, checked_week_4: true, checked_week_5: false, price: 2200, price_1st: 2200, price_2nd: 0, price_3rd: 0, unit_price: 2200, unit_price_1st: 2200, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: '2026-01-10', purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 8, month_id: 1, category_id: 10, opening_qty: 3, closing_qty: 4, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Toilet Tissue (Snow White SP)', itemDescription: 'Toilet Tissue (Snow White SP)', minimum_threshold: 5, purchase_1st_qty: 8, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 1, used_qty_2nd_week: 1, used_qty_3rd_week: 1, used_qty_4th_week: 1, used_qty_5th_week: 0, checked_week_1: true, checked_week_2: true, checked_week_3: true, checked_week_4: true, checked_week_5: false, price: 3500, price_1st: 3500, price_2nd: 0, price_3rd: 0, unit_price: 3500, unit_price_1st: 3500, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: '2026-01-12', purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 9, month_id: 1, category_id: 11, opening_qty: 8, closing_qty: 10, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'A4 Paper Ream', itemDescription: 'A4 Paper Ream', minimum_threshold: 3, purchase_1st_qty: 5, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 1, used_qty_2nd_week: 2, used_qty_3rd_week: 1, used_qty_4th_week: 0, used_qty_5th_week: 0, checked_week_1: true, checked_week_2: true, checked_week_3: true, checked_week_4: false, checked_week_5: false, price: 12000, price_1st: 12000, price_2nd: 0, price_3rd: 0, unit_price: 12000, unit_price_1st: 12000, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: '2026-01-15', purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 10, month_id: 1, category_id: 12, opening_qty: 12, closing_qty: 7, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Ballpoint Pens', itemDescription: 'Ballpoint Pens', minimum_threshold: 10, purchase_1st_qty: 6, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 2, used_qty_2nd_week: 1, used_qty_3rd_week: 1, used_qty_4th_week: 2, used_qty_5th_week: 0, checked_week_1: true, checked_week_2: true, checked_week_3: true, checked_week_4: true, checked_week_5: false, price: 5000, price_1st: 5000, price_2nd: 0, price_3rd: 0, unit_price: 5000, unit_price_1st: 5000, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: '2026-01-15', purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 11, month_id: 2, category_id: 2, opening_qty: 22, closing_qty: 35, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Premier Coffee Original 3 in 1', itemDescription: 'Premier Coffee Original 3 in 1', minimum_threshold: 10, purchase_1st_qty: 25, purchase_2nd_qty: 15, purchase_3rd_qty: 0, used_qty_1st_week: 9, used_qty_2nd_week: 8, used_qty_3rd_week: 11, used_qty_4th_week: 10, used_qty_5th_week: 0, checked_week_1: true, checked_week_2: true, checked_week_3: true, checked_week_4: true, checked_week_5: false, price: 10400, price_1st: 5200, price_2nd: 5200, price_3rd: 0, unit_price: 5200, unit_price_1st: 5200, unit_price_2nd: 5200, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 1, quantity_per_unit_3rd: 0, purchase_date_1st: '2026-02-03', purchase_date_2nd: '2026-02-18', purchase_date_3rd: null },
    { id: 12, month_id: 2, category_id: 3, opening_qty: 0, closing_qty: 0, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Premier Coffee Expresso', itemDescription: 'Premier Coffee Expresso', minimum_threshold: 10, purchase_1st_qty: 0, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 0, used_qty_2nd_week: 0, used_qty_3rd_week: 0, used_qty_4th_week: 0, used_qty_5th_week: 0, checked_week_1: false, checked_week_2: false, checked_week_3: false, checked_week_4: false, checked_week_5: false, price: 0, price_1st: 0, price_2nd: 0, price_3rd: 0, unit_price: 0, unit_price_1st: 0, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: null, purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 13, month_id: 2, category_id: 4, opening_qty: 12, closing_qty: 11, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Premier Coffee 2 plus 1', itemDescription: 'Premier Coffee 2 plus 1', minimum_threshold: 3, purchase_1st_qty: 8, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 2, used_qty_2nd_week: 3, used_qty_3rd_week: 4, used_qty_4th_week: 2, used_qty_5th_week: 0, checked_week_1: true, checked_week_2: true, checked_week_3: true, checked_week_4: true, checked_week_5: false, price: 4500, price_1st: 4500, price_2nd: 0, price_3rd: 0, unit_price: 4500, unit_price_1st: 4500, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: '2026-02-06', purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 14, month_id: 2, category_id: 5, opening_qty: 22, closing_qty: 14, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Sugar', itemDescription: 'Sugar ( ဝမ်းဗိုက် )', minimum_threshold: 15, purchase_1st_qty: 12, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 4, used_qty_2nd_week: 3, used_qty_3rd_week: 3, used_qty_4th_week: 4, used_qty_5th_week: 0, checked_week_1: true, checked_week_2: true, checked_week_3: true, checked_week_4: true, checked_week_5: false, price: 3100, price_1st: 3100, price_2nd: 0, price_3rd: 0, unit_price: 3100, unit_price_1st: 3100, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: '2026-02-10', purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 15, month_id: 2, category_id: 6, opening_qty: 5, closing_qty: 8, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Dry Tea', itemDescription: 'Dry Tea', minimum_threshold: 5, purchase_1st_qty: 0, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 1, used_qty_2nd_week: 2, used_qty_3rd_week: 1, used_qty_4th_week: 1, used_qty_5th_week: 0, checked_week_1: true, checked_week_2: true, checked_week_3: true, checked_week_4: true, checked_week_5: false, price: 0, price_1st: 0, price_2nd: 0, price_3rd: 0, unit_price: 0, unit_price_1st: 0, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: null, purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 16, month_id: 2, category_id: 8, opening_qty: 15, closing_qty: 12, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Table Tissue (OK Happy Rose)', itemDescription: 'Table Tissue (OK Happy Rose)', minimum_threshold: 5, purchase_1st_qty: 12, purchase_2nd_qty: 8, purchase_3rd_qty: 0, used_qty_1st_week: 4, used_qty_2nd_week: 3, used_qty_3rd_week: 4, used_qty_4th_week: 3, used_qty_5th_week: 0, checked_week_1: true, checked_week_2: true, checked_week_3: true, checked_week_4: true, checked_week_5: false, price: 5100, price_1st: 2500, price_2nd: 2600, price_3rd: 0, unit_price: 2500, unit_price_1st: 2500, unit_price_2nd: 2600, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 1, quantity_per_unit_3rd: 0, purchase_date_1st: '2026-02-05', purchase_date_2nd: '2026-02-20', purchase_date_3rd: null },
    { id: 17, month_id: 2, category_id: 9, opening_qty: 10, closing_qty: 8, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Table Tissue (Diva)', itemDescription: 'Table Tissue (Diva)', minimum_threshold: 5, purchase_1st_qty: 0, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 2, used_qty_2nd_week: 2, used_qty_3rd_week: 3, used_qty_4th_week: 1, used_qty_5th_week: 0, checked_week_1: true, checked_week_2: true, checked_week_3: true, checked_week_4: true, checked_week_5: false, price: 0, price_1st: 0, price_2nd: 0, price_3rd: 0, unit_price: 0, unit_price_1st: 0, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: null, purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 18, month_id: 2, category_id: 10, opening_qty: 8, closing_qty: 6, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Toilet Tissue (Snow White SP)', itemDescription: 'Toilet Tissue (Snow White SP)', minimum_threshold: 5, purchase_1st_qty: 6, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 2, used_qty_2nd_week: 1, used_qty_3rd_week: 2, used_qty_4th_week: 1, used_qty_5th_week: 0, checked_week_1: true, checked_week_2: true, checked_week_3: true, checked_week_4: true, checked_week_5: false, price: 3600, price_1st: 3600, price_2nd: 0, price_3rd: 0, unit_price: 3600, unit_price_1st: 3600, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: '2026-02-12', purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 19, month_id: 2, category_id: 11, opening_qty: 9, closing_qty: 8, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'A4 Paper Ream', itemDescription: 'A4 Paper Ream', minimum_threshold: 3, purchase_1st_qty: 0, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 2, used_qty_2nd_week: 1, used_qty_3rd_week: 1, used_qty_4th_week: 1, used_qty_5th_week: 0, checked_week_1: true, checked_week_2: true, checked_week_3: true, checked_week_4: true, checked_week_5: false, price: 0, price_1st: 0, price_2nd: 0, price_3rd: 0, unit_price: 0, unit_price_1st: 0, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: null, purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 20, month_id: 2, category_id: 12, opening_qty: 13, closing_qty: 9, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Ballpoint Pens', itemDescription: 'Ballpoint Pens', minimum_threshold: 10, purchase_1st_qty: 0, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 1, used_qty_2nd_week: 2, used_qty_3rd_week: 2, used_qty_4th_week: 1, used_qty_5th_week: 0, checked_week_1: true, checked_week_2: true, checked_week_3: true, checked_week_4: true, checked_week_5: false, price: 0, price_1st: 0, price_2nd: 0, price_3rd: 0, unit_price: 0, unit_price_1st: 0, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: null, purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 21, month_id: 3, category_id: 2, opening_qty: 17, closing_qty: 28, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Premier Coffee Original 3 in 1', itemDescription: 'Premier Coffee Original 3 in 1', minimum_threshold: 10, purchase_1st_qty: 35, purchase_2nd_qty: 10, purchase_3rd_qty: 0, used_qty_1st_week: 10, used_qty_2nd_week: 11, used_qty_3rd_week: 9, used_qty_4th_week: 12, used_qty_5th_week: 3, checked_week_1: true, checked_week_2: true, checked_week_3: true, checked_week_4: true, checked_week_5: true, price: 10500, price_1st: 5200, price_2nd: 5300, price_3rd: 0, unit_price: 5200, unit_price_1st: 5200, unit_price_2nd: 5300, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 1, quantity_per_unit_3rd: 0, purchase_date_1st: '2026-03-03', purchase_date_2nd: '2026-03-20', purchase_date_3rd: null },
    { id: 22, month_id: 3, category_id: 3, opening_qty: 0, closing_qty: 0, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Premier Coffee Expresso', itemDescription: 'Premier Coffee Expresso', minimum_threshold: 10, purchase_1st_qty: 0, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 0, used_qty_2nd_week: 0, used_qty_3rd_week: 0, used_qty_4th_week: 0, used_qty_5th_week: 0, checked_week_1: false, checked_week_2: false, checked_week_3: false, checked_week_4: false, checked_week_5: false, price: 0, price_1st: 0, price_2nd: 0, price_3rd: 0, unit_price: 0, unit_price_1st: 0, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: null, purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 23, month_id: 3, category_id: 4, opening_qty: 11, closing_qty: 10, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Premier Coffee 2 plus 1', itemDescription: 'Premier Coffee 2 plus 1', minimum_threshold: 3, purchase_1st_qty: 10, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 3, used_qty_2nd_week: 2, used_qty_3rd_week: 3, used_qty_4th_week: 2, used_qty_5th_week: 1, checked_week_1: true, checked_week_2: true, checked_week_3: true, checked_week_4: true, checked_week_5: true, price: 4600, price_1st: 4600, price_2nd: 0, price_3rd: 0, unit_price: 4600, unit_price_1st: 4600, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: '2026-03-05', purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 24, month_id: 3, category_id: 5, opening_qty: 14, closing_qty: 10, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Sugar', itemDescription: 'Sugar ( ဝမ်းဗိုက် )', minimum_threshold: 15, purchase_1st_qty: 8, purchase_2nd_qty: 5, purchase_3rd_qty: 0, used_qty_1st_week: 3, used_qty_2nd_week: 4, used_qty_3rd_week: 2, used_qty_4th_week: 3, used_qty_5th_week: 2, checked_week_1: true, checked_week_2: true, checked_week_3: true, checked_week_4: true, checked_week_5: true, price: 6400, price_1st: 3200, price_2nd: 3200, price_3rd: 0, unit_price: 3200, unit_price_1st: 3200, unit_price_2nd: 3200, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 1, quantity_per_unit_3rd: 0, purchase_date_1st: '2026-03-08', purchase_date_2nd: '2026-03-22', purchase_date_3rd: null },
    { id: 25, month_id: 3, category_id: 6, opening_qty: 8, closing_qty: 8, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Dry Tea', itemDescription: 'Dry Tea', minimum_threshold: 5, purchase_1st_qty: 0, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 2, used_qty_2nd_week: 2, used_qty_3rd_week: 2, used_qty_4th_week: 1, used_qty_5th_week: 1, checked_week_1: true, checked_week_2: true, checked_week_3: true, checked_week_4: true, checked_week_5: true, price: 0, price_1st: 0, price_2nd: 0, price_3rd: 0, unit_price: 0, unit_price_1st: 0, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: null, purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 26, month_id: 3, category_id: 8, opening_qty: 12, closing_qty: 10, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Table Tissue (OK Happy Rose)', itemDescription: 'Table Tissue (OK Happy Rose)', minimum_threshold: 5, purchase_1st_qty: 18, purchase_2nd_qty: 12, purchase_3rd_qty: 0, used_qty_1st_week: 6, used_qty_2nd_week: 5, used_qty_3rd_week: 7, used_qty_4th_week: 5, used_qty_5th_week: 2, checked_week_1: true, checked_week_2: true, checked_week_3: true, checked_week_4: true, checked_week_5: true, price: 5200, price_1st: 2600, price_2nd: 2600, price_3rd: 0, unit_price: 2600, unit_price_1st: 2600, unit_price_2nd: 2600, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 1, quantity_per_unit_3rd: 0, purchase_date_1st: '2026-03-05', purchase_date_2nd: '2026-03-22', purchase_date_3rd: null },
    { id: 27, month_id: 3, category_id: 9, opening_qty: 8, closing_qty: 6, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Table Tissue (Diva)', itemDescription: 'Table Tissue (Diva)', minimum_threshold: 5, purchase_1st_qty: 0, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 2, used_qty_2nd_week: 2, used_qty_3rd_week: 2, used_qty_4th_week: 1, used_qty_5th_week: 1, checked_week_1: true, checked_week_2: true, checked_week_3: true, checked_week_4: true, checked_week_5: true, price: 0, price_1st: 0, price_2nd: 0, price_3rd: 0, unit_price: 0, unit_price_1st: 0, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: null, purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 28, month_id: 3, category_id: 10, opening_qty: 6, closing_qty: 6, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Toilet Tissue (Snow White SP)', itemDescription: 'Toilet Tissue (Snow White SP)', minimum_threshold: 5, purchase_1st_qty: 10, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 2, used_qty_2nd_week: 2, used_qty_3rd_week: 3, used_qty_4th_week: 1, used_qty_5th_week: 1, checked_week_1: true, checked_week_2: true, checked_week_3: true, checked_week_4: true, checked_week_5: true, price: 3600, price_1st: 3600, price_2nd: 0, price_3rd: 0, unit_price: 3600, unit_price_1st: 3600, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: '2026-03-10', purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 29, month_id: 3, category_id: 11, opening_qty: 8, closing_qty: 8, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'A4 Paper Ream', itemDescription: 'A4 Paper Ream', minimum_threshold: 3, purchase_1st_qty: 0, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 2, used_qty_2nd_week: 1, used_qty_3rd_week: 2, used_qty_4th_week: 1, used_qty_5th_week: 0, checked_week_1: true, checked_week_2: true, checked_week_3: true, checked_week_4: true, checked_week_5: false, price: 0, price_1st: 0, price_2nd: 0, price_3rd: 0, unit_price: 0, unit_price_1st: 0, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: null, purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 30, month_id: 3, category_id: 12, opening_qty: 9, closing_qty: 9, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Ballpoint Pens', itemDescription: 'Ballpoint Pens', minimum_threshold: 10, purchase_1st_qty: 0, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 2, used_qty_2nd_week: 2, used_qty_3rd_week: 1, used_qty_4th_week: 1, used_qty_5th_week: 1, checked_week_1: true, checked_week_2: true, checked_week_3: true, checked_week_4: true, checked_week_5: true, price: 0, price_1st: 0, price_2nd: 0, price_3rd: 0, unit_price: 0, unit_price_1st: 0, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: null, purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 31, month_id: 4, category_id: 2, opening_qty: 18, closing_qty: 14, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Premier Coffee Original 3 in 1', itemDescription: 'Premier Coffee Original 3 in 1', minimum_threshold: 10, purchase_1st_qty: 30, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 8, used_qty_2nd_week: 9, used_qty_3rd_week: 7, used_qty_4th_week: 10, used_qty_5th_week: 0, checked_week_1: true, checked_week_2: true, checked_week_3: true, checked_week_4: true, checked_week_5: false, price: 5300, price_1st: 5300, price_2nd: 0, price_3rd: 0, unit_price: 5300, unit_price_1st: 5300, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: '2026-04-05', purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 32, month_id: 4, category_id: 3, opening_qty: 0, closing_qty: 0, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Premier Coffee Expresso', itemDescription: 'Premier Coffee Expresso', minimum_threshold: 10, purchase_1st_qty: 0, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 0, used_qty_2nd_week: 0, used_qty_3rd_week: 0, used_qty_4th_week: 0, used_qty_5th_week: 0, checked_week_1: false, checked_week_2: false, checked_week_3: false, checked_week_4: false, checked_week_5: false, price: 0, price_1st: 0, price_2nd: 0, price_3rd: 0, unit_price: 0, unit_price_1st: 0, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: null, purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 33, month_id: 4, category_id: 4, opening_qty: 10, closing_qty: 9, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Premier Coffee 2 plus 1', itemDescription: 'Premier Coffee 2 plus 1', minimum_threshold: 3, purchase_1st_qty: 8, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 2, used_qty_2nd_week: 3, used_qty_3rd_week: 2, used_qty_4th_week: 2, used_qty_5th_week: 0, checked_week_1: true, checked_week_2: true, checked_week_3: true, checked_week_4: true, checked_week_5: false, price: 4600, price_1st: 4600, price_2nd: 0, price_3rd: 0, unit_price: 4600, unit_price_1st: 4600, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: '2026-04-08', purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 34, month_id: 4, category_id: 5, opening_qty: 10, closing_qty: 8, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Sugar', itemDescription: 'Sugar ( ဝမ်းဗိုက် )', minimum_threshold: 15, purchase_1st_qty: 10, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 3, used_qty_2nd_week: 2, used_qty_3rd_week: 3, used_qty_4th_week: 2, used_qty_5th_week: 0, checked_week_1: true, checked_week_2: true, checked_week_3: true, checked_week_4: true, checked_week_5: false, price: 3200, price_1st: 3200, price_2nd: 0, price_3rd: 0, unit_price: 3200, unit_price_1st: 3200, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: '2026-04-10', purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 35, month_id: 4, category_id: 6, opening_qty: 8, closing_qty: 7, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Dry Tea', itemDescription: 'Dry Tea', minimum_threshold: 5, purchase_1st_qty: 0, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 2, used_qty_2nd_week: 1, used_qty_3rd_week: 2, used_qty_4th_week: 1, used_qty_5th_week: 0, checked_week_1: true, checked_week_2: true, checked_week_3: true, checked_week_4: true, checked_week_5: false, price: 0, price_1st: 0, price_2nd: 0, price_3rd: 0, unit_price: 0, unit_price_1st: 0, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: null, purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 36, month_id: 4, category_id: 8, opening_qty: 10, closing_qty: 5, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Table Tissue (OK Happy Rose)', itemDescription: 'Table Tissue (OK Happy Rose)', minimum_threshold: 5, purchase_1st_qty: 15, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 4, used_qty_2nd_week: 3, used_qty_3rd_week: 5, used_qty_4th_week: 3, used_qty_5th_week: 0, checked_week_1: true, checked_week_2: true, checked_week_3: true, checked_week_4: true, checked_week_5: false, price: 2600, price_1st: 2600, price_2nd: 0, price_3rd: 0, unit_price: 2600, unit_price_1st: 2600, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: '2026-04-07', purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 37, month_id: 4, category_id: 9, opening_qty: 6, closing_qty: 5, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Table Tissue (Diva)', itemDescription: 'Table Tissue (Diva)', minimum_threshold: 5, purchase_1st_qty: 0, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 1, used_qty_2nd_week: 2, used_qty_3rd_week: 1, used_qty_4th_week: 1, used_qty_5th_week: 0, checked_week_1: true, checked_week_2: true, checked_week_3: true, checked_week_4: true, checked_week_5: false, price: 0, price_1st: 0, price_2nd: 0, price_3rd: 0, unit_price: 0, unit_price_1st: 0, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: null, purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 38, month_id: 4, category_id: 10, opening_qty: 5, closing_qty: 4, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Toilet Tissue (Snow White SP)', itemDescription: 'Toilet Tissue (Snow White SP)', minimum_threshold: 5, purchase_1st_qty: 8, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 2, used_qty_2nd_week: 1, used_qty_3rd_week: 2, used_qty_4th_week: 1, used_qty_5th_week: 0, checked_week_1: true, checked_week_2: true, checked_week_3: true, checked_week_4: true, checked_week_5: false, price: 3700, price_1st: 3700, price_2nd: 0, price_3rd: 0, unit_price: 3700, unit_price_1st: 3700, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: '2026-04-12', purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 39, month_id: 4, category_id: 11, opening_qty: 7, closing_qty: 7, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'A4 Paper Ream', itemDescription: 'A4 Paper Ream', minimum_threshold: 3, purchase_1st_qty: 0, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 1, used_qty_2nd_week: 1, used_qty_3rd_week: 1, used_qty_4th_week: 1, used_qty_5th_week: 0, checked_week_1: true, checked_week_2: true, checked_week_3: true, checked_week_4: true, checked_week_5: false, price: 0, price_1st: 0, price_2nd: 0, price_3rd: 0, unit_price: 0, unit_price_1st: 0, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: null, purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 40, month_id: 4, category_id: 12, opening_qty: 7, closing_qty: 6, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Ballpoint Pens', itemDescription: 'Ballpoint Pens', minimum_threshold: 10, purchase_1st_qty: 0, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 1, used_qty_2nd_week: 1, used_qty_3rd_week: 2, used_qty_4th_week: 1, used_qty_5th_week: 0, checked_week_1: true, checked_week_2: true, checked_week_3: true, checked_week_4: true, checked_week_5: false, price: 0, price_1st: 0, price_2nd: 0, price_3rd: 0, unit_price: 0, unit_price_1st: 0, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: null, purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 41, month_id: 5, category_id: 2, opening_qty: 14, closing_qty: 12, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Premier Coffee Original 3 in 1', itemDescription: 'Premier Coffee Original 3 in 1', minimum_threshold: 10, purchase_1st_qty: 32, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 7, used_qty_2nd_week: 8, used_qty_3rd_week: 6, used_qty_4th_week: 9, used_qty_5th_week: 4, checked_week_1: true, checked_week_2: true, checked_week_3: true, checked_week_4: true, checked_week_5: true, price: 5300, price_1st: 5300, price_2nd: 0, price_3rd: 0, unit_price: 5300, unit_price_1st: 5300, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: '2026-05-05', purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 42, month_id: 5, category_id: 3, opening_qty: 0, closing_qty: 0, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Premier Coffee Expresso', itemDescription: 'Premier Coffee Expresso', minimum_threshold: 10, purchase_1st_qty: 0, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 0, used_qty_2nd_week: 0, used_qty_3rd_week: 0, used_qty_4th_week: 0, used_qty_5th_week: 0, checked_week_1: false, checked_week_2: false, checked_week_3: false, checked_week_4: false, checked_week_5: false, price: 0, price_1st: 0, price_2nd: 0, price_3rd: 0, unit_price: 0, unit_price_1st: 0, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: null, purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 43, month_id: 5, category_id: 4, opening_qty: 9, closing_qty: 8, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Premier Coffee 2 plus 1', itemDescription: 'Premier Coffee 2 plus 1', minimum_threshold: 3, purchase_1st_qty: 8, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 2, used_qty_2nd_week: 2, used_qty_3rd_week: 3, used_qty_4th_week: 2, used_qty_5th_week: 0, checked_week_1: true, checked_week_2: true, checked_week_3: true, checked_week_4: true, checked_week_5: false, price: 4600, price_1st: 4600, price_2nd: 0, price_3rd: 0, unit_price: 4600, unit_price_1st: 4600, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: '2026-05-08', purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 44, month_id: 5, category_id: 5, opening_qty: 8, closing_qty: 8, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Sugar', itemDescription: 'Sugar ( ဝမ်းဗိုက် )', minimum_threshold: 15, purchase_1st_qty: 10, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 3, used_qty_2nd_week: 2, used_qty_3rd_week: 3, used_qty_4th_week: 2, used_qty_5th_week: 0, checked_week_1: true, checked_week_2: true, checked_week_3: true, checked_week_4: true, checked_week_5: false, price: 3200, price_1st: 3200, price_2nd: 0, price_3rd: 0, unit_price: 3200, unit_price_1st: 3200, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: '2026-05-10', purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 45, month_id: 5, category_id: 6, opening_qty: 7, closing_qty: 6, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Dry Tea', itemDescription: 'Dry Tea', minimum_threshold: 5, purchase_1st_qty: 0, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 2, used_qty_2nd_week: 1, used_qty_3rd_week: 2, used_qty_4th_week: 1, used_qty_5th_week: 0, checked_week_1: true, checked_week_2: true, checked_week_3: true, checked_week_4: true, checked_week_5: false, price: 0, price_1st: 0, price_2nd: 0, price_3rd: 0, unit_price: 0, unit_price_1st: 0, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: null, purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 46, month_id: 5, category_id: 8, opening_qty: 5, closing_qty: 6, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Table Tissue (OK Happy Rose)', itemDescription: 'Table Tissue (OK Happy Rose)', minimum_threshold: 5, purchase_1st_qty: 15, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 5, used_qty_2nd_week: 3, used_qty_3rd_week: 4, used_qty_4th_week: 2, used_qty_5th_week: 0, checked_week_1: true, checked_week_2: true, checked_week_3: true, checked_week_4: true, checked_week_5: false, price: 2600, price_1st: 2600, price_2nd: 0, price_3rd: 0, unit_price: 2600, unit_price_1st: 2600, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: '2026-05-06', purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 47, month_id: 5, category_id: 9, opening_qty: 5, closing_qty: 4, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Table Tissue (Diva)', itemDescription: 'Table Tissue (Diva)', minimum_threshold: 5, purchase_1st_qty: 0, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 2, used_qty_2nd_week: 2, used_qty_3rd_week: 1, used_qty_4th_week: 1, used_qty_5th_week: 0, checked_week_1: true, checked_week_2: true, checked_week_3: true, checked_week_4: true, checked_week_5: false, price: 0, price_1st: 0, price_2nd: 0, price_3rd: 0, unit_price: 0, unit_price_1st: 0, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: null, purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 48, month_id: 5, category_id: 10, opening_qty: 4, closing_qty: 5, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Toilet Tissue (Snow White SP)', itemDescription: 'Toilet Tissue (Snow White SP)', minimum_threshold: 5, purchase_1st_qty: 8, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 1, used_qty_2nd_week: 2, used_qty_3rd_week: 2, used_qty_4th_week: 1, used_qty_5th_week: 1, checked_week_1: true, checked_week_2: true, checked_week_3: true, checked_week_4: true, checked_week_5: true, price: 3700, price_1st: 3700, price_2nd: 0, price_3rd: 0, unit_price: 3700, unit_price_1st: 3700, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: '2026-05-12', purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 49, month_id: 5, category_id: 11, opening_qty: 7, closing_qty: 8, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'A4 Paper Ream', itemDescription: 'A4 Paper Ream', minimum_threshold: 3, purchase_1st_qty: 0, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 1, used_qty_2nd_week: 1, used_qty_3rd_week: 1, used_qty_4th_week: 1, used_qty_5th_week: 0, checked_week_1: true, checked_week_2: true, checked_week_3: true, checked_week_4: true, checked_week_5: false, price: 0, price_1st: 0, price_2nd: 0, price_3rd: 0, unit_price: 0, unit_price_1st: 0, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: null, purchase_date_2nd: null, purchase_date_3rd: null },
    { id: 50, month_id: 5, category_id: 12, opening_qty: 6, closing_qty: 7, created_by: 1, updated_by: null, created_at: now, updated_at: null, deleted_at: null, categoryName: 'Ballpoint Pens', itemDescription: 'Ballpoint Pens', minimum_threshold: 10, purchase_1st_qty: 0, purchase_2nd_qty: 0, purchase_3rd_qty: 0, used_qty_1st_week: 1, used_qty_2nd_week: 1, used_qty_3rd_week: 2, used_qty_4th_week: 1, used_qty_5th_week: 0, checked_week_1: true, checked_week_2: true, checked_week_3: true, checked_week_4: true, checked_week_5: false, price: 0, price_1st: 0, price_2nd: 0, price_3rd: 0, unit_price: 0, unit_price_1st: 0, unit_price_2nd: 0, unit_price_3rd: 0, discount_amount: 0, discount_amount_1st: 0, discount_amount_2nd: 0, discount_amount_3rd: 0, quantity_per_unit: 1, quantity_per_unit_1st: 1, quantity_per_unit_2nd: 0, quantity_per_unit_3rd: 0, purchase_date_1st: null, purchase_date_2nd: null, purchase_date_3rd: null },
  ],
  weeklyChecks: [],
  purchases: [
    { id: 1, monthly_stock_id: 1, category_id: 2, purchase_date: '2026-01-05', quantity: 32, purchase_price: 5000, discount_price: 5000, quantity_per_unit: 1, unit_price: 5000, discount_amount: 0, created_by: 1, updated_by: null, created_at: now, updated_at: null },
    { id: 2, monthly_stock_id: 3, category_id: 4, purchase_date: '2026-01-08', quantity: 10, purchase_price: 4500, discount_price: 4500, quantity_per_unit: 1, unit_price: 4500, discount_amount: 0, created_by: 1, updated_by: null, created_at: now, updated_at: null },
    { id: 3, monthly_stock_id: 6, category_id: 8, purchase_date: '2026-01-10', quantity: 15, purchase_price: 2500, discount_price: 2500, quantity_per_unit: 1, unit_price: 2500, discount_amount: 0, created_by: 1, updated_by: null, created_at: now, updated_at: null },
    { id: 4, monthly_stock_id: 7, category_id: 9, purchase_date: '2026-01-10', quantity: 10, purchase_price: 2200, discount_price: 2200, quantity_per_unit: 1, unit_price: 2200, discount_amount: 0, created_by: 1, updated_by: null, created_at: now, updated_at: null },
    { id: 5, monthly_stock_id: 8, category_id: 10, purchase_date: '2026-01-12', quantity: 8, purchase_price: 3500, discount_price: 3500, quantity_per_unit: 1, unit_price: 3500, discount_amount: 0, created_by: 1, updated_by: null, created_at: now, updated_at: null },
    { id: 6, monthly_stock_id: 9, category_id: 11, purchase_date: '2026-01-15', quantity: 5, purchase_price: 12000, discount_price: 12000, quantity_per_unit: 1, unit_price: 12000, discount_amount: 0, created_by: 1, updated_by: null, created_at: now, updated_at: null },
    { id: 7, monthly_stock_id: 10, category_id: 12, purchase_date: '2026-01-15', quantity: 6, purchase_price: 5000, discount_price: 5000, quantity_per_unit: 1, unit_price: 5000, discount_amount: 0, created_by: 1, updated_by: null, created_at: now, updated_at: null },
    { id: 8, monthly_stock_id: 11, category_id: 2, purchase_date: '2026-02-03', quantity: 25, purchase_price: 5200, discount_price: 5200, quantity_per_unit: 1, unit_price: 5200, discount_amount: 0, created_by: 1, updated_by: null, created_at: now, updated_at: null },
    { id: 9, monthly_stock_id: 11, category_id: 2, purchase_date: '2026-02-18', quantity: 15, purchase_price: 5200, discount_price: 5200, quantity_per_unit: 1, unit_price: 5200, discount_amount: 0, created_by: 1, updated_by: null, created_at: now, updated_at: null },
    { id: 10, monthly_stock_id: 13, category_id: 4, purchase_date: '2026-02-06', quantity: 8, purchase_price: 4500, discount_price: 4500, quantity_per_unit: 1, unit_price: 4500, discount_amount: 0, created_by: 1, updated_by: null, created_at: now, updated_at: null },
    { id: 11, monthly_stock_id: 14, category_id: 5, purchase_date: '2026-02-10', quantity: 12, purchase_price: 3100, discount_price: 3100, quantity_per_unit: 1, unit_price: 3100, discount_amount: 0, created_by: 1, updated_by: null, created_at: now, updated_at: null },
    { id: 12, monthly_stock_id: 16, category_id: 8, purchase_date: '2026-02-05', quantity: 12, purchase_price: 2500, discount_price: 2500, quantity_per_unit: 1, unit_price: 2500, discount_amount: 0, created_by: 1, updated_by: null, created_at: now, updated_at: null },
    { id: 13, monthly_stock_id: 16, category_id: 8, purchase_date: '2026-02-20', quantity: 8, purchase_price: 2600, discount_price: 2600, quantity_per_unit: 1, unit_price: 2600, discount_amount: 0, created_by: 1, updated_by: null, created_at: now, updated_at: null },
    { id: 14, monthly_stock_id: 18, category_id: 10, purchase_date: '2026-02-12', quantity: 6, purchase_price: 3600, discount_price: 3600, quantity_per_unit: 1, unit_price: 3600, discount_amount: 0, created_by: 1, updated_by: null, created_at: now, updated_at: null },
    { id: 15, monthly_stock_id: 21, category_id: 2, purchase_date: '2026-03-03', quantity: 35, purchase_price: 5200, discount_price: 5200, quantity_per_unit: 1, unit_price: 5200, discount_amount: 0, created_by: 1, updated_by: null, created_at: now, updated_at: null },
    { id: 16, monthly_stock_id: 21, category_id: 2, purchase_date: '2026-03-20', quantity: 10, purchase_price: 5300, discount_price: 5300, quantity_per_unit: 1, unit_price: 5300, discount_amount: 0, created_by: 1, updated_by: null, created_at: now, updated_at: null },
    { id: 17, monthly_stock_id: 23, category_id: 4, purchase_date: '2026-03-05', quantity: 10, purchase_price: 4600, discount_price: 4600, quantity_per_unit: 1, unit_price: 4600, discount_amount: 0, created_by: 1, updated_by: null, created_at: now, updated_at: null },
    { id: 18, monthly_stock_id: 24, category_id: 5, purchase_date: '2026-03-08', quantity: 8, purchase_price: 3200, discount_price: 3200, quantity_per_unit: 1, unit_price: 3200, discount_amount: 0, created_by: 1, updated_by: null, created_at: now, updated_at: null },
    { id: 19, monthly_stock_id: 24, category_id: 5, purchase_date: '2026-03-22', quantity: 5, purchase_price: 3200, discount_price: 3200, quantity_per_unit: 1, unit_price: 3200, discount_amount: 0, created_by: 1, updated_by: null, created_at: now, updated_at: null },
    { id: 20, monthly_stock_id: 26, category_id: 8, purchase_date: '2026-03-05', quantity: 18, purchase_price: 2600, discount_price: 2600, quantity_per_unit: 1, unit_price: 2600, discount_amount: 0, created_by: 1, updated_by: null, created_at: now, updated_at: null },
    { id: 21, monthly_stock_id: 26, category_id: 8, purchase_date: '2026-03-22', quantity: 12, purchase_price: 2600, discount_price: 2600, quantity_per_unit: 1, unit_price: 2600, discount_amount: 0, created_by: 1, updated_by: null, created_at: now, updated_at: null },
    { id: 22, monthly_stock_id: 28, category_id: 10, purchase_date: '2026-03-10', quantity: 10, purchase_price: 3600, discount_price: 3600, quantity_per_unit: 1, unit_price: 3600, discount_amount: 0, created_by: 1, updated_by: null, created_at: now, updated_at: null },
    { id: 23, monthly_stock_id: 31, category_id: 2, purchase_date: '2026-04-05', quantity: 30, purchase_price: 5300, discount_price: 5300, quantity_per_unit: 1, unit_price: 5300, discount_amount: 0, created_by: 1, updated_by: null, created_at: now, updated_at: null },
    { id: 24, monthly_stock_id: 33, category_id: 4, purchase_date: '2026-04-08', quantity: 8, purchase_price: 4600, discount_price: 4600, quantity_per_unit: 1, unit_price: 4600, discount_amount: 0, created_by: 1, updated_by: null, created_at: now, updated_at: null },
    { id: 25, monthly_stock_id: 34, category_id: 5, purchase_date: '2026-04-10', quantity: 10, purchase_price: 3200, discount_price: 3200, quantity_per_unit: 1, unit_price: 3200, discount_amount: 0, created_by: 1, updated_by: null, created_at: now, updated_at: null },
    { id: 26, monthly_stock_id: 36, category_id: 8, purchase_date: '2026-04-07', quantity: 15, purchase_price: 2600, discount_price: 2600, quantity_per_unit: 1, unit_price: 2600, discount_amount: 0, created_by: 1, updated_by: null, created_at: now, updated_at: null },
    { id: 27, monthly_stock_id: 38, category_id: 10, purchase_date: '2026-04-12', quantity: 8, purchase_price: 3700, discount_price: 3700, quantity_per_unit: 1, unit_price: 3700, discount_amount: 0, created_by: 1, updated_by: null, created_at: now, updated_at: null },
    { id: 28, monthly_stock_id: 41, category_id: 2, purchase_date: '2026-05-05', quantity: 32, purchase_price: 5300, discount_price: 5300, quantity_per_unit: 1, unit_price: 5300, discount_amount: 0, created_by: 1, updated_by: null, created_at: now, updated_at: null },
    { id: 29, monthly_stock_id: 43, category_id: 4, purchase_date: '2026-05-08', quantity: 8, purchase_price: 4600, discount_price: 4600, quantity_per_unit: 1, unit_price: 4600, discount_amount: 0, created_by: 1, updated_by: null, created_at: now, updated_at: null },
    { id: 30, monthly_stock_id: 44, category_id: 5, purchase_date: '2026-05-10', quantity: 10, purchase_price: 3200, discount_price: 3200, quantity_per_unit: 1, unit_price: 3200, discount_amount: 0, created_by: 1, updated_by: null, created_at: now, updated_at: null },
    { id: 31, monthly_stock_id: 46, category_id: 8, purchase_date: '2026-05-06', quantity: 15, purchase_price: 2600, discount_price: 2600, quantity_per_unit: 1, unit_price: 2600, discount_amount: 0, created_by: 1, updated_by: null, created_at: now, updated_at: null },
    { id: 32, monthly_stock_id: 48, category_id: 10, purchase_date: '2026-05-12', quantity: 8, purchase_price: 3700, discount_price: 3700, quantity_per_unit: 1, unit_price: 3700, discount_amount: 0, created_by: 1, updated_by: null, created_at: now, updated_at: null },
  ],
};

function getCurrentUserId(): number {
  return currentUser?.id ?? 1;
}

function nowStr(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

function clone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function mockLoginUser(email: string, password: string): { user: User } {
  const user = store.users.find(u => u.email === email && u.password === password && u.status === 'active' && u.deleted_at === null);
  if (!user) throw new Error('Invalid email or password');
  currentUser = { id: user.id, name: user.name, email: user.email };
  user.last_login = nowStr();
  return { user: clone(user) };
}

export function mockLogoutUser(): { message: string } {
  currentUser = null;
  return { message: 'Logged out successfully' };
}

export function mockGetMe(): User {
  if (!currentUser) throw new Error('Not authenticated');
  const user = store.users.find(u => u.id === currentUser!.id);
  if (!user || user.deleted_at) throw new Error('User not found');
  return clone(user);
}

export function mockChangePassword(currentPassword: string, newPassword: string): { message: string } {
  if (!currentUser) throw new Error('Not authenticated');
  const user = store.users.find(u => u.id === currentUser!.id);
  if (!user) throw new Error('User not found');
  if (user.password !== currentPassword) throw new Error('Current password is incorrect');
  user.password = newPassword;
  return { message: 'Password changed successfully' };
}

export function mockGetUsers(): User[] {
  return clone(store.users.filter(u => u.deleted_at === null));
}

export function mockCreateUser(data: { name: string; email: string; password: string; status: string }): { message: string } {
  if (store.users.find(u => u.email === data.email && u.deleted_at === null)) throw new Error('Email already exists');
  const id = nextId.users++;
  store.users.push({
    id, name: data.name, email: data.email, password: data.password,
    status: data.status as 'active' | 'inactive', last_login: null,
    created_at: nowStr(), updated_at: null, deleted_at: null,
  });
  return { message: 'User created successfully' };
}

export function mockUpdateUser(id: number, data: { name: string; email: string; status: string }): { message: string } {
  const user = store.users.find(u => u.id === id && u.deleted_at === null);
  if (!user) throw new Error('User not found');
  const existing = store.users.find(u => u.email === data.email && u.id !== id && u.deleted_at === null);
  if (existing) throw new Error('Email already exists');
  user.name = data.name;
  user.email = data.email;
  user.status = data.status as 'active' | 'inactive';
  user.updated_at = nowStr();
  return { message: 'User updated successfully' };
}

export function mockDeleteUser(id: number): { message: string } {
  const user = store.users.find(u => u.id === id);
  if (!user) throw new Error('User not found');
  user.deleted_at = nowStr();
  return { message: 'User deleted successfully' };
}

export function mockGetCategories(): Category[] {
  return clone(store.categories.filter(c => c.deleted_at === null));
}

export function mockCreateCategory(data: { name: string; parentId?: number | null; minimumThreshold?: number; remark?: string }): { message: string } {
  const id = nextId.categories++;
  store.categories.push({
    id, name: data.name, minimum_threshold: data.minimumThreshold ?? 0,
    remark: data.remark ?? null, parent_id: data.parentId ?? null,
    children: [], created_at: nowStr(), updated_at: null, deleted_at: null,
  });
  return { message: 'Category created successfully' };
}

export function mockUpdateCategory(id: number, data: { name: string; minimumThreshold?: number; remark?: string }): { message: string } {
  const cat = store.categories.find(c => c.id === id && c.deleted_at === null);
  if (!cat) throw new Error('Category not found');
  cat.name = data.name;
  if (data.minimumThreshold !== undefined) cat.minimum_threshold = data.minimumThreshold;
  cat.remark = data.remark ?? null;
  cat.updated_at = nowStr();
  return { message: 'Category updated successfully' };
}

export function mockDeleteCategory(id: number): { message: string } {
  const cat = store.categories.find(c => c.id === id);
  if (!cat) throw new Error('Category not found');
  const hasStock = store.stockData.some(s => s.category_id === id && s.deleted_at === null);
  const hasPurchases = store.purchases.some(p => p.category_id === id);
  if (hasStock) throw new Error('Cannot delete category with existing stock data');
  if (hasPurchases) throw new Error('Cannot delete category with existing purchases');
  const hasChildren = store.categories.some(c => c.parent_id === id && c.deleted_at === null);
  if (hasChildren) throw new Error('Cannot delete category with subcategories');
  cat.deleted_at = nowStr();
  return { message: 'Category deleted successfully' };
}

export function mockGetMonths(): Month[] {
  return clone(store.months);
}

export function mockCreateMonth(data: { month: number; year: number }): { message: string; id: number } {
  const exists = store.months.some(m => m.month === data.month && m.year === data.year);
  if (exists) throw new Error('Month already exists');
  const id = nextId.months++;
  store.months.push({ id, month: data.month, year: data.year, created_at: nowStr() });
  return { message: 'Month created successfully', id };
}

export function mockDeleteMonth(id: number): { message: string } {
  const idx = store.months.findIndex(m => m.id === id);
  if (idx === -1) throw new Error('Month not found');
  store.months.splice(idx, 1);
  store.stockData = store.stockData.filter(s => s.month_id !== id);
  store.weeklyChecks = store.weeklyChecks.filter(w => w.month_id !== id);
  store.purchases = store.purchases.filter(p => {
    const sd = store.stockData.find(s => s.id === p.monthly_stock_id);
    return sd !== undefined;
  });
  return { message: 'Month deleted successfully' };
}

export function mockGetProducts(year: number, month: number): (MonthlyStockData & Record<string, unknown>)[] {
  const monthRecord = store.months.find(m => m.year === year && m.month === month);
  if (!monthRecord) return [];
  const categoryMap = new Map(store.categories.filter(c => c.deleted_at === null).map(c => [c.id, c]));
  return clone(store.stockData.filter(s => s.month_id === monthRecord.id && s.deleted_at === null).map(s => {
    const cat = categoryMap.get(s.category_id as number);
    return {
      ...s,
      categoryName: cat?.name || '',
      minimum_threshold: cat?.minimum_threshold || 0,
      itemDescription: cat?.name || '',
    };
  }));
}

export function mockCreateProduct(data: Record<string, unknown>): { message: string } {
  const id = nextId.stockData++;
  const entry: Record<string, unknown> = {
    id, month_id: data.month_id, category_id: data.category_id,
    opening_qty: data.opening_qty ?? 0, closing_qty: data.closing_qty ?? 0,
    created_by: getCurrentUserId(), updated_by: null,
    created_at: nowStr(), updated_at: null, deleted_at: null,
    purchase_1st_qty: data.purchase_1st_qty ?? 0,
    purchase_2nd_qty: data.purchase_2nd_qty ?? 0,
    purchase_3rd_qty: data.purchase_3rd_qty ?? 0,
    used_qty_1st_week: data.used_qty_1st_week ?? 0,
    used_qty_2nd_week: data.used_qty_2nd_week ?? 0,
    used_qty_3rd_week: data.used_qty_3rd_week ?? 0,
    used_qty_4th_week: data.used_qty_4th_week ?? 0,
    used_qty_5th_week: data.used_qty_5th_week ?? 0,
    checked_week_1: data.checked_week_1 ?? false,
    checked_week_2: data.checked_week_2 ?? false,
    checked_week_3: data.checked_week_3 ?? false,
    checked_week_4: data.checked_week_4 ?? false,
    checked_week_5: data.checked_week_5 ?? false,
    price: data.price ?? 0,
    price_1st: data.price_1st ?? 0,
    price_2nd: data.price_2nd ?? 0,
    price_3rd: data.price_3rd ?? 0,
    unit_price: data.unit_price ?? 0,
    unit_price_1st: data.unit_price_1st ?? 0,
    unit_price_2nd: data.unit_price_2nd ?? 0,
    unit_price_3rd: data.unit_price_3rd ?? 0,
    discount_amount: data.discount_amount ?? 0,
    discount_amount_1st: data.discount_amount_1st ?? 0,
    discount_amount_2nd: data.discount_amount_2nd ?? 0,
    discount_amount_3rd: data.discount_amount_3rd ?? 0,
    quantity_per_unit: data.quantity_per_unit ?? 1,
    quantity_per_unit_1st: data.quantity_per_unit_1st ?? 1,
    quantity_per_unit_2nd: data.quantity_per_unit_2nd ?? 1,
    quantity_per_unit_3rd: data.quantity_per_unit_3rd ?? 1,
    purchase_date_1st: data.purchase_date_1st ?? null,
    purchase_date_2nd: data.purchase_date_2nd ?? null,
    purchase_date_3rd: data.purchase_date_3rd ?? null,
    categoryName: '', minimum_threshold: 0, itemDescription: '',
  };
  store.stockData.push(entry as unknown as MonthlyStockData & Record<string, unknown>);
  return { message: 'Product created successfully' };
}

export function mockUpdateProduct(id: number, data: Record<string, unknown>): { message: string } {
  const idx = store.stockData.findIndex(s => s.id === id && s.deleted_at === null);
  if (idx === -1) throw new Error('Product not found');
  const existing = store.stockData[idx];
  const fields = ['opening_qty', 'closing_qty', 'purchase_1st_qty', 'purchase_2nd_qty', 'purchase_3rd_qty',
    'used_qty_1st_week', 'used_qty_2nd_week', 'used_qty_3rd_week', 'used_qty_4th_week', 'used_qty_5th_week',
    'checked_week_1', 'checked_week_2', 'checked_week_3', 'checked_week_4', 'checked_week_5',
    'price', 'price_1st', 'price_2nd', 'price_3rd',
    'unit_price', 'unit_price_1st', 'unit_price_2nd', 'unit_price_3rd',
    'discount_amount', 'discount_amount_1st', 'discount_amount_2nd', 'discount_amount_3rd',
    'quantity_per_unit', 'quantity_per_unit_1st', 'quantity_per_unit_2nd', 'quantity_per_unit_3rd',
    'purchase_date_1st', 'purchase_date_2nd', 'purchase_date_3rd'];
  for (const key of fields) {
    if (data[key] !== undefined) {
      existing[key as keyof typeof existing] = data[key] as never;
    }
  }
  existing.updated_at = nowStr();
  existing.updated_by = getCurrentUserId();
  return { message: 'Product updated successfully' };
}

export function mockDeleteProduct(id: number): { message: string } {
  const entry = store.stockData.find(s => s.id === id);
  if (!entry) throw new Error('Product not found');
  entry.deleted_at = nowStr();
  return { message: 'Product deleted successfully' };
}

export function mockGetPurchases(): (Purchase & { categoryName?: string })[] {
  const categoryMap = new Map(store.categories.filter(c => c.deleted_at === null).map(c => [c.id, c.name]));
  return clone(store.purchases.map(p => ({
    ...p,
    categoryName: categoryMap.get(p.category_id as number) || '',
  })));
}

export function mockCreatePurchase(data: {
  category_id: number; purchase_date: string; quantity: number; unit_price: number; purchase_price: number;
  monthly_stock_id?: number | null;
  discount_price?: number; discount_amount?: number; quantity_per_unit?: number;
}): { message: string } {
  const id = nextId.purchases++;
  store.purchases.push({
    id, monthly_stock_id: data.monthly_stock_id ?? null,
    category_id: data.category_id, purchase_date: data.purchase_date,
    quantity: data.quantity, purchase_price: data.purchase_price,
    discount_price: data.discount_price ?? 0,
    quantity_per_unit: data.quantity_per_unit ?? 1,
    unit_price: data.unit_price, discount_amount: data.discount_amount ?? 0,
    created_by: getCurrentUserId(), updated_by: null,
    created_at: nowStr(), updated_at: null,
  } as unknown as Purchase & Record<string, unknown>);
  return { message: 'Purchase created successfully' };
}

export function mockUpdatePurchase(id: number, data: {
  category_id: number; purchase_date: string; quantity: number; unit_price: number; purchase_price: number;
  discount_price?: number; discount_amount?: number; quantity_per_unit?: number;
}): { message: string } {
  const purchase = store.purchases.find(p => p.id === id);
  if (!purchase) throw new Error('Purchase not found');
  purchase.category_id = data.category_id;
  purchase.purchase_date = data.purchase_date;
  purchase.quantity = data.quantity;
  purchase.unit_price = data.unit_price;
  purchase.purchase_price = data.purchase_price;
  if (data.discount_price !== undefined) purchase.discount_price = data.discount_price;
  if (data.discount_amount !== undefined) purchase.discount_amount = data.discount_amount;
  if (data.quantity_per_unit !== undefined) purchase.quantity_per_unit = data.quantity_per_unit;
  purchase.updated_at = nowStr();
  return { message: 'Purchase updated successfully' };
}

export function mockDeletePurchase(id: number): { message: string } {
  const idx = store.purchases.findIndex(p => p.id === id);
  if (idx === -1) throw new Error('Purchase not found');
  store.purchases.splice(idx, 1);
  return { message: 'Purchase deleted successfully' };
}

export function mockUpsertWeeklyCheck(data: {
  month_id: number; category_id: number;
  used_qty_1st_week?: number; used_qty_2nd_week?: number; used_qty_3rd_week?: number; used_qty_4th_week?: number; used_qty_5th_week?: number;
  checked_week_1?: boolean; checked_week_2?: boolean; checked_week_3?: boolean; checked_week_4?: boolean; checked_week_5?: boolean;
}): { message: string } {
  const existing = store.stockData.find(s =>
    s.month_id === data.month_id && s.category_id === data.category_id && s.deleted_at === null);
  if (existing) {
    if (data.used_qty_1st_week !== undefined) existing.used_qty_1st_week = data.used_qty_1st_week;
    if (data.used_qty_2nd_week !== undefined) existing.used_qty_2nd_week = data.used_qty_2nd_week;
    if (data.used_qty_3rd_week !== undefined) existing.used_qty_3rd_week = data.used_qty_3rd_week;
    if (data.used_qty_4th_week !== undefined) existing.used_qty_4th_week = data.used_qty_4th_week;
    if (data.used_qty_5th_week !== undefined) existing.used_qty_5th_week = data.used_qty_5th_week;
    if (data.checked_week_1 !== undefined) existing.checked_week_1 = data.checked_week_1;
    if (data.checked_week_2 !== undefined) existing.checked_week_2 = data.checked_week_2;
    if (data.checked_week_3 !== undefined) existing.checked_week_3 = data.checked_week_3;
    if (data.checked_week_4 !== undefined) existing.checked_week_4 = data.checked_week_4;
    if (data.checked_week_5 !== undefined) existing.checked_week_5 = data.checked_week_5;
    const totalPurchase = (existing.purchase_1st_qty as number ?? 0) + (existing.purchase_2nd_qty as number ?? 0) + (existing.purchase_3rd_qty as number ?? 0);
    const totalUsed = (existing.used_qty_1st_week as number ?? 0) + (existing.used_qty_2nd_week as number ?? 0) + (existing.used_qty_3rd_week as number ?? 0) + (existing.used_qty_4th_week as number ?? 0) + (existing.used_qty_5th_week as number ?? 0);
    existing.closing_qty = (existing.opening_qty as number ?? 0) + totalPurchase - totalUsed;
    existing.updated_at = nowStr();
  } else {
    const id = nextId.weeklyChecks++;
    store.weeklyChecks.push({
      id, month_id: data.month_id, category_id: data.category_id,
      used_qty_1st_week: data.used_qty_1st_week ?? 0,
      used_qty_2nd_week: data.used_qty_2nd_week ?? 0,
      used_qty_3rd_week: data.used_qty_3rd_week ?? 0,
      used_qty_4th_week: data.used_qty_4th_week ?? 0,
      used_qty_5th_week: data.used_qty_5th_week ?? 0,
      checked_week_1: data.checked_week_1 ?? false,
      checked_week_2: data.checked_week_2 ?? false,
      checked_week_3: data.checked_week_3 ?? false,
      checked_week_4: data.checked_week_4 ?? false,
      checked_week_5: data.checked_week_5 ?? false,
      created_by: getCurrentUserId(), updated_by: null,
      created_at: nowStr(), updated_at: null, deleted_at: null,
    } as WeeklyStockCheck & Record<string, unknown>);
  }
  return { message: 'Check saved successfully' };
}
