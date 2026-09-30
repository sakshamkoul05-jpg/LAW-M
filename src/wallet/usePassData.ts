import { useMemo } from "react";
import { isActive, useMembership, useStore } from "@/lib/store";
import { useLock } from "@/lib/lock";
import type { PassData } from "./Pass";

/** Everything the passes show, from the store and the lock. */
export function usePassData(): PassData {
  const { state, balance } = useStore();
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
    }),
    [balance, state, lock.enabled, lock.unlocked, plan, benefit],
  );
}
