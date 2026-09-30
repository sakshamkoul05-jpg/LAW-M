import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon, type IconName } from "@/icons/Icon";
import { useAppWidth, useLayout } from "@/components/AppWidth";
import { useStore } from "@/lib/store";
import { Glass, Panda, Press, T } from "@/ui";
import { color as C, elevation, font, gradient, motion } from "@/theme";
import { QuickActions } from "./QuickActions";

/**
 * The bottom navigation, on a phone.
 *
 * Home, Filings, the "+", Panda AI, Profile. It floats — glass over the
 * content, inset from the edges — so the page runs underneath it rather than
 * stopping at a grey band. The selected tab's icon turns gold and a short gold
 * bar slides under it on a spring; the "+" is raised, gold, and turns into an
 * × while its sheet is open.
 *
 * On a tablet or desktop this renders nothing: the side rail takes over.
 */
const TABS: Record<string, { label: string; icon: IconName }> = {
  index: { label: "Home", icon: "home" },
  filings: { label: "Filings", icon: "filings" },
  ai: { label: "Panda", icon: "panda" },
  profile: { label: "Profile", icon: "account" },
};

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const layout = useLayout();
  const width = useAppWidth();
  const { state: data } = useStore();
  const [open, setOpen] = useState(false);

  const routes = state.routes.filter((r) => TABS[r.name]);
  const barW = Math.min(width - 24, 460);
  const slotW = barW / (routes.length + 1);
  /* The "+" sits in the middle slot, so tabs after it shift one slot right. */
  const slotOf = (i: number) => (i >= 2 ? i + 1 : i);
  const activeIndex = routes.findIndex((r) => r.key === state.routes[state.index]?.key);

  const x = useSharedValue(slotOf(Math.max(0, activeIndex)) * slotW);
  useEffect(() => {
    if (activeIndex >= 0) x.value = withSpring(slotOf(activeIndex) * slotW, motion.slide);
  }, [activeIndex, slotW, x]);
  const bar = useAnimatedStyle(() => ({ transform: [{ translateX: x.value + slotW / 2 - 10 }] }));

  const turn = useSharedValue(0);
  useEffect(() => {
    turn.value = withSpring(open ? 1 : 0, motion.press);
  }, [open, turn]);
  const plus = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.value * 45}deg` }] }));

  if (layout !== "compact") return null;

  const awaiting = data.orders.filter((o) => o.status === "quoted").length;

  const tab = (route: (typeof routes)[number], i: number) => {
    const meta = TABS[route.name]!;
    const focused = i === activeIndex;
    return (
      <Press
        key={route.key}
        lift={false}
        haptic="select"
        radius={16}
        accessibilityRole="tab"
        accessibilityLabel={meta.label}
        accessibilityState={{ selected: focused }}
        onPress={() => {
          const e = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!focused && !e.defaultPrevented) navigation.navigate(route.name);
        }}
        style={[styles.tab, { width: slotW }]}
      >
        <View>
          {route.name === "ai" ? (
            <View style={[styles.pandaTab, focused && styles.pandaTabOn, { opacity: focused ? 1 : 0.72 }]}>
              <Panda size={24} still={!focused} />
            </View>
          ) : (
            <Icon name={meta.icon} size={22} active={focused} color={focused ? C.gold : C.textMuted} />
          )}
          {route.name === "filings" && awaiting > 0 && <View style={styles.dot} />}
        </View>
        <T v="micro" color={focused ? C.text : C.textMuted} style={{ fontFamily: focused ? font.semibold : font.medium, marginTop: 3 }} numberOfLines={1}>
          {meta.label}
        </T>
      </Press>
    );
  };

  return (
    <>
      <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: Math.max(insets.bottom - 6, 10) }]}>
        <View style={[{ width: barW }, elevation.card]}>
          <Glass radius={28} style={{ height: 66 }}>
            <View style={styles.row}>
              {routes.slice(0, 2).map((r, i) => tab(r, i))}
              <View style={{ width: slotW }} />
              {routes.slice(2).map((r, i) => tab(r, i + 2))}
            </View>
            <Animated.View style={[styles.indicator, bar]} />
          </Glass>

          <View style={[styles.fabSlot, { left: slotW * 2, width: slotW }]} pointerEvents="box-none">
            <Press onPress={() => setOpen((o) => !o)} haptic="medium" radius={29} scaleTo={0.92} lift={false} accessibilityLabel={open ? "Close quick actions" : "Quick actions"} style={[styles.fab, elevation.gold]}>
              <LinearGradient colors={gradient.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFill, { borderRadius: 29 }]} />
              <View style={styles.fabShine} pointerEvents="none" />
              <Animated.View style={plus}>
                <Icon name="plus" size={26} color={C.ink} strokeWidth={2.2} />
              </Animated.View>
            </Press>
          </View>
        </View>
      </View>
      <QuickActions open={open} onClose={() => setOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, bottom: 0, alignItems: "center" },
  row: { flex: 1, flexDirection: "row", alignItems: "center" },
  tab: { height: 66, alignItems: "center", justifyContent: "center" },
  indicator: { position: "absolute", bottom: 7, left: 0, width: 20, height: 3, borderRadius: 2, backgroundColor: C.gold },
  pandaTab: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: -3, marginBottom: -3 },
  pandaTabOn: { borderWidth: 1.5, borderColor: C.gold, backgroundColor: C.goldWash },
  dot: { position: "absolute", right: -3, top: -2, width: 8, height: 8, borderRadius: 4, backgroundColor: C.gold, borderWidth: 1.5, borderColor: C.surface },
  fabSlot: { position: "absolute", top: -18, alignItems: "center" },
  fab: { width: 58, height: 58, borderRadius: 29, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: C.bg },
  fabShine: { position: "absolute", top: 2, left: 6, right: 6, height: 20, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.18)" },
});
