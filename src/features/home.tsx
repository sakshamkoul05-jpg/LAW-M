import React, { useCallback, useEffect, useRef, useState } from "react";
import { Image, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { Easing, FadeIn, cancelAnimation, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { Icon } from "@/icons/Icon";
import { allServices, categories, feePaise, liveServices } from "@/data/catalogue";
import {
  FIRST_PURCHASE,
  FOR_YOU,
  OFFERS_LIVE,
  PROMISES,
  QUICK,
  SEARCH_PROMPT,
  TAGLINES,
  TICKETS,
  TRENDING,
  WALLET_TIERS,
  WHY,
  destFor,
  type Dest,
  type Ticket,
} from "@/data/home";
import { rupees } from "@/lib/format";
import { Press, T } from "@/ui";
import { color as C, font, radius as R, space } from "@/theme";

/**
 * The home page's sections from lawfic.pro, made for a phone.
 *
 * Same content and the same order of ideas as the website — promises, search,
 * quick actions, offers, a welcome with five tabs, why LAWFIC, the top 21,
 * categories, latest launches, coming soon — but set in the app's own black
 * and champagne, with one type family and one radius system. The website's
 * colours appear only where they carry meaning: each "for you" tab keeps its
 * colour, so the open panel is unmistakably that tab's.
 */

/* ── navigation ──────────────────────────────────────────────────────────── */

export function useGo() {
  const router = useRouter();
  return useCallback(
    (d: Dest) => {
      if ("web" in d) WebBrowser.openBrowserAsync(d.web).catch(() => {});
      else router.push(d.app as Href);
    },
    [router],
  );
}

export function SectionHead({ title, action, onAction, center }: { title: string; action?: string; onAction?: () => void; center?: boolean }) {
  return (
    <View style={[s.head, center && { justifyContent: "center" }]}>
      <T v="title3" center={center}>
        {title}
      </T>
      {action && onAction && (
        <Press onPress={onAction} radius={10} haptic="select" accessibilityLabel={action} hitSlop={8} style={s.headAction}>
          <T v="calloutMedium" tone="gold">
            {action}
          </T>
          <Icon name="chevron" size={14} color={C.gold} />
        </Press>
      )}
    </View>
  );
}

/* ── a marquee that stops while it is touched ────────────────────────────── */

function Marquee({ children, speed = 36, style }: { children: React.ReactNode; speed?: number; style?: object }) {
  const reduced = useReducedMotion();
  const x = useSharedValue(0);
  const [w, setW] = useState(0);

  const run = useCallback(() => {
    if (!w || reduced) return;
    const left = w + x.value;
    x.value = withSequence(
      withTiming(-w, { duration: Math.max(16, (left / speed) * 1000), easing: Easing.linear }),
      withTiming(0, { duration: 0 }),
      withRepeat(withSequence(withTiming(-w, { duration: (w / speed) * 1000, easing: Easing.linear }), withTiming(0, { duration: 0 })), -1),
    );
  }, [w, reduced, speed, x]);

  useEffect(() => {
    run();
    return () => cancelAnimation(x);
  }, [run, x]);

  const moving = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <Pressable onPressIn={() => cancelAnimation(x)} onPressOut={run} style={[{ overflow: "hidden" }, style]} accessible={false}>
      {reduced ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={s.row}>{children}</View>
        </ScrollView>
      ) : (
        <Animated.View style={[s.row, moving]}>
          <View style={s.row} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
            {children}
          </View>
          <View style={s.row} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
            {children}
          </View>
        </Animated.View>
      )}
    </Pressable>
  );
}

/* ── 1 · the running promises ────────────────────────────────────────────── */

export function PromiseStrip() {
  return (
    <Marquee style={s.strip}>
      {PROMISES.map((p) => (
        <View key={p.text} style={s.promise}>
          <Icon name={p.icon} size={15} color={C.gold} strokeWidth={1.8} />
          <T v="captionMedium" style={{ color: C.text, fontSize: 12 }}>
            {p.text}
          </T>
          <View style={s.promiseDot} />
        </View>
      ))}
    </Marquee>
  );
}

