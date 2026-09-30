import type { IconName } from "@/icons/Icon";

/**
 * Sample data for the front end.
 *
 * Every screen that shows any of this says so on the screen. The service names
 * and fees inside these records are real (see catalogue.ts); the balance, the
 * dates, the order numbers and the amounts are not, and the people are
 * placeholders in brackets rather than invented names. No reviews, no user
 * counts, no statistics nobody measured.
 */

export const SAMPLE = true;

export const profile = {
  name: "[Your name]",
  first: "[Name]",
  phone: "+91 [00000 00000]",
  email: "[you@example.com]",
  memberSince: "[2026]",
  member: false,
};

export const SAMPLE_BALANCE_PAISE = 2435050;

export type Category = "filing" | "topup" | "refund" | "membership";

export const CATEGORY: Record<Category, { label: string; icon: IconName; color: string; tone: "gold" | "green" | "violet" | "blue" }> = {
  filing: { label: "Filings", icon: "legal", color: "#F2C66D", tone: "gold" },
  topup: { label: "Top-ups", icon: "arrowDown", color: "#34D399", tone: "green" },
  refund: { label: "Refunds", icon: "arrowDown", color: "#60A5FA", tone: "blue" },
  membership: { label: "Membership", icon: "crown", color: "#8B6CFF", tone: "violet" },
};

export type Txn = {
  id: string;
  title: string;
  subtitle: string;
  paise: number;
  /** ISO date — the list groups by day. */
  on: string;
  category: Category;
  icon: IconName;
  status?: "pending";
};

/* Dates are relative to "now" so the day grouping (Today, Yesterday, a date)
   always has something in each bucket, whenever the app is opened. */
const day = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

export const transactions: Txn[] = [
  { id: "t1", title: "GST Registration", subtitle: "Professional fee", paise: -149900, on: day(0), category: "filing", icon: "tax" },
  { id: "t2", title: "Money added", subtitle: "UPI", paise: 500000, on: day(0), category: "topup", icon: "arrowDown" },
  { id: "t3", title: "MSME Udyam Registration", subtitle: "Professional fee", paise: -49900, on: day(1), category: "filing", icon: "business", status: "pending" },
  { id: "t4", title: "Refund", subtitle: "PAN Services", paise: 29900, on: day(3), category: "refund", icon: "arrowDown" },
  { id: "t5", title: "PAN Services", subtitle: "Professional fee", paise: -29900, on: day(4), category: "filing", icon: "identity" },
  { id: "t6", title: "Money added", subtitle: "Card", paise: 1000000, on: day(9), category: "topup", icon: "arrowDown" },
  { id: "t7", title: "Aadhaar Services", subtitle: "Professional fee", paise: -19900, on: day(12), category: "filing", icon: "identity" },
  { id: "t8", title: "Money added", subtitle: "Net banking", paise: 250000, on: day(18), category: "topup", icon: "arrowDown" },
];

/** Group by calendar day, newest first, with human labels. */
export function groupByDay(list: Txn[]): { label: string; items: Txn[]; net: number }[] {
  const out = new Map<string, Txn[]>();
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  for (const t of [...list].sort((a, b) => b.on.localeCompare(a.on))) {
    const d = new Date(t.on);
    const key = d.toDateString();
    const label =
      key === today
        ? "Today"
        : key === yesterday
          ? "Yesterday"
          : d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    out.set(label, [...(out.get(label) ?? []), t]);
  }
  return [...out.entries()].map(([label, items]) => ({
    label,
    items,
    net: items.reduce((s, t) => s + t.paise, 0),
  }));
}

/** Spend by category this month, for the donut. Credits are excluded — they are not spend. */
export function spendByCategory(list: Txn[]) {
  const spend = list.filter((t) => t.paise < 0);
  const total = spend.reduce((s, t) => s - t.paise, 0);
  const byService = new Map<string, number>();
  for (const t of spend) byService.set(t.title, (byService.get(t.title) ?? 0) - t.paise);
  const palette = ["#F2C66D", "#8B6CFF", "#60A5FA", "#34D399", "#F87171"];
  return {
    total,
    rows: [...byService.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], i) => ({ label, value, color: palette[i % palette.length]! })),
  };
}

export const monthly = [
  { label: "[M-5]", value: 12 },
  { label: "[M-4]", value: 30 },
  { label: "[M-3]", value: 18 },
  { label: "[M-2]", value: 42 },
  { label: "[M-1]", value: 26 },
  { label: "Now", value: 36, current: true },
];

/* ── orders ──────────────────────────────────────────────────────────── */

export type OrderStatus = "needs-you" | "in-progress" | "filed" | "done";

export type Order = {
  id: string;
  slug: string;
  name: string;
  status: OrderStatus;
  progress: number;
  step: string;
  stepIndex: number;
  paidPaise: number | null;
  startedOn: string;
  expectedOn: string | null;
};

export const STATUS: Record<OrderStatus, { label: string; tone: "amber" | "red" | "green" | "neutral"; color: string }> = {
  "needs-you": { label: "Needs you", tone: "red", color: "#F87171" },
  "in-progress": { label: "In progress", tone: "amber", color: "#FBBF24" },
  filed: { label: "Filed", tone: "green", color: "#34D399" },
  done: { label: "Done", tone: "neutral", color: "#6B6980" },
};

export const orders: Order[] = [
  { id: "SAMPLE-0001", slug: "gst", name: "GST Registration", status: "in-progress", progress: 0.6, step: "Filed with the department", stepIndex: 2, paidPaise: 149900, startedOn: "[start date]", expectedOn: "[expected date]" },
  { id: "SAMPLE-0002", slug: "msme-udyam", name: "MSME Udyam Registration", status: "needs-you", progress: 0.25, step: "One document still missing", stepIndex: 1, paidPaise: 49900, startedOn: "[start date]", expectedOn: null },
  { id: "SAMPLE-0003", slug: "pan", name: "PAN Services", status: "filed", progress: 0.85, step: "Acknowledgement received", stepIndex: 3, paidPaise: 29900, startedOn: "[start date]", expectedOn: "[expected date]" },
  { id: "SAMPLE-0004", slug: "aadhaar", name: "Aadhaar Services", status: "done", progress: 1, step: "Closed", stepIndex: 4, paidPaise: 19900, startedOn: "[start date]", expectedOn: null },
];

export const timeline = [
  "Documents received",
  "Application prepared",
  "Filed with the department",
  "Query window",
  "Certificate issued",
];

/* ── the real Udyam content, from the website ────────────────────────── */

export const udyamDocuments = [
  "Aadhaar number of the proprietor, partner or director",
  "PAN of the business",
  "GSTIN, if the business is registered",
  "Bank account details and business address",
];

export const udyamSteps = [
  { title: "Classification", body: "We work out whether you are micro, small or medium on the current slabs." },
  { title: "Filing", body: "Filed on the Udyam portal against your Aadhaar and PAN." },
  { title: "Certificate", body: "Issued with a permanent Udyam number and QR code. Usually the same day." },
];
