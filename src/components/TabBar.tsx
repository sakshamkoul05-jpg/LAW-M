import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { Icon, type IconName } from "@/icons/Icon";
import { color as C, elevation, gradient, motion, radius, space, text } from "@/theme";
import { useAppWidth } from "./AppWidth";
import { Sheet } from "./Sheet";
import { IconTile, Touch } from "./ui";

/**
 * The tab bar: four tabs and a raised centre button.
 *
 * The centre button is the HDFC / Paytm idea — the thing you most often came
 * to do, one thumb-reach away on every screen. Here it is not "Pay" (there is
 * no paying other people from this wallet, deliberately) but "Do something":
 * add money, start a filing, ask the Panda. It opens a sheet rather than
 * navigating, so whatever you were looking at stays behind it.
 *
 * Profile is not a tab. It is your avatar, top-left on Home — the Revolut
 * convention, and it gives the bar back a slot for something used daily.
 */

const ICON: Record<string, IconName> = {
  index: "home",
  services: "services",
  orders: "orders",
  wallet: "wallet",
};

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const width = useAppWidth();
  const router = useRouter();
  const [actions, setActions] = useState(false);

  const SIDE = space.lg;
  const barW = width - SIDE * 2;
  /* Four tab slots plus a centre gap the width of one slot. */
  const slot = barW / 5;
  const slotX = (i: number) => (i < 2 ? i * slot : (i + 1) * slot);

  const x = useSharedValue(slotX(state.index));
  useEffect(() => {
    x.value = withSpring(slotX(state.index), motion.arrive);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.index, slot]);

  const dot = useAnimatedStyle(() => ({ transform: [{ translateX: x.value + slot / 2 - 3 }] }));

  const go = (to: string) => {
    setActions(false);
    setTimeout(() => router.push(to as never), 220);
  };

  const tabs = state.routes.map((route, i) => {
    const focused = state.index === i;
    const label = (descriptors[route.key]?.options.title ?? route.name) as string;
    return (
      <Touch
        key={route.key}
        haptic="none"
        accessibilityRole="tab"
        accessibilityState={{ selected: focused }}
        accessibilityLabel={label}
        onPress={() => {
          const e = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (focused || e.defaultPrevented) return;
          Haptics.selectionAsync().catch(() => {});
          navigation.navigate(route.name);
        }}
        style={{ width: slot, alignItems: "center", paddingTop: 12, paddingBottom: 10 }}
      >
        <TabGlyph name={ICON[route.name] ?? "home"} focused={focused} />
        <Text style={[text.tiny, { fontSize: 10, marginTop: 5, color: focused ? C.text : C.textFaint }]}>{label}</Text>
      </Touch>
    );
  });

  return (
    <>
      <View style={{ position: "absolute", left: SIDE, right: SIDE, bottom: Math.max(insets.bottom, space.md) }}>
        <View style={[styles.shell, elevation.mid]}>
          <BlurView intensity={Platform.OS === "ios" ? 50 : 30} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(12,12,18,0.78)" }]} />
          <LinearGradient
            colors={[C.litEdge, "rgba(255,255,255,0)"]}
            style={{ position: "absolute", left: 0, right: 0, top: 0, height: 1.2 }}
          />
          <Animated.View style={[styles.dot, dot]} />
          <View style={{ flexDirection: "row" }}>
            {tabs.slice(0, 2)}
            <View style={{ width: slot }} />
            {tabs.slice(2)}
          </View>
        </View>

        {/* The raised centre. It sits above the bar, not in it. */}
        <View style={[styles.fabWrap, { left: slot * 2 + slot / 2 - 31 }]} pointerEvents="box-none">
          <Touch
            onPress={() => setActions(true)}
            haptic="medium"
            scaleTo={0.9}
            accessibilityLabel="Quick actions"
            style={[styles.fab, elevation.glowGold]}
          >
            <LinearGradient colors={gradient.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
            <LinearGradient
              colors={["rgba(255,255,255,0.45)", "rgba(255,255,255,0)"]}
              style={{ position: "absolute", left: 0, right: 0, top: 0, height: 30 }}
            />
            <Icon name="plus" size={26} color={C.goldInk} />
          </Touch>
        </View>
      </View>

      <Sheet open={actions} onClose={() => setActions(false)} title="What would you like to do?">
        <View style={{ gap: space.sm }}>
          <Action icon="plus" tone="gold" title="Add money" sub="UPI, card or net banking" onPress={() => go("/pay")} />
          <Action icon="legal" tone="violet" title="Start a filing" sub="39 services, from Udyam to trademarks" onPress={() => go("/services")} />
          <Action icon="spark" tone="violet" title="Ask the Panda" sub="Which service do I need?" onPress={() => go("/panda")} />
          <Action icon="statement" tone="blue" title="Download statement" sub="Every credit and debit" onPress={() => go("/wallet")} />
          <Action icon="star" tone="amber" title="Reviews" sub="What customers said" onPress={() => go("/reviews")} />
        </View>
      </Sheet>
    </>
  );
}

function TabGlyph({ name, focused }: { name: IconName; focused: boolean }) {
  const s = useSharedValue(focused ? 1 : 0);
  useEffect(() => {
    s.value = withTiming(focused ? 1 : 0, motion.fade);
  }, [focused, s]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: 1 + s.value * 0.08 }, { translateY: -s.value * 1.5 }] }));
  return (
    <Animated.View style={style}>
      <Icon name={name} size={23} color={focused ? C.gold : C.textFaint} active={focused} />
    </Animated.View>
  );
}

function Action({
  icon,
  tone,
  title,
  sub,
  onPress,
}: {
  icon: IconName;
  tone: "gold" | "violet" | "blue" | "amber";
  title: string;
  sub: string;
  onPress: () => void;
}) {
  return (
    <Touch onPress={onPress} accessibilityLabel={title} style={styles.action}>
      <IconTile icon={icon} tone={tone} size={44} />
      <View style={{ flex: 1 }}>
        <Text style={[text.subhead, { color: C.text }]}>{title}</Text>
        <Text style={[text.small, { color: C.textFaint, marginTop: 1 }]}>{sub}</Text>
      </View>
      <Icon name="chevron" size={16} color={C.textFaint} />
    </Touch>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: radius.xl,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.hairlineStrong,
  },
  dot: {
    position: "absolute",
    top: 5,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.gold,
  },
  fabWrap: { position: "absolute", top: -22 },
  fab: {
    width: 62,
    height: 62,
    borderRadius: 31,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: C.void,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: C.glass,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.hairline,
  },
});

