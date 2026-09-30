import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ServiceOrder, OrderStatus } from "@/lawfic/orders";
import { STATUS_META, orderTotalPaise } from "@/lawfic/orders";
import type { OrderMessage } from "@/lawfic/messages";
import type { WalletEntry } from "@/lawfic/wallet-entries";
import type { Invoice } from "@/lawfic/invoice";
import type { Subscription, BillingPeriod } from "@/lawfic/subscription";
import { membershipFor, priceFor, savingOn } from "@/lawfic/subscription";
import { plans } from "@/lawfic/pricing";
import { EMPTY_PROFILE, type UserProfile } from "@/lawfic/profile";
import { MAX_TOPUP_PAISE, MIN_TOPUP_PAISE } from "@/lawfic/money";
import { serviceName } from "@/data/catalogue";
import { rupees } from "@/lib/format";

/**
 * The app's data, in the website's shapes.
 *
 * ─────────────────────────────────────────────────────────────────────────
 *  THIS IS THE SEAM WHERE THE BACKEND GOES
 *
 *  Every record here is typed with the website's own types — ServiceOrder,
 *  WalletEntry, OrderMessage, Invoice, Subscription — so the day the app talks
 *  to lawfic.pro's database, each action below becomes one API call and each
 *  selector one query, and not a single screen changes.
 *
 *  Until then the app runs in PREVIEW MODE: a small starter set of records,
 *  stored on this device and nowhere else. It is labelled as a preview on
 *  every screen that shows money, no payment is taken, and nothing leaves
 *  the phone except what the customer types to Panda.
 * ─────────────────────────────────────────────────────────────────────────
 */

export type AppProfile = UserProfile & {
  email: string;
  website: string;
  /** Local file URI of the photo the customer chose. Never uploaded. */
  photoUri: string | null;
  /** True once the welcome flow has been completed. */
  onboarded: boolean;
  memberSince: string;
};

export type Upload = {
  id: string;
  name: string;
  uri: string;
  created_at: string;
  order_id: string | null;
};

export type Prefs = {
  /** The website's dashboard preference ("home.sections"), for this person. */
  homeSections: { promotions: boolean; forYou: boolean; services: boolean; activity: boolean };
  hideBalance: boolean;
};

export type State = {
  version: 1;
  profile: AppProfile;
  entries: WalletEntry[];
  invoices: (Invoice & { entry_id: string })[];
  orders: ServiceOrder[];
  messages: OrderMessage[];
  uploads: Upload[];
  subscription: Subscription | null;
  wishlist: string[];
  read: string[];
  prefs: Prefs;
};

const KEY = "lawfic:demo:v2";
const ME = "me";

/* ────────────────────────────────────────────────────────────── ids & time */

let seq = 0;
function uid(prefix: string): string {
  seq += 1;
  return `${prefix}_${Date.now().toString(36)}${seq.toString(36)}`;
}

const HOUR = 3600_000;
const DAY = 24 * HOUR;
const at = (msAgo: number) => new Date(Date.now() - msAgo).toISOString();

/* Demo references follow the LF- pattern the website's documents use. They
   live only in this device's demo data; the account connection replaces them
   with the database's own. */
let refNo = 2040;
const nextRef = () => `LF-${++refNo}`;

/* ──────────────────────────────────────────────────────────────── the seed */

