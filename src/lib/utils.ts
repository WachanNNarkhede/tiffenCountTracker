import { format } from "date-fns";

/** Local YYYY-MM-DD (avoids UTC off-by-one from toISOString). */
export function toKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/** Today as a YYYY-MM-DD key. */
export function todayKey(): string {
  return toKey(new Date());
}

/** Parse a YYYY-MM-DD key into a local Date at midnight. */
export function fromKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** "Sat 12 Jul 2025" style label from a key. */
export function prettyDate(key: string): string {
  return format(fromKey(key), "EEE d MMM yyyy");
}

export function isWeekend(key: string): boolean {
  const day = fromKey(key).getDay();
  return day === 0 || day === 6;
}

/** True if the date key is after today. YYYY-MM-DD keys compare lexically. */
export function isFuture(key: string): boolean {
  return key > todayKey();
}

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
