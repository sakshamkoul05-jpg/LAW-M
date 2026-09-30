import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { plans, PRICING_IS_PROVISIONAL, type Plan } from "@/lawfic/pricing";
import { autopayable, cancellation, membershipFor, priceFor, type BillingPeriod } from "@/lawfic/subscription";
import { Icon } from "@/icons/Icon";
import { useAppWidth, useLayout } from "@/components/AppWidth";
import { useMembership, useStore } from "@/lib/store";
import { useLock } from "@/lib/lock";
import { dateLong, rupees } from "@/lib/format";
import { Badge, Button, Reveal, Screen, Segmented, Sheet, Surface, T, useToast } from "@/ui";
import { color as C, elevation, font, radius as R, space } from "@/theme";

/**
 * Membership — the website's plans (lib/pricing.ts) and rules
 * (lib/subscription.ts), unchanged:
 *
 *   · a membership buys DISCOUNTS and INCLUDED WORK, never wallet rupees
 *   · the fee is charged through the wallet, so one statement explains it all
 *   · cancelling is one tap, stated before you join, not after you try to leave
 *
 * The prices are marked indicative on the website until LAWFIC signs them off,
 * and they are marked the same way here.
 */
export default function Membership() {
  const router = useRouter();
  const width = useAppWidth();
  const layout = useLayout();
  const toast = useToast();
  const lock = useLock();
  const { subscribe, cancelSubscription, balance } = useStore();
  const { entitled, sub, plan: current } = useMembership();
  const [period, setPeriod] = useState<BillingPeriod>("monthly");
  const [confirm, setConfirm] = useState<Plan | null>(null);
  const [cancel, setCancel] = useState(false);
  const wide = layout !== "compact";
  const cardW = wide ? 300 : Math.min(width - 56, 340);

  const join = async (p: Plan) => {
    if (lock.enabled && !lock.unlocked && !(await lock.unlock())) return false;
    const r = subscribe(p.id, period);
    if (!r.ok) {
      toast({ title: "Not joined", body: r.error, tone: "bad" });
      return false;
    }
    setTimeout(() => setConfirm(null), 900);
    toast({ title: `Welcome to ${p.name}`, body: "Your discount applies to the next quote you pay.", tone: "gold", icon: "crown" });
    return true;
  };

  return (
    <Screen back title="Membership" kicker="Plans" subtitle="Pay per filing, or join a plan for a discount on every filing and the standing benefits that come with it.">
      {entitled && sub && current && (
        <Reveal fade>
          <Surface tone="gold" raised style={{ padding: space.xl, marginBottom: space.xl }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
              <Icon name="crown" size={22} color={C.gold} />
              <View style={{ flex: 1 }}>
                <T v="title3">You are on {current.name}</T>
                <T v="caption" tone="dim">
                  {sub.status === "cancelling" ? `Renewal cancelled — benefits stay until ${dateLong(sub.currentPeriodEnd)}` : `Renews ${dateLong(sub.currentPeriodEnd)} · ${sub.period}`}
                </T>
              </View>
              <Badge label={`${membershipFor(current.id)?.discountPercent}% off`} tone="gold" />
            </View>
            {sub.status === "active" && <Button label="Cancel renewal" variant="secondary" size="md" onPress={() => setCancel(true)} style={{ marginTop: space.lg }} />}
          </Surface>
        </Reveal>
      )}

      <View style={{ maxWidth: 440, marginBottom: space.xl }}>
        <Segmented<BillingPeriod>
          value={period}
          onChange={setPeriod}
          options={[
            { id: "monthly", label: "Monthly" },
            { id: "annual", label: "Annual · 2 free" },
          ]}
        />
      </View>

      <ScrollView
        horizontal={!wide}
        showsHorizontalScrollIndicator={false}
        snapToInterval={wide ? undefined : cardW + space.md}
        decelerationRate="fast"
        contentContainerStyle={wide ? styles.grid : { gap: space.md, paddingRight: space.xl, paddingVertical: 6 }}
        style={!wide && { marginHorizontal: -space.xl, paddingLeft: space.xl }}
        scrollEnabled={!wide}
      >
        {plans.map((p, i) => {
          const price = p.monthlyPaise != null ? priceFor(p.monthlyPaise, period) : null;
          const m = membershipFor(p.id);
          const mine = entitled ? current?.id === p.id : p.id === "per-filing";
          return (
            <Reveal key={p.id} i={i} style={{ width: cardW }}>
              <View style={[styles.card, p.featured && styles.featured, p.featured && elevation.gold]}>
                {p.featured && <LinearGradient colors={["rgba(198,161,91,0.14)", "rgba(198,161,91,0)"]} style={StyleSheet.absoluteFill} />}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <T v="title3" style={{ flex: 1 }}>
                    {p.name}
                  </T>
                  {mine ? <Badge label="Current" tone="good" icon="check" /> : p.featured ? <Badge label="Most chosen" tone="gold" /> : null}
                </View>
                <T v="caption" style={{ marginTop: 4, minHeight: 34 }} numberOfLines={2}>
                  {p.tagline}
                </T>
                <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 6, marginTop: space.lg }}>
                  <T num style={{ fontFamily: font.bold, fontSize: 32, letterSpacing: -1, color: C.text }}>
                    {price ? rupees(period === "annual" ? price.feePaise : p.monthlyPaise!) : "₹0"}
                  </T>
                  <T v="caption" style={{ marginBottom: 6 }}>
                    {price ? (period === "annual" ? "a year + GST" : "a month + GST") : p.priceNote}
                  </T>
                </View>
                {price && period === "annual" && price.savingPaise > 0 && (
                  <T v="captionMedium" tone="gold" num>
                    Save {rupees(price.savingPaise)} against monthly
                  </T>
                )}
                {m && m.discountPercent > 0 && (
                  <View style={styles.discount}>
                    <Icon name="percent" size={14} color={C.gold} />
                    <T v="calloutMedium">{m.discountPercent}% off every filing</T>
                  </View>
                )}
                <View style={{ gap: 9, marginTop: space.lg }}>
                  {p.includes.slice(0, 5).map((t) => (
                    <View key={t} style={{ flexDirection: "row", gap: 8 }}>
                      <Icon name="check" size={14} color={C.gold} strokeWidth={2.2} />
                      <T v="caption" tone="dim" style={{ flex: 1 }}>
                        {t}
                      </T>
                    </View>
                  ))}
                </View>
                <T v="micro" style={{ marginTop: space.md }}>
                  Best for: {p.bestFor}
                </T>
                <View style={{ flex: 1 }} />
                <View style={{ marginTop: space.xl }}>
                  {mine ? (
                    <Button label={p.id === "per-filing" ? "Browse services" : "Your plan"} variant="secondary" size="md" onPress={() => (p.id === "per-filing" ? router.push("/services") : undefined)} disabled={p.id !== "per-filing"} />
                  ) : p.monthlyPaise == null ? (
                    <Button label="Stay on pay per filing" variant="ghost" size="md" disabled />
                  ) : (
                    <Button label={`Join ${p.name}`} variant={p.featured ? "primary" : "secondary"} size="md" onPress={() => setConfirm(p)} />
                  )}
                </View>
              </View>
            </Reveal>
          );
        })}
      </ScrollView>

      <Reveal style={{ marginTop: space.section }}>
        <Surface style={{ padding: space.xl }}>
          <T v="headline">{cancellation.heading}</T>
          <View style={{ gap: space.md, marginTop: space.lg }}>
            {cancellation.points.map((t) => (
              <View key={t} style={{ flexDirection: "row", gap: space.md }}>
                <View style={styles.bullet} />
                <T v="callout" style={{ flex: 1 }}>
                  {t}
                </T>
              </View>
            ))}
          </View>
        </Surface>
        {PRICING_IS_PROVISIONAL && (
          <T v="caption" style={{ marginTop: space.md, marginHorizontal: 4 }}>
            Prices are indicative and may change before launch. The government fee is never inside a plan price — it is always passed through at cost, on its own line.
          </T>
        )}
      </Reveal>

      <Sheet open={!!confirm} onClose={() => setConfirm(null)} title={confirm ? `Join ${confirm.name}` : ""} subtitle="Charged from your LAWFiC wallet, like any other payment.">
        {confirm &&
          confirm.monthlyPaise != null &&
          (() => {
            const price = priceFor(confirm.monthlyPaise, period);
            return (
              <View style={{ gap: space.lg }}>
                <Surface padded={false}>
                  <Line k={`${confirm.name} · ${period === "annual" ? "12 months" : "1 month"}`} v={rupees(price.feePaise)} />
                  <Line k="GST @ 18%" v={rupees(price.gstPaise)} />
                  <Line k="Total from wallet" v={rupees(price.totalPaise)} strong />
                </Surface>
                <T v="caption">
                  {autopayable(confirm.monthlyPaise, period)
                    ? "Renews automatically at the same price. Cancel in one tap, any time."
                    : "An annual plan over ₹15,000 is taken as one authenticated payment, not a standing instruction — you will be asked before each renewal."}{" "}
                  Wallet balance {rupees(balance)}. Preview: no money moves.
                </T>
                {price.totalPaise > balance ? (
                  <Button label={`Add ${rupees(price.totalPaise - balance)} first`} icon="plus" onPress={() => { setConfirm(null); router.push(`/wallet/add?amount=${Math.ceil((price.totalPaise - balance) / 100)}`); }} />
                ) : (
                  <Button label={`Pay ${rupees(price.totalPaise)} and join`} icon={lock.enabled ? "faceid" : "crown"} successLabel="Joined" onPress={() => join(confirm)} />
                )}
              </View>
            );
          })()}
      </Sheet>

      <Sheet open={cancel} onClose={() => setCancel(false)} title="Cancel renewal?" subtitle={sub ? `Your benefits stay on until ${dateLong(sub.currentPeriodEnd)}. Nothing else changes.` : undefined}>
        <View style={{ gap: space.sm }}>
          <Button
            label="Cancel renewal"
            variant="danger"
            onPress={() => {
              cancelSubscription();
              setCancel(false);
              toast({ title: "Renewal cancelled", body: "No further charges. Your benefits run to the end of the period." });
            }}
          />
          <Button label="Keep my membership" variant="ghost" onPress={() => setCancel(false)} />
        </View>
      </Sheet>
    </Screen>
  );
}

function Line({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <View style={styles.line}>
      <T v={strong ? "headline" : "callout"} tone={strong ? "text" : "dim"} style={{ flex: 1 }}>
        {k}
      </T>
      <T v={strong ? "headline" : "calloutMedium"} num>
        {v}
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: space.md },
  card: { flex: 1, minHeight: 470, padding: space.xl, borderRadius: R.xl, backgroundColor: C.surfaceHigh, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line, overflow: "hidden" },
  featured: { borderColor: C.gold, borderWidth: 1 },
  discount: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: space.md, paddingHorizontal: 12, height: 34, borderRadius: 10, backgroundColor: C.goldWash, alignSelf: "flex-start" },
  bullet: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.gold, marginTop: 8 },
  line: { flexDirection: "row", alignItems: "center", paddingHorizontal: space.lg, paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.line },
});
