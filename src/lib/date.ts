export interface DateParts {
  year: number;
  month: number;
  day: number;
  bce: boolean;
}

/**
 * Parse a date string into parts. Accepted forms:
 *   -0044-03-15, -0044.03.15, 44 BCE, 0044 BC, 1969-07-20, 1969.07.20, 1776
 * A negative sign or a trailing BCE/BC/BD marker means "Before Common Era".
 * Year 0 is treated as 1 BCE.
 */
export function parseDateParts(dateStr: string): DateParts | null {
  if (!dateStr) return null;
  const s = dateStr.trim().toUpperCase();
  const match = s.match(
    /^(-?)(\d{1,6})(?:[.\-](\d{1,2}))?(?:[.\-](\d{1,2}))?(?:\s*(BCE|BC|BD))?$/
  );
  if (!match) return null;
  const [, sign, yStr, mo, d, era] = match;
  let year = parseInt(yStr, 10);
  const bce = sign === "-" || era === "BCE" || era === "BC";
  if (bce) year = -year;
  if (year === 0) year = -1;
  const month = mo ? parseInt(mo, 10) : 1;
  const day = d ? parseInt(d, 10) : 1;
  if (month > 12 || month < 1 || day < 1 || day > 31) return null;
  return { year, month, day, bce };
}

export function canonicalDateString(
  parts: DateParts | null,
  fallback = ""
): string {
  if (!parts) return fallback;
  const p = (n: number) => String(n).padStart(2, "0");
  const year = `${parts.year < 0 ? "-" : ""}${String(Math.abs(parts.year)).padStart(4, "0")}`;
  return `${year}-${p(parts.month)}-${p(parts.day)}`;
}

export function normalizeDateString(raw: string): string {
  const s = raw?.trim() ?? "";
  return canonicalDateString(parseDateParts(s), s);
}

/**
 * Numeric sort key: yyyymmdd with a negative sign for BCE. Monotonic across
 * the BCE/CE boundary (1 BCE = -1, 1 CE = +1).
 */
export function sortDateKey(dateStr: string): number {
  const parts = parseDateParts(dateStr);
  if (!parts) return 1_000_000_000_000;
  const base = Math.abs(parts.year) * 10_000 + parts.month * 100 + parts.day;
  return parts.bce ? -base : base;
}

const ERA_LABELS: Record<string, { bce: string; unknown: string }> = {
  vi: { bce: "TCN", unknown: "Ngày không rõ" },
  en: { bce: "BCE", unknown: "Unknown Date" },
};

function eraLabel(locale: string): { bce: string; unknown: string } {
  return ERA_LABELS[locale] ?? ERA_LABELS.en!;
}

export function formatDateDisplay(dateStr: string, locale = "en"): string {
  const era = eraLabel(locale);
  const parts = parseDateParts(dateStr);
  if (!parts) return dateStr || era.unknown;
  const p = (n: number) => String(n).padStart(2, "0");
  const yearLabel = parts.bce
    ? `${Math.abs(parts.year)} ${era.bce}`
    : String(parts.year).padStart(4, "0");
  if (parts.month === 1 && parts.day === 1) return yearLabel;
  if (parts.day === 1) return `${yearLabel} ${p(parts.month)}`;
  return `${yearLabel} ${p(parts.month)}.${p(parts.day)}`;
}

export function parseDateFromFilename(filename: string): string {
  const match = filename.match(/^(-?)(\d{4})(?:\.(\d{2}))?(?:\.(\d{2}))?/);
  if (!match) return "";
  const sign = match[1] === "-" ? "-" : "";
  const year = match[2];
  const month = match[3] || "01";
  const day = match[4] || "01";
  return `${sign}${year}-${month}-${day}`;
}