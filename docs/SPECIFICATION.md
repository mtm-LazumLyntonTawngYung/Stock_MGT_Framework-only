# Stock Management System - Development Specification

A comprehensive specification for building a stock management system from scratch.

## Overview

Build a web-based Stock Management System for tracking monthly inventory, purchases, and usage across product categories.

---

## Technical Requirements

### Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Next.js 16 (App Router), Tailwind CSS |
| Backend | Next.js 16 API Routes |
| Database | MySQL 8.0 |
| Authentication | JWT, bcryptjs |
| HTTP Client | Native fetch with cookie handling |
| Icons | lucide-react |

---

## Features & Functionality

### 1. Authentication

Create a secure login system with:

- **Login Page** (`/login`)
  - Email/password form
  - Show/hide password toggle
  - Remember me checkbox (UI only)
  - Forgot password link (placeholder)
  - Redirect to `/stock` on success

- **JWT Authentication**
  - Hash passwords with bcryptjs before storing
  - Sign JWT tokens with `JWT_SECRET` (7-day expiry)
  - Store token in HTTP-only cookie
  - Middleware to protect routes: `/stock/*`, `/categories/*`, `/users/*`, `/purchases/*`

### 2. Dashboard

**Route:** `/stock` (Dashboard)

- Display all years with months
- Each year shows:
  - Year number
  - Link to view months
  - Delete button (removes all months of that year)
- If no data, show empty state

### 3. Monthly Stock Management

**Route:** `/stock/[year]/[monthId]`

#### Read-Only Rule
- Only the **latest month** and its **immediate previous month** can be edited
- Other months display as read-only with message

#### Table Columns

| Column | Description |
|--------|-------------|
| Item Description | Product/category name |
| Price | Total price (sum of 3 purchases) - discount |
| Opening Qty | Starting quantity for the month |
| 1st/2nd/3rd Purchase Qty | Quantities purchased |
| Price (1st/2nd/3rd) | Price for each purchase slot |
| Total Purchase | Sum of all purchase quantities |
| Used Qty (Week 1-5) | Weekly usage amounts |
| Total Used | Sum of all weekly usage |
| Closing Qty | `opening + total_purchase - total_used` |
| Action | Edit/Delete buttons (when editable) |

#### Calculations

```
totalPurchase = purchase_1st_qty + purchase_2nd_qty + purchase_3rd_qty
totalUsed = used_qty_1st_week + used_qty_2nd_week + used_qty_3rd_week + used_qty_4th_week + used_qty_5th_week
closingQty = opening_qty + totalPurchase - totalUsed
unitPrice = (price - discount) / (quantity * quantityPerUnit)
```

#### Modal Form Fields

When adding/editing a product:

1. **Category** (dropdown) - Parent categories
2. **Sub Category** (dropdown) - Children of selected parent
3. **Opening Qty** (number)
4. **Purchase Information** (expandable, up to 3 purchases)
   - For each purchase:
     - Purchase Qty
     - Price
     - Quantity Per Unit
     - Unit Price (auto-calculated)
     - Discount Amount
     - Purchase Date
5. **Remark** (text)
6. **Save** / **Cancel** buttons

### 4. Weekly Stock Check

**Route:** `/stock/[year]/[monthId]/check`

- Form to enter weekly usage per category
- 5 week columns (week 1-5)
- Checkboxes to mark each week as completed
- Save updates weekly usage to database

### 5. Category Management

**Route:** `/categories`

- List all categories in a table
- Columns: Name, Minimum Threshold, Remark, Actions
- **Add Category** button opens modal
- Modal fields:
  - Name (required)
  - Parent Category (optional dropdown of root categories)
  - Minimum Threshold (number, default 0)
  - Remark (textarea)
- Edit/Delete actions per category

### 6. Purchase Records

**Route:** `/purchases`

- List all purchase transactions
- Columns: Date, Category, Quantity, Price, etc.
- **Add Purchase** button opens modal
- Modal fields:
  - Category
  - Sub Category (optional)
  - Purchase Date
  - Quantity
  - Unit Price
  - Discount Amount
  - Price fields (1st/2nd/3rd)
- Edit/Delete actions

### 7. User Management

**Route:** `/users`

- List all users
- Columns: Name, Email, Status, Last Login, Actions
- **Add User** button opens modal
- Modal fields:
  - Name
  - Email
  - Password
  - Status (active/inactive dropdown)
- Edit/Delete actions

---

## Database Schema

### users table

```sql
CREATE TABLE IF NOT EXISTS users (
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
```

### category table (self-referencing)

```sql
CREATE TABLE IF NOT EXISTS category (
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
```

### month table

```sql
CREATE TABLE IF NOT EXISTS month (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  month TINYINT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year SMALLINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_month_year (month, year)
);
```

### monthly_stock_data table