/* ── 2 · the search band ─────────────────────────────────────────────────── */

export function SearchBand() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const [line, setLine] = useState(0);
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => setLine((n) => (n + 1) % TAGLINES.length), 3600);
    return () => clearInterval(t);
  }, [reduced]);

  const submit = () => router.push({ pathname: "/services", params: q.trim() ? { q: q.trim() } : {} });

  return (
    <View style={s.searchBand}>
      <View style={s.taglineBox}>
        <Animated.View key={line} entering={FadeIn.duration(450)}>
          <T v="headline" tone="gold" center style={s.tagline} numberOfLines={2}>
            “{TAGLINES[line]} — Only on Lawfic”
          </T>
        </Animated.View>
      </View>
      <View style={[s.searchPill, focus && s.searchPillOn]}>
        <Press onPress={() => router.push("/services")} radius={18} haptic="select" accessibilityLabel="All services" style={s.scope}>
          <T v="captionMedium" style={{ color: C.text }}>
            All Service
          </T>
          <Icon name="chevronDown" size={13} color={C.textDim} />
        </Press>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <TextInput
            value={q}
            onChangeText={setQ}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            onSubmitEditing={submit}
            returnKeyType="search"
            selectionColor={C.gold}
            accessibilityLabel="Search services, documents and experts"
            style={[s.searchInput, Platform.OS === "web" && ({ outlineStyle: "none" } as object)]}
          />
          {!q && !focus && (
            <View pointerEvents="none" style={StyleSheet.absoluteFill}>
              <Marquee speed={28} style={{ flex: 1, justifyContent: "center" }}>
                <T v="caption" style={{ color: C.textMuted, paddingRight: 48 }}>
                  {SEARCH_PROMPT}
                </T>
              </Marquee>
            </View>
          )}
        </View>
        <Press onPress={submit} radius={20} accessibilityLabel="Search" style={s.searchGo}>
          <Icon name="search" size={17} color={C.ink} strokeWidth={2.2} />
        </Press>
      </View>
    </View>
  );
}

/* ── 3 · the quick-icon bar ──────────────────────────────────────────────── */

export function QuickBar({ side, onOffers }: { side: number; onOffers: () => void }) {
  const go = useGo();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -side }} contentContainerStyle={{ paddingHorizontal: side - 4, gap: 2 }}>
      {QUICK.map((a) => (
        <Press
          key={a.label}
          onPress={() => ("app" in a.to && a.to.app === "#offers" ? onOffers() : go(a.to))}
          radius={16}
          lift={false}
          haptic="select"
          accessibilityLabel={a.label}
          style={s.quick}
        >
          <View style={s.quickIcon}>
            <Icon name={a.icon} size={19} color={C.gold} strokeWidth={1.7} />
          </View>
          <T v="micro" tone="dim" center numberOfLines={2} style={{ fontSize: 10.5, lineHeight: 13 }}>
            {a.label}
          </T>
        </Press>
      ))}
    </ScrollView>
  );
}

/* ── 4 · coupon tickets ──────────────────────────────────────────────────── */

const TICKET_TONE: Record<Ticket["tone"], { bg: readonly [string, string]; ink: string; sub: string; line: string }> = {
  gold: { bg: ["#E0C783", "#A9843F"], ink: C.ink, sub: "rgba(23,18,10,0.72)", line: "rgba(23,18,10,0.35)" },
  night: { bg: ["#1F1D1A", "#0A0A0A"], ink: C.text, sub: C.textDim, line: C.goldLine },
  blue: { bg: ["#1D4F8F", "#0C2446"], ink: "#F5F3EE", sub: "rgba(245,243,238,0.75)", line: "rgba(245,243,238,0.3)" },
  plum: { bg: ["#3B2158", "#150A22"], ink: "#F5F3EE", sub: "rgba(245,243,238,0.75)", line: "rgba(224,199,131,0.45)" },
};