function seed(): State {
  refNo = 2040;
  const entries: WalletEntry[] = [];
  const invoices: State["invoices"] = [];
  const credit = (paise: number, reason: string, msAgo: number, gateway = true) => {
    const e: WalletEntry = {
      id: uid("we"),
      direction: "credit",
      amount_paise: paise,
      reason,
      created_at: at(msAgo),
      gateway_payment_id: gateway ? "preview" : null,
      order_id: null,
    };
    entries.push(e);
    invoices.push(invoiceFor(e));
  };

  const orders: ServiceOrder[] = [];
  const order = (
    slug: string,
    status: OrderStatus,
    fees: { gov: number; pro: number } | null,
    times: { created: number; quoted?: number; paid?: number; completed?: number },
    details: string,
  ): ServiceOrder => {
    const o: ServiceOrder = {
      id: uid("ord"),
      reference: nextRef(),
      user_id: ME,
      service_slug: slug,
      status,
      government_fee_paise: fees ? fees.gov : null,
      professional_fee_paise: fees ? fees.pro : null,
      details,
      admin_notes: null,
      quoted_at: times.quoted != null ? at(times.quoted) : null,
      paid_at: times.paid != null ? at(times.paid) : null,
      completed_at: times.completed != null ? at(times.completed) : null,
      created_at: at(times.created),
    };
    orders.push(o);
    return o;
  };
  const debitFor = (o: ServiceOrder, msAgo: number) => {
    const e: WalletEntry = {
      id: uid("we"),
      direction: "debit",
      amount_paise: orderTotalPaise(o),
      reason: `${serviceName(o.service_slug)} · ${o.reference}`,
      created_at: at(msAgo),
      gateway_payment_id: null,
      order_id: o.id,
    };
    entries.push(e);
    invoices.push(invoiceFor(e));
  };

  credit(2_500_000, "Wallet top-up · UPI", 11 * DAY);
  const pan = order("pan", "completed", { gov: 10_700, pro: 29_900 }, { created: 9.2 * DAY, quoted: 9 * DAY, paid: 8.8 * DAY, completed: 6.5 * DAY }, "New PAN for a first bank account.");
  debitFor(pan, 8.8 * DAY);
  const gst = order("gst", "in_progress", { gov: 0, pro: 149_900 }, { created: 5.3 * DAY, quoted: 5 * DAY, paid: 4.6 * DAY }, "Regular scheme. Online sales from next month.");
  debitFor(gst, 4.6 * DAY);
  credit(125_550, "Wallet top-up · Card", 2.1 * DAY);
  const udyam = order("msme-udyam", "quoted", { gov: 0, pro: 49_900 }, { created: 26 * HOUR, quoted: 3 * HOUR }, "Proprietorship, services. Needs the certificate for a CGTMSE loan.");
  const aadhaar = order("aadhaar", "submitted", null, { created: 0.4 * HOUR }, "Address change after moving city.");

  const messages: OrderMessage[] = [
    msg(pan.id, true, "Your e-PAN has been issued and sent to the email on the application. The physical card follows by post.", 6.5 * DAY),
    msg(gst.id, true, "Filed. The application is with the GST officer now — they usually respond within seven working days. If they raise a clarification we answer it inside the window, so there is nothing you need to do.", 4.4 * DAY),
    msg(gst.id, false, "Thanks. Will they need to visit the shop?", 4.3 * DAY),
    msg(gst.id, true, "Only if the officer asks for physical verification, which adds about two weeks. We will tell you the day it is triggered.", 4.2 * DAY),
    msg(udyam.id, true, "Priced and ready: ₹499, and there is no government fee for Udyam. Pay from your wallet and we file today.", 3 * HOUR),
  ];

  /* What is older than a day has been seen. Everything newer is unread, so
     the first open of the preview has something to show in the bell. */
  const state: State = {
    version: 1,
    profile: { ...EMPTY_PROFILE, email: "", website: "", photoUri: null, onboarded: false, memberSince: at(11 * DAY) },
    entries: entries.sort(byNewest),
    invoices,
    orders: orders.sort(byNewest),
    messages,
    uploads: [],
    subscription: null,
    wishlist: [],
    read: [],
    prefs: { homeSections: { promotions: true, forYou: true, services: true, activity: true }, hideBalance: false },
  };
  state.read = notificationsFor(state)
    .filter((n) => Date.now() - new Date(n.at).getTime() > DAY)
    .map((n) => n.id);
  void aadhaar;
  return state;
}

function msg(order_id: string, fromStaff: boolean, body: string, msAgo: number): OrderMessage {
  return {
    id: uid("msg"),
    order_id,
    author_id: fromStaff ? "lawfic" : ME,
    from_staff: fromStaff,
    body,
    read_at: fromStaff && msAgo > DAY ? at(msAgo - HOUR) : null,
    created_at: at(msAgo),
  };
}

const byNewest = (a: { created_at: string }, b: { created_at: string }) => b.created_at.localeCompare(a.created_at);

let invoiceNo = 1000;

/** "2627" for FY 2026–27 — the website's invoice numbering (LF/2627/000001). */
function financialYear(iso: string): string {
  const d = new Date(iso);
  const start = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
  return `${String(start % 100).padStart(2, "0")}${String((start + 1) % 100).padStart(2, "0")}`;
}
/* Credits get a payment receipt; debits are a supply of services and the
   database labels them tax_invoice. Whether the words "tax invoice" may be
   PRINTED depends on the company having a GSTIN — lib/invoice.ts decides that
   at render time, and today it says receipt for both.

   PREVIEW DOCUMENTS CARRY NO TAX LINE. LAWFIC has no GSTIN on file, so an
   "18% GST" row on a preview receipt would be a tax figure nobody collected.
   The real split is the database trigger's to make. */
