# Implementation Guide

**Type:** Tutorial — Learning-oriented, step-by-step guide to build the system from scratch.

---

## Overview

This document walks you through building the Stock Management System from an empty Next.js project to a fully working application. Follow each phase in order and run the verification test at the end of each phase before continuing.

**Estimated total time:** 5–7 days for a developer who knows React and TypeScript.

---

## Prerequisites

Before starting, ensure your development machine has:

| Requirement | Minimum Version | Check Command |
|-------------|----------------|---------------|
| Node.js | 18.x or 20.x | `node -v` |
| npm or yarn | any recent version | `npm -v` |
| MySQL | 8.0 or later | `mysql --version` |
| Git | any | `git --version` |
| A code editor | VS Code recommended | — |

You need access to a running MySQL instance. If your team provides a shared database host, get the credentials (host, port, user, password, database name) before starting.

---

## Phase 1: Project Setup

**Goal:** Get a blank Next.js project running with Tailwind CSS configured.

### Step 1.1: Create the Next.js project

```bash
npx create-next-app@latest stock-mgt --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
cd stock-mgt
```

When prompted, choose **Yes** for App Router, **Yes** for Tailwind CSS, **Yes** for `src/` directory, and **No** for custom import alias (use the default `@/*`).

### Step 1.2: Install dependencies

```bash
npm install bcryptjs jsonwebtoken mysql2 lucide-react sonner zod
npm install -D @types/bcryptjs @types/jsonwebtoken
```

### Step 1.3: Configure environment variables

Create `.env.local` in the project root (this file is git-ignored — never commit it):

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=stock_mgt
JWT_SECRET=change-this-to-a-random-secret-key-in-production
```

Create `DB_NAME` as an empty database in MySQL first:

```sql
CREATE DATABASE stock_mgt;
```

### Step 1.4: Configure database connection

Create `src/lib/db.ts`:

```typescript
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

export default pool;
```

The `dateStrings: true` option makes MySQL return date columns as strings instead of Date objects, which avoids timezone issues.

### Step 1.5: Verify the project runs

```bash
npm run dev
```

Open `http://localhost:3000` and confirm you see the Next.js welcome page.

### Phase 1 Verification

1. `http://localhost:3000` loads without errors in the browser.
2. No TypeScript or ESLint errors in the terminal output.
3. `.env.local` exists at the project root and is listed in `.gitignore`.

---

## Phase 2: Authentication

**Goal:** Build a working login system with JWT tokens, protected routes, and a user table.

### Step 2.1: Create the users table

Run this SQL against your `stock_mgt` database:

```sql
CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  status ENUM('active', 'inactive') DEFAULT 'active',
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

INSERT INTO users (name, email, password, status)
VALUES ('Admin User', 'admin@example.com', '$2a$10$rOjXqcJhZ7K8vE5zA1bB2eD3fG4hI5jK6lM7nO8pQ9rS0tU1vW2xX', 'active');
```

Generate a real bcrypt hash for `password`:

```bash
node -e "const bcrypt=require('bcryptjs'); console.log(bcrypt.hashSync('password', 10));"
```

Replace the hash in the INSERT statement above with the generated one.

### Step 2.2: Create shared utilities

Create `src/lib/validate.ts` — a generic request-body validator:

```typescript
import { NextResponse } from 'next/server';
import { z } from 'zod';

export function validateBody<T>(
  schema: z.ZodSchema<T>,
  body: unknown
): { data: T | null; errorResponse: NextResponse | null } {
  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      data: null,
      errorResponse: NextResponse.json(
        { error: result.error.errors[0]?.message || 'Validation failed' },
        { status: 400 }
      ),
    };
  }
  return { data: result.data, errorResponse: null };
}
```

Create `src/lib/auth-utils.ts` — helper to extract the user ID from a JWT cookie:

```typescript
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

interface JwtPayload {
  id: number;
  email: string;
}

export function getCurrentUserId(request: NextRequest): number | null {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as JwtPayload;
    return decoded.id;
  } catch {
    return null;
  }
}
```

### Step 2.3: Create the login API route