export function OfferTickets({ side, width, stack, onPick }: { side: number; width: number; stack?: boolean; onPick?: () => void }) {
  const router = useRouter();
  if (!OFFERS_LIVE) return null;
  const w = stack ? width : Math.min(width * 0.8, 300);
  const Wrap = ({ children }: { children: React.ReactNode }) =>
    stack ? (
      <View style={{ gap: space.md }}>{children}</View>
    ) : (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={w + space.md} decelerationRate="fast" style={{ marginHorizontal: -side, marginVertical: -6 }} contentContainerStyle={{ gap: space.md, paddingHorizontal: side, paddingVertical: 6 }}>
        {children}
      </ScrollView>
    );
  return (
    <View>
      <Wrap>
        {TICKETS.map((t) => {
          const tone = TICKET_TONE[t.tone];
          return (
            <Press key={t.id} onPress={() => { onPick?.(); router.push(t.id === "wal20" || t.id === "app100" ? "/wallet/add" : "/services"); }} radius={R.lg} accessibilityLabel={`${t.headline}${t.code ? `, code ${t.code}` : ""}`} style={{ width: w }}>
              <LinearGradient colors={tone.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.ticket, t.tone === "night" && { borderWidth: 1, borderColor: C.goldLine }]}>
                <View style={{ flex: 1 }}>
                  <T v="label" style={{ color: tone.sub, fontSize: 9.5 }}>
                    {t.kicker}
                  </T>
                  <T v="title3" style={{ color: tone.ink, marginTop: 4 }} numberOfLines={2}>
                    {t.headline}
                  </T>
                  <T v="caption" style={{ color: tone.sub, marginTop: 4 }} numberOfLines={2}>
                    {t.line}
                  </T>
                </View>
                <View style={[s.ticketFoot, { borderTopColor: tone.line }]}>
                  {t.code ? (
                    <View style={[s.code, { borderColor: tone.line }]}>
                      <T v="captionMedium" style={{ color: tone.ink, letterSpacing: 1, fontFamily: font.semibold }}>
                        {t.code}
                      </T>
                    </View>
                  ) : (
                    <T v="captionMedium" style={{ color: tone.ink }}>
                      Only on LAWFIC
                    </T>
                  )}
                  <T v="micro" style={{ color: tone.sub }}>
                    {t.fine}
                  </T>
                </View>
                {/* the punched notches of a ticket */}
                <View style={[s.notch, { left: -9 }]} />
                <View style={[s.notch, { right: -9 }]} />
              </LinearGradient>
            </Press>
          );
        })}
      </Wrap>

      <Press onPress={() => { onPick?.(); router.push("/services"); }} radius={R.lg} accessibilityLabel={`${FIRST_PURCHASE.headline} ${FIRST_PURCHASE.line}`} style={{ marginTop: space.md }}>
        <View style={s.firstStrip}>
          <T v="title2" tone="gold" style={{ letterSpacing: 0.5 }}>
            {FIRST_PURCHASE.headline}
          </T>
          <View style={s.firstCut} />
          <T v="caption" style={{ flex: 1, color: C.text }}>
            {FIRST_PURCHASE.line}
          </T>
        </View>
      </Press>
    </View>
  );
}

/* ── 5 · welcome, five tabs, wallet tiers ────────────────────────────────── */

