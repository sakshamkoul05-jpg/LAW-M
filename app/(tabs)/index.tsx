import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Icon, type IconName } from "@/icons/Icon";
import { useDevice } from "@/components/AppWidth";
import { FlyerCarousel } from "@/components/FlyerCarousel";
import { isActive, useStore } from "@/lib/store";
import { ago, firstName, greeting, rupees } from "@/lib/format";
import { STATUS_META, orderTotalPaise, timelineIndex, TIMELINE } from "@/lawfic/orders";
import { feePaise, iconFor, liveServices, serviceName } from "@/data/catalogue";
import { nextStep } from "@/features/filings";
import { TransactionItem, TransactionSheet } from "@/features/money";
import { Pass } from "@/wallet/Pass";
import { usePassData } from "@/wallet/usePassData";
import { Avatar, Divider, IconButton, IconTile, Logo, Panda, Press, Reveal, Screen, Skeleton, SkeletonCard, StepBar, T } from "@/ui";
import { color as C, font, radius as R, space } from "@/theme";
import type { WalletEntry } from "@/lawfic/wallet-entries";

const ASKS = ["Do I need GST to sell online?", "What does Udyam cost?", "My PAN name is wrong"];

/**
 * Home.
 *
 * Classy is mostly restraint. One object leads — the wallet — and everything
 * under it is arranged by how likely it is to be why you opened the app:
 * money, then Panda, then the one thing waiting on you (only if there is one),
 * then what LAWFIC is doing for you, then what you might start next.
 *
 * Sections are titled in plain sentence case, not shouted in caps; there is
 * one gold action on the screen; and there is more space between sections than
 * inside them, which is what makes a screen read as composed rather than full.
 */
