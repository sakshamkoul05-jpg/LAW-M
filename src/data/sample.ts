/**
 * Sample data for the front end.
 *
 * THE RULE THIS FILE FOLLOWS
 *
 * Every screen that renders any of this labels it as a sample, on the screen,
 * where the customer can see it. Not in a comment, not in a README — on the
 * screen. A prototype that shows a plausible balance and a plausible order
 * history without saying so is a demo that somebody will eventually screenshot
 * and call a product, and then somebody else will ask why their real balance
 * does not match.
 *
 * The service names, fees and turnarounds inside these records are real (see
 * catalogue.ts). The people, the dates, the order numbers and the balance are
 * not, and are written to look obviously placeheld rather than convincingly
 * fake: no invented customer names, no invented testimonials, no counts of
 * users or filings that nobody has measured.
 */

export type OrderStatus = "needs-you" | "in-progress" | "filed" | "done";

export type Order = {
  id: string;
  slug: string;
  name: string;
  status: OrderStatus;
  /** 0 to 1, for the progress rail. */
  progress: number;
  step: string;
  paidPaise: number | null;
  startedOn: string;
  expectedOn: string | null;
};

export const STATUS_COPY: Record<OrderStatus, { label: string; tone: "amber" | "red" | "green" | "neutral" }> = {
  "needs-you": { label: "Needs you", tone: "red" },
  "in-progress": { label: "In progress", tone: "amber" },
  filed: { label: "Filed", tone: "green" },
  done: { label: "Done", tone: "neutral" },
};

export const sampleOrders: Order[] = [
  {
    id: "SAMPLE-0001",
    slug: "gst",
    name: "GST Registration",
    status: "in-progress",
    progress: 0.6,
    step: "Filed with the department",
    paidPaise: 149900,
    startedOn: "[start date]",
    expectedOn: "[expected date]",
  },
  {
    id: "SAMPLE-0002",
    slug: "msme-udyam",
    name: "MSME Udyam Registration",
    status: "needs-you",
    progress: 0.25,
    step: "One document still missing",
    paidPaise: 49900,
    startedOn: "[start date]",
    expectedOn: null,
  },
  {
    id: "SAMPLE-0003",
    slug: "pan",
    name: "PAN Services",
    status: "filed",
    progress: 0.85,
    step: "Acknowledgement received",
    paidPaise: 29900,
    startedOn: "[start date]",
    expectedOn: "[expected date]",
  },
  {
    id: "SAMPLE-0004",
    slug: "aadhaar",
    name: "Aadhaar Services",
    status: "done",
    progress: 1,
    step: "Closed",
    paidPaise: 19900,
    startedOn: "[start date]",
    expectedOn: null,
  },
];

/** The timeline on an order. Five steps, because five is what a filing has. */
export const sampleTimeline = [
  { title: "Documents received", when: "[date]", state: "done" as const },
  { title: "Application prepared", when: "[date]", state: "done" as const },
  { title: "Filed with the department", when: "in progress", state: "now" as const },
  { title: "Query window", when: "[00] days after filing", state: "later" as const },
  { title: "Certificate issued", when: "expected [date]", state: "later" as const },
];

export type Entry = {
  id: string;
  reason: string;
  date: string;
  paise: number;
};

/**
 * A sample statement.
 *
 * These rows once read as real filings with real-sounding court references.
 * They name only what LAWFIC actually sells now, and the screen that shows them
 * is labelled. A fabricated ledger on a money screen is the worst thing a
 * prototype can quietly do.
 */
export const sampleEntries: Entry[] = [
  { id: "s1", reason: "Wallet top-up", date: "[date]", paise: 500000 },
  { id: "s2", reason: "GST Registration — professional fee", date: "[date]", paise: -149900 },
  { id: "s3", reason: "MSME Udyam Registration", date: "[date]", paise: -49900 },
  { id: "s4", reason: "Refund — PAN Services", date: "[date]", paise: 29900 },
  { id: "s5", reason: "Aadhaar Services", date: "[date]", paise: -19900 },
];

/** The sample balance. Round, and obviously a demo number. */
export const SAMPLE_BALANCE_PAISE = 2435000;

/** What the Udyam service page actually says it needs. Real, from the website. */
export const udyamDocuments = [
  "Aadhaar number of the proprietor, partner or director",
  "PAN of the business",
  "GSTIN, if the business is registered",
  "Bank account details and business address",
];

export const udyamSteps = [
  {
    title: "Classification",
    body: "We work out whether you are micro, small or medium on the current investment and turnover slabs. Getting this wrong costs you scheme eligibility.",
  },
  {
    title: "Filing",
    body: "We file on the Udyam portal against your Aadhaar and PAN, and reconcile the auto-fetched ITR and GST figures.",
  },
  {
    title: "Certificate",
    body: "The certificate issues with a permanent Udyam Registration Number and a QR code. Usually the same day.",
  },
];
