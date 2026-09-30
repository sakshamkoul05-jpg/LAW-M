import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { ServiceOrder } from "@/lawfic/orders";
import type { OrderMessage } from "@/lawfic/messages";
import type { WalletEntry } from "@/lawfic/wallet-entries";
import type { Invoice } from "@/lawfic/invoice";
import type { Subscription } from "@/lawfic/subscription";
import { supabase, accessToken } from "./supabase";
import { SITE_URL } from "./supabase-config";

/**
 * The live backend — lawfic.pro's own tables and functions.
 *
 * Every read here is the same query the website runs, and every write is the
 * same database function: pay_order_from_wallet, post_order_message,
 * mark_order_messages_read, cancel_my_subscription. The rules those functions
 * enforce (balance guard, only-your-own-order, one message per call) are the
 * database's, so the app cannot do anything the website would refuse.
 *
 * The two things that must run on a server — creating a Cashfree order and
 * reconciling a payment — go through the website's own routes with the
 * customer's token (see lib/app-access.ts on the website).
 */

export type Remote = {
  profile: { fullName: string; phone: string; city: string; qualification: string; examsPreparing: string[]; jobsLooking: string[] };
  entries: WalletEntry[];
  invoices: (Invoice & { entry_id: string })[];
  orders: ServiceOrder[];
  messages: OrderMessage[];
  subscription: Subscription | null;
  balance: number | null;
};

export type R<T = void> = { ok: true; value: T } | { ok: false; error: string; code?: string };

export async function fetchAll(userId: string): Promise<R<Remote>> {
  const [prof, entries, invoices, orders, sub, bal] = await Promise.all([
    supabase.from("user_profiles").select("full_name, phone, city, qualification, exams_preparing, jobs_looking").eq("user_id", userId).maybeSingle(),
    supabase.from("wallet_entries").select("id, direction, amount_paise, reason, created_at, gateway_payment_id, order_id").eq("user_id", userId).order("created_at", { ascending: false }).limit(200),
    supabase.from("invoices").select("id, number, kind, issued_at, total_paise, taxable_paise, tax_paise, tax_rate_bp, narration, wallet_entry_id").eq("user_id", userId).order("issued_at", { ascending: false }).limit(200),
    supabase.from("service_orders").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("my_subscription").select("plan_id, billing_period, status, period_end, cancelled_at").maybeSingle(),
    supabase.rpc("my_wallet_balance"),
  ]);

  const failed = [entries, orders].find((r) => r.error);
  if (failed?.error) return { ok: false, error: "Could not load your account. Check your connection and try again.", code: failed.error.code };

  const orderRows = (orders.data ?? []) as ServiceOrder[];
  let messages: OrderMessage[] = [];
  if (orderRows.length) {
    const m = await supabase.from("order_messages").select("*").in("order_id", orderRows.map((o) => o.id)).order("created_at", { ascending: true });
    messages = (m.data ?? []) as OrderMessage[];
  }

  const p = prof.data as null | { full_name: string; phone: string | null; city: string | null; qualification: string | null; exams_preparing: string[] | null; jobs_looking: string[] | null };
  const s = sub.data as null | { plan_id: string; billing_period: "monthly" | "annual"; status: Subscription["status"]; period_end: string; cancelled_at: string | null };

  return {
    ok: true,
    value: {
      profile: {
        fullName: p?.full_name ?? "",
        phone: p?.phone ?? "",
        city: p?.city ?? "",
        qualification: p?.qualification ?? "",
        examsPreparing: p?.exams_preparing ?? [],
        jobsLooking: p?.jobs_looking ?? [],
      },
      entries: (entries.data ?? []) as WalletEntry[],
      invoices: ((invoices.data ?? []) as (Invoice & { wallet_entry_id: string })[]).map((i) => ({ ...i, entry_id: i.wallet_entry_id })),
      orders: orderRows,
      messages,
      subscription: s ? { planId: s.plan_id, period: s.billing_period, status: s.status, currentPeriodEnd: s.period_end, cancelledAt: s.cancelled_at } : null,
      balance: typeof bal.data === "number" ? bal.data : null,
    },
  };
}

/* ── writes: the website's own functions ───────────────────────────────── */

export async function requestFiling(userId: string, slug: string, details: string): Promise<R<ServiceOrder>> {
  const { data, error } = await supabase
    .from("service_orders")
    .insert({ user_id: userId, service_slug: slug, details: details.trim().slice(0, 4000) || null })
    .select("*")
    .single();
  if (error || !data) return { ok: false, error: "Could not start that filing. Try again." };
  return { ok: true, value: data as ServiceOrder };
}

export async function payOrder(orderId: string): Promise<R> {
  const { error } = await supabase.rpc("pay_order_from_wallet", { p_order_id: orderId });
  if (!error) return { ok: true, value: undefined };
  if (error.code === "23514" || /insufficient/i.test(error.message)) return { ok: false, error: "Your wallet does not have enough for this. Add money and try again." };
  if (error.code === "22023") return { ok: false, error: "This filing is not awaiting payment." };
  return { ok: false, error: "Could not take the payment. Nothing has been charged." };
}

export async function postMessage(orderId: string, body: string): Promise<R> {
  const { error } = await supabase.rpc("post_order_message", { p_order_id: orderId, p_body: body.trim() });
  if (!error) return { ok: true, value: undefined };
  return { ok: false, error: error.code === "42501" ? "You cannot post on this filing." : "That did not send. Try again in a moment." };
}

