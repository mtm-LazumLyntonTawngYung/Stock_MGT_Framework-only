# API Reference

> **Audience:** Frontend developers integrating with the backend, and backend developers extending the API.

---

## Conventions

All API routes follow these rules unless noted otherwise:

- **Base URL:** `/api`
- **Authentication:** Protected routes require an `auth-token` HTTP-only cookie. The cookie is set by `/api/auth/login`. Send `credentials: 'include'` from the browser.
- **Request format:** `POST`, `PUT` requests use `Content-Type: application/json` with a JSON body.
- **Success response:** `{ "message": "..." }`, status `200` or `201`.
- **Error response:** `{ "error": "..." }`, status `400`, `401`, `403`, `404`, `409`, or `500`.
- **Validation errors:** Returned with Zod-validated messages and HTTP 400.

---

## Authentication Endpoints

### POST `/api/auth/login`

Authenticates a user and sets the JWT token as an HTTP-only cookie.

**Request body:**

| Field | Type | Required |
|-------|------|----------|
| `email` | string (email) | Yes |
| `password` | string | Yes |

**Success response `200`:**

```json
{
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "status": "active"
  }
}
```

**Cookie set:** `auth-token` (HttpOnly, SameSite=Strict, Max-Age=7 days).

**Error responses:**
- `401` Invalid credentials
- `400` Validation error (email format invalid or empty)

---

### POST `/api/auth/logout`

Deletes the authentication cookie.

**No parameters.** Returns:

```json
{ "message": "Logged out successfully" }
```

**Cookie deleted:** `auth-token`.

---

### GET `/api/auth/me`

Returns the currently authenticated user's profile.

**No parameters.** Requires valid `auth-token` cookie.

**Success response `200`:**

```json
{
  "id": 1,
  "name": "Admin User",
  "email": "admin@example.com",
  "status": "active"
}
```

**Error responses:**
- `401` Not authenticated or invalid token

---

### POST `/api/auth/change-password`

Updates the current user's password.

**Request body:**

| Field | Type | Required |
|-------|------|----------|
| `currentPassword` | string | Yes |
| `newPassword` | string (min 6 chars) | Yes |

**Success response `200`:**

```json
{ "message": "Password changed successfully" }
```

**Error responses:**
- `401` Not authenticated
- `400` Current password is incorrect
- `400` Validation error (new password too short)

---

## User Endpoints

### GET `/api/users`

Returns all non-deleted users.

**Query parameters:** None.

**Success response `200`:**

```json
[
  {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "status": "active",
    "created_at": "2025-01-01 00:00:00",
    "last_login": "2025-06-01 10:00:00"
  }
]
```

---

### POST `/api/users`

Creates a new user.

**Request body:**

| Field | Type | Required |
|-------|------|----------|
| `name` | string | Yes |
| `email` | string (email) | Yes |
| `password` | string (min 6 chars) | Yes |
| `status` | `'active'` or `'inactive'` | No (default: `'active'`) |

**Success response `201`:**

```json
{ "message": "User created successfully" }
```

**Error responses:**
- `409` Email already exists
- `400` Validation error

---

### PUT `/api/users/[id]`

Updates a user's name, email, or status.

**Request body:**

| Field | Type | Required |
|-------|------|----------|
| `name` | string | Yes |
| `email` | string (email) | Yes |
| `status` | `'active'` or `'inactive'` | Yes |

**Success response `200`:** `{ "message": "User updated successfully" }`

---

### DELETE `/api/users/[id]`

Soft-deletes a user (sets `deleted_at`).

**No body.** Returns:

```json
{ "message": "User deleted successfully" }
```

---

## Category Endpoints

### GET `/api/categories`

Returns all non-deleted categories, ordered with root categories (no parent) first.

**Success response `200`:**

```json
[
  {
    "id": 1,
    "name": "Coffee Products",
    "minimum_threshold": 0,
    "remark": "All coffee-related items",
    "parent_id": null
  },
  {
    "id": 3,
    "name": "Instant Coffee",
    "minimum_threshold": 0,
    "remark": null,
    "parent_id": 1
  }
]
```

---

### POST `/api/categories`

Creates a new category.

**Request body:**

| Field | Type | Required |
|-------|------|----------|
| `name` | string | Yes |
| `parentId` | number or null | No |
| `minimumThreshold` | number | No (default: 0) |
| `remark` | string | No |

