# Types and Schemas Reference

> **Audience:** Frontend and backend developers working with data shapes, form validation, and date formats.

---

## TypeScript Interfaces

All interfaces live in `src/lib/types.ts`.

### `User`

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;      // bcrypt hash — never send to client
  status: 'active' | 'inactive';
  last_login?: string | null;
  created_at: string;
  updated_at?: string | null;
  deleted_at?: string | null;
}
```

### `Category`

```typescript
interface Category {
  id: number;
  name: string;
  minimum_threshold: number;     // used as stock warning threshold
  remark?: string | null;
  parent_id?: number | null;     // null = root category
  children?: Category[];         // used for nested tree rendering
  created_at: string;
  updated_at?: string | null;
  deleted_at?: string | null;
}
```

### `Month`

```typescript
interface Month {
  id: number;
  month: number;       // 1–12
  year: number;        // e.g. 2025
  created_at: string;
}
```

### `MonthlyStockData`

```typescript
interface MonthlyStockData {
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
  // Additional JOINed fields from API response:
  itemDescription?: string;
  categoryName?: string;
}
```

### `WeeklyStockCheck`

```typescript
interface WeeklyStockCheck {
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
```

### `Purchase`

```typescript
interface Purchase {
  id: number;
  monthly_stock_id?: number | null;
  category_id: number;
  purchase_date: string;        // "YYYY-MM-DD"
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
  categoryName?: string;        // JOINed field
}
```

---

## Frontend Product Shape (`Product`)

Defined in `src/data/defaultProducts.ts`, this is the client-side shape used by the product table and form.

```typescript
interface Product {
  id: string;                  // string (not number) for React key compatibility
  categoryId: string;
  categoryName: string;
  itemDescription: string;
  quantityPerUnit: number;
  unitPrice: number;
  discountAmount: number;
  price: number;
  price_1st: number;
  price_2nd: number;
  price_3rd: number;
  openingQty: number;
  closingQty: number;
  purchaseQty1st: number;
  purchaseQty2nd: number;
  purchaseQty3rd: number;
  usedQty1stWeek: number;
  usedQty2ndWeek: number;
  usedQty3rdWeek: number;
  usedQty4thWeek: number;
  usedQty5thWeek: number;
  minimumThreshold?: number;
  checkedWeek1?: boolean;
  checkedWeek2?: boolean;
  checkedWeek3?: boolean;
  checkedWeek4?: boolean;
  checkedWeek5?: boolean;
  // Optional per-purchase overrides:
  quantityPerUnit1st?: number;
  unitPrice1st?: number;
  discountAmount1st?: number;
  purchaseDate1st?: string;
  // … [2nd, 3rd] variants
}
```

Conversion between `MonthlyStockData` and `Product` happens in `mapProductFromAPI` and `mapProductToAPI` in `src/lib/api.ts`.

---

## Zod Validation Schemas

All schemas live in `src/lib/schemas.ts`.

### `loginSchema`

```typescript
{ email: string (email), password: string (required) }
```

### `createCategorySchema`

```typescript
{
  name: string (1–100 chars, required),
  parentId: number | null (optional),
  minimumThreshold: number >= 0 (optional),
  remark: string (max 500, optional)
}
```

### `updateCategorySchema`

Same as create, but `parentId` is not allowed (parent cannot be changed after creation).

### `createMonthSchema`

```typescript
{
  month: integer 1–12 (required),
  year: integer 2000–2100 (required)
}
```

### `purchaseInfoSchema` (shared sub-schema)

```typescript
{
  purchaseQty: number >= 0,
  quantityPerUnit: number >= 0,
  unitPrice: number >= 0,
  discountAmount: number >= 0,
  purchasePrice: number >= 0,
  discountPrice?: number >= 0,
  purchaseDate: string (YYYY-MM-DD) | ''
}
```

### `createProductSchema`

Combines all stock fields plus 3 purchase info groups (1st, 2nd, 3rd). Key constraint enforced by `.superRefine`:

> If `purchaseQtyX > 0` then `priceX > 0` must be true, and vice versa.

### `createPurchaseSchema`

```typescript
{
  category_id: positive integer (required),
  purchase_date: string matching /^\d{4}-\d{2}-\d{2}$/ (required),
  quantity: positive number (required),
  unit_price: number >= 0,
  purchase_price: number >= 0,
  discount_price?: number >= 0,
  discount_amount: number >= 0 (optional),
  quantity_per_unit: positive number (optional),
  monthly_stock_id?: positive integer | null
}
```

### `weeklyCheckFormSchema` / `weeklyCheckSchema`

```typescript
{
  month_id: positive integer,
  category_id: positive integer,
  used_qty_1st_week–used_qty_5th_week: number (default 0),
  checked_week_1–checked_week_5: boolean
}
```

### `createUserSchema`

```typescript
{
  name: string (1–100, required),
  email: string (valid email, required),
  password: string (min 6, required),
  status: 'active' | 'inactive' (default 'active')
}
```

### `changePasswordSchema` (client) / `changePasswordApiSchema` (server)

Client version includes `confirmPassword` and a `.refine` to ensure `newPassword === confirmPassword`. The API version only accepts `currentPassword` and `newPassword`.

### `userFormSchema`

Same as `createUserSchema` but used for edit forms (password optional for updates — see `updateUserSchema` in code which omits `password`).

---

## Date Format Rules

All dates entering or leaving the API use `YYYY-MM-DD` strings.

| Source | Format | Example |
|--------|--------|---------|
| Browser → API (purchase date) | `YYYY-MM-DD` | `'2025-06-01'` |
| SQL DATE columns returned by mysql2 with `dateStrings: true` | `'YYYY-MM-DD HH:MM:SS'` | `'2025-06-01 00:00:00'` |
| Formatter in `mapProductFromAPI` | strips time part | `'2025-06-01'` |

The `formatDateForDb()` utility in `stock-utils.ts` normalizes input dates and returns `null` if invalid.

---

## Utility Functions Summary

| Function | File | Purpose |
|----------|------|---------|
| `calculateClosingQty(row)` | `stock-utils.ts` | `opening + totalPurchase - totalUsed` |
| `getPreviousCalendarMonth(m, y)` | `stock-utils.ts` | Returns `{ month, year }` for the prior calendar month |
| `getNextCalendarMonth(m, y)` | `stock-utils.ts` | Returns `{ month, year }` for the next calendar month |
| `getEditableMonthIds(months)` | `stock-utils.ts` | Set of the 2 most recent month IDs |
| `isMonthEditable(id, months)` | `stock-utils.ts` | Boolean — is this month in the editable set? |
| `isMonthAddable(id, months)` | `stock-utils.ts` | Boolean — is this the single latest month? |
| `formatDateForDb(str)` | `stock-utils.ts` | Normalizes to `YYYY-MM-DD` or `null` |
| `mapProductFromAPI(item)` | `api.ts` | Converts DB row → `Product` for the UI |
| `mapProductToAPI(product, monthId, catId)` | `api.ts` | Converts `Product` → DB-ready payload |
| `mapCategoryFromAPI(item)` | `api.ts` | Converts DB `Category` → `FlatCategory` |
| `mapUserFromAPI(item)` | `api.ts` | Converts DB `User` → `FlatUser` |
| `getCurrentUserId(request)` | `auth-utils.ts` | Extracts user ID from JWT cookie |