export function ForYou({ side, width, name }: { side: number; width: number; name: string | null }) {
  const go = useGo();
  const router = useRouter();
  const [active, setActive] = useState(FOR_YOU[0]!.id);
  const tab = FOR_YOU.find((t) => t.id === active)!;
  const cardW = Math.min(width * 0.42, 170);

  return (
    <View>
      <T v="title2" center>
        A heartfelt welcome to the LAWFIC family <T v="title2" style={{ color: "#E5262B" }}>❤</T>
      </T>
      <T v="headline" tone="gold" center style={{ marginTop: 6 }}>
        {name ? `${name} Ji!` : "Dear Customer Ji!"} 🙏
      </T>
      <T v="callout" tone="dim" center style={{ marginTop: space.sm, paddingHorizontal: space.sm }}>
        Offers chosen for your needs and handpicked by our experts. Speak to an expert any time, and move towards a secure future with confidence.
      </T>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -side, marginTop: space.xl }} contentContainerStyle={{ gap: space.sm, paddingHorizontal: side }}>
        {FOR_YOU.map((t) => {
          const on = t.id === active;
          return (
            <Press
              key={t.id}
              onPress={() => setActive(t.id)}
              radius={R.pill}
              haptic="select"
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              accessibilityLabel={t.label}
              style={[s.tab, { borderColor: t.color }, on && { backgroundColor: t.color }]}
            >
              <Icon name={t.icon} size={14} color={on ? "#fff" : t.color} strokeWidth={2} />
              <T v="captionMedium" style={{ color: on ? "#fff" : C.text }}>
                {t.label}
              </T>
            </Press>
          );
        })}
      </ScrollView>

      {/* The open panel wears its tab's colour. */}
      <Animated.View key={tab.id} entering={FadeIn.duration(320)} style={[s.panel, { borderColor: `${tab.color}AA`, backgroundColor: `${tab.color}1F`, marginHorizontal: -space.xs }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={cardW + space.sm} decelerationRate="fast" contentContainerStyle={{ gap: space.sm, padding: space.sm }}>
          {tab.cards.map((c) => (
            <Press key={c.title} onPress={() => go(destFor(c.slug, c.live))} radius={R.md} accessibilityLabel={c.title} style={{ width: cardW }}>
              <View style={[s.card, { borderColor: `${tab.color}CC` }]}>
                <Image source={{ uri: c.img }} style={StyleSheet.absoluteFill} resizeMode="cover" accessibilityIgnoresInvertColors />
                <LinearGradient colors={["rgba(0,0,0,0)", `${tab.color}D9`, "#000000F2"]} locations={[0.25, 0.72, 1]} style={StyleSheet.absoluteFill} />
                <View style={s.cardBody}>
                  <View style={[s.cardLabel, { backgroundColor: tab.color }]}>
                    <T v="label" style={{ color: "#fff", fontSize: 8.5 }}>
                      {c.label}
                    </T>
                  </View>
                  <T v="calloutMedium" style={{ color: "#fff", marginTop: 6 }} numberOfLines={2}>
                    {c.title}
                  </T>
                  <T v="micro" style={{ color: "rgba(255,255,255,0.82)", marginTop: 2 }} numberOfLines={2}>
                    {c.blurb}
                  </T>
                </View>
              </View>
            </Press>
          ))}
        </ScrollView>
      </Animated.View>

      {OFFERS_LIVE && (
        <View style={s.walletCard}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Icon name="wallet" size={18} color={C.gold} />
              <T v="headline" tone="gold">
                LAWFIC Wallet
              </T>
            </View>
            <T v="micro" tone="muted">
              Extra on every top-up
            </T>
          </View>
          <View style={s.tiers}>
            {WALLET_TIERS.map((t) => (
              <Press key={t.pay} onPress={() => router.push({ pathname: "/wallet/add", params: { amount: String(t.pay) } })} radius={R.md} accessibilityLabel={`Recharge ${rupees(t.pay * 100)}, get ${rupees(t.get * 100)}`} style={[s.tier, t.best && s.tierBest]}>
                {t.best && (
                  <View style={s.best}>
                    <T v="label" color={C.ink} style={{ fontSize: 8 }}>
                      Best value
                    </T>
                  </View>
                )}
                <T v="micro" tone="muted">
                  Recharge {rupees(t.pay * 100)}
                </T>
                <T v="title3" tone="gold" num style={{ marginTop: 2 }}>
                  {rupees(t.get * 100)}
                </T>
                <T v="micro" tone="dim" num>
                  +{rupees((t.get - t.pay) * 100)} extra
                </T>
              </Press>
            ))}
          </View>
          <Press onPress={() => WebBrowser.openBrowserAsync("https://lawfic.pro/legal/wallet-terms").catch(() => {})} radius={8} accessibilityLabel="Wallet terms and conditions" style={{ alignSelf: "center", marginTop: space.md }}>
            <T v="micro" tone="muted">
              Lawfic Wallet & Pay Later Terms & Conditions
            </T>
          </Press>
        </View>
      )}
    </View>
  );
}

