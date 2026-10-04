import React, { useEffect } from "react";
import { View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import Animated, { useAnimatedProps, useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import { color as C, motion } from "@/theme";
import { T } from "./Text";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * A progress ring. Draws from nothing to its value on mount — the one number
 * on a filing card worth watching arrive.
 */
export function ProgressRing({
  value,
  size = 56,
  stroke = 4,
  label,
  tone = C.gold,
  delay = 120,
}: {
  /** 0..1 */
  value: number;
  size?: number;
  stroke?: number;
  label?: string | null;
  tone?: string;
  delay?: number;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withDelay(delay, withTiming(Math.max(0, Math.min(1, value)), motion.count));
  }, [value, delay, v]);
  const props = useAnimatedProps(() => ({ strokeDashoffset: circ * (1 - v.value) }));
  const pct = Math.round(value * 100);

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }} accessibilityLabel={`${pct} percent`}>
      <Svg width={size} height={size} style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
        <Defs>
          <LinearGradient id="ringGold" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={C.goldLight} />
            <Stop offset="1" stopColor={tone} />
          </LinearGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={C.track} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={tone === C.gold ? "url(#ringGold)" : tone}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circ} ${circ}`}
          animatedProps={props}
        />
      </Svg>
      {label !== null && (
        <T v="captionMedium" num style={{ fontSize: size * 0.22 }}>
          {label ?? `${pct}%`}
        </T>
      )}
    </View>
  );
}

/**
 * A segmented bar: one segment per step, the current one half-lit.
 * Animated with scaleX from the left edge — a transform, not a width, so it
 * never triggers layout.
 */
export function StepBar({ steps, current, tone = C.gold, bad }: { steps: number; current: number; tone?: string; bad?: boolean }) {
  return (
    <View style={{ flexDirection: "row", gap: 4 }}>
      {Array.from({ length: steps }, (_, i) => (
        <Segment key={i} fill={bad ? (i <= current ? 1 : 0) : i < current ? 1 : i === current ? 0.5 : 0} tone={bad ? C.red : tone} delay={i * 70} />
      ))}
    </View>
  );
}

function Segment({ fill, tone, delay }: { fill: number; tone: string; delay: number }) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withDelay(delay + 150, withTiming(fill, motion.enter));
  }, [fill, delay, v]);
  const s = useAnimatedStyle(() => ({ transform: [{ scaleX: v.value }] }));
  return (
    <View style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: C.track, overflow: "hidden" }}>
      <Animated.View style={[{ flex: 1, backgroundColor: tone, borderRadius: 2, transformOrigin: "left" }, s]} />
    </View>
  );
}

/** A single bar, 0..1. */
export function Bar({ value, tone = C.gold, height = 4, delay = 0 }: { value: number; tone?: string; height?: number; delay?: number }) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withDelay(delay, withTiming(Math.max(0, Math.min(1, value)), motion.count));
  }, [value, delay, v]);
  const s = useAnimatedStyle(() => ({ transform: [{ scaleX: v.value }] }));
  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: C.track, overflow: "hidden" }}>
      <Animated.View style={[{ flex: 1, backgroundColor: tone, borderRadius: height / 2, transformOrigin: "left" }, s]} />
    </View>
  );
}
