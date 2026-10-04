import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useLayout } from "@/components/AppWidth";
import { Bars, Donut } from "@/components/Charts";
import { useStore } from "@/lib/store";
import { useWalletHidden } from "@/lib/lock";
import { rupees } from "@/lib/format";
import { serviceName } from "@/data/catalogue";
import { Bar, EmptyState, Reveal, Screen, Segmented, Surface, T } from "@/ui";
import { color as C, space, themed, perTheme } from "@/theme";

const SHADES = perTheme(() => ([C.gold, C.goldLight, "#8F6E32", "#6F6D68", "#A8A6A0", "#4A4640"]));
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Insights — where the wallet's money went, worked out from the wallet itself.
 * Every figure is a sum of entries in the statement; nothing is estimated,
 * projected or compared with anybody else.
 */
export default function Insights() {
  const router = useRouter();
  const layout = useLayout();
  const { state } = useStore();
  const hidden = useWalletHidden() || state.prefs.hideBalance;
  const [range, setRange] = useState<"30" | "180">("30");

  const debits = useMemo(() => {
    const since = Date.now() - Number(range) * 864e5;
    return state.entries.filter((e) => e.direction === "debit" && new Date(e.created_at).getTime() >= since);
  }, [state.entries, range]);
  const credits = state.entries.filter((e) => e.direction === "credit" && Date.now() - new Date(e.created_at).getTime() < Number(range) * 864e5);

  const by = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of debits) {
      const o = e.order_id ? state.orders.find((x) => x.id === e.order_id) : null;
      const k = o ? serviceName(o.service_slug) : e.reason.split(" · ")[0]!;
      m.set(k, (m.get(k) ?? 0) + e.amount_paise);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [debits, state.orders]);
  const spent = debits.reduce((s, e) => s + e.amount_paise, 0);
  const added = credits.reduce((s, e) => s + e.amount_paise, 0);

  const months = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const v = state.entries
        .filter((e) => e.direction === "debit")
        .filter((e) => {
          const t = new Date(e.created_at);
          return t.getFullYear() === d.getFullYear() && t.getMonth() === d.getMonth();
        })
        .reduce((s, e) => s + e.amount_paise, 0);
      return { label: MONTHS[d.getMonth()]!, value: v, current: i === 5 };
    });
  }, [state.entries]);

  const wide = layout !== "compact";

  return (
    <Screen back title="Insights" kicker="Your spending" subtitle="Worked out from your wallet statement — nothing estimated.">
      <View style={{ maxWidth: 360, marginBottom: space.xl }}>
        <Segmented
          value={range}
          onChange={setRange}
          options={[
            { id: "30", label: "30 days" },
            { id: "180", label: "6 months" },
          ]}
        />
      </View>

      {debits.length === 0 ? (
        <EmptyState icon="chart" title="No spending in this period" body="Pay for a filing and it will be broken down here." cta="Start a filing" onCta={() => router.push("/services")} />
      ) : (
        <View style={wide ? { flexDirection: "row", gap: space.xxxl, alignItems: "flex-start" } : { gap: space.xl }}>
          <View style={{ flex: 1, gap: space.lg }}>
            <Reveal fade style={{ alignItems: "center", paddingVertical: space.lg }}>
              <Donut key={range} segments={by.map(([, v], i) => ({ value: v, color: SHADES[i % SHADES.length]! }))} centerLabel="Spent" centerValue={hidden ? "₹ •••" : rupees(spent)} size={196} stroke={16} />
            </Reveal>
            <Reveal i={1} style={{ flexDirection: "row", gap: space.md }}>
              <Surface style={{ flex: 1 }}>
                <T v="label">Spent</T>
                <T v="title3" num style={{ marginTop: 4 }}>
                  {hidden ? "₹ •••" : rupees(spent)}
                </T>
              </Surface>
              <Surface style={{ flex: 1 }}>
                <T v="label">Added</T>
                <T v="title3" num color={C.green} style={{ marginTop: 4 }}>
                  {hidden ? "₹ •••" : rupees(added)}
                </T>
              </Surface>
            </Reveal>
          </View>
          <View style={{ flex: 1.2, gap: space.xl }}>
            <Reveal i={2}>
              <Surface padded={false}>
                <View style={{ padding: space.lg, paddingBottom: 0 }}>
                  <T v="headline">By service</T>
                </View>
                {by.map(([k, v], i) => (
                  <View key={k} style={[styles.row, i > 0 && styles.rule]}>
                    <View style={[styles.swatch, { backgroundColor: SHADES[i % SHADES.length] }]} />
                    <View style={{ flex: 1, gap: 8 }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <T v="calloutMedium" numberOfLines={1} style={{ flex: 1 }}>
                          {k}
                        </T>
                        <T v="calloutMedium" num>
                          {hidden ? "₹ •••" : rupees(v)}
                        </T>
                      </View>
                      <Bar value={v / Math.max(1, spent)} tone={SHADES[i % SHADES.length]} delay={200 + i * 80} />
                    </View>
                  </View>
                ))}
              </Surface>
            </Reveal>
            <Reveal i={3}>
              <Surface style={{ padding: space.xl }}>
                <T v="headline" style={{ marginBottom: space.lg }}>
                  Month by month
                </T>
                <Bars data={months} height={110} />
              </Surface>
            </Reveal>
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = themed(() => ({
  row: { flexDirection: "row", alignItems: "center", gap: space.md, paddingHorizontal: space.lg, paddingVertical: 14 },
  rule: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.line },
  swatch: { width: 10, height: 10, borderRadius: 3 },
}));
