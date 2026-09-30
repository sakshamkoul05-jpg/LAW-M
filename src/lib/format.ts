/**
 * Formatting, in one place.
 *
 * Money is integer paise everywhere (the website's rule, lib/money.ts). These
 * turn it into text at the last moment, and never round a balance UP: a wallet
 * that shows ₹24,351 when the ledger says ₹24,350.50 has told the customer
 * they have money they do not.
 */

/** Last three digits, then pairs: 24,35,000. Worklet-safe. */
export function groupIndian(n: number): string {
  "worklet";
  const neg = n < 0;
  const s = Math.floor(Math.abs(n)).toString();
  if (s.length <= 3) return (neg ? "-" : "") + s;
  const last3 = s.slice(-3);
  let rest = s.slice(0, -3);
  let out = "";
  while (rest.length > 2) {
    out = "," + rest.slice(-2) + out;
    rest = rest.slice(0, -2);
  }
  return (neg ? "-" : "") + rest + out + "," + last3;
}

/** "₹2,000" / "₹1,499.50" — decimals only when there are paise. */
export function rupees(paise: number): string {
  const abs = Math.round(Math.abs(paise));
  const whole = groupIndian(Math.floor(abs / 100));
  const p = abs % 100;
  return p ? `₹${whole}.${String(p).padStart(2, "0")}` : `₹${whole}`;
}

/** "₹24,350.50" always with paise — for the balance, where precision is the point. */
export function rupeesExact(paise: number): string {
  const abs = Math.round(Math.abs(paise));
  return `₹${groupIndian(Math.floor(abs / 100))}.${String(abs % 100).padStart(2, "0")}`;
}

/** Signed for a statement line: "+ ₹500" / "− ₹1,499". */
export function signed(direction: "credit" | "debit", paise: number): string {
  return `${direction === "credit" ? "+" : "−"} ${rupees(paise)}`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "14 Oct 2026" */
export function dateLong(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** "14 Oct" */
export function dateShort(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** "2:15 pm" */
export function time(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h % 12 || 12}:${m} ${h < 12 ? "am" : "pm"}`;
}

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** "Today" / "Yesterday" / "Earlier" — how notifications group. */
export function dayBucket(iso: string, now = new Date()): "Today" | "Yesterday" | "Earlier" {
  const diff = Math.round((startOfDay(now) - startOfDay(new Date(iso))) / 86400000);
  if (diff <= 0) return "Today";
  if (diff === 1) return "Yesterday";
  return "Earlier";
}

/** "Today" / "Yesterday" / "Mon, 14 Oct" — how a statement groups. */
export function dayHeading(iso: string, now = new Date()): string {
  const b = dayBucket(iso, now);
  if (b !== "Earlier") return b;
  const d = new Date(iso);
  const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
  return `${wd}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** "just now" / "12 min ago" / "3 h ago" / "14 Oct". */
export function ago(iso: string, now = new Date()): string {
  const s = Math.max(0, (now.getTime() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 86400 * 2) return "yesterday";
  return dateShort(iso);
}

export function greeting(now = new Date()): string {
  const h = now.getHours();
  if (h < 5) return "Good evening";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/** First word of a name, or null. */
export function firstName(full: string | null | undefined): string | null {
  const w = (full ?? "").trim().split(/\s+/)[0];
  return w ? w : null;
}

/** The initial for an avatar: the first letter, skipping punctuation. */
export function initial(full: string | null | undefined): string {
  const m = (full ?? "").match(/\p{L}/u);
  return m ? m[0].toUpperCase() : "L";
}

/** Two-digit counts on the pass: "04". */
export function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}