Create `src/app/api/auth/login/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { RowDataPacket } from 'mysql2';
import type { User } from '@/lib/types';
import { loginSchema } from '@/lib/schemas';
import { validateBody } from '@/lib/validate';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, errorResponse } = validateBody(loginSchema, body);
    if (errorResponse) return errorResponse;
    const { email, password } = data!;

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ? AND deleted_at IS NULL',
      [email]
    );

    const users = rows as User[];
    if (users.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = users[0];
    const isValid = await bcrypt.compare(password, user.password || '');
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, status: user.status }
    });
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60
    });
    return response;
  } catch {
    return NextResponse.json(
      { error: 'Login failed due to a server error.' }, { status: 500 }
    );
  }
}
```

Create `src/app/api/auth/me/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

interface JwtPayload { id: number; email: string; }

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as JwtPayload;
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, email, status FROM users WHERE id = ? AND deleted_at IS NULL',
      [decoded.id]
    );
    if (rows.length === 0) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const user = rows[0];
    return NextResponse.json({ id: user.id, name: user.name, email: user.email, status: user.status });
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
```

Create `src/app/api/auth/logout/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out successfully' });
  response.cookies.delete('auth-token');
  return response;
}
```

### Step 2.4: Create the schema definitions

Create `src/lib/schemas.ts`:

```typescript
import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address').min(1, 'Email is required');
export const passwordSchema = z.string().min(6, 'Password must be at least 6 characters').max(100);

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: emailSchema,
  password: passwordSchema,
  status: z.enum(['active', 'inactive']).default('active'),
});

export const userFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: emailSchema,
  password: z.string().min(6, 'Password must be at least 6 characters'),
  status: z.enum(['active', 'inactive']),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const changePasswordApiSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});
```

Create `src/lib/types.ts` with all TypeScript interfaces at the start of the file (User, Category, Month, MonthlyStockData, WeeklyStockCheck, Purchase).

### Step 2.5: Create the login page

Create `src/app/login/page.tsx`. Requirements:

- Email input + password input in a centered card
- Toggle to show/hide password (lucide-react `Eye` / `EyeOff`)
- "Remember me" checkbox (UI only, no persistence)
- "Forgot password?" link (placeholder, no functionality yet)
- Form submits to `/api/auth/login` using the `loginUser()` API helper
- On success, redirect to `/stock`
- On error, show the error message in red above the form
- Dark gradient background: `bg-gradient-to-br from-gray-900 to-blue-900`

### Step 2.6: Create the change-password-page component

Create `src/app/password/page.tsx` — a form with current password, new password, and confirm password fields. Calls `/api/auth/change-password`.

### Step 2.7: Create the middleware

Create `middleware.ts` at the project root:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const pathname = request.nextUrl.pathname;
  const protectedPaths = ['/stock', '/categories', '/users', '/purchases', '/password'];
  const isProtected = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtected && !token) return NextResponse.redirect(new URL('/login', request.url));
  if (isProtected && token) {
    try { jwt.verify(token, process.env.JWT_SECRET || 'default-secret'); }
    catch { return NextResponse.redirect(new URL('/login', request.url)); }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/stock/:path*', '/categories/:path*', '/users/:path*', '/purchases/:path*', '/password/:path*']
};
```

### Phase 2 Verification

1. Go to `http://localhost:3000` — you should be redirected to `/login`.
2. Log in with `admin@example.com` / `password` — you should be redirected to `/stock` (which will be a blank page until Phase 3).
3. Directly navigate to a protected path like `/categories` while logged out — you should be redirected to `/login`.
4. Open DevTools > Application > Cookies — `auth-token` should be present and marked `HttpOnly`.
5. Log out of the password change page — redirect back to `/login`.

---

## Phase 3: Core Features

**Goal:** Build the four main modules: Categories, Months, Monthly Stock (Products), and Purchases.

### Step 3.1: Create remaining database tables

Run this SQL to add the remaining tables:

