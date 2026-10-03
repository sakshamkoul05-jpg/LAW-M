import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { SITE_URL } from "./supabase-config";
import { isAlreadyConfirmed, signUpWasDeclinedAsDuplicate } from "@/lawfic/auth-signals";

/**
 * Accounts — the same LAWFIC accounts as the website.
 *
 * Sign-in is the website's: email and password, and a new account confirms its
 * address with the code Supabase emails (see OTP_LENGTH). An account made in the app
 * signs in on lawfic.pro and the other way round, and both see the same
 * filings, wallet and messages, because both read the same rows.
 *
 * DEMO stays available for anybody who wants to look around first. It runs on
 * sample data on the phone and never touches the backend; the two modes never
 * mix, so a demo balance cannot appear in a real account.
 */
export type Mode = "live" | "demo" | "none";

type Result = { ok: true } | { ok: false; error: string };

type Auth = {
  ready: boolean;
  mode: Mode;
  session: Session | null;
  email: string | null;
  userId: string | null;
  signIn: (email: string, password: string) => Promise<Result>;
  /** Creates the account; the customer then enters the emailed code. */
  signUp: (email: string, password: string) => Promise<Result | { ok: true; alreadyConfirmed: true }>;
  verifyCode: (email: string, code: string) => Promise<Result>;
  resendCode: (email: string) => Promise<Result>;
  resetPassword: (email: string) => Promise<Result>;
  signOut: () => Promise<void>;
  enterDemo: () => void;
  leaveDemo: () => void;
};

const Ctx = createContext<Auth | null>(null);
const DEMO_KEY = "lawfic:mode";

/** The website's wording for Supabase's errors (app/login/LoginForm.tsx). */
function readable(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "That email and password do not match an account.";
  if (m.includes("already registered") || m.includes("already been registered")) return "That email already has an account. Sign in instead.";
  if (m.includes("email not confirmed")) return "Confirm your email first — enter the code we sent, or ask for a new one.";
  if (m.includes("password should be")) return "Use at least 8 characters for your password.";
  if (m.includes("token has expired") || m.includes("invalid token") || m.includes("otp_expired"))
    return "That code is wrong or has expired. Ask for a new one and use the newest email.";
  if (m.includes("for security purposes")) return "That was too quick after the last one. Wait a moment and try again.";
  if (m.includes("rate limit") || m.includes("error sending") || m.includes("smtp") || m.includes("confirmation email"))
    return "We could not send the email just now. Try again in a few minutes.";
  if (m.includes("network") || m.includes("fetch")) return "No connection. Check your network and try again.";
  return "Something went wrong. Please try again.";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([supabase.auth.getSession(), AsyncStorage.getItem(DEMO_KEY).catch(() => null)]).then(([{ data }, d]) => {
      if (!alive) return;
      setSession(data.session);
      setDemo(d === "demo");
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<Result> => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    return error ? { ok: false, error: readable(error.message) } : { ok: true };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { emailRedirectTo: `${SITE_URL}/auth/callback?next=/profile/setup` },
    });
    if (error) return { ok: false as const, error: readable(error.message) };
    /* Supabase answers a sign-up for an existing, confirmed email with a user
       that has no identities rather than an error — the website checks for it
       the same way, so the customer is told to sign in instead of waiting for a
       code that will never come. */
    if (data.user && signUpWasDeclinedAsDuplicate(data.user)) return { ok: true as const, alreadyConfirmed: true as const };
    return { ok: true as const };
  }, []);

  const verifyCode = useCallback(async (email: string, code: string): Promise<Result> => {
    const { error } = await supabase.auth.verifyOtp({ email: email.trim().toLowerCase(), token: code.trim(), type: "signup" });
    return error ? { ok: false, error: readable(error.message) } : { ok: true };
  }, []);

  const resendCode = useCallback(async (email: string): Promise<Result> => {
    const { error } = await supabase.auth.resend({ type: "signup", email: email.trim().toLowerCase() });
    if (error && isAlreadyConfirmed(error.message)) return { ok: false, error: "That email is already confirmed. Sign in instead." };
    return error ? { ok: false, error: readable(error.message) } : { ok: true };
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<Result> => {
    /* The reset link opens lawfic.pro, where the new password is set — the same
       page a website customer uses. */
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: `${SITE_URL}/auth/callback?next=/auth/reset` });
    return error ? { ok: false, error: readable(error.message) } : { ok: true };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut().catch(() => {});
    setDemo(false);
    AsyncStorage.removeItem(DEMO_KEY).catch(() => {});
  }, []);

  const enterDemo = useCallback(() => {
    setDemo(true);
    AsyncStorage.setItem(DEMO_KEY, "demo").catch(() => {});
  }, []);
  const leaveDemo = useCallback(() => {
    setDemo(false);
    AsyncStorage.removeItem(DEMO_KEY).catch(() => {});
  }, []);

  const mode: Mode = session ? "live" : demo ? "demo" : "none";

  const value = useMemo(
    () => ({
      ready,
      mode,
      session,
      email: session?.user.email ?? null,
      userId: session?.user.id ?? null,
      signIn,
      signUp,
      verifyCode,
      resendCode,
      resetPassword,
      signOut,
      enterDemo,
      leaveDemo,
    }),
    [ready, mode, session, signIn, signUp, verifyCode, resendCode, resetPassword, signOut, enterDemo, leaveDemo],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): Auth {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth outside AuthProvider");
  return v;
}
