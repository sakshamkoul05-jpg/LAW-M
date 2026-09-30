import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Icon, type IconName } from "@/icons/Icon";
import { useAppWidth, useLayout } from "@/components/AppWidth";
import { FlyerCarousel } from "@/components/FlyerCarousel";
import { isActive, useStore } from "@/lib/store";
import { firstName, greeting, rupees } from "@/lib/format";
import { orderTotalPaise } from "@/lawfic/orders";
import { recommendedServiceSlugs } from "@/lawfic/profile";
import { feePaise, getService, iconFor, liveServices, serviceName } from "@/data/catalogue";
import { FilingCard } from "@/features/filings";
import { TransactionList, TransactionSheet } from "@/features/money";
import { PassCarousel } from "@/wallet/PassCarousel";
import { Pass, type PassKind } from "@/wallet/Pass";
import { usePassData } from "@/wallet/usePassData";
import { Avatar, IconButton, IconTile, Press, Reveal, Screen, SectionHeader, SkeletonCard, SkeletonList, T, Skeleton } from "@/ui";
import { color as C, font, radius as R, space } from "@/theme";
import type { WalletEntry } from "@/lawfic/wallet-entries";

/**
 * Home — the legal wallet.
 *
 * Not a dashboard of eight equal cards. One thing leads: the passes, which say
 * in a glance what you hold (money, filings in motion, documents, membership).
 * Under them, the one action that is YOURS to take, if there is one; then the
 * filings in motion; then everything else in descending order of "you probably
 * came here for this".
 *
 * Which of the lower sections appear is the customer's choice — the website's
 * "home.sections" preference, set from Profile.
 */
