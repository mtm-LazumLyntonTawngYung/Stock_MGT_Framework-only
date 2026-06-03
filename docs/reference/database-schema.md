# Database Schema Reference

> **Audience:** Developers who need to understand or modify the database structure.

---

## Overview

The database has 5 core tables (`users`, `category`, `month`, `monthly_stock_data`, `purchases`) plus the `weekly_stock_check` table. All tables use soft deletion (`deleted_at`) and standard audit timestamps (`created_at`, `updated_at`).

```
users ──────────┐
                │
category ───────┼──→ monthly_stock_data ────→ purchases
                │
                └──→ weekly_stock_check

month ──────────┼──→ monthly_stock_data
                └──→ weekly_stock_check
```

---

## Entity Relationship Diagram

```
┌──────────┐       ┌──────────────────────┐       ┌───────────────────────┐
│  users   │       │        month         │       │  weekly_stock_check  │
├──────────┤       ├──────────────────────┤       ├───────────────────────┤
│ id (PK)  │       │ id (PK)              │       │ id (PK)               │
│ name     │       │ month (1–12, CHECK)  │       │ month_id (FK→month)   │
│ email    │       │ year                 │       │ category_id (FK→cat)  │
│ password │       │ created_at           │       │ used_qty_1st_week     │
│ status   │       │ UNIQUE(month, year)  │       │ used_qty_2nd_week     │
│ last_login│      └──────────────────────┘       │ used_qty_3rd_week     │
│ created_at│                                      │ used_qty_4th_week     │
│ updated_at│                                      │ used_qty_5th_week     │
│ deleted_at│                                      │ checked_week_1..5     │
└──────────┘                                      │ created_by (FK→users) │
                                                  │ updated_by (FK→users) │
                                                  │ created_at             │
                                                  │ updated_at             │
                                                  │ deleted_at             │
                                                  └───────────────────────┘
         │
         │ 1:N (parent→child)
         ▼
┌──────────────────────┐       ┌──────────────────────────┐       ┌────────────────────────────┐
│      category        │       │   monthly_stock_data     │       │         purchases          │
├──────────────────────┤       ├──────────────────────────┤       ├────────────────────────────┤
│ id (PK)              │       │ id (PK)                  │       │ id (PK)                    │
│ name                 │       │ month_id (FK→month)      │       │ monthly_stock_id (FK→msd)  │
│ minimum_threshold    │       │ category_id (FK→cat)     │       │ category_id (FK→cat)       │
│ remark               │       │ opening_qty              │       │ purchase_date              │
│ parent_id (FK→cat)   │       │ closing_qty              │       │ quantity                   │
│ created_at           │       │ created_by (FK→users)    │       │ purchase_price             │
│ updated_at           │       │ updated_by (FK→users)    │       │ discount_price             │
│ deleted_at           │       │ created_at               │       │ quantity_per_unit          │
└──────────────────────┘       │ updated_at               │       │ unit_price                 │
                               │ deleted_at               │       │ discount_amount            │
                               │ UNIQUE(month_id,         │       │ created_by (FK→users)      │
                               │   category_id)           │       │ updated_by (FK→users)      │
                               └──────────────────────────┘       │ created_at                 │
                                                                  │ updated_at                 │
                                                                  └────────────────────────────┘
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
| `updated_at` | TIMESTAMP | NULL, ON UPDATE CURRENT_TIMESTAMP | |
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
| `updated_at` | TIMESTAMP | NULL, ON UPDATE CURRENT_TIMESTAMP | |
| `deleted_at` | TIMESTAMP | NULLABLE | Soft delete marker |

**Indexes:** `parent_id`.

**Self-referencing relationship:** `parent_id` can reference another row in the same table. `ON DELETE SET NULL` means deleting a parent does not delete children — they become root categories.

---

### `month`

Represents a calendar month in the system.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | |
| `month` | TINYINT | NOT NULL, CHECK (1–12) | Calendar month number |
| `year` | SMALLINT | NOT NULL | 4-digit year |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

**Indexes:** `UNIQUE(month, year)` — prevents duplicate month entries.

---

### `monthly_stock_data`

Core table. One row per category per month containing opening and closing stock quantities.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | |
| `month_id` | BIGINT | NOT NULL, FK → month(id) ON DELETE CASCADE | The month this row belongs to |
| `category_id` | BIGINT | NOT NULL, FK → category(id) ON DELETE CASCADE | Which product category |
| `opening_qty` | INT | DEFAULT 0 | Starting quantity at month start |
| `closing_qty` | INT | DEFAULT 0 | Calculated; also stored here |
| `created_by` | BIGINT | NULLABLE, FK → users(id) | Who created this record |
| `updated_by` | BIGINT | NULLABLE, FK → users(id) | Who last updated this record |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| `updated_at` | TIMESTAMP | NULL, ON UPDATE CURRENT_TIMESTAMP | |
| `deleted_at` | TIMESTAMP | NULLABLE | Soft delete |

**Indexes:** `UNIQUE(month_id, category_id)` — exactly one stock record per category per month.

**ON DELETE CASCADE:** When a month row is deleted, all its `monthly_stock_data` rows are automatically deleted.

> **Note:** Purchase quantities and weekly usage data are stored in `purchases` and `weekly_stock_check` respectively, not in this table. The UI displays them together via a joined query.

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
| `created_by` | BIGINT | NULLABLE, FK → users(id) | |
| `updated_by` | BIGINT | NULLABLE, FK → users(id) | |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| `updated_at` | TIMESTAMP | NULL, ON UPDATE CURRENT_TIMESTAMP | |
| `deleted_at` | TIMESTAMP | NULLABLE | Soft delete |

---

### `purchases`

Records individual purchase transactions. Up to 3 purchases per `monthly_stock_data` row are displayed in the product table.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | |
| `monthly_stock_id` | BIGINT | NULLABLE, FK → monthly_stock_data(id) ON DELETE SET NULL | Links back to stock row |
| `category_id` | BIGINT | NOT NULL, FK → category(id) ON DELETE CASCADE | |
| `purchase_date` | DATE | NOT NULL | Date of purchase |
| `quantity` | INT | NOT NULL | Units purchased |
| `purchase_price` | DECIMAL(10,2) | DEFAULT 0.00 | Total purchase price |
| `discount_price` | DECIMAL(10,2) | DEFAULT 0.00 | Price after discount |
| `quantity_per_unit` | INT | DEFAULT 1 | E.g. units per carton |
| `unit_price` | DECIMAL(10,2) | NOT NULL | Price per single unit |
| `discount_amount` | DECIMAL(10,2) | DEFAULT 0.00 | Discount applied |
| `created_by` | BIGINT | NULLABLE, FK → users(id) | |
| `updated_by` | BIGINT | NULLABLE, FK → users(id) | |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| `updated_at` | TIMESTAMP | NULL, ON UPDATE CURRENT_TIMESTAMP | |

**Up to 3 purchases per monthly stock row** are identified by a `ROW_NUMBER()` partition in the API query (`pr` subquery in `GET /api/products`), sorted by `purchase_date ASC, id ASC`.

---

## Data Lifecycle Notes

1. **Soft deletes:** Every table uses `deleted_at`. Deletion queries do `UPDATE … SET deleted_at = NOW() WHERE id = ?`. All SELECT queries include `WHERE deleted_at IS NULL`.
2. **Monthly stock creation:** When a month is created, the previous calendar month's closing quantities are copied as `opening_qty` for each category in the new month.
3. **Closing quantity calculation:**
   ```
   closing_qty = opening_qty
               + purchase_1st_qty + purchase_2nd_qty + purchase_3rd_qty
               - used_qty_1st_week - used_qty_2nd_week - used_qty_3rd_week
               - used_qty_4th_week - used_qty_5th_week
   ```
   The purchase quantities and usage figures are joined from `purchases` and `weekly_stock_check` at query time.
4. **Only latest 2 months writable:** See the Explanation chapter on Read-Only Logic for the policy.