**Success response `201`:** `{ "message": "Category created successfully" }`

---

### PUT `/api/categories/[id]`

Updates a category.

**Request body:**

| Field | Type | Required |
|-------|------|----------|
| `name` | string | Yes |
| `minimumThreshold` | number | No (default: 0) |
| `remark` | string | No |

**Success response `200`:** `{ "message": "Category updated successfully" }`

**Deletion guard:** Cannot delete a category if:
- Stock quantities exist in its sub-categories
- Purchase records reference it

---

### DELETE `/api/categories/[id]`

Soft-deletes a category (sets `deleted_at`).

**Returns:** `{ "message": "Category deleted successfully" }` or `400` if stock/purchases exist.

---

## Month Endpoints

### GET `/api/months`

Returns all months, ordered by year DESC then month DESC.

**Success response `200`:**

```json
[
  { "id": 3, "month": 6, "year": 2025, "created_at": "2025-06-01 00:00:00" },
  { "id": 2, "month": 5, "year": 2025, "created_at": "2025-05-01 00:00:00" }
]
```

---

### POST `/api/months`

Creates a new month and seeds opening quantities from the previous calendar month.

**Request body:**

| Field | Type | Required |
|-------|------|----------|
| `month` | number (1–12) | Yes |
| `year` | number (2000–2100) | Yes |

**Success response `201`:**

```json
{ "message": "Month created successfully", "id": 4 }
```

**Error responses:**
- `409` Month already exists (unique constraint on month+year)
- `400` Validation error

**Side effect:** Uses a database transaction. If the previous calendar month exists, all its `category_id` + `closing_qty` rows are copied into the new month as `opening_qty` rows with `created_by` / `updated_by` set to the current user's ID.

---

### DELETE `/api/months/[id]`

Hard-deletes a month (cascades to `monthly_stock_data` and `weekly_stock_check` via FK).

**Returns:** `{ "message": "Month deleted successfully" }` or `404` if not found.

---

## Product (Monthly Stock) Endpoints

### GET `/api/products?year=X&month=Y`

Returns all stock records for a given month with derived fields joined from `weekly_stock_check` and a pivoted `purchases` subquery.

**Query parameters:**

| Param | Type | Required |
|-------|------|----------|
| `year` | number | Yes |
| `month` | number (1–12) | Yes |

**Success response `200`:**

```json
[
  {
    "id": 1,
    "month_id": 3,
    "category_id": 2,
    "opening_qty": 6,
    "closing_qty": 25,
    "purchase_1st_qty": 32,
    "purchase_2nd_qty": 0,
    "purchase_3rd_qty": 0,
    "price": 1200.00,
    "price_1st": 1200.00,
    "unit_price_1st": 37.50,
    "itemDescription": "Premier Coffee 3-in-1",
    "categoryName": "Premier Coffee Original 3 in 1",
    "minimum_threshold": 5,
    "used_qty_1st_week": 3,
    "checked_week_1": true
  }
]
```

**Pivoted purchase fields included:**

- `purchase_1st_qty`, `purchase_2nd_qty`, `purchase_3rd_qty`
- `price_1st`, `price_2nd`, `price_3rd`
- `unit_price_1st`, `unit_price_2nd`, `unit_price_3rd`
- `discount_amount_1st`, … (`_2nd`, `_3rd`)
- `quantity_per_unit_1st`, … (`_2nd`, `_3rd`)
- `purchase_date_1st`, … (`_2nd`, `_3rd`)
- `checked_week_1`, … (`_2nd`–`_5th`)

If no purchases exist for a record, the pivoted fields default to `0` or `''`.

---

### POST `/api/products`

Creates a new monthly stock record and up to 3 associated purchase rows.

**Request body:**

| Field | Type | Required |
|-------|------|----------|
| `month_id` | number | Yes |
| `category_id` | number | Yes |
| `opening_qty` | number | Yes |
| `closing_qty` | number | No |
| `purchase_1st_qty` | number | Yes |
| `purchase_2nd_qty` | number | Yes |
| `purchase_3rd_qty` | number | Yes |
| `used_qty_1st_week`–`used_qty_5th_week` | number | Yes |
| `price_1st`, `price_2nd`, `price_3rd` | number | No |
| `unit_price_1st`, `_2nd`, `_3rd` | number | No |
| `discount_amount_1st`, `_2nd`, `_3rd` | number | No |
| `quantity_per_unit_1st`, `_2nd`, `_3rd` | number | No |
| `purchase_date_1st`, `_2nd`, `_3rd` | string (YYYY-MM-DD) | No |