/* ── 6 · why LAWFIC ──────────────────────────────────────────────────────── */

export function WhyLawfic({ side, width }: { side: number; width: number }) {
  const w = Math.min(width * 0.72, 270);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={w + space.md} decelerationRate="fast" style={{ marginHorizontal: -side }} contentContainerStyle={{ gap: space.md, paddingHorizontal: side }}>
      {WHY.map((r) => (
        <View key={r.title} style={[s.why, { width: w }, r.blue && s.whyBlue]}>
          <View style={[s.whyIcon, r.blue && { backgroundColor: "rgba(46,117,182,0.22)" }]}>
            <Icon name={r.icon} size={20} color={r.blue ? "#8AB4F8" : C.gold} strokeWidth={1.7} />
          </View>
          <T v="calloutMedium" style={{ marginTop: space.md }}>
            {r.title}
          </T>
          <T v="caption" tone="dim" style={{ marginTop: 6, fontStyle: "italic" }}>
            “{r.body}”
          </T>
        </View>
      ))}
    </ScrollView>
  );
}

/* ── 7 · top twenty-one ──────────────────────────────────────────────────── */

export function TopTrending() {
  const go = useGo();
  const [all, setAll] = useState(false);
  const rows = all ? TRENDING : TRENDING.slice(0, 7);
  return (
    <View style={s.group}>
      {rows.map((t, i) => (
        <Press key={t.rank} onPress={() => go(destFor(t.slug, t.live))} radius={0} scaleTo={0.99} accessibilityLabel={`${t.rank}. ${t.label}`} style={[s.trendRow, i > 0 && s.rowLine]}>
          <T v="calloutMedium" num style={{ width: 26, color: t.rank <= 3 ? C.gold : C.textMuted }}>
            {String(t.rank).padStart(2, "0")}
          </T>
          <View style={{ flex: 1, minWidth: 0 }}>
            <T v="bodyMedium" numberOfLines={1}>
              {t.label}
            </T>
            <T v="micro" tone="muted">
              {t.section}
              {t.live ? "  ·  Available now" : ""}
            </T>
          </View>
          <Icon name="chevron" size={15} color={C.textMuted} />
        </Press>
      ))}
      <Press onPress={() => setAll((v) => !v)} radius={0} haptic="select" accessibilityLabel={all ? "Show fewer" : "Show all 21"} style={[s.trendMore, s.rowLine]}>
        <T v="calloutMedium" tone="gold">
          {all ? "Show fewer" : "Show all 21"}
        </T>
        <View style={all ? { transform: [{ rotate: "180deg" }] } : undefined}>
          <Icon name="chevronDown" size={14} color={C.gold} />
        </View>
      </Press>
    </View>
  );
}

/* ── 8 · explore by category ─────────────────────────────────────────────── */

export function ExploreCategories() {
  const router = useRouter();
  return (
    <View style={s.cats}>
      {categories.map((c) => {
        const n = c.services.length;
        return (
          <Press key={c.id} onPress={() => router.push({ pathname: "/services", params: { cat: c.id } })} radius={R.lg} accessibilityLabel={`${c.name}, ${n} services`} style={s.cat}>
            <View style={s.catIcon}>
              <Icon name={c.icon} size={19} color={C.gold} strokeWidth={1.7} />
            </View>
            <T v="calloutMedium" numberOfLines={2} style={{ marginTop: space.md }}>
              {c.name}
            </T>
            <T v="micro" tone="muted" num>
              {n} services
            </T>
          </Press>
        );
      })}
    </View>
  );
}

/* ── 9 · latest launch ───────────────────────────────────────────────────── */