```sql
CREATE TABLE category (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  minimum_threshold INT DEFAULT 0,
  remark TEXT,
  parent_id BIGINT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (parent_id) REFERENCES category(id) ON DELETE SET NULL
);

CREATE TABLE month (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  month TINYINT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year SMALLINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_month_year (month, year)
);

CREATE TABLE monthly_stock_data (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  month_id BIGINT NOT NULL,
  category_id BIGINT NOT NULL,
  opening_qty INT DEFAULT 0,
  closing_qty INT DEFAULT 0,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (month_id) REFERENCES month(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE,
  UNIQUE KEY unique_monthly_category (month_id, category_id)
);

CREATE TABLE purchases (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  monthly_stock_id BIGINT NULL,
  category_id BIGINT NOT NULL,
  purchase_date DATE NOT NULL,
  quantity INT NOT NULL,
  purchase_price DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  quantity_per_unit INT DEFAULT 1,
  discount_amount DECIMAL(10,2) DEFAULT 0.00,
  discount_price DECIMAL(10,2) DEFAULT 0.00,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (monthly_stock_id) REFERENCES monthly_stock_data(id) ON DELETE SET NULL,
  FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE
);

CREATE TABLE weekly_stock_check (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  month_id BIGINT NOT NULL,
  category_id BIGINT NOT NULL,
  used_qty_1st_week INT DEFAULT 0,
  used_qty_2nd_week INT DEFAULT 0,
  used_qty_3rd_week INT DEFAULT 0,
  used_qty_4th_week INT DEFAULT 0,
  used_qty_5th_week INT DEFAULT 0,
  checked_week_1 BOOLEAN DEFAULT FALSE,
  checked_week_2 BOOLEAN DEFAULT FALSE,
  checked_week_3 BOOLEAN DEFAULT FALSE,
  checked_week_4 BOOLEAN DEFAULT FALSE,
  checked_week_5 BOOLEAN DEFAULT FALSE,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (month_id) REFERENCES month(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE
);
```

### Step 3.2: Build the Category module

The Category module lets you define item types in a parent-child hierarchy (e.g. "Coffee" → "Premier Coffee 3-in-1").

**API routes to build:**

- `GET  /api/categories` — returns all non-deleted categories
- `POST /api/categories` — creates a new category (accepts `name`, `parentId`, `minimumThreshold`, `remark`)
- `PUT  /api/categories/[id]` — updates name, minimum_threshold, remark
- `DELETE /api/categories/[id]` — sets `deleted_at = NOW()` (soft delete)

**Schema fields for create-category requests:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | Yes | Max 100 chars |
| `parentId` | number \| null | No | Set for sub-categories |
| `minimumThreshold` | number | No | Defaults to 0 |
| `remark` | string | No | Max 500 chars |

**Page to build:** `src/app/categories/page.tsx`

Requirements:
- Sidebar with navigation (shared `Sidebar` component)
- Table listing all categories with columns: Name, Minimum Threshold, Remark, Actions (Edit / Delete)
- "Add Category" button that opens a modal
- Modal has: Name input, Parent Category dropdown (optional), Minimum Threshold number input, Remark textarea
- Edit and Delete buttons per row
- Delete uses `ConfirmModal` component
- Automatic toast notifications on success/error (use `sonner`)

### Step 3.3: Build the Month module

Months group stock records by calendar period. Creating a new month automatically copies the previous month's closing quantities as the new month's opening quantities.

**API routes to build:**

- `GET  /api/months` — returns all months ordered by year DESC, month DESC
- `POST /api/months` — creates a month and seeds opening quantities from the previous calendar month
- `DELETE /api/months/[id]` — soft-deletes a month (cascades to stock data via FK)

**Month creation logic (critical):**

When a new month is created, use a database transaction:
1. Insert the new row in `month`.
2. Find the previous calendar month (e.g. if creating June 2025, find May 2025).
3. If it exists, select all `category_id` + `closing_qty` from its `monthly_stock_data`.
4. INSERT those as `opening_qty` rows in the new month's `monthly_stock_data`.

**Utility to use:** `getPreviousCalendarMonth(month, year)` from `src/lib/stock-utils.ts`.

### Step 3.4: Create stock utilities

Create `src/lib/stock-utils.ts`:

