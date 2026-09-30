import { useEffect, useMemo, useState } from "react";
import { isActive, useMembership, useStore } from "@/lib/store";
import { useLock } from "@/lib/lock";
import type { PassData } from "./Pass";

/** Everything the passes show, from the store and the lock. */
export function usePassData(): PassData {
  const { state, balance, onLive } = useStore();
  const [flash, setFlash] = useState(0);
  useEffect(() => onLive((e) => e.kind === "credit" && setFlash((n) => n + 1)), [onLive]);
  const lock = useLock();
  const { plan, benefit } = useMembership();
  return useMemo(
    () => ({
      balancePaise: balance,
      hidden: state.prefs.hideBalance || (lock.enabled && !lock.unlocked),
      active: state.orders.filter(isActive).length,
      awaiting: state.orders.filter((o) => o.status === "quoted").length,
      documents: state.invoices.length + state.uploads.length,
      verified: state.invoices.length,
      secured: lock.enabled,
      plan: plan?.name ?? null,
      discount: benefit?.discountPercent ?? null,
      holder: state.profile.fullName || null,
      flash,
    }),
    [balance, state, lock.enabled, lock.unlocked, plan, benefit, flash],
  );
}