const PHOTO: Record<string, string> = {
  aadhaar: "https://lawfic.pro/banners/passport.webp",
  "msme-udyam": "https://lawfic.pro/banners/udyam.webp",
  gst: "https://lawfic.pro/banners/gst.webp",
  pan: "https://lawfic.pro/banners/identity.webp",
};

export function LatestLaunch({ side, width }: { side: number; width: number }) {
  const router = useRouter();
  const w = Math.min(width * 0.62, 240);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={w + space.md} decelerationRate="fast" style={{ marginHorizontal: -side }} contentContainerStyle={{ gap: space.md, paddingHorizontal: side }}>
      {liveServices.map((svc) => (
        <Press key={svc.slug} onPress={() => router.push(`/service/${svc.slug}`)} radius={R.lg} accessibilityLabel={svc.name} style={{ width: w }}>
          <View style={s.launch}>
            <View style={{ height: w * 0.56 }}>
              <Image source={{ uri: PHOTO[svc.slug] ?? "https://lawfic.pro/banners/membership.webp" }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              <View style={s.newBadge}>
                <T v="label" color={C.ink} style={{ fontSize: 9 }}>
                  New
                </T>
              </View>
            </View>
            <View style={{ padding: space.md }}>
              <T v="calloutMedium" numberOfLines={1}>
                {svc.name}
              </T>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
                <T v="captionMedium" tone="gold" num>
                  {feePaise(svc.slug) ? rupees(feePaise(svc.slug)!) : "Quoted"}
                </T>
                <T v="micro" tone="muted" numberOfLines={1} style={{ flexShrink: 1, marginLeft: 8 }}>
                  {svc.turnaround}
                </T>
              </View>
            </View>
          </View>
        </Press>
      ))}
    </ScrollView>
  );
}

/* ── 10 · coming soon ────────────────────────────────────────────────────── */

export function ComingSoon() {
  const router = useRouter();
  const soon = allServices.filter((x) => x.status === "soon");
  return (
    <View style={s.soonWrap}>
      {soon.slice(0, 10).map((x) => (
        <Press key={x.slug} onPress={() => router.push(`/request/${x.slug}`)} radius={R.pill} haptic="select" accessibilityLabel={`${x.name}, coming soon`} style={s.soon}>
          <T v="captionMedium" numberOfLines={1} style={{ color: C.text }}>
            {x.name}
          </T>
        </Press>
      ))}
      <Press onPress={() => router.push("/services")} radius={R.pill} haptic="select" accessibilityLabel={`All ${soon.length} coming soon`} style={[s.soon, { borderColor: C.goldLine }]}>
        <T v="captionMedium" tone="gold">
          +{soon.length - 10} more
        </T>
      </Press>
    </View>
  );
}

/* ── styles ─────────────────────────────────────────────────────────────── */

