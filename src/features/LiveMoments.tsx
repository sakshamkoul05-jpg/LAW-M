import { useEffect } from "react";
import { STATUS_META } from "@/lawfic/orders";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { serviceName } from "@/data/catalogue";
import { rupees } from "@/lib/format";
import { buzz, useToast } from "@/ui";

/**
 * Live moments.
 *
 * When the LAWFIC team quotes a filing, files it, completes it, or replies —
 * or when Cashfree's payment lands — the database changes, and the app hears
 * about it the same second. This turns those events into something you feel:
 * a haptic, a toast, and (for money) the wallet pass catching the light.
 *
 * Nothing is shown for changes the customer made themselves a moment ago in
 * this app (their own payment, their own message), because telling somebody
 * what they just did is noise.
 */
export function LiveMoments() {
  const { onLive, state } = useStore();
  const { userId } = useAuth();
  const toast = useToast();

  useEffect(
    () =>
      onLive((e) => {
        if (e.kind === "credit") {
          buzz("success");
          toast({ title: `${rupees(e.entry.amount_paise)} added to your wallet`, body: e.entry.reason, tone: "gold", icon: "wallet" });
        } else if (e.kind === "order" && e.previous && e.previous !== e.order.status) {
          const meta = STATUS_META[e.order.status];
          buzz(e.order.status === "completed" ? "success" : "light");
          toast({
            title: `${serviceName(e.order.service_slug)} · ${meta.label}`,
            body: meta.blurb,
            tone: e.order.status === "rejected" ? "bad" : e.order.status === "completed" ? "good" : "gold",
            icon: e.order.status === "quoted" ? "bolt" : e.order.status === "completed" ? "checkCircle" : "filings",
          });
        } else if (e.kind === "message" && e.message.from_staff && e.message.author_id !== userId) {
          const o = state.orders.find((x) => x.id === e.message.order_id);
          buzz("light");
          toast({ title: `New message${o ? ` · ${serviceName(o.service_slug)}` : ""}`, body: e.message.body.slice(0, 90), tone: "info", icon: "chat" });
        }
      }),
    [onLive, toast, userId, state.orders],
  );

  return null;
}
