import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { Icon, type IconName } from "@/icons/Icon";
import { color as C, font, themed, perTheme } from "@/theme";
import { T } from "./Text";

export type BadgeTone = "neutral" | "action" | "good" | "bad" | "gold" | "info";

const TONE: Record<BadgeTone, { fg: string; bg: string; line: string }> = perTheme(() => ({
  neutral: { fg: C.textDim, bg: C.track, line: C.line },
  action: { fg: C.amber, bg: C.amberWash, line: "rgba(229,180,90,0.25)" },
  good: { fg: C.green, bg: C.greenWash, line: "rgba(111,207,151,0.22)" },
  bad: { fg: C.red, bg: C.redWash, line: "rgba(235,122,111,0.25)" },
  gold: { fg: C.gold, bg: C.goldWash, line: C.goldLine },
  info: { fg: C.blue, bg: C.blueWash, line: "rgba(138,180,248,0.22)" },
}));

/**
 * A status badge: a dot and a word, small caps.
 *
 * `live` pulses the dot — for something happening now (a filing with the
 * registry, a reply being written). Nothing else pulses; if everything on a
 * screen breathed, nothing would read as live.
 */
export function Badge({ label, tone = "neutral", icon, live }: { label: string; tone?: BadgeTone; icon?: IconName; live?: boolean }) {
  const t = TONE[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg, borderColor: t.line }]} accessibilityLabel={label}>
      {icon ? <Icon name={icon} size={11} color={t.fg} strokeWidth={2.2} /> : <Pulse color={t.fg} live={live} />}
      <T v="label" color={t.fg} style={{ fontSize: 10, letterSpacing: 0.9, fontFamily: font.semibold }}>
        {label}
      </T>
    </View>
  );
}

function Pulse({ color, live }: { color: string; live?: boolean }) {
  const v = useSharedValue(0);
  useEffect(() => {
    if (live) v.value = withRepeat(withSequence(withTiming(1, { duration: 900 }), withTiming(0, { duration: 900 })), -1);
  }, [live, v]);
  const halo = useAnimatedStyle(() => ({ opacity: live ? 0.5 * (1 - v.value) : 0, transform: [{ scale: 1 + v.value * 1.6 }] }));
  return (
    <View style={{ width: 6, height: 6, alignItems: "center", justifyContent: "center" }}>
      <Animated.View style={[{ position: "absolute", width: 6, height: 6, borderRadius: 3, backgroundColor: color }, halo]} />
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
    </View>
  );
}

/** A plain pill — filters, "Soon", counts. */
export function Chip({ label, tone = "neutral", icon }: { label: string; tone?: BadgeTone; icon?: IconName }) {
  const t = TONE[tone];
  return (
    <View style={[styles.chip, { backgroundColor: t.bg, borderColor: t.line }]}>
      {icon && <Icon name={icon} size={12} color={t.fg} />}
      <T v="captionMedium" color={t.fg} style={{ fontSize: 11.5 }}>
        {label}
      </T>
    </View>
  );
}

const styles = themed(() => ({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 9,
    height: 22,
    borderRadius: 11,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    height: 24,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
}));