function invoiceFor(e: WalletEntry): State["invoices"][number] {
  invoiceNo += 1;
  const total = e.amount_paise;
  const isDebit = e.direction === "debit";
  const taxable = total;
  return {
    id: uid("inv"),
    entry_id: e.id,
    number: `LF/${financialYear(e.created_at)}/${String(invoiceNo).padStart(6, "0")}`,
    kind: isDebit ? "tax_invoice" : "receipt",
    issued_at: e.created_at,
    total_paise: total,
    taxable_paise: taxable,
    tax_paise: 0,
    tax_rate_bp: 0,
    narration: e.reason,
  };
}

/* ─────────────────────────────────────────────────────────────── selectors */

export function balanceOf(entries: WalletEntry[]): number {
  return entries.reduce((s, e) => s + (e.direction === "credit" ? e.amount_paise : -e.amount_paise), 0);
}

export const isActive = (o: ServiceOrder) => o.status !== "completed" && o.status !== "rejected";

export type Notice = {
  id: string;
  at: string;
  kind: "order" | "message" | "wallet";
  tone: "neutral" | "action" | "good" | "bad";
  title: string;
  body: string;
  /** Where tapping it goes. */
  href: string;
};

/**
 * Notifications are DERIVED, never stored.
 *
 * Every one is an event that already exists in the records — an order changing
 * status, a message from the team, money arriving. Deriving them means a
 * notification can never claim something happened that the ledger does not
 * show, and "mark as read" is the only state they need of their own.
 */
export function notificationsFor(s: Pick<State, "orders" | "messages" | "entries">): Notice[] {
  const out: Notice[] = [];
  for (const o of s.orders) {
    const name = serviceName(o.service_slug);
    const href = `/filing/${o.id}`;
    out.push({ id: `o:${o.id}:submitted`, at: o.created_at, kind: "order", tone: "neutral", title: "Request received", body: `${name}. ${STATUS_META.submitted.blurb}`, href });
    if (o.quoted_at) {
      out.push({ id: `o:${o.id}:quoted`, at: o.quoted_at, kind: "order", tone: "action", title: `Quote ready · ${rupees(orderTotalPaise(o))}`, body: `${name}. ${STATUS_META.quoted.blurb}`, href });
    }
    if (o.paid_at) {
      out.push({ id: `o:${o.id}:paid`, at: o.paid_at, kind: "order", tone: "neutral", title: "Payment received", body: `${name}. ${STATUS_META.paid.blurb}`, href });
    }
    if (o.completed_at) {
      out.push({
        id: `o:${o.id}:${o.status}`,
        at: o.completed_at,
        kind: "order",
        tone: o.status === "rejected" ? "bad" : "good",
        title: o.status === "rejected" ? "Filing closed" : "Filing completed",
        body: `${name}. ${STATUS_META[o.status].blurb}`,
        href,
      });
    }
  }
  for (const m of s.messages) {
    if (!m.from_staff) continue;
    const o = s.orders.find((x) => x.id === m.order_id);
    if (!o) continue;
    out.push({ id: `m:${m.id}`, at: m.created_at, kind: "message", tone: "neutral", title: `Message · ${serviceName(o.service_slug)}`, body: m.body, href: `/filing/${o.id}?tab=messages` });
  }
  for (const e of s.entries) {
    if (e.direction !== "credit") continue;
    out.push({ id: `w:${e.id}`, at: e.created_at, kind: "wallet", tone: "good", title: `${rupees(e.amount_paise)} added`, body: e.reason, href: `/wallet?entry=${e.id}` });
  }
  return out.sort((a, b) => b.at.localeCompare(a.at));
}

export type VaultItem =
  | { id: string; kind: "receipt"; title: string; at: string; invoice: State["invoices"][number]; entry: WalletEntry; order: ServiceOrder | null }
  | { id: string; kind: "upload"; title: string; at: string; upload: Upload; order: ServiceOrder | null };

/** The document vault: every paper LAWFIC issued, plus what the customer added. */
export function vaultFor(s: Pick<State, "invoices" | "entries" | "uploads" | "orders">): VaultItem[] {
  const out: VaultItem[] = [];
  for (const inv of s.invoices) {
    const entry = s.entries.find((e) => e.id === inv.entry_id);
    if (!entry) continue;
    const order = entry.order_id ? s.orders.find((o) => o.id === entry.order_id) ?? null : null;
    out.push({ id: inv.id, kind: "receipt", title: order ? serviceName(order.service_slug) : "Wallet top-up", at: inv.issued_at, invoice: inv, entry, order });
  }
  for (const u of s.uploads) {
    out.push({ id: u.id, kind: "upload", title: u.name, at: u.created_at, upload: u, order: u.order_id ? s.orders.find((o) => o.id === u.order_id) ?? null : null });
  }
  return out.sort((a, b) => b.at.localeCompare(a.at));
}