export default function Home() {
  const router = useRouter();
  const width = useAppWidth();
  const layout = useLayout();
  const wide = layout !== "compact";
  const { state, status, unread } = useStore();
  const pass = usePassData();
  const [entry, setEntry] = React.useState<WalletEntry | null>(null);

  const name = firstName(state.profile.fullName);
  const active = state.orders.filter(isActive);
  const quote = state.orders.find((o) => o.status === "quoted");
  const sections = state.prefs.homeSections;
  const forYou = recommendedServiceSlugs(state.profile).filter((s) => getService(s));

  const side = layout === "expanded" ? space.section : wide ? space.xxxl : space.xl;
  const column = Math.min(width - (wide ? (layout === "expanded" ? 232 : 76) : 0), 1180) - side * 2;

  const openPass = (k: PassKind) =>
    router.push(k === "wallet" ? "/wallet" : k === "filings" ? "/filings" : k === "vault" ? "/documents" : "/membership");

  const header = (
    <Reveal fade style={styles.header}>
      <Press onPress={() => router.push("/profile")} radius={22} accessibilityLabel="Your profile" lift={false}>
        <Avatar name={state.profile.fullName} uri={state.profile.photoUri} size={44} ring />
      </Press>
      <View style={{ flex: 1 }}>
        <T v="callout" tone="dim">
          {greeting()}
          {name ? `, ${name}` : ""}
        </T>
        <T v={wide ? "title1" : "title2"} accessibilityRole="header">
          Your Legal Wallet
        </T>
      </View>
      {!wide && <IconButton icon="bell" label={`Notifications${unread ? `, ${unread} unread` : ""}`} badge={unread || false} onPress={() => router.push("/notifications")} />}
    </Reveal>
  );

  const actions: { icon: IconName; label: string; href: string; gold?: boolean }[] = [
    { icon: "plus", label: "Add money", href: "/wallet/add", gold: true },
    { icon: "filings", label: "New filing", href: "/services" },
    { icon: "vault", label: "Documents", href: "/documents" },
    { icon: "chart", label: "Insights", href: "/insights" },
  ];

  const actionRow = (
    <View style={styles.actions}>
      {actions.map((a, i) => (
        <Reveal key={a.label} i={i + 2} style={{ flex: 1 }}>
          <Press onPress={() => router.push(a.href as never)} radius={R.lg} accessibilityLabel={a.label} style={styles.action}>
            <View style={[styles.actionIcon, a.gold && { backgroundColor: C.gold, borderColor: C.gold }]}>
              <Icon name={a.icon} size={20} color={a.gold ? C.ink : C.gold} strokeWidth={1.8} />
            </View>
            <T v="captionMedium" tone="dim" numberOfLines={1}>
              {a.label}
            </T>
          </Press>
        </Reveal>
      ))}
    </View>
  );

  const quoteBanner = quote && (
    <Reveal i={1}>
      <Press onPress={() => router.push(`/filing/${quote.id}`)} radius={R.lg} accessibilityLabel={`Quote ready for ${serviceName(quote.service_slug)}`} style={styles.quote}>
        <View style={styles.quoteIcon}>
          <Icon name="bolt" size={18} color={C.ink} strokeWidth={2} />
        </View>
        <View style={{ flex: 1 }}>
          <T v="calloutMedium">Your quote is ready</T>
          <T v="caption" tone="dim" numberOfLines={1}>
            {serviceName(quote.service_slug)} · {rupees(orderTotalPaise(quote))} · pay to start
          </T>
        </View>
        <T v="calloutMedium" tone="gold">
          Pay
        </T>
        <Icon name="chevron" size={16} color={C.gold} />
      </Press>
    </Reveal>
  );

  const filings = (
    <View>
      <SectionHeader kicker={`${active.length} in motion`} title="Your filings" action="All filings" onAction={() => router.push("/filings")} />
      {active.length === 0 ? (
        <Press onPress={() => router.push("/services")} radius={R.xl} accessibilityLabel="Start a filing" style={styles.emptyFiling}>
          <IconTile icon="filings" gold />
          <View style={{ flex: 1 }}>
            <T v="calloutMedium">No filings in motion</T>
            <T v="caption">Start one — you owe nothing until we quote.</T>
          </View>
          <Icon name="chevron" size={16} color={C.textMuted} />
        </Press>
      ) : (
        <View style={{ gap: space.md }}>
          {active.slice(0, wide ? 3 : 2).map((o, i) => (
            <Reveal key={o.id} i={i + 3}>
              <FilingCard order={o} featured={o.status === "quoted"} onPress={() => router.push(`/filing/${o.id}`)} />
            </Reveal>
          ))}
        </View>
      )}
    </View>
  );

  const services = sections.services && (
    <View>
      <SectionHeader kicker="Available now" title="Popular services" action="All 39" onAction={() => router.push("/services")} />
      <View style={styles.grid}>
        {liveServices.map((s, i) => (
          <Reveal key={s.slug} i={i} style={{ width: wide ? (column - space.md * 3) / 4 : (column - space.md) / 2 }}>
            <Press onPress={() => router.push(`/service/${s.slug}`)} radius={R.lg} accessibilityLabel={s.name} style={styles.svc}>
              <IconTile icon={iconFor(s.slug)} />
              <View style={{ marginTop: "auto" }}>
                <T v="calloutMedium" numberOfLines={2}>
                  {s.name}
                </T>
                <T v="caption" num style={{ marginTop: 3 }}>
                  {feePaise(s.slug) ? `From ${rupees(feePaise(s.slug)!)}` : "Quoted"} · {s.turnaround}
                </T>
              </View>
            </Press>
          </Reveal>
        ))}
      </View>
    </View>
  );

  const recommended = sections.forYou && forYou.length > 0 && (
    <View>
      <SectionHeader kicker="For you" title={state.profile.examsPreparing.length || state.profile.jobsLooking.length ? "Picked from your interests" : "Where most people start"} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.md }}>
        {forYou.map((slug) => {
          const s = getService(slug)!;
          return (
            <Press key={slug} onPress={() => router.push(`/service/${slug}`)} radius={R.lg} accessibilityLabel={s.name} style={styles.forYou}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
                <IconTile icon={iconFor(slug)} gold size={36} />
                <T v="calloutMedium" style={{ flex: 1 }} numberOfLines={1}>
                  {s.name}
                </T>
              </View>
              <T v="caption" numberOfLines={2} style={{ marginTop: space.md }}>
                {s.tagline}
              </T>
            </Press>
          );
        })}
      </ScrollView>
    </View>
  );

  const activity = sections.activity && (
    <View>
      <SectionHeader kicker="Wallet" title="Recent activity" action="Statement" onAction={() => router.push("/wallet")} />
      <TransactionList entries={state.entries} limit={4} hidden={pass.hidden} onOpen={setEntry} />
    </View>
  );

  const help = (
    <Reveal>
      <Press onPress={() => router.push("/ai")} radius={R.xl} accessibilityLabel="Ask LAWFiC AI" style={styles.ai}>
        <View style={styles.orb}>
          <Icon name="panda" size={20} color={C.gold} />
        </View>
        <View style={{ flex: 1 }}>
          <T v="label" tone="gold">
            Ask LAWFiC AI
          </T>
          <T v="calloutMedium" style={{ marginTop: 3 }}>
            “Do I need GST registration to sell online?”
          </T>
        </View>
        <Icon name="forward" size={18} color={C.textDim} />
      </Press>
    </Reveal>
  );

  if (status === "loading") {
    return (
      <Screen tabbed header={header}>
        <SkeletonCard height={210} />
        <View style={{ flexDirection: "row", gap: space.md, marginTop: space.xl }}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} h={76} r={R.lg} style={{ flex: 1 }} />
          ))}
        </View>
        <View style={{ marginTop: space.section }}>
          <SkeletonList rows={3} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen tabbed header={header}>
      {wide ? (
        <View style={{ gap: space.section }}>
          <View style={{ flexDirection: "row", gap: space.xxxl, alignItems: "flex-start" }}>
            <View style={{ width: Math.min(440, column * 0.44), gap: space.xl }}>
              <Reveal i={0}>
                <Pass kind="wallet" width={Math.min(440, column * 0.44)} data={pass} onPress={() => router.push("/wallet")} />
              </Reveal>
              {actionRow}
              <View style={{ flexDirection: "row", gap: space.md }}>
                {(["filings", "vault", "membership"] as PassKind[]).map((k) => (
                  <MiniPass key={k} kind={k} pass={pass} onPress={() => openPass(k)} />
                ))}
              </View>
            </View>
            <View style={{ flex: 1, gap: space.xl }}>
              {quoteBanner}
              {filings}
            </View>
          </View>
          {sections.promotions && <FlyerCarousel width={column} onOpen={(f) => router.push(`/service/${f.slug}`)} />}
          {services}
          <View style={{ flexDirection: "row", gap: space.xxxl }}>
            <View style={{ flex: 1.2 }}>{activity}</View>
            <View style={{ flex: 1, gap: space.xl }}>
              {recommended}
              {help}
            </View>
          </View>
        </View>
      ) : (
        <View style={{ gap: space.xxl }}>
          <View style={{ marginHorizontal: -side }}>
            <PassCarousel width={width} kinds={["wallet", "filings", "vault", "membership"]} data={pass} onOpen={openPass} />
          </View>
          {actionRow}
          {quoteBanner}
          <View style={{ marginTop: space.sm }}>{filings}</View>
          {sections.promotions && <FlyerCarousel width={column} onOpen={(f) => router.push(`/service/${f.slug}`)} />}
          {recommended}
          {services}
          {activity}
          {help}
        </View>
      )}
      <Animated.View entering={FadeInDown.delay(400)}>
        <T v="caption" center style={{ marginTop: space.section }}>
          Preview mode · sample data on this device · no payment is taken
        </T>
      </Animated.View>
      <TransactionSheet entry={entry} onClose={() => setEntry(null)} />
    </Screen>
  );
}

