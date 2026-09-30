import "react-native-url-polyfill/auto";
import { AppState, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./supabase-config";

/**
 * The app's Supabase client — the same project, the same tables, the same
 * row-level security as lawfic.pro.
 *
 * The session (access + refresh token) is kept in AsyncStorage on the phone,
 * so a customer stays signed in between launches, and is refreshed while the
 * app is in the foreground. Nothing here can see another customer's rows:
 * every query runs as the signed-in user under the website's RLS policies.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/* Refresh the session only while the app is visible — Supabase's guidance for
   React Native, where timers do not run reliably in the background. */
if (Platform.OS !== "web") {
  AppState.addEventListener("change", (state) => {
    if (state === "active") supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}

/** The current access token, for the website routes that run server-side. */
export async function accessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