**Success response `201`:** `{ "message": "Product created successfully" }`

**Side effect:** If `month_id` is not the latest month, returns `403`.

---

### PUT `/api/products/[id]`

Updates a stock record and rebuilds up to 3 purchase rows (delete old, insert new). Also updates the next month's `opening_qty`.

**Request body:** Same fields as POST.

**Success response `200`:** `{ "message": "Product updated successfully" }`

**Error responses:**
- `400` Negative quantity detected
- `403` Month is read-only
- `401` Not authenticated

**Side effect:** Updates `next_month.category_id.opening_qty` to the new `closing_qty` if a next month exists.

---

### DELETE `/api/products/[id]`

Soft-deletes (sets `deleted_at`) a stock record.

**Returns:** `{ "message": "Product deleted successfully" }` or `403`/`404`.

---

## Purchase Endpoints

### GET `/api/purchases`

Returns all purchases joined with their category name, ordered by purchase date DESC.

**Success response `200`:**

```json
[
  {
    "id": 1,
    "monthly_stock_id": 5,
    "category_id": 3,
    "categoryName": "Premier Coffee 3-in-1",
    "purchase_date": "2025-06-01",
    "quantity": 32,
    "unit_price": 37.50,
    "quantity_per_unit": 1,
    "discount_amount": 0,
    "total_amount": 1200.00,
    "price": 1200.00,
    "created_at": "2025-06-01 00:00:00"
  }
]
```

---

### POST `/api/purchases`

Creates a standalone purchase record.

**Request body:**

| Field | Type | Required |
|-------|------|----------|
| `monthly_stock_id` | number | No |
| `category_id` | number | Yes |
| `purchase_date` | string (YYYY-MM-DD) | Yes |
| `quantity` | number (> 0) | Yes |
| `unit_price` | number | Yes |
| `price` | number | Yes |
| `discount_amount` | number | No |
| `quantity_per_unit` | number (> 0) | No |

**Success response `201`:** `{ "message": "Purchase created successfully" }`

---

### PUT `/api/purchases/[id]`

Updates a purchase record. Same body schema as POST.

**Returns:** `{ "message": "Purchase updated successfully" }`

---

### DELETE `/api/purchases/[id]`

Physically deletes the purchase row.

**Returns:** `{ "message": "Purchase deleted successfully" }`

---

## Weekly Check Endpoints

### GET `/api/weekly-check?month_id=X&category_id=Y`

Returns the weekly stock check record for the given month and category.

**Query parameters:**

| Param | Type | Required |
|-------|------|----------|
| `month_id` | number | Yes |
| `category_id` | number | Yes |

**Success response `200`:**

```json
{
  "id": 1,
  "month_id": 3,
  "category_id": 2,
  "used_qty_1st_week": 3,
  "used_qty_2nd_week": 4,
  "used_qty_3rd_week": 6,
  "used_qty_4th_week": 4,
  "used_qty_5th_week": 3,
  "checked_week_1": true,
  "checked_week_2": true,
  "checked_week_3": false,
  "checked_week_4": false,
  "checked_week_5": false,
  "created_at": "2025-06-03 00:00:00",
  "updated_at": "2025-06-03 00:00:00"
}
```

Returns an empty object `{}` if no record exists yet.

---

### POST `/api/weekly-check`

Upsert: INSERTs a new weekly check or updates the existing one for the given `month_id` + `category_id` combination.

**Request body:**

| Field | Type | Required |
|-------|------|----------|
| `month_id` | number | Yes |
| `category_id` | number | Yes |
| `used_qty_1st_week`–`used_qty_5th_week` | number | Yes (default: 0) |
| `checked_week_1`–`checked_week_5` | boolean | Yes |

**Success response `200` / `201`:** `{ "message": "Weekly check saved" }`

---

## Status Code Summary

| Code | Meaning |
|------|---------|
| `200` | OK — request succeeded |
| `201` | Created — new resource created |
| `400` | Bad Request — validation error or logic guard |
| `401` | Unauthorized — missing or invalid auth token |
| `403` | Forbidden — month is read-only or other authorization failure |
| `404` | Not Found — resource does not exist |
| `409` | Conflict — duplicate month/year, duplicate email, etc. |
| `500` | Server Error — unexpected failure |
