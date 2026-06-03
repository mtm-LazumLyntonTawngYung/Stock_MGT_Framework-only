export function calculateClosingQty(row: {
  opening_qty: number;
  used_qty_1st_week: number;
  used_qty_2nd_week: number;
  used_qty_3rd_week: number;
  used_qty_4th_week: number;
  used_qty_5th_week: number;
  total_purchase_qty: number;
}): number {
  return (
    Number(row.opening_qty ?? 0) +
    Number(row.total_purchase_qty ?? 0) -
    Number(row.used_qty_1st_week ?? 0) -
    Number(row.used_qty_2nd_week ?? 0) -
    Number(row.used_qty_3rd_week ?? 0) -
    Number(row.used_qty_4th_week ?? 0) -
    Number(row.used_qty_5th_week ?? 0)
  );
}

export function getPreviousCalendarMonth(month: number, year: number): { month: number; year: number } {
  if (month === 1) {
    return { month: 12, year: year - 1 };
  }
  return { month: month - 1, year };
}

export function getNextCalendarMonth(month: number, year: number): { month: number; year: number } {
  if (month === 12) {
    return { month: 1, year: year + 1 };
  }
  return { month: month + 1, year };
}

export interface MonthLike {
  id: number;
  month: number;
  year: number;
}

/** Latest month in DB + its immediate previous month (if exists). */
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

export function isMonthEditable(monthId: number, months: MonthLike[]): boolean {
  return getEditableMonthIds(months).has(monthId);
}

/** Only the latest (most recent) month can have new products added. */
export function isMonthAddable(monthId: number, months: MonthLike[]): boolean {
  if (months.length === 0) return false;
  const sorted = [...months].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });
  return sorted[0].id === monthId;
}

export function formatDateForDb(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  const trimmed = dateStr.split('T')[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  return null;
}

export const MONTH_READ_ONLY_MESSAGE =
  'Only the latest month and its previous month can be edited.';