```typescript
export function calculateClosingQty(row: {
  opening_qty: number;
  total_purchase_qty: number;
  used_qty_1st_week: number;
  used_qty_2nd_week: number;
  used_qty_3rd_week: number;
  used_qty_4th_week: number;
  used_qty_5th_week: number;
}): number {
  return (
    (row.opening_qty ?? 0) +
    (row.total_purchase_qty ?? 0) -
    (row.used_qty_1st_week ?? 0) -
    (row.used_qty_2nd_week ?? 0) -
    (row.used_qty_3rd_week ?? 0) -
    (row.used_qty_4th_week ?? 0) -
    (row.used_qty_5th_week ?? 0)
  );
}

export function getPreviousCalendarMonth(month: number, year: number): { month: number; year: number } {
  if (month === 1) return { month: 12, year: year - 1 };
  return { month: month - 1, year };
}

export function getEditableMonthIds(months: { id: number; month: number; year: number }[]): Set<number> {
  if (months.length === 0) return new Set();
  const sorted = [...months].sort((a, b) => a.year !== b.year ? b.year - a.year : b.month - a.month);
  const latest = sorted[0];
  const prev = getPreviousCalendarMonth(latest.month, latest.year);
  const prevRecord = months.find(m => m.month === prev.month && m.year === prev.year);
  const ids = new Set<number>([latest.id]);
  if (prevRecord) ids.add(prevRecord.id);
  return ids;
}

export function isMonthEditable(monthId: number, months: { id: number; month: number; year: number }[]): boolean {
  return getEditableMonthIds(months).has(monthId);
}

export function isMonthAddable(monthId: number, months: { id: number; month: number; year: number }[]): boolean {
  if (months.length === 0) return false;
  const sorted = [...months].sort((a, b) => a.year !== b.year ? b.year - a.year : b.month - a.month);
  return sorted[0].id === monthId;
}

export function formatDateForDb(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  const trimmed = dateStr.split('T')[0];
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null;
}

export const MONTH_READ_ONLY_MESSAGE = 'Only the latest month and its previous month can be edited.';
```

Create `src/lib/month-edit-server.ts` (used by API routes to enforce read-only rules server-side):

```typescript
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { isMonthEditable, isMonthAddable } from './stock-utils';

export async function requireMonthEditable(monthId: number): Promise<NextResponse | null> {
  const [rows] = await pool.query('SELECT id, month, year FROM month');
  const months = rows as { id: number; month: number; year: number }[];
  if (!isMonthEditable(monthId, months)) {
    return NextResponse.json({ error: 'This month is read-only' }, { status: 403 });
  }
  return null;
}

export async function requireMonthAddable(monthId: number): Promise<NextResponse | null> {
  const [rows] = await pool.query('SELECT id, month, year FROM month');
  const months = rows as { id: number; month: number; year: number }[];
  if (!isMonthAddable(monthId, months)) {
    return NextResponse.json({ error: 'Cannot add products to this month' }, { status: 403 });
  }
  return null;
}
```

### Step 3.5: Build the Products (Monthly Stock) module

This is the central data entry screen. Each row in the `monthly_stock_data` table represents one category's stock for one month.

**API routes to build:**

- `GET  /api/products?year=X&month=Y` — complex query joining `monthly_stock_data`, `weekly_stock_check`, `purchases` (pivoted via ROW_NUMBER), and `category` tables. See SPECIFICATION for the exact SQL.
- `POST /api/products` — insert into `monthly_stock_data`, then insert up to 3 rows into `purchases`
- `PUT  /api/products/[id]` — update `monthly_stock_data` and handle purchase upserts
- `DELETE /api/products/[id]` — soft-delete a stock record

**Key calculations for the product form:**

```
totalPurchase  = purchaseQty1st + purchaseQty2nd + purchaseQty3rd
totalUsed      = usedQty1stWeek + … + usedQty5thWeek
closingQty     = openingQty + totalPurchase - totalUsed
unitPrice      = (price - discount) / (quantity * quantityPerUnit)
```

**Page to build:** `src/app/stock/[year]/[monthId]/page.tsx`

