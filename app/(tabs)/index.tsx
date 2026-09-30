import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle } from "react-native-svg";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Icon } from "@/icons/Icon";
import { Avatar, Chip, CircleAction, Glass, IconButton, SectionHeader, T, Touch } from "@/components/ui";
import { Balance, rupees } from "@/components/Money";
import { Screen, TxnList } from "@/components/Screen";
import { Donut, Sparkline } from "@/components/Charts";
import { FlyerCarousel } from "@/components/FlyerCarousel";
import { useWalletHidden } from "@/lib/lock";
import { color as C, elevation, gradient, radius, space, text } from "@/theme";
import { categories, popular } from "@/data/catalogue";
import {
  SAMPLE_BALANCE_PAISE,
  STATUS,
  orders,
  profile,
  spendByCategory,
  transactions,
} from "@/data/sample";

/**
 * Home.
 *
 * The Revolut shape, in the order people actually open a money app for: how
 * much do I have, do the thing I came to do, where has my filing got to, and
 * only then — what else is there. Marketing is fourth, not first.
 */
export default function Home() {
  const router = useRouter();
  const lockedHidden = useWalletHidden();
  const [peek, setPeek] = useState(true);
  const hidden = lockedHidden || !peek;

  const live = orders.find((o) => o.status === "needs-you") ?? orders.find((o) => o.status === "in-progress");
  const spend = spendByCategory(transactions);
  const addedThisMonth = transactions.filter((t) => t.paise > 0).reduce((s, t) => s + t.paise, 0);

  return (
    <Screen aurora="home" auroraHeight={560}>
      {/* ── header ── */}
      <Animated.View entering={FadeInDown.duration(420)} style={styles.head}>
        <Touch onPress={() => router.push("/account")} accessibilityLabel="Your account" scaleTo={0.92}>
          <Avatar name={profile.first} size={42} />
        </Touch>
        <Touch onPress={() => router.push("/services")} style={styles.search} accessibilityLabel="Search services">
          <Icon name="search" size={17} color={C.textDim} />
          <Text style={[text.small, { color: C.textDim, flex: 1 }]} numberOfLines={1}>
            Search services
          </Text>
        </Touch>
        <IconButton icon="bell" label="Notifications" badge />
      </Animated.View>

      {/* ── the balance ── */}
      <Animated.View entering={FadeInDown.delay(70).duration(460)} style={styles.balanceBlock}>
        <Touch onPress={() => setPeek((p) => !p)} haptic="select" accessibilityLabel={peek ? "Hide balance" : "Show balance"}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <T.Small tone={C.textDim}>Wallet balance</T.Small>
            <Icon name={hidden ? "eyeOff" : "eye"} size={15} color={C.textFaint} />
          </View>
        </Touch>
        <View style={{ marginTop: 6 }}>
          <Balance paise={SAMPLE_BALANCE_PAISE} hidden={hidden} size={48} />
        </View>
        <View style={styles.deltaRow}>
          <Chip tone="green" icon="arrowUp">
            {hidden ? "••••" : `${rupees(addedThisMonth)} added this month`}
          </Chip>
          <Sparkline points={[4, 6, 5, 9, 8, 12, 11, 15]} />
        </View>
        <T.Tiny style={{ marginTop: 8 }}>Sample balance · not your account</T.Tiny>
      </Animated.View>

      {/* ── the four things ── */}
      <Animated.View entering={FadeInDown.delay(140).duration(460)} style={styles.actions}>
        <CircleAction icon="plus" label="Add money" tone="gold" onPress={() => router.push("/pay")} />
        <CircleAction icon="legal" label="New filing" onPress={() => router.push("/services")} />
        <CircleAction icon="statement" label="Statement" onPress={() => router.push("/wallet")} />
        <CircleAction icon="chart" label="Insights" onPress={() => router.push("/insights")} />
      </Animated.View>

      {/* ── the filing in flight ── */}
      {live && (
        <Animated.View entering={FadeInDown.delay(210).duration(460)} style={styles.pad}>
          <Touch onPress={() => router.push(`/order/${live.id}`)} accessibilityLabel={`${live.name}, ${STATUS[live.status].label}`}>
            <Glass strong style={{ borderRadius: radius.xl }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: space.lg }}>
                <Ring progress={live.progress} color={STATUS[live.status].color} />
                <View style={{ flex: 1 }}>
                  <Chip tone={STATUS[live.status].tone}>{STATUS[live.status].label}</Chip>
                  <T.Sub style={{ marginTop: 8 }}>{live.name}</T.Sub>
                  <T.Small style={{ marginTop: 2 }}>{live.step}</T.Small>
                </View>
                <Icon name="chevron" size={18} color={C.textFaint} />
              </View>
            </Glass>
          </Touch>
        </Animated.View>
      )}

      {/* ── offers ── */}
      <Animated.View entering={FadeInDown.delay(280).duration(460)} style={{ marginTop: space.xxl }}>
        <SectionHeader title="For your business" style={styles.pad} />
        <FlyerCarousel onOpen={(f) => f.slug && router.push(`/service/${f.slug}`)} />
      </Animated.View>

      {/* ── popular ── */}
      <Animated.View entering={FadeInDown.delay(340).duration(460)} style={{ marginTop: space.xxl }}>
        <SectionHeader title="Popular right now" action="All services" onAction={() => router.push("/services")} style={styles.pad} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.lg, gap: space.md }}>
          {popular.map((s, i) => {
            const cat = categories.find((c) => c.id === s.categoryId)!;
            const g = [gradient.violet, gradient.midnight, gradient.obsidian][i % 3]!;
            return (
              <Touch key={s.slug} onPress={() => router.push(`/service/${s.slug}`)} accessibilityLabel={s.name} style={[styles.tile, elevation.low]}>
                <LinearGradient colors={g} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
                <View style={styles.tileIcon}>
                  <Icon name={cat.icon} size={20} color={C.gold} />
                </View>
                <View style={{ flex: 1 }} />
                <Text style={[text.subhead, { color: C.text }]} numberOfLines={2}>
                  {s.name}
                </Text>
                <Text style={[text.small, { color: C.textDim, marginTop: 4 }]}>
                  {s.feePaise ? rupees(s.feePaise) : "On request"}
                </Text>
              </Touch>
            );
          })}
        </ScrollView>
      </Animated.View>

      {/* ── this month ── */}
      <Animated.View entering={FadeInDown.delay(400).duration(460)} style={[styles.pad, { marginTop: space.xxl }]}>
        <Touch onPress={() => router.push("/insights")} accessibilityLabel="Spending insights">
          <Glass style={{ borderRadius: radius.xl }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: space.lg }}>
              <Donut
                size={112}
                stroke={12}
                segments={spend.rows.map((r) => ({ value: r.value, color: r.color }))}
                centerLabel="Spent"
                centerValue={hidden ? "••••" : rupees(spend.total)}
              />
              <View style={{ flex: 1, gap: 8 }}>
                <T.Label>This month</T.Label>
                {spend.rows.slice(0, 3).map((r) => (
                  <View key={r.label} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: r.color }} />
                    <T.Small tone={C.text} numberOfLines={1} style={{ flex: 1 }}>
                      {r.label}
                    </T.Small>
                  </View>
                ))}
                <Text style={[text.smallSemi, { color: C.violetHot, marginTop: 2 }]}>See insights</Text>
              </View>
            </View>
          </Glass>
        </Touch>
      </Animated.View>

      {/* ── recent ── */}
      <Animated.View entering={FadeInDown.delay(460).duration(460)} style={[styles.pad, { marginTop: space.xxl }]}>
        <SectionHeader title="Recent activity" action="See all" onAction={() => router.push("/wallet")} />
        <TxnList items={transactions} hidden={hidden} limit={3} />
      </Animated.View>

      {/* ── the assistant ── */}
      <Animated.View entering={FadeInDown.delay(520).duration(460)} style={[styles.pad, { marginTop: space.xxl }]}>
        <Touch onPress={() => router.push("/panda")} accessibilityLabel="Ask the Panda" style={[styles.panda, elevation.glowViolet]}>
          <LinearGradient colors={gradient.violet} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          <View style={styles.pandaOrb}>
            <Icon name="spark" size={24} color="#fff" active fill="rgba(255,255,255,0.3)" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[text.subhead, { color: "#fff" }]}>Not sure which filing you need?</Text>
            <Text style={[text.small, { color: "rgba(255,255,255,0.75)", marginTop: 2 }]}>
              Ask the Panda in plain words.
            </Text>
          </View>
          <Icon name="chevron" size={18} color="#fff" />
        </Touch>
      </Animated.View>

      <T.Tiny style={{ textAlign: "center", marginTop: space.xxxl, paddingHorizontal: space.xxl, lineHeight: 16 }}>
        A front-end preview. Balances, orders and dates are samples, not your account.
      </T.Tiny>
    </Screen>
  );
}

/** Progress as a ring — a filing has a shape, and a ring shows how much of it is left. */
function Ring({ progress, color }: { progress: number; color: string }) {
  const size = 56;
  const r = 23;
  const c = 2 * Math.PI * r;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={5} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={5}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c * progress} ${c}`}
        />
      </Svg>
      <Text style={[text.smallSemi, { color: C.text }]}>{Math.round(progress * 100)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: space.lg },
  head: { flexDirection: "row", alignItems: "center", gap: space.md, paddingHorizontal: space.lg },
  search: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: space.lg,
    backgroundColor: C.glassHigh,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.hairline,
  },
  balanceBlock: { paddingHorizontal: space.xl, marginTop: space.xxxl },
  deltaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: space.md },
  actions: { flexDirection: "row", paddingHorizontal: space.md, marginTop: space.xxl },
  tile: { width: 158, height: 176, borderRadius: radius.lg, overflow: "hidden", padding: space.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: C.hairlineStrong },
  tileIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(242,198,109,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  panda: { flexDirection: "row", alignItems: "center", gap: space.md, padding: space.lg, borderRadius: radius.xl, overflow: "hidden" },
  pandaOrb: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
});
