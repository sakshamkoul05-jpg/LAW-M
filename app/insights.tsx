import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Glass, Segmented, T } from "@/components/ui";
import { Money, rupees } from "@/components/Money";
import { Screen, StackHeader } from "@/components/Screen";
import { Bars, Donut } from "@/components/Charts";
import { useWalletHidden } from "@/lib/lock";
import { color as C, radius, space, text } from "@/theme";
import { monthly, spendByCategory, transactions } from "@/data/sample";

/**
 * Where it went. The Revolut analytics screen, for a wallet that only buys
 * filings: spend by service this month, and the last six months side by side.
 * Credits are not counted as spend — adding money is not spending it.
 */
export default function Insights() {
  const hidden = useWalletHidden();
  const [range, setRange] = useState<"month" | "six">("month");
  const spend = spendByCategory(transactions);
  const added = transactions.filter((t) => t.paise > 0).reduce((s, t) => s + t.paise, 0);

  return (
    <Screen aurora="violet" auroraHeight={440} tabbed={false}>
      <StackHeader title="Insights" />
      <View style={[styles.pad, { gap: space.xl }]}>
        <Segmented value={range} onChange={setRange} options={[{ id: "month", label: "This month" }, { id: "six", label: "6 months" }]} />

        {range === "month" ? (
          <Animated.View entering={FadeInDown.duration(380)} style={{ alignItems: "center" }}>
            <Donut size={220} stroke={22} segments={spend.rows.map((r) => ({ value: r.value, color: r.color }))} centerLabel="Spent" centerValue={hidden ? "••••" : rupees(spend.total)} />
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.duration(380)}>
            <Glass style={{ borderRadius: radius.xl }}>
              <T.Label style={{ marginBottom: space.lg }}>Spend per month</T.Label>
              <Bars data={monthly} height={140} />
            </Glass>
          </Animated.View>
        )}

        <View style={{ flexDirection: "row", gap: space.md }}>
          <Glass style={{ flex: 1, borderRadius: radius.lg }}>
            <T.Label>Spent</T.Label>
            <Text style={[text.title, { color: C.text, marginTop: 6 }]}>{hidden ? "••••" : rupees(spend.total)}</Text>
          </Glass>
          <Glass style={{ flex: 1, borderRadius: radius.lg }}>
            <T.Label>Added</T.Label>
            <Text style={[text.title, { color: C.green, marginTop: 6 }]}>{hidden ? "••••" : rupees(added)}</Text>
          </Glass>
        </View>

        <View>
          <T.Heading style={{ marginBottom: space.md }}>By service</T.Heading>
          <Glass padded={false} style={{ borderRadius: radius.xl }}>
            {spend.rows.map((r, i) => (
              <View key={r.label} style={[styles.row, i > 0 && styles.rule]}>
                <View style={[styles.swatch, { backgroundColor: r.color }]} />
                <View style={{ flex: 1 }}>
                  <T.Sub>{r.label}</T.Sub>
                  <View style={styles.track}>
                    <View style={{ width: `${(r.value / Math.max(1, spend.total)) * 100}%`, height: "100%", backgroundColor: r.color, borderRadius: 3 }} />
                  </View>
                </View>
                {hidden ? <T.Sub tone={C.textFaint}>••••</T.Sub> : <Money paise={-r.value} size={15} />}
              </View>
            ))}
          </Glass>
        </View>

        <T.Tiny style={{ textAlign: "center" }}>Worked out from the sample statement. Months shown as placeholders.</T.Tiny>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: space.lg },
  row: { flexDirection: "row", alignItems: "center", gap: space.md, padding: space.lg },
  rule: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.hairline },
  swatch: { width: 10, height: 36, borderRadius: 5 },
  track: { height: 5, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.06)", marginTop: 8, overflow: "hidden" },
});