Requirements:
- Read-only protection: only the latest month and its immediate previous month can be edited; other months show a warning message
- Data table with columns: Item Description, Price, Opening Qty, 1st/2nd/3rd Purchase Qty, 1st/2nd Price, Total Purchase, Used Qty (Week 1–5), Total Used, Closing Qty, Remark, Actions
- "Add Product" button (only visible on the addable month)
- Modal form with: Category dropdown, Sub Category dropdown, Opening Qty, expandable purchase section (3 purchases), Remark, Save/Cancel
- Auto-calculate unit price when quantity/price changes
- Delete uses `ConfirmModal`

### Step 3.6: Build the Purchases module

**API routes:**

- `GET  /api/purchases` — all non-deleted purchases
- `POST /api/purchases` — insert a new purchase
- `PUT  /api/purchases/[id]` — update
- `DELETE /api/purchases/[id]` — soft-delete

**Purchase schema:**

| Field | Type | Required |
|-------|------|----------|
| `category_id` | number | Yes |
| `purchase_date` | string (YYYY-MM-DD) | Yes |
| `quantity` | number | Yes (> 0) |
| `unit_price` | number | Yes |
| `purchase_price` | number | Yes |
| `discount_price` | number | No |
| `discount_amount` | number | No |
| `quantity_per_unit` | number | Yes (> 0) |
| `monthly_stock_id` | number | No |

### Phase 3 Verification

1. Navigate to `/categories` — you can create a root category, a sub-category, edit, and delete.
2. Navigate to `/stock` — you see the Dashboard (empty initially).
3. Create a month using the Dashboard — new empty stock rows are automatically created for all categories with `opening_qty = 0`.
4. Click into the month — you see the stock table. Click "Add Product", fill in the form, save — the row appears in the table.
5. The closing quantity auto-calculates correctly when you change opening, purchase, or used quantities.
6. Navigate to `/purchases` — the purchase you just created appears in the list.

---

## Phase 4: Advanced Features

**Goal:** Add weekly stock checks, sidebar navigation, read-only enforcement, and the compare view.

### Step 4.1: Build the Weekly Stock Check

This screen lets users enter weekly consumption amounts per category for a given month.

**API routes:**

- `GET  /api/weekly-check?month_id=X&category_id=Y` — returns the weekly check record (or null)
- `POST /api/weekly-check` — upsert (INSERT … ON DUPLICATE KEY UPDATE)

**Table columns on the page:**

5 week columns (Week 1 through Week 5), each with:
- A number input for `used_qty`
- A checkbox for `checked` status

**Page:** `src/app/stock/[year]/[monthId]/check/page.tsx`

### Step 4.2: Build the Dashboard

**Page:** `src/app/stock/page.tsx`

- Display all `month` records grouped by year
- Each year section shows a link to view its months and a Delete button for the whole year
- If no month data exists, show an empty-state message with a "Create First Month" call to action

### Step 4.3: Create the month-by-year pages

**Page:** `src/app/stock/[year]/page.tsx`

- List all months for a given year
- Month cards linking to `[monthId]`

### Step 4.4: Build the current stock page

**Page:** `src/app/stock/current/page.tsx`

- Redirects to the latest month's stock page automatically.

### Step 4.5: Build the compare stock page

**Page:** `src/app/stock/compare/page.tsx`

- Side-by-side or tabular comparison of closing quantities between two selected months.
- Use the `Product` interface from `src/data/defaultProducts.ts` as a reference shape.

### Step 4.6: Build the Sidebar component

Create `src/components/Sidebar.tsx`:

- Fixed left sidebar, collapsible (store state in localStorage under key `sidebarCollapsed`)
- Navigation items: Dashboard (`/stock`), Stock Mgt (`/stock/current`), Category Mgt (`/categories`), Purchases (`/purchases`), Compare Stock (`/stock/compare`), User Mgt (`/users`)
- User profile section at the bottom showing name and email from `/api/auth/me`
- Change Password link → `/password`
- Logout button calling `/api/auth/logout`
- Uses `lucide-react` icons: `LayoutDashboard`, `Package`, `Tag`, `ShoppingBag`, `GitCompare`, `Users`, `LogOut`, `UserCircle`, `KeyRound`, `ChevronLeft`, `ChevronRight`