/** A small pass tile under the wallet on desktop. */
function MiniPass({ kind, pass, onPress }: { kind: PassKind; pass: ReturnType<typeof usePassData>; onPress: () => void }) {
  const meta =
    kind === "filings"
      ? { icon: "filings" as IconName, k: "Filings", v: `${pass.active} active` }
      : kind === "vault"
        ? { icon: "vault" as IconName, k: "Vault", v: `${pass.documents} documents` }
        : { icon: "crown" as IconName, k: "Membership", v: pass.plan ?? "Pay per filing" };
  return (
    <Press onPress={onPress} radius={R.lg} accessibilityLabel={meta.k} style={[styles.mini]}>
      <Icon name={meta.icon} size={18} color={C.gold} />
      <T v="label" style={{ marginTop: space.md }}>
        {meta.k}
      </T>
      <T v="calloutMedium" numberOfLines={1} style={{ fontFamily: font.semibold, marginTop: 2 }}>
        {meta.v}
      </T>
    </Press>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: space.md, marginBottom: space.xxl },
  actions: { flexDirection: "row", gap: space.sm },
  action: { alignItems: "center", gap: 8, paddingVertical: space.md, borderRadius: R.lg, backgroundColor: C.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.goldWash,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.goldLine,
  },
  quote: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    padding: space.md,
    paddingRight: space.lg,
    borderRadius: R.lg,
    backgroundColor: "#15120C",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.goldLine,
  },
  quoteIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: C.gold, alignItems: "center", justifyContent: "center" },
  emptyFiling: { flexDirection: "row", alignItems: "center", gap: space.md, padding: space.lg, borderRadius: R.xl, backgroundColor: C.surfaceHigh, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: space.md },
  svc: { height: 138, padding: space.lg, borderRadius: R.lg, backgroundColor: C.surfaceHigh, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line },
  forYou: { width: 250, padding: space.lg, borderRadius: R.lg, backgroundColor: C.surfaceHigh, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line },
  ai: { flexDirection: "row", alignItems: "center", gap: space.lg, padding: space.lg, borderRadius: R.xl, backgroundColor: C.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: C.goldLine },
  orb: { width: 48, height: 48, borderRadius: 24, backgroundColor: C.goldWash, borderWidth: 1, borderColor: C.goldLine, alignItems: "center", justifyContent: "center" },
  mini: { flex: 1, padding: space.md, borderRadius: R.lg, backgroundColor: C.surfaceHigh, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line },
});
