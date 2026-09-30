import React, { useEffect, useMemo, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Icon, type IconName } from "@/icons/Icon";
import { useAppWidth, useLayout } from "@/components/AppWidth";
import { useStore, useMembership } from "@/lib/store";
import { useLock } from "@/lib/lock";
import { rupees } from "@/lib/format";
import { orderTotalPaise } from "@/lawfic/orders";
import { serviceName } from "@/data/catalogue";
import { TransactionList, TransactionSheet } from "@/features/money";
import { exportStatement } from "@/features/statement";
import { Pass } from "@/wallet/Pass";
import { usePassData } from "@/wallet/usePassData";
import { Button, EmptyState, IconButton, Press, Reveal, Screen, SectionHeader, Segmented, Sheet, SkeletonList, Surface, T } from "@/ui";
import { color as C, radius as R, space } from "@/theme";
import type { WalletEntry } from "@/lawfic/wallet-entries";

type Filter = "all" | "in" | "out";

/**
 * The wallet — Payments, in the spec's words.
 *
 * A closed-loop wallet: money goes in by UPI, card or net banking, and comes
 * out only to pay for LAWFIC's work. It cannot send money to another person or
 * be withdrawn as cash, and that is not a missing feature — it is the basis on
 * which LAWFIC can run a wallet without a payments licence. The screen says so
 * plainly, once.
 */