```sql
CREATE TABLE IF NOT EXISTS monthly_stock_data (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  month_id BIGINT NOT NULL,
  category_id BIGINT NOT NULL,
  opening_qty INT DEFAULT 0,
  closing_qty INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  created_by BIGINT null,
  updated_by BIGINT null,
  FOREIGN KEY (month_id) REFERENCES month(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE,
  UNIQUE KEY unique_monthly_category (month_id, category_id)
);
```

### weekly_stock_check table

```sql
CREATE TABLE IF NOT EXISTS weekly_stock_check (
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
  created_by BIGINT null,
  updated_by BIGINT null,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (month_id) REFERENCES month(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE
);
```

### purchases table

```sql
CREATE TABLE IF NOT EXISTS purchases (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  monthly_stock_id BIGINT NULL,
  category_id BIGINT NOT NULL,
  purchase_date DATE NOT NULL,
  quantity INT NOT NULL,
  purchase_price DECIMAL(10,2) DEFAULT 0.00,
  discount_price DECIMAL(10,2) DEFAULT 0.00,
  quantity_per_unit INT DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0.00,
  created_by BIGINT null,
  updated_by BIGINT null,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (monthly_stock_id) REFERENCES monthly_stock_data(id) ON DELETE SET NULL,
  FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE
);
```

---

## API Endpoints Required

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/login` | Authenticate user |
| POST | `/api/auth/logout` | Log out user |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/users` | Get all users |
| POST | `/api/users` | Create user |
| PUT | `/api/users/[id]` | Update user |
| DELETE | `/api/users/[id]` | Delete user |
| GET | `/api/categories` | Get all categories |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/[id]` | Update category |
| DELETE | `/api/categories/[id]` | Delete category |
| GET | `/api/months` | Get all months |
| POST | `/api/months` | Create month |
| DELETE | `/api/months/[id]` | Delete month |
| GET | `/api/products?year=X&month=Y` | Get monthly stock |
| POST | `/api/products` | Create stock record |
| PUT | `/api/products/[id]` | Update stock record |
| DELETE | `/api/products/[id]` | Delete stock record |
| GET | `/api/purchases` | Get all purchases |
| POST | `/api/purchases` | Create purchase |
| PUT | `/api/purchases/[id]` | Update purchase |
| DELETE | `/api/purchases/[id]` | Delete purchase |
| GET | `/api/weekly-check?month_id=X&category_id=Y` | Get weekly check |
| POST | `/api/weekly-check` | Upsert weekly check |

---

## UI Components

### Sidebar

- Collapsible (store state in localStorage)
- Navigation items:
  - Dashboard → `/stock`
  - Stock Mgt → `/stock/current`
  - Category Mgt → `/categories`
  - Purchases → `/purchases`
  - User Mgt → `/users`
  - Compare Stock → `/stock/compare`
- User profile at bottom
- Logout button

### ConfirmModal

- Reusable confirmation dialog
- Props: `open`, `title`, `message`, `confirmLabel`, `onConfirm`, `onCancel`

### Shared Utilities

- `fetchAPI<T>()` - Wrapper for fetch with credentials
- `calculateClosingQty()` - Calculate closing quantity
- `getEditableMonthIds()` - Determine which months are editable
- Navigation state management for back button behavior

---

## Folder Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── login/         # Login page
│   ├── stock/         # Stock pages
│   ├── categories/    # Category pages
│   ├── users/         # User pages
│   ├── purchases/     # Purchase pages
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Landing page
├── components/
│   ├── Sidebar.tsx
│   └── ConfirmModal.tsx
├── lib/
│   ├── db.ts          # MySQL pool
│   ├── types.ts       # TypeScript interfaces
│   ├── api.ts         # Client API functions
│   └── stock-utils.ts # Utility functions
└── data/
    └── defaultProducts.ts
```

---

## Styling Guidelines

- Use **Tailwind CSS** for styling
- Dark mode gradient backgrounds: `from-gray-900 to-blue-900`
- Modal backdrop blur: `backdrop-blur-lg`
- Status colors:
  - Active: green
  - Inactive: gray
  - Warning/alert: yellow
  - Error: red

---

## Development Phases

### Phase 1: Setup
- [ ] Initialize Next.js project
- [ ] Configure Tailwind CSS
- [ ] Set up MySQL connection
- [ ] Configure environment variables

### Phase 2: Authentication
- [ ] Create users table
- [ ] Implement login/register endpoints
- [ ] Create login page UI
- [ ] Add middleware protection

### Phase 3: Core Features
- [ ] Category management (CRUD)
- [ ] Month management
- [ ] Monthly stock data (CRUD)
- [ ] Purchase records (CRUD)

### Phase 4: Advanced Features
- [ ] Weekly stock check
- [ ] Read-only month logic
- [ ] Stock comparison
- [ ] Sidebar navigation

### Phase 5: Polish
- [ ] Responsive design
- [ ] Error handling
- [ ] Loading states
- [ ] Threshold warnings