const s = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: space.md },
  headAction: { flexDirection: "row", alignItems: "center", gap: 2 },
  row: { flexDirection: "row", alignItems: "center" },

  strip: { height: 34, justifyContent: "center", borderRadius: R.pill, backgroundColor: "#000", borderWidth: StyleSheet.hairlineWidth, borderColor: C.goldLine },
  promise: { flexDirection: "row", alignItems: "center", gap: 8, paddingLeft: 16 },
  promiseDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: C.textMuted, marginLeft: 8 },

  searchBand: { paddingVertical: space.lg, paddingHorizontal: space.md, borderRadius: R.xl, backgroundColor: "#000", borderWidth: StyleSheet.hairlineWidth, borderColor: C.goldLine },
  taglineBox: { minHeight: 46, justifyContent: "center" },
  tagline: { fontFamily: font.bold, fontSize: 16, lineHeight: 22 },
  searchPill: { flexDirection: "row", alignItems: "center", height: 48, marginTop: space.md, paddingLeft: 4, paddingRight: 4, borderRadius: R.pill, backgroundColor: C.surfaceHigh, borderWidth: 1, borderColor: C.lineStrong },
  searchPillOn: { borderColor: C.gold },
  scope: { flexDirection: "row", alignItems: "center", gap: 4, height: 40, paddingHorizontal: 12, borderRadius: R.pill, backgroundColor: C.surfaceTop, marginRight: 6 },
  searchInput: { height: 44, fontFamily: font.regular, fontSize: 14, color: C.text, paddingHorizontal: 4 },
  searchGo: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: C.gold },

  quick: { width: 70, alignItems: "center", gap: 6, paddingVertical: 4 },
  quickIcon: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", backgroundColor: C.surfaceHigh, borderWidth: StyleSheet.hairlineWidth, borderColor: C.goldLine },

  ticket: { height: 158, borderRadius: R.lg, padding: space.lg, paddingHorizontal: space.xl, overflow: "hidden" },
  ticketFoot: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, borderStyle: "dashed", paddingTop: space.sm },
  code: { borderWidth: 1, borderStyle: "dashed", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  notch: { position: "absolute", top: 102, width: 18, height: 18, borderRadius: 9, backgroundColor: C.bg },
  firstStrip: { flexDirection: "row", alignItems: "center", gap: space.md, paddingVertical: space.md, paddingHorizontal: space.lg, borderRadius: R.lg, backgroundColor: C.goldWash, borderWidth: 1, borderColor: C.goldLine },
  firstCut: { width: 0, alignSelf: "stretch", borderLeftWidth: 1, borderStyle: "dashed", borderColor: C.goldLine },

  tab: { flexDirection: "row", alignItems: "center", gap: 6, height: 36, paddingHorizontal: 14, borderRadius: R.pill, borderWidth: 1.2 },
  panel: { marginTop: space.md, borderRadius: R.xl, borderWidth: 1.2 },
  card: { height: 210, borderRadius: R.md, overflow: "hidden", borderWidth: 1.5, backgroundColor: C.surface },
  cardBody: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 10 },
  cardLabel: { alignSelf: "flex-start", paddingHorizontal: 7, paddingVertical: 2, borderRadius: R.pill },

  walletCard: { marginTop: space.lg, padding: space.lg, borderRadius: R.xl, backgroundColor: C.surfaceHigh, borderWidth: 1, borderColor: C.goldLine },
  tiers: { flexDirection: "row", flexWrap: "wrap", gap: space.sm, marginTop: space.md },
  tier: { flexGrow: 1, flexBasis: "46%", padding: space.md, borderRadius: R.md, backgroundColor: C.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: C.lineStrong },
  tierBest: { borderColor: C.gold, backgroundColor: C.goldWash },
  best: { position: "absolute", top: -8, right: 10, paddingHorizontal: 7, paddingVertical: 2, borderRadius: R.pill, backgroundColor: C.gold },

  why: { padding: space.lg, borderRadius: R.xl, backgroundColor: C.surfaceHigh, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line, minHeight: 190 },
  whyBlue: { borderColor: "rgba(46,117,182,0.6)", backgroundColor: "rgba(46,117,182,0.10)" },
  whyIcon: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: C.goldWash },

  group: { borderRadius: R.xl, backgroundColor: C.surfaceHigh, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line, overflow: "hidden" },
  rowLine: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.line },
  trendRow: { flexDirection: "row", alignItems: "center", gap: space.md, paddingHorizontal: space.lg, paddingVertical: 12 },
  trendMore: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 13 },

  cats: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  cat: { flexGrow: 1, flexBasis: "46%", minHeight: 124, padding: space.lg, borderRadius: R.lg, backgroundColor: C.surfaceHigh, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line },
  catIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: C.goldWash },

  launch: { borderRadius: R.lg, overflow: "hidden", backgroundColor: C.surfaceHigh, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line },
  newBadge: { position: "absolute", top: 10, left: 10, paddingHorizontal: 8, paddingVertical: 2, borderRadius: R.pill, backgroundColor: C.gold },

  soonWrap: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  soon: { height: 34, justifyContent: "center", paddingHorizontal: 14, borderRadius: R.pill, backgroundColor: C.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: C.lineStrong, maxWidth: "100%" },
});