/* ───────────────────────────────────────────────────────────────── actions */

export type Result<T = void> = { ok: true; value: T } | { ok: false; error: string };

type Store = {
  status: "loading" | "ready" | "error";
  state: State;
  balance: number;
  notices: Notice[];
  unread: number;
  retry: () => void;
  updateProfile: (patch: Partial<AppProfile>) => void;
  setPrefs: (patch: Partial<Prefs>) => void;
  topUp: (paise: number, method: string) => Result<WalletEntry>;
  payOrder: (orderId: string) => Result<{ discountPaise: number }>;
  request: (slug: string, details: string) => Result<ServiceOrder>;
  sendMessage: (orderId: string, body: string) => Result;
  markRead: (ids: string[]) => void;
  addUpload: (u: Omit<Upload, "id" | "created_at">) => Upload;
  removeUpload: (id: string) => void;
  subscribe: (planId: string, period: BillingPeriod) => Result;
  cancelSubscription: () => void;
  toggleWishlist: (slug: string) => void;
  reset: () => void;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Store["status"]>("loading");
  const [state, setState] = useState<State>(() => seed());
  const loaded = useRef(false);

  const load = useCallback(() => {
    setStatus("loading");
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw) as State;
          if (parsed?.version === 1) setState(parsed);
        }
        loaded.current = true;
        setStatus("ready");
      })
      .catch(() => {
        /* Storage unavailable (a private window, a full disk). The app still
           works on the in-memory seed; it just will not remember. */
        loaded.current = true;
        setStatus("ready");
      });
  }, []);

  useEffect(load, [load]);

  /* Persist after every change, but never before the first load has landed —
     writing the seed over a saved state is how a preview forgets itself. */
  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  const balance = useMemo(() => balanceOf(state.entries), [state.entries]);
  const notices = useMemo(() => notificationsFor(state), [state.orders, state.messages, state.entries]);
  const unread = useMemo(() => notices.filter((n) => !state.read.includes(n.id)).length, [notices, state.read]);

  const store: Store = useMemo(
    () => ({
      status,
      state,
      balance,
      notices,
      unread,
      retry: load,
      updateProfile: (patch) => setState((s) => ({ ...s, profile: { ...s.profile, ...patch } })),
      setPrefs: (patch) => setState((s) => ({ ...s, prefs: { ...s.prefs, ...patch } })),

      topUp: (paise, method) => {
        if (!Number.isInteger(paise) || paise < MIN_TOPUP_PAISE) return { ok: false, error: `The smallest top-up is ${rupees(MIN_TOPUP_PAISE)}.` };
        if (paise > MAX_TOPUP_PAISE) return { ok: false, error: `One top-up can be at most ${rupees(MAX_TOPUP_PAISE)}.` };
        const e: WalletEntry = {
          id: uid("we"),
          direction: "credit",
          amount_paise: paise,
          reason: `Wallet top-up · ${method}`,
          created_at: new Date().toISOString(),
          gateway_payment_id: "preview",
          order_id: null,
        };
        setState((s) => ({ ...s, entries: [e, ...s.entries], invoices: [...s.invoices, invoiceFor(e)] }));
        return { ok: true, value: e };
      },

      payOrder: (orderId) => {
        const o = state.orders.find((x) => x.id === orderId);
        if (!o) return { ok: false, error: "That filing no longer exists." };
        if (o.status !== "quoted") return { ok: false, error: "Only a quoted filing can be paid." };
        /* A member's discount comes off LAWFIC's fee only. The government fee
           is passed through at cost, always — lib/pricing.ts, rule two. */
        const planId = state.subscription && (state.subscription.status === "active" || state.subscription.status === "cancelling") ? state.subscription.planId : null;
        const pro = o.professional_fee_paise ?? 0;
        const { discountPaise } = planId ? savingOn(pro, planId) : { discountPaise: 0 };
        const total = orderTotalPaise(o) - discountPaise;
        if (total > balance) return { ok: false, error: `This needs ${rupees(total)} and your wallet has ${rupees(balance)}. Add ${rupees(total - balance)} first.` };
        const now = new Date().toISOString();
        const e: WalletEntry = {
          id: uid("we"),
          direction: "debit",
          amount_paise: total,
          reason: `${serviceName(o.service_slug)} · ${o.reference}${discountPaise ? ` · member saving ${rupees(discountPaise)}` : ""}`,
          created_at: now,
          gateway_payment_id: null,
          order_id: o.id,
        };
        setState((s) => ({
          ...s,
          entries: [e, ...s.entries],
          invoices: [...s.invoices, invoiceFor(e)],
          orders: s.orders.map((x) => (x.id === o.id ? { ...x, status: "paid", paid_at: now, professional_fee_paise: pro - discountPaise } : x)),
        }));
        return { ok: true, value: { discountPaise } };
      },

      request: (slug, details) => {
        const o: ServiceOrder = {
          id: uid("ord"),
          reference: nextRef(),
          user_id: ME,
          service_slug: slug,
          status: "submitted",
          government_fee_paise: null,
          professional_fee_paise: null,
          details: details.trim() || null,
          admin_notes: null,
          quoted_at: null,
          paid_at: null,
          completed_at: null,
          created_at: new Date().toISOString(),
        };
        setState((s) => ({ ...s, orders: [o, ...s.orders] }));
        return { ok: true, value: o };
      },

      sendMessage: (orderId, body) => {
        const t = body.trim();
        if (!t) return { ok: false, error: "Write something first." };
        if (t.length > 4000) return { ok: false, error: "Keep it under 4,000 characters." };
        const m: OrderMessage = { id: uid("msg"), order_id: orderId, author_id: ME, from_staff: false, body: t, read_at: null, created_at: new Date().toISOString() };
        setState((s) => ({ ...s, messages: [...s.messages, m] }));
        return { ok: true, value: undefined };
      },

      markRead: (ids) => setState((s) => ({ ...s, read: Array.from(new Set([...s.read, ...ids])) })),

      addUpload: (u) => {
        const up: Upload = { ...u, id: uid("up"), created_at: new Date().toISOString() };
        setState((s) => ({ ...s, uploads: [up, ...s.uploads] }));
        return up;
      },
      removeUpload: (id) => setState((s) => ({ ...s, uploads: s.uploads.filter((u) => u.id !== id) })),

      subscribe: (planId, period) => {
        const plan = plans.find((p) => p.id === planId);
        if (!plan || plan.monthlyPaise == null || !membershipFor(planId)) return { ok: false, error: "That plan is not available." };
        /* The fee is charged THROUGH the wallet like any other debit, so one
           statement explains every movement — lib/subscription.ts. */
        const price = priceFor(plan.monthlyPaise, period);
        if (price.totalPaise > balance) return { ok: false, error: `${plan.name} costs ${rupees(price.totalPaise)} including GST. Add ${rupees(price.totalPaise - balance)} to your wallet first.` };
        const now = new Date();
        const end = new Date(now);
        end.setMonth(end.getMonth() + (period === "annual" ? 12 : 1));
        const e: WalletEntry = {
          id: uid("we"),
          direction: "debit",
          amount_paise: price.totalPaise,
          reason: `${plan.name} membership · ${period === "annual" ? "12 months" : "1 month"}`,
          created_at: now.toISOString(),
          gateway_payment_id: null,
          order_id: null,
        };
        setState((s) => ({
          ...s,
          entries: [e, ...s.entries],
          invoices: [...s.invoices, invoiceFor(e)],
          subscription: { planId, period, status: "active", currentPeriodEnd: end.toISOString(), cancelledAt: null },
        }));
        return { ok: true, value: undefined };
      },
      /* Cancelling stops the renewal and keeps the benefit to the end of the
         period already paid for. No phone call, no retention maze. */
      cancelSubscription: () =>
        setState((s) => (s.subscription ? { ...s, subscription: { ...s.subscription, status: "cancelling", cancelledAt: new Date().toISOString() } } : s)),

      toggleWishlist: (slug) =>
        setState((s) => ({ ...s, wishlist: s.wishlist.includes(slug) ? s.wishlist.filter((x) => x !== slug) : [...s.wishlist, slug] })),

      reset: () => {
        const fresh = seed();
        setState((s) => ({ ...fresh, profile: { ...fresh.profile, fullName: s.profile.fullName, onboarded: s.profile.onboarded, photoUri: s.profile.photoUri } }));
      },
    }),
    [status, state, balance, notices, unread, load],
  );

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside StoreProvider");
  return s;
}

/** Is the customer a member right now, and on what? */
export function useMembership() {
  const { state } = useStore();
  const sub = state.subscription;
  const entitled = !!sub && (sub.status === "active" || sub.status === "cancelling");
  const plan = entitled ? plans.find((p) => p.id === sub!.planId) ?? null : null;
  const benefit = entitled ? membershipFor(sub!.planId) ?? null : null;
  return { sub, entitled, plan, benefit };
}
