import { Platform } from "react-native";
import { fetch as expoFetch } from "expo/fetch";

/**
 * Panda AI — the same assistant as the website, on the same endpoint.
 *
 * The app does not carry a model key and never will: a key inside an app
 * binary is a key published to anyone who unzips it. It calls lawfic.pro's
 * /api/panda, which holds the key server-side, applies the site's rules and
 * rate limit, and streams the answer back as plain text.
 *
 * WEB NEEDS THE WEBSITE'S PERMISSION
 *
 * A native app can call any HTTPS endpoint. The browser preview on
 * law-m.vercel.app is a different origin, so it only works once lawfic.pro's
 * route sends CORS headers for it. Until then the browser refuses the call and
 * the chat says so plainly, rather than pretending to answer.
 */
export const PANDA_URL = "https://lawfic.pro/api/panda";

export type Turn = { role: "user" | "assistant"; content: string };

export type PandaError = "not_configured" | "rate_limited" | "offline" | "blocked" | "upstream" | "aborted";

export const PANDA_ERROR_COPY: Record<PandaError, string> = {
  not_configured: "Panda AI is switched off on the server right now. The team has been told — WhatsApp or call us in the meantime.",
  rate_limited: "That is a lot of questions in a few minutes. Give it a moment and ask again.",
  offline: "No connection. Check your network and try again.",
  blocked: "This web preview is not yet allowed to reach Panda AI. It works in the installed app, and here once lawfic.pro allows it.",
  upstream: "Something went wrong on our side. Please try again.",
  aborted: "Stopped.",
};

/** Keep the last 16 turns and at most 2,000 characters each — the route's own limits. */
function trim(history: Turn[]): Turn[] {
  return history
    .filter((t) => t.content.trim())
    .slice(-16)
    .map((t) => ({ role: t.role, content: t.content.slice(0, 2000) }));
}

export async function askPanda(
  history: Turn[],
  onDelta: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<{ ok: true } | { ok: false; error: PandaError }> {
  const f = (Platform.OS === "web" ? globalThis.fetch : expoFetch) as typeof globalThis.fetch;
  let res: Response;
  try {
    res = await f(PANDA_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: trim(history) }),
      signal,
    });
  } catch (e) {
    if (signal?.aborted) return { ok: false, error: "aborted" };
    /* A CORS refusal and a dead network look identical from here: a TypeError
       with no response. On web, while online, it is almost always CORS. */
    const online = Platform.OS !== "web" || (typeof navigator !== "undefined" && navigator.onLine);
    return { ok: false, error: Platform.OS === "web" && online ? "blocked" : "offline" };
  }

  if (res.status === 503) return { ok: false, error: "not_configured" };
  if (res.status === 429) return { ok: false, error: "rate_limited" };
  if (!res.ok) return { ok: false, error: "upstream" };

  const reader = res.body?.getReader?.();
  if (!reader) {
    onDelta(await res.text());
    return { ok: true };
  }
  const decoder = new TextDecoder();
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) onDelta(decoder.decode(value, { stream: true }));
    }
  } catch {
    if (signal?.aborted) return { ok: false, error: "aborted" };
    return { ok: false, error: "upstream" };
  }
  return { ok: true };
}

/**
 * The route answers with site paths ("see /services/gst"). In the app those
 * should open the matching screen, so paths the app has are mapped here and
 * the rest open on lawfic.pro.
 */
export function appPathFor(sitePath: string): string | null {
  const p = sitePath.replace(/[).,]+$/, "");
  if (p === "/services") return "/services";
  if (p.startsWith("/services/")) return `/service/${p.slice("/services/".length)}`;
  if (p === "/wallet" || p === "/wallet/topup") return p === "/wallet" ? "/wallet" : "/wallet/add";
  if (p === "/pricing") return "/membership";
  if (p === "/orders") return "/filings";
  if (p === "/document") return "/documents";
  if (p.startsWith("/document/")) return `/service/${p.slice("/document/".length)}`;
  if (p === "/contact" || p === "/instant-help") return "/support";
  if (p === "/profile") return "/profile";
  if (p === "/reviews") return "/reviews";
  return null;
}