export default function Home() {
  const router = useRouter();
  const { width, short } = useDevice();
  const { state, status, unread } = useStore();
  const pass = usePassData();
  const [entry, setEntry] = useState<WalletEntry | null>(null);

  const side = width < 360 ? space.lg : space.xl;
  const inner = Math.min(width, 560) - side * 2;
  const name = firstName(state.profile.fullName);
  const active = state.orders.filter(isActive);
  const quote = state.orders.find((o) => o.status === "quoted");
  const sections = state.prefs.homeSections;
  const gap = short ? space.xxl : space.xxxl;
  const cardW = Math.min(inner * 0.86, 300);

  const header = (
    <Reveal fade style={styles.header}>
      <Press onPress={() => router.push("/profile")} radius={22} lift={false} accessibilityLabel="Your profile">
        <Avatar name={state.profile.fullName} uri={state.profile.photoUri} size={42} ring />
      </Press>
      <View style={{ flex: 1 }}>
        <T v="caption" tone="dim">
          {greeting()}
        </T>
        <T v="headline" numberOfLines={1}>
          {name ?? "Welcome to LAWFIC"}
        </T>
      </View>
      <IconButton icon="bell" label={`Notifications${unread ? `, ${unread} unread` : ""}`} badge={unread || false} onPress={() => router.push("/notifications")} />
    </Reveal>
  );

  if (status === "loading") {
    return (
      <Screen tabbed header={header}>
        <SkeletonCard height={Math.round(inner / 1.586)} />
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: space.xl }}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} w={56} h={56} r={28} />
          ))}
        </View>
        <Skeleton h={56} r={28} style={{ marginTop: space.xxl }} />
      </Screen>
    );
  }

  const actions: { icon: IconName; label: string; onPress: () => void; gold?: boolean }[] = [
    { icon: "plus", label: "Add money", onPress: () => router.push("/wallet/add"), gold: true },
    { icon: "bolt", label: "Pay", onPress: () => router.push(quote ? `/filing/${quote.id}` : "/wallet") },
    { icon: "vault", label: "Documents", onPress: () => router.push("/documents") },
    { icon: "services", label: "Services", onPress: () => router.push("/services") },
  ];

  return (
    <Screen tabbed header={header}>
      {/* The wallet */}
      <Reveal i={0} style={{ alignItems: "center" }}>
        <Pass kind="wallet" width={inner} data={pass} onPress={() => router.push("/wallet")} />
      </Reveal>

      <Reveal i={1} style={styles.actions}>
        {actions.map((a) => (
          <Press key={a.label} onPress={a.onPress} radius={30} lift={false} accessibilityLabel={a.label} style={styles.action}>
            <View style={[styles.actionIcon, a.gold && styles.actionGold]}>
              <Icon name={a.icon} size={21} color={a.gold ? C.ink : C.text} strokeWidth={1.7} />
            </View>
            <T v="captionMedium" tone="dim" numberOfLines={1}>
              {a.label}
            </T>
          </Press>
        ))}
      </Reveal>

      {/* Panda */}
      <Reveal i={2} style={{ marginTop: gap }}>
        <Press onPress={() => router.push("/ai")} radius={30} accessibilityLabel="Ask Panda" style={styles.ask}>
          <Panda size={38} />
          <View style={{ flex: 1 }}>
            <T v="calloutMedium">Ask Panda</T>
            <T v="caption" numberOfLines={1}>
              Which filing you need, what it costs, what to keep ready
            </T>
          </View>
          <View style={styles.askGo}>
            <Icon name="arrowUpRight" size={16} color={C.gold} strokeWidth={2} />
          </View>
        </Press>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: space.md, marginHorizontal: -side }} contentContainerStyle={{ gap: space.sm, paddingHorizontal: side }}>
          {ASKS.map((q) => (
            <Press key={q} onPress={() => router.push({ pathname: "/ai", params: { q } })} radius={18} haptic="select" accessibilityLabel={q} style={styles.chip}>
              <T v="captionMedium" tone="dim">
                {q}
              </T>
            </Press>
          ))}
        </ScrollView>
      </Reveal>

      {/* The one thing waiting on you */}
      {quote && (
        <Reveal i={3} style={{ marginTop: gap }}>
          <Press onPress={() => router.push(`/filing/${quote.id}`)} radius={R.xl} accessibilityLabel={`Pay ${serviceName(quote.service_slug)}`} style={styles.attention}>
            <View style={styles.attentionBar} />
            <View style={{ flex: 1 }}>
              <T v="label" tone="gold" style={{ fontSize: 10 }}>
                Waiting on you
              </T>
              <T v="bodyMedium" style={{ marginTop: 4 }}>
                {serviceName(quote.service_slug)} is priced
              </T>
              <T v="caption" tone="dim" num>
                {rupees(orderTotalPaise(quote))} · work starts when you pay
              </T>
            </View>
            <View style={styles.payPill}>
              <T v="captionMedium" color={C.ink} style={{ fontFamily: font.semibold }}>
                Pay
              </T>
            </View>
          </Press>
        </Reveal>
      )}

      {/* In progress */}
      <Reveal i={4} style={{ marginTop: gap }}>
        <Head title="In progress" action={active.length ? "All filings" : undefined} onAction={() => router.push("/filings")} />
        {active.length === 0 ? (
          <Press onPress={() => router.push("/services")} radius={R.xl} accessibilityLabel="Start a filing" style={styles.empty}>
            <IconTile icon="filings" gold size={38} />
            <View style={{ flex: 1 }}>
              <T v="calloutMedium">Nothing in progress</T>
              <T v="caption">Start a filing — you owe nothing until we quote.</T>
            </View>
            <Icon name="chevron" size={16} color={C.textMuted} />
          </Press>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={cardW + space.md} decelerationRate="fast" style={{ marginHorizontal: -side }} contentContainerStyle={{ gap: space.md, paddingHorizontal: side }}>
            {active.map((o) => {
              const next = nextStep(o);
              return (
                <Press key={o.id} onPress={() => router.push(`/filing/${o.id}`)} radius={R.xl} accessibilityLabel={`${serviceName(o.service_slug)}, ${STATUS_META[o.status].label}`} style={[styles.filing, { width: cardW }]}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
                    <IconTile icon={iconFor(o.service_slug)} size={36} gold={next.yours} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <T v="calloutMedium" numberOfLines={1}>
                        {serviceName(o.service_slug)}
                      </T>
                      <T v="caption" num>
                        {o.reference} · {ago(o.quoted_at ?? o.created_at)}
                      </T>
                    </View>
                  </View>
                  <View style={{ marginTop: space.lg }}>
                    <StepBar steps={TIMELINE.length} current={timelineIndex(o.status)} />
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: space.md, gap: space.sm }}>
                    <T v="captionMedium" color={next.yours ? C.goldLight : C.text} numberOfLines={1} style={{ flex: 1 }}>
                      {STATUS_META[o.status].label}
                    </T>
                    <T v="caption" num>
                      Step {timelineIndex(o.status) + 1} of {TIMELINE.length}
                    </T>
                  </View>
                  <T v="caption" numberOfLines={1} style={{ marginTop: 2 }}>
                    {next.text}
                  </T>
                </Press>
              );
            })}
          </ScrollView>
        )}
      </Reveal>

      {/* From LAWFIC */}
      {sections.promotions && (
        <Reveal i={5} style={{ marginTop: gap }}>
          <Head title="From LAWFIC" />
          <View style={{ marginHorizontal: -side }}>
            <FlyerCarousel width={Math.min(width, 560)} inset={side} onOpen={(f) => router.push(`/service/${f.slug}`)} />
          </View>
        </Reveal>
      )}

      {/* Start something */}
      {sections.services && (
        <Reveal i={6} style={{ marginTop: gap }}>
          <Head title="Start today" action="All 39" onAction={() => router.push("/services")} />
          <View style={styles.group}>
            {liveServices.map((s, i) => (
              <View key={s.slug}>
                {i > 0 && <Divider inset={66} />}
                <Press onPress={() => router.push(`/service/${s.slug}`)} radius={0} scaleTo={0.99} accessibilityLabel={s.name} style={styles.svc}>
                  <IconTile icon={iconFor(s.slug)} size={38} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <T v="bodyMedium" numberOfLines={1}>
                      {s.name}
                    </T>
                    <T v="caption" numberOfLines={1}>
                      {s.turnaround}
                    </T>
                  </View>
                  <T v="calloutMedium" num>
                    {feePaise(s.slug) ? rupees(feePaise(s.slug)!) : "Quoted"}
                  </T>
                  <Icon name="chevron" size={15} color={C.textMuted} />
                </Press>
              </View>
            ))}
          </View>
        </Reveal>
      )}

      {/* Recent activity */}
      {sections.activity && state.entries.length > 0 && (
        <Reveal i={7} style={{ marginTop: gap }}>
          <Head title="Recent activity" action="Wallet" onAction={() => router.push("/wallet")} />
          <View style={styles.group}>
            {state.entries.slice(0, 3).map((e, i) => (
              <View key={e.id}>
                {i > 0 && <Divider inset={64} />}
                <TransactionItem entry={e} hidden={pass.hidden} onPress={() => setEntry(e)} />
              </View>
            ))}
          </View>
        </Reveal>
      )}

      {/* Sign-off */}
      <View style={styles.signoff}>
        <Logo size={96} />
      </View>

      <TransactionSheet entry={entry} onClose={() => setEntry(null)} />
    </Screen>
  );
}

