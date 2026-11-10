/** Date helpers. The API stores UTC; "date" strings (YYYY-MM-DD) denote the user's calendar day. */

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime());
}

/** Converts YYYY-MM-DD into a Date at UTC midnight (what Prisma @db.Date columns expect). */
export function toDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export function dateOnlyToIso(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export function addDays(value: Date, days: number): Date {
  const next = new Date(value);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function startOfWeek(value: Date, weekStartsOn = 1): Date {
  const d = new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  const diff = (d.getUTCDay() - weekStartsOn + 7) % 7;
  d.setUTCDate(d.getUTCDate() - diff);
  return d;
}

export function dayRange(date: string): { start: Date; end: Date } {
  const start = toDateOnly(date);
  return { start, end: addDays(start, 1) };
}

export function yearsBetween(birthDate: Date, now = new Date()): number {
  let age = now.getUTCFullYear() - birthDate.getUTCFullYear();
  const m = now.getUTCMonth() - birthDate.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < birthDate.getUTCDate())) age -= 1;
  return age;
}
