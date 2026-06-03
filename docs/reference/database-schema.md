# Database Schema Reference

> **Audience:** Developers who need to understand or modify the database structure.

---

## Overview

The database has 6 tables organized around a central `category` entity. All tables use soft deletion (`deleted_at`), an "editable" flag (`is_active`), and standard audit timestamps (`created_at`, `updated_at`).

```
users ──────┐
            │
category ───┼──→ monthly_stock_data ─┐
            │                          │
            └──→ purchases ────────────┘
                       │
            month ←───┘
                       │
             weekly_stock_check
```

---

## Entity Relationship Diagram

```
┌──────────┐       ┌───────────────────┐       ┌──────────────────────┐
│  users   │       │      month        │       │   weekly_stock_check │
├──────────┤       ├───────────────────┤       ├──────────────────────┤
│ id (PK)  │       │ id (PK)           │       │ id (PK)              │
│ name     │       │ month  (1-12)     │       │ month_id   (FK→month)│
│ email    │       │ year              │       │ category_id(FK→cat)  │
│ password │       │ created_at        │       │ used_qty_1st..5th    │
│ status   │       │ UNIQUE(month,year)│       │ checked_week_1..5    │
│ ...      │       └───────────────────┘       │ is_active            │
└──────────┘                                      │ created_at           │
                                                  │ updated_at           │
                                                  │ deleted_at           │
                                                  └──────────────────────┘
         │
         │ 1:N (parent→child)
         ▼
┌─────────────────┐       ┌──────────────────────┐       ┌──────────────────┐
│    category     │       │  monthly_stock_data  │       │    purchases     │
├─────────────────┤       ├──────────────────────┤       ├──────────────────┤
│ id (PK)         │       │ id (PK)              │       │ id (PK)          │
│ name            │       │ month_id   (FK→month)│       │ monthly_stock_id │
│ parent_id (FK→  │       │ category_id(FK→cat)  │       │   (FK→mthly_stk) │
│   category.id)  │       │ opening_qty          │       │ category_id (FK) │
│ minimum_thresh. │       │ closing_qty          │       │ purchase_date    │
│ remark          │       │ purchase_1st_qty     │       │ quantity         │
│ created_at      │       │ purchase_2nd_qty     │       │ unit_price       │
│ updated_at      │       │ purchase_3nd_qty     │       │ discount_amount  │
│ deleted_at      │       │ is_active            │       │ total_amount(GEN)│
└─────────────────┘       │ created_by (FK→users)│       │ price_1st/2nd/3rd│
                          │ updated_by (FK→users)│       │ quantity_per_unit│
                          │ UNIQUE(month_id,      │       │ quantity_per_unit│
                          │   category_id)        │       │ created_at       │
                          └──────────────────────┘       │ updated_at       │
                                                          └──────────────────┘
```

---

## Table Reference

### `users`

Stores login account information.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Internal identifier |
| `name` | VARCHAR(255) | NOT NULL | Full name for display |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Used as login username |
| `password` | VARCHAR(255) | NOT NULL | bcrypt hash (never plaintext) |
| `status` | ENUM('active','inactive') | DEFAULT 'active' | Controls account access |
| `last_login` | TIMESTAMP | NULLABLE | Updated on each successful login |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| `updated_at` | TIMESTAMP | NULL, auto-updated | On UPDATE trigger |
| `deleted_at` | TIMESTAMP | NULLABLE | Soft delete marker |

**Indexes:** `email` (implicit unique index).

---

### `category`

Represents item types organized in a parent-child hierarchy.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | |
| `name` | VARCHAR(255) | NOT NULL | E.g. "Premier Coffee 3-in-1" |
| `minimum_threshold` | INT | DEFAULT 0 | Warning threshold in stock view |
| `remark` | TEXT | NULLABLE | Optional description |
| `parent_id` | BIGINT | NULLABLE, FK → category(id) ON DELETE SET NULL | NULL = root category |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| `updated_at` | TIMESTAMP | NULL, auto-updated | |
| `deleted_at` | TIMESTAMP | NULLABLE | Soft delete marker |

**Indexes:** `parent_id`.

**Self-referencing relationship:** `parent_id` can reference another row in the same table. SET NULL means deleting a parent does not delete children — they become root categories.

---

### `month`

Represents a calendar month in the system.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | |
| `month` | TINYINT | NOT NULL, CHECK (1–12) | Calendar month number |
| `year` | SMALLINT | NOT NULL | 4-digit year |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

**Indexes:** `UNIQUE(month, year)` — prevents duplicate month entries (`CREATE UNIQUE KEY unique_month_year (month, year)`).

---

### `monthly_stock_data`

