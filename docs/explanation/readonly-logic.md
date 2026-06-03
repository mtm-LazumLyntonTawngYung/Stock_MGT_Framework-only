# Read-Only Month Logic

> **Audience:** Developers who need to understand, extend, or debug the month edit restrictions.

---

## Why Does Read-Only Protection Exist?

In this system, each `month` record represents a full accounting period. Once a period closes, its data should become immutable to prevent accidental revision. Only the two most recent periods — the current month and the month immediately before it — are kept editable. All older months are locked.

---

## Which Months Are Editable?

The editable window is exactly **2 months**: the latest month in the database and its immediate calendar predecessor.

```
Month table currently holds:
  (1, 2025-06)  ← id=5   ✓ editable
  (2, 2025-05)  ← id=4   ✓ editable
  (3, 2025-04)  ← id=3   ✗ read-only
  (4, 2025-03)  ← id=2   ✗ read-only
  (5, 2025-01)  ← id=1   ✗ read-only
```

If July 2025 is created:
```
  (1, 2025-07)  ← id=6   ✓ editable
  (2, 2025-06)  ← id=5   ✓ editable
  (3, 2025-05)  ← id=4   ✗ read-only  ← was previously editable!
  …                 rest continue as read-only
```

---

## Where Is the Check Implemented?

Editable check is enforced in **two layers**:

### 1. Frontend (UI hides controls)

`src/lib/stock-utils.ts`: `getEditableMonthIds()` computes the set of editable month IDs. Pages call `isMonthEditable(monthId, months)` before showing Add / Edit / Delete buttons.

In `src/app/stock/[year]/[monthId]/page.tsx`, a read-only banner displays:
```tsx
<p className="text-amber-600 text-sm">Only the latest month and its previous month can be edited.</p>
```
when the current month is not in the editable set.

### 2. Backend (API returns 403)

Every mutating endpoint that touches a specific month calls `requireMonthEditable(monthId)` from `src/lib/month-edit-server.ts`. This function:

1. Fetches all months from the database.
2. Calls `isMonthEditable(monthId, months)`.
3. Returns `NextResponse.json({ error: 'This month is read-only' }, { status: 403 })` if not editable.

This check runs in:
- `PUT /api/products/[id]`
- `DELETE /api/products/[id]`
- `POST /api/products`
- And is also used by `requireMonthAddable()` in `POST /api/products` to ensure **only** the latest month can have new products added.

---

## Key Code: `getEditableMonthIds`

```typescript
export function getEditableMonthIds(months: MonthLike[]): Set<number> {
  if (months.length === 0) return new Set();

  const sorted = [...months].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });

  const latest = sorted[0];
  const prev = getPreviousCalendarMonth(latest.month, latest.year);
  const prevRecord = months.find((m) => m.month === prev.month && m.year === prev.year);

  const ids = new Set<number>([latest.id]);
  if (prevRecord) ids.add(prevRecord.id);
  return ids;
}
```

**Critically, the function does NOT just take `sorted[0]` and `sorted[1]`.** It finds the latest month by calendar order, then computes the true previous calendar month. This handles year boundaries:

```
latest = December 2024
previous calendar month = November 2024 (NOT whatever the second entry is — it must match month 11, year 2024)
```

---

## Cross-Month Write: Next Month's Opening Quantity

When a product's `closing_qty` changes (via `PUT /api/products/[id]`), the system updates the **next month's** `opening_qty` for the same category.

This cascading write, implemented in `products/[id]/route.ts`, ensures that closing figures always flow forward:

```typescript
const nextMonth = getNextCalendarMonth(currentMonth, currentYear);
// ... look up next month's monthly_stock_data row
await connection.query(
  `UPDATE monthly_stock_data SET opening_qty = ? WHERE month_id = ? AND category_id = ?`,
  [finalClosingQty, nextMonthId, currentCategoryId]
);
```

---

## Common Mistakes

| Scenario | Correct behavior |
|----------|-----------------|
| Editing a product in February when March is the latest | Allowed (Feb is the "prev" month) |
| Editing a product in February after March is created | Forbidden — Feb is now 2 months back |
| Adding a new product row to February from the Add Product form | Forbidden — only March's page can add rows |
| Deleting a month that is the editable "prev" month | Allowed at DB level — cascades all its stock rows |