### Phase 4 Verification

1. Log out and back in — the sidebar renders with your name and email.
2. Collapse and expand the sidebar — state persists after page reload (check localStorage).
3. Click each nav item — you navigate to the correct page.
4. On a read-only month page, the warning message `MONTH_READ_ONLY_MESSAGE` is displayed and Add/Edit/Delete buttons are hidden.
5. Weekly check page loads for a month and allows entering used quantities.

---

## Phase 5: Polish

**Goal:** Match the visual design quality of the reference screenshot, add error handling, and prepare for deployment.

### Step 5.1: Match the styling guidelines

Apply these Tailwind patterns consistently across all pages:

| Element | Tailwind Classes |
|---------|-----------------|
| Page background | `min-h-screen bg-gray-50` |
| Card / panel | `bg-white rounded-xl shadow-sm border border-gray-200` |
| Primary button | `bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700` |
| Danger button | `bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700` |
| Input field | `border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500` |
| Table header | `bg-gray-50 text-gray-600 text-xs font-semibold uppercase tracking-wider` |
| Toast (sonner) | Already configured in root layout |

Dark gradient for login page:
```
bg-gradient-to-br from-gray-900 to-blue-900 min-h-screen flex items-center justify-center
```

Modal backdrop blur:
```
fixed inset-0 bg-slate-900/40 backdrop-blur-sm
```

### Step 5.2: Add loading and error states

Every data-fetching page needs:
- A loading spinner or skeleton while data is loading
- An error state with a retry button if the API call fails
- An empty state if the result set is empty

Use React `useState` + `useEffect` for client-side page data fetching, or `async/await` in server components for server-side fetching.

### Step 5.3: Add threshold warnings

Where stock quantities are displayed, compare `opening_qty` against `category.minimum_threshold`. If `opening_qty < minimum_threshold`, display a yellow/amber warning badge.

### Step 5.4: Add the change-password API

Create `src/app/api/auth/change-password/route.ts` using `changePasswordApiSchema` from schemas:
1. Get user ID from JWT via `getCurrentUserId`.
2. Fetch the user to verify `currentPassword` with bcrypt.
3. Hash `newPassword` and save.

### Step 5.5: Final cross-browser check

| Check | Pass criteria |
|-------|---------------|
| Chrome | UI renders correctly, no console errors |
| Edge | Same as Chrome |
| Mobile (375px) | Sidebar collapses, table scrolls horizontally if needed |
| Network throttling (Slow 3G) | Loading spinners appear, no blank screens |

### Phase 5 Verification

Run the full scenario end-to-end:

1. Log in → navigate to every page via the sidebar.
2. Create a category with a parent-subcategory link — both appear in dropdowns.
3. Create a month → verify opening quantities are seeded.
4. Add 3 products per category → verify closing quantities are correct.
5. Enter weekly usage → save and reload → values persist.
6. Delete a product → confirm it disappears from the table.
7. Create a second month → verify the older month is now read-only.
8. Change your password → log out → log in with new password.

---

## Common Issues and Troubleshooting

| Problem | Likely cause | Fix |
|---------|-------------|-----|
| `ER_NO_SUCH_TABLE` | Table not created | Run the SQL CREATE statements against the correct database |
| `JWT malformed` | `JWT_SECRET` not set | Add `JWT_SECRET` to `.env.local` |
| `Cannot read property 'id' of undefined` | API returned error but code didn't check `res.ok` | Always check `res.ok` before parsing JSON in `fetchAPI` |
| `mysql2` connection timeout | Wrong `DB_HOST` or MySQL not running | Check `DB_HOST`, `DB_USER`, `DB_PASSWORD` in `.env.local` |
| Images/icons not showing | `lucide-react` import wrong | Import icons as named imports: `import { IconName } from 'lucide-react'` |
| Soft-delete rows still appear | Query missing `deleted_at IS NULL` filter | Check your SQL WHERE clauses |