function Head({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.head}>
      <T v="title3">{title}</T>
      {action && onAction && (
        <Press onPress={onAction} radius={10} haptic="select" accessibilityLabel={action} hitSlop={8} style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
          <T v="calloutMedium" tone="gold">
            {action}
          </T>
          <Icon name="chevron" size={14} color={C.gold} />
        </Press>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: space.md, marginBottom: space.xl },
  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: space.xl, paddingHorizontal: space.xs },
  action: { alignItems: "center", gap: 8, width: 76 },
  actionIcon: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", backgroundColor: C.surfaceHigh, borderWidth: StyleSheet.hairlineWidth, borderColor: C.lineStrong },
  actionGold: { backgroundColor: C.gold, borderColor: C.gold, shadowColor: C.gold, shadowOpacity: 0.3, shadowRadius: 14, shadowOffset: { width: 0, height: 4 } },
  ask: { flexDirection: "row", alignItems: "center", gap: space.md, paddingVertical: 10, paddingLeft: 10, paddingRight: 12, borderRadius: 30, backgroundColor: C.surfaceHigh, borderWidth: StyleSheet.hairlineWidth, borderColor: C.goldLine },
  askGo: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: C.goldWash },
  chip: { height: 34, paddingHorizontal: 14, borderRadius: 17, justifyContent: "center", backgroundColor: C.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line },
  attention: { flexDirection: "row", alignItems: "center", gap: space.md, padding: space.lg, paddingLeft: space.lg + 4, borderRadius: R.xl, backgroundColor: C.surfaceHigh, borderWidth: StyleSheet.hairlineWidth, borderColor: C.goldLine, overflow: "hidden" },
  attentionBar: { position: "absolute", left: 0, top: 0, bottom: 0, width: 3, backgroundColor: C.gold },
  payPill: { height: 34, paddingHorizontal: 18, borderRadius: 17, backgroundColor: C.gold, alignItems: "center", justifyContent: "center" },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: space.md },
  empty: { flexDirection: "row", alignItems: "center", gap: space.md, padding: space.lg, borderRadius: R.xl, backgroundColor: C.surfaceHigh, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line },
  filing: { padding: space.lg, borderRadius: R.xl, backgroundColor: C.surfaceHigh, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line },
  group: { borderRadius: R.xl, backgroundColor: C.surfaceHigh, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line, overflow: "hidden" },
  svc: { flexDirection: "row", alignItems: "center", gap: space.md, paddingHorizontal: space.lg, paddingVertical: 13 },
  signoff: { alignItems: "center", marginTop: space.hero, marginBottom: space.lg, opacity: 0.8 },
});