export default function Wallet() {
  const router = useRouter();
  const params = useLocalSearchParams<{ entry?: string; statement?: string }>();
  const width = useAppWidth();
  const layout = useLayout();
  const { state, status, balance, setPrefs, mode, refresh } = useStore();
  const lock = useLock();
  const { entitled, plan } = useMembership();
  const pass = usePassData();
  const [filter, setFilter] = useState<Filter>("all");
  const [entry, setEntry] = useState<WalletEntry | null>(null);
  const [statement, setStatement] = useState(params.statement === "1");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (params.entry) setEntry(state.entries.find((e) => e.id === params.entry) ?? null);
  }, [params.entry]); // eslint-disable-line react-hooks/exhaustive-deps

  const locked = lock.enabled && !lock.unlocked;
  const hidden = pass.hidden;
  const wide = layout !== "compact";
  const railW = layout === "expanded" ? 232 : layout === "medium" ? 76 : 0;
  const passW = Math.min(wide ? 460 : width - 40, (width - railW) - (wide ? 64 : 40));

  const entries = useMemo(
    () => state.entries.filter((e) => (filter === "all" ? true : filter === "in" ? e.direction === "credit" : e.direction === "debit")),
    [state.entries, filter],
  );
  const quotes = state.orders.filter((o) => o.status === "quoted");
  const monthIn = state.entries.filter((e) => e.direction === "credit" && Date.now() - new Date(e.created_at).getTime() < 30 * 864e5).reduce((s, e) => s + e.amount_paise, 0);
  const monthOut = state.entries.filter((e) => e.direction === "debit" && Date.now() - new Date(e.created_at).getTime() < 30 * 864e5).reduce((s, e) => s + e.amount_paise, 0);

  const actions: { icon: IconName; label: string; onPress: () => void; gold?: boolean }[] = [
    { icon: "plus", label: "Add money", onPress: () => router.push("/wallet/add"), gold: true },
    { icon: "bolt", label: quotes.length ? `Pay quote${quotes.length > 1 ? "s" : ""}` : "Pay a filing", onPress: () => (quotes[0] ? router.push(`/filing/${quotes[0].id}`) : router.push("/filings")) },
    { icon: "statement", label: "Statement", onPress: () => setStatement(true) },
    { icon: "chart", label: "Insights", onPress: () => router.push("/insights") },
  ];

  const hero = (
    <View style={{ alignItems: wide ? "flex-start" : "center" }}>
      <View>
        <Pass kind="wallet" width={passW} data={pass} />
        {locked && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={[StyleSheet.absoluteFill, styles.lock]}>
            {Platform.OS !== "android" && <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />}
            <View style={styles.lockInner}>
              <Icon name="faceid" size={30} color={C.gold} />
              <T v="headline" style={{ marginTop: space.md }}>
                Wallet locked
              </T>
              <Button label={`Unlock with ${lock.label}`} size="md" full={false} onPress={() => lock.unlock()} style={{ marginTop: space.md }} />
            </View>
          </Animated.View>
        )}
      </View>
    </View>
  );

  return (
    <Screen
      back
      onRefresh={async () => {
        setRefreshing(true);
        await refresh();
        setRefreshing(false);
      }}
      refreshing={refreshing}
      title="Wallet"
      right={
        <IconButton
          icon={state.prefs.hideBalance ? "eye" : "eyeOff"}
          label={state.prefs.hideBalance ? "Show balance" : "Hide balance"}
          onPress={() => setPrefs({ hideBalance: !state.prefs.hideBalance })}
        />
      }
    >
      <View style={wide ? { flexDirection: "row", gap: space.xxxl, alignItems: "flex-start" } : { gap: space.xl }}>
        <View style={[{ gap: space.xl }, wide && { width: passW }]}>
          <Reveal fade>{hero}</Reveal>

          <Reveal i={1} style={styles.actions}>
            {actions.map((a) => (
              <Press key={a.label} onPress={a.onPress} radius={R.lg} accessibilityLabel={a.label} style={styles.action}>
                <View style={[styles.actionIcon, a.gold && { backgroundColor: C.gold, borderColor: C.gold }]}>
                  <Icon name={a.icon} size={20} color={a.gold ? C.ink : C.gold} strokeWidth={1.8} />
                </View>
                <T v="captionMedium" tone="dim" numberOfLines={1}>
                  {a.label}
                </T>
              </Press>
            ))}
          </Reveal>

          <Reveal i={2} style={{ flexDirection: "row", gap: space.md }}>
            <Surface style={{ flex: 1 }}>
              <T v="label">In · 30 days</T>
              <T v="title3" num color={C.green} style={{ marginTop: 4 }}>
                {hidden ? "₹ •••" : rupees(monthIn)}
              </T>
            </Surface>
            <Surface style={{ flex: 1 }}>
              <T v="label">Out · 30 days</T>
              <T v="title3" num style={{ marginTop: 4 }}>
                {hidden ? "₹ •••" : rupees(monthOut)}
              </T>
            </Surface>
          </Reveal>

          {quotes.map((q) => (
            <Reveal key={q.id} i={3}>
              <Press onPress={() => router.push(`/filing/${q.id}`)} radius={R.lg} accessibilityLabel={`Pay ${serviceName(q.service_slug)}`} style={styles.quote}>
                <Icon name="bolt" size={18} color={C.gold} />
                <View style={{ flex: 1 }}>
                  <T v="calloutMedium">{serviceName(q.service_slug)}</T>
                  <T v="caption" tone="dim">
                    Quote ready · {rupees(orderTotalPaise(q))}
                  </T>
                </View>
                <T v="calloutMedium" tone="gold">
                  Pay
                </T>
              </Press>
            </Reveal>
          ))}

          <Reveal i={4}>
            <Press onPress={() => router.push("/membership")} radius={R.lg} accessibilityLabel="Membership" style={styles.strip}>
              <Icon name="crown" size={18} color={C.gold} />
              <T v="callout" tone="dim" style={{ flex: 1 }}>
                {entitled ? `${plan?.name} member — your discount comes off LAWFIC's fee automatically.` : "Members save 5–18% on LAWFIC's fee for every filing."}
              </T>
              <Icon name="chevron" size={15} color={C.textMuted} />
            </Press>
          </Reveal>

          <Reveal i={5}>
            <View style={styles.note}>
              <Icon name="shield" size={16} color={C.textMuted} />
              <T v="caption" style={{ flex: 1 }}>
                A closed wallet. It pays for LAWFIC services and takes refunds back — it cannot send money to another person or be withdrawn as cash.
              </T>
            </View>
          </Reveal>
        </View>

        <View style={{ flex: 1, marginTop: wide ? 0 : space.lg }}>
          <SectionHeader kicker={`${state.entries.length} movements`} title="History" />
          <View style={{ marginBottom: space.lg }}>
            <Segmented<Filter>
              value={filter}
              onChange={setFilter}
              options={[
                { id: "all", label: "All" },
                { id: "in", label: "Money in" },
                { id: "out", label: "Money out" },
              ]}
            />
          </View>
          {status === "loading" ? (
            <SkeletonList rows={5} />
          ) : entries.length === 0 ? (
            <EmptyState compact icon="rupee" title="Nothing here yet" body={filter === "in" ? "Top-ups and refunds will show here." : "Payments for filings will show here."} cta={filter === "in" ? "Add money" : undefined} onCta={() => router.push("/wallet/add")} />
          ) : (
            <View key={filter}>
              <TransactionList entries={entries} hidden={hidden} onOpen={setEntry} />
            </View>
          )}
        </View>
      </View>

      <TransactionSheet entry={entry} onClose={() => setEntry(null)} />

      <Sheet open={statement} onClose={() => setStatement(false)} title="Wallet statement" subtitle={`${state.entries.length} movements · closing balance ${hidden ? "hidden" : rupees(balance)}`}>
        <View style={{ gap: space.md }}>
          <T v="callout">
            {Platform.OS === "web"
              ? "Downloads as a spreadsheet (CSV), oldest first, in the same columns as the statement on lawfic.pro."
              : "Opens as a PDF you can save to Files, or send by WhatsApp or mail."}
          </T>
          <Button
            label={Platform.OS === "web" ? "Download CSV" : "Save as PDF"}
            icon="download"
            successLabel="Ready"
            onPress={async () => {
              if (locked && !(await lock.unlock())) return false;
              const ok = await exportStatement(state.entries, state.profile.fullName, mode === "demo");
              if (ok) setTimeout(() => setStatement(false), 900);
              return ok;
            }}
          />
        </View>
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  lock: { borderRadius: 24, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  lockInner: { alignItems: "center", padding: space.xl, backgroundColor: "rgba(5,5,5,0.55)", ...StyleSheet.absoluteFillObject, justifyContent: "center" },
  actions: { flexDirection: "row", gap: space.sm },
  action: { flex: 1, alignItems: "center", gap: 8, paddingVertical: space.md, borderRadius: R.lg, backgroundColor: C.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line },
  actionIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: C.goldWash, borderWidth: StyleSheet.hairlineWidth, borderColor: C.goldLine },
  quote: { flexDirection: "row", alignItems: "center", gap: space.md, padding: space.lg, borderRadius: R.lg, backgroundColor: "#15120C", borderWidth: StyleSheet.hairlineWidth, borderColor: C.goldLine },
  strip: { flexDirection: "row", alignItems: "center", gap: space.md, padding: space.lg, borderRadius: R.lg, backgroundColor: C.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line },
  note: { flexDirection: "row", gap: space.md, paddingHorizontal: 4 },
});
