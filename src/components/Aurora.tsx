import React, { useEffect } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { color as C } from "@/theme";

/**
 * The light behind everything.
 *
 * Revolut's gradient backgrounds and Phantom's purple glow are the single
 * biggest reason those apps feel expensive rather than dark. This is the same
 * idea built cheaply: three or four huge, very soft radial glows, each drifting
 * on its own slow loop, so the page is never quite the same twice.
 *
 * WHY SVG RADIALS AND NOT BLUR
 *
 * A blurred view costs a GPU pass every frame on Android and does not exist on
 * the web at all. A radial gradient is already soft at the edge — it IS the
 * blur, drawn once — and moving it is a transform, which runs on the native
 * thread for free.
 *
 * WHY THE LOOPS ARE SO SLOW
 *
 * Eighteen to thirty seconds per cycle. Fast enough to notice that it is alive
 * if you look; slow enough that you never watch it instead of the screen.
 */

export type Glow = { color: string; x: number; y: number; size: number; opacity?: number };

const PRESETS: Record<string, Glow[]> = {
  home: [
    { color: C.violet, x: 0.15, y: 0.1, size: 1.1, opacity: 0.55 },
    { color: C.indigo, x: 0.9, y: 0.05, size: 0.9, opacity: 0.45 },
    { color: C.gold, x: 0.75, y: 0.55, size: 0.8, opacity: 0.28 },
  ],
  wallet: [
    { color: C.gold, x: 0.2, y: 0.15, size: 1.0, opacity: 0.35 },
    { color: C.violet, x: 0.95, y: 0.2, size: 1.0, opacity: 0.4 },
    { color: C.indigo, x: 0.5, y: 0.7, size: 0.9, opacity: 0.3 },
  ],
  violet: [
    { color: C.violet, x: 0.3, y: 0.1, size: 1.2, opacity: 0.55 },
    { color: C.violetDeep, x: 0.85, y: 0.35, size: 0.9, opacity: 0.5 },
  ],
  gold: [
    { color: C.gold, x: 0.3, y: 0.05, size: 1.0, opacity: 0.4 },
    { color: C.goldDeep, x: 0.9, y: 0.3, size: 0.8, opacity: 0.35 },
  ],
  quiet: [
    { color: C.violet, x: 0.1, y: 0.0, size: 0.9, opacity: 0.25 },
    { color: C.indigo, x: 0.95, y: 0.05, size: 0.7, opacity: 0.2 },
  ],
};

export function Aurora({
  preset = "home",
  height = 520,
  style,
}: {
  preset?: keyof typeof PRESETS;
  height?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const glows = PRESETS[preset] ?? PRESETS.home!;

  return (
    <View
      pointerEvents="none"
      style={[{ position: "absolute", left: 0, right: 0, top: 0, height, overflow: "hidden" }, style]}
    >
      {glows.map((g, i) => (
        <Blob key={i} glow={g} height={height} index={i} />
      ))}
      {/* Fade the light into the ground so the hero has no bottom edge. */}
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <RadialGradient id="vignette" cx="50%" cy="0%" r="100%">
            <Stop offset="0.55" stopColor={C.void} stopOpacity={0} />
            <Stop offset="1" stopColor={C.void} stopOpacity={1} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#vignette)" />
      </Svg>
    </View>
  );
}

function Blob({ glow, height, index }: { glow: Glow; height: number; index: number }) {
  const t = useSharedValue(0);
  const SIZE = height * glow.size;

  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, {
        duration: 18000 + index * 6000,
        easing: Easing.inOut(Easing.sin),
        reduceMotion: ReduceMotion.System,
      }),
      -1,
      true,
    );
  }, [t, index]);

  const drift = useAnimatedStyle(() => {
    /* Each blob traces its own small ellipse, phase-shifted by index, so the
       glows never move in step and the light keeps changing shape. */
    const a = t.value * Math.PI * 2 + index * 1.7;
    return {
      transform: [
        { translateX: Math.cos(a) * SIZE * 0.14 },
        { translateY: Math.sin(a) * SIZE * 0.1 },
        { scale: 1 + Math.sin(a * 0.5) * 0.08 },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: SIZE,
          height: SIZE,
          left: `${glow.x * 100}%`,
          top: glow.y * height,
          marginLeft: -SIZE / 2,
          marginTop: -SIZE / 2,
        },
        drift,
      ]}
    >
      <Svg width={SIZE} height={SIZE}>
        <Defs>
          <RadialGradient id={`g${index}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={glow.color} stopOpacity={glow.opacity ?? 0.4} />
            <Stop offset="0.45" stopColor={glow.color} stopOpacity={(glow.opacity ?? 0.4) * 0.35} />
            <Stop offset="1" stopColor={glow.color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={SIZE} height={SIZE} fill={`url(#g${index})`} />
      </Svg>
    </Animated.View>
  );
}