Core table. One row per category per month containing all stock figures.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | |
| `month_id` | BIGINT | NOT NULL, FK → month(id) ON DELETE CASCADE | The month this row belongs to |
| `category_id` | BIGINT | NOT NULL, FK → category(id) ON DELETE CASCADE | Which product category |
| `opening_qty` | INT | DEFAULT 0 | Starting quantity at month start |
| `closing_qty` | INT | DEFAULT 0 | Calculated; also stored here |
| `purchase_1st_qty` | INT | DEFAULT 0 | Quantity from first purchase |
| `purchase_2nd_qty` | INT | DEFAULT 0 | Quantity from second purchase |
| `purchase_3rd_qty` | INT | DEFAULT 0 | Quantity from third purchase |
| `is_active` | BOOLEAN | DEFAULT TRUE | |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| `updated_at` | TIMESTAMP | NULL, auto-updated | |
| `deleted_at` | TIMESTAMP | NULLABLE | Soft delete |

**Indexes:** `UNIQUE(month_id, category_id)` — there must be exactly one stock record per category per month.

**ON DELETE CASCADE on `month_id`:** When a month is deleted (soft-delete: `deleted_at` is set), the `monthly_stock_data` rows for that month are also soft-deleted via application logic.

---

### `weekly_stock_check`

Tracks week-by-week consumption for each category in a month.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | |
| `month_id` | BIGINT | NOT NULL, FK → month(id) ON DELETE CASCADE | |
| `category_id` | BIGINT | NOT NULL, FK → category(id) ON DELETE CASCADE | |
| `used_qty_1st_week` | INT | DEFAULT 0 | Units consumed in week 1 |
| `used_qty_2nd_week` | INT | DEFAULT 0 | |
| `used_qty_3rd_week` | INT | DEFAULT 0 | |
| `used_qty_4th_week` | INT | DEFAULT 0 | |
| `used_qty_5th_week` | INT | DEFAULT 0 | Some months span 5 weeks |
| `checked_week_1` | BOOLEAN | DEFAULT FALSE | User ticked "done" for week 1 |
| `checked_week_2` | BOOLEAN | DEFAULT FALSE | |
| `checked_week_3` | BOOLEAN | DEFAULT FALSE | |
| `checked_week_4` | BOOLEAN | DEFAULT FALSE | |
| `checked_week_5` | BOOLEAN | DEFAULT FALSE | |
| `is_active` | BOOLEAN | DEFAULT TRUE | |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| `updated_at` | TIMESTAMP | NULL, auto-updated | |
| `deleted_at` | TIMESTAMP | NULLABLE | |

---

### `purchases`

Records individual purchase transactions. Up to 3 purchases per `monthly_stock_data` row are displayed in the product table.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | |
| `monthly_stock_id` | BIGINT | NULLABLE, FK → monthly_stock_data(id) ON DELETE SET NULL | Links back to stock row |
| `category_id` | BIGINT | NOT NULL, FK → category(id) ON DELETE CASCADE | |
| `subcategory_id` | BIGINT | NULLABLE, FK → category(id) ON DELETE SET NULL | Optional sub-category |
| `purchase_date` | DATE | NOT NULL | Date of purchase |
| `quantity` | INT | NOT NULL | Units purchased |
| `unit_price` | DECIMAL(10,2) | NOT NULL | Price per unit |
| `discount_amount` | DECIMAL(10,2) | DEFAULT 0.00 | Discount applied |
| `total_amount` | DECIMAL(10,2) | GENERATED ALWAYS STORED | = (quantity × unit_price) − discount |
| `quantity_per_unit` | INT | DEFAULT 1 | E.g. units per carton |
| `price` | DECIMAL(10,2) | DEFAULT 0.00 | Total line price (kept for backward compat) |
| `price_1st` | DECIMAL(10,2) | DEFAULT 0.00 | Aligned with 1st purchase slot |
| `price_2nd` | DECIMAL(10,2) | DEFAULT 0.00 | Aligned with 2nd purchase slot |
| `price_3rd` | DECIMAL(10,2) | DEFAULT 0.00 | Aligned with 3rd purchase slot |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| `updated_at` | TIMESTAMP | NULL, auto-updated | |

**Generated column:** `total_amount` is computed by MySQL and cannot be written to — do not include it in INSERT/UPDATE statements.

**Up to 3 purchases per monthly stock row** are identified by a `ROW_NUMBER()` partition in the API query (`pr` subquery in `GET /api/products`), sorted by `purchase_date ASC, id ASC`.

---

## Data Lifecycle Notes

1. **Soft deletes:** Every table uses `deleted_at`. Deletion queries do `UPDATE … SET deleted_at = NOW() WHERE id = ?`. All SELECT queries include `WHERE deleted_at IS NULL`.
2. **Monthly stock creation:** When a month is created, the previous calendar month's closing quantities are copied as `opening_qty` for each category in the new month.
3. **Closing quantity calculation:**
   ```
   closing_qty = opening_qty + purchase_1st_qty + purchase_2nd_qty + purchase_3rd_qty
                - used_qty_1st_week - used_qty_2nd_week - used_qty_3rd_week
                - used_qty_4th_week - used_qty_5th_week
   ```
4. **Only latest 2 months writable:** See the Explanation chapter on Read-Only Logic for the policy.
