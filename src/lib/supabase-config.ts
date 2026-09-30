/**
 * lawfic.pro's Supabase project — the same one the website uses.
 *
 * These are the PUBLIC values: the project URL and the anon key, exactly what
 * every visitor's browser already receives from lawfic.pro. The anon key can
 * only do what row-level security allows a signed-in customer to do with
 * their own rows. The service-role key never comes near the app.
 */
export const SUPABASE_URL = "https://rxonbipcrcuqwukinbne.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4b25iaXBjcmN1cXd1a2luYm5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4OTQ5MzUsImV4cCI6MjEwMzQ3MDkzNX0.3wTHvwW3_z9IWGoKKntgbEgUtezG3L0ZQ-7-H0swGYQ";

/** The website, for the routes that must run server-side (payments, uploads). */
export const SITE_URL = "https://lawfic.pro";