export async function markMessagesRead(orderId: string): Promise<void> {
  try {
    await supabase.rpc("mark_order_messages_read", { p_order_id: orderId });
  } catch {
    /* A read receipt is not worth an error. */
  }
}

export async function cancelSubscription(): Promise<R> {
  const { error } = await supabase.rpc("cancel_my_subscription");
  return error ? { ok: false, error: "Could not cancel just now. Try again." } : { ok: true, value: undefined };
}

export async function saveProfile(userId: string, p: Remote["profile"]): Promise<R> {
  const { error } = await supabase.from("user_profiles").upsert(
    {
      user_id: userId,
      full_name: p.fullName.trim(),
      phone: p.phone,
      city: p.city,
      qualification: p.qualification,
      exams_preparing: p.examsPreparing,
      jobs_looking: p.jobsLooking,
    },
    { onConflict: "user_id" },
  );
  return error ? { ok: false, error: "Could not save your profile. Try again." } : { ok: true, value: undefined };
}

/* ── money in: Cashfree, through the website ───────────────────────────── */

async function site(path: string, body: unknown): Promise<{ status: number; data: Record<string, unknown> }> {
  const token = await accessToken();
  const res = await fetch(`${SITE_URL}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  let data: Record<string, unknown> = {};
  try {
    data = (await res.json()) as Record<string, unknown>;
  } catch {
    /* an empty body is fine */
  }
  return { status: res.status, data };
}

export type TopUpStart = R<{ orderId: string }> & { needsPhone?: boolean };

/**
 * Starts a real top-up: the website creates the Cashfree order (and records
 * the intent first, as it always does), and the app opens Cashfree's secure
 * checkout in an in-app browser. Card and UPI details go to Cashfree, never to
 * LAWFIC or the app. The wallet is credited by the webhook, or by `reconcile`.
 */
export async function startTopUp(rupees: number, phone?: string): Promise<TopUpStart> {
  let r: Awaited<ReturnType<typeof site>>;
  try {
    r = await site("/api/wallet/topup", { rupees, ...(phone ? { phone } : {}), returnTo: "app" });
  } catch {
    return { ok: false, error: Platform.OS === "web" ? "This web preview could not reach lawfic.pro. The installed app can." : "No connection. Check your network and try again." };
  }
  const d = r.data;
  if (r.status === 422 && d.error === "phone_required") return { ok: false, error: String(d.message ?? "A mobile number is needed for the payment receipt."), needsPhone: true };
  if (r.status === 401) return { ok: false, error: "Sign in again to add money." };
  if (r.status === 503) return { ok: false, error: "Online payments are not switched on yet. Please try again later." };
  if (r.status === 400) return { ok: false, error: String(d.message ?? "That amount cannot be added.") };
  if (r.status >= 300 || typeof d.paymentSessionId !== "string" || typeof d.orderId !== "string") return { ok: false, error: "Could not start the payment. Nothing has been charged." };

  const url = `${SITE_URL}/app-checkout?s=${encodeURIComponent(d.paymentSessionId)}&m=${d.mode === "production" ? "production" : "sandbox"}`;
  try {
    if (Platform.OS === "web") await WebBrowser.openBrowserAsync(url);
    else await WebBrowser.openAuthSessionAsync(url, "lawfic://wallet");
  } catch {
    return { ok: false, error: "The payment page could not open." };
  }
  return { ok: true, value: { orderId: d.orderId } };
}

/** Asks the website to settle a payment with Cashfree. Safe to call repeatedly. */
export async function reconcile(orderId: string): Promise<"credited" | "pending" | "unknown"> {
  try {
    const r = await site("/api/wallet/reconcile", { orderId });
    if (r.status === 200 && r.data.ok) return "credited";
    if (r.status === 404) return "unknown";
    return "pending";
  } catch {
    return "pending";
  }
}

/* ── live updates ──────────────────────────────────────────────────────── */

export type LiveEvent =
  | { kind: "credit"; entry: WalletEntry }
  | { kind: "debit"; entry: WalletEntry }
  | { kind: "order"; order: ServiceOrder; previous?: ServiceOrder["status"] }
  | { kind: "message"; message: OrderMessage };

/**
 * Subscribes to the customer's own rows changing — money arriving, a filing
 * moving on, the team replying — so the app updates the moment the back office
 * does something, with no pull-to-refresh. RLS applies to these events as it
 * does to queries. If realtime is not enabled for a table on the project, the
 * subscription simply stays quiet and the app refreshes on focus instead.
 */
export function subscribeLive(userId: string, onEvent: (e: LiveEvent) => void): () => void {
  const ch: RealtimeChannel = supabase
    .channel(`lawfic-app:${userId}`)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "wallet_entries", filter: `user_id=eq.${userId}` }, (p) => {
      const entry = p.new as WalletEntry;
      onEvent({ kind: entry.direction === "credit" ? "credit" : "debit", entry });
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "service_orders", filter: `user_id=eq.${userId}` }, (p) => {
      onEvent({ kind: "order", order: p.new as ServiceOrder, previous: (p.old as Partial<ServiceOrder> | null)?.status });
    })
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "order_messages" }, (p) => {
      onEvent({ kind: "message", message: p.new as OrderMessage });
    })
    .subscribe();
  return () => {
    supabase.removeChannel(ch).catch(() => {});
  };
}
