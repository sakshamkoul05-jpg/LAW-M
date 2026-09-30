import React, { useEffect } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { color as C, radius as R, space } from "@/theme";

/**
 * Skeletons, not spinners.
 *
 * A spinner says "wait". A skeleton says "this is what is coming, and where",
 * so the screen is already legible before the data lands and nothing jumps
 * when it does. The shimmer is one slow, dim band — enough to read as alive,
 * not enough to pull the eye.
 */
export function Skeleton({ w, h = 14, r = 7, style }: { w?: number | `${number}%`; h?: number; r?: number; style?: StyleProp<ViewStyle> }) {
  const x = useSharedValue(-1);
  useEffect(() => {
    x.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }), -1);
  }, [x]);
  const band = useAnimatedStyle(() => ({ transform: [{ translateX: `${x.value * 120}%` }] }));
  return (
    <View style={[{ width: w ?? "100%", height: h, borderRadius: r, backgroundColor: C.surfaceTop, overflow: "hidden" }, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, band]}>
        <LinearGradient
          colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.045)", "rgba(255,255,255,0)"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

/** A card-shaped skeleton: a tile, two lines, a trailing figure. */
export function SkeletonRow() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: space.md, paddingVertical: space.md }}>
      <Skeleton w={40} h={40} r={12} />
      <View style={{ flex: 1, gap: 7 }}>
        <Skeleton w="62%" h={13} />
        <Skeleton w="38%" h={10} />
      </View>
      <Skeleton w={56} h={13} />
    </View>
  );
}

export function SkeletonCard({ height = 132 }: { height?: number }) {
  return (
    <View style={{ height, borderRadius: R.xl, backgroundColor: C.surfaceHigh, padding: space.lg, gap: 10, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line }}>
      <Skeleton w={90} h={10} />
      <Skeleton w="70%" h={18} />
      <View style={{ flex: 1 }} />
      <Skeleton w="100%" h={4} r={2} />
    </View>
  );
}

export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <View>
      {Array.from({ length: rows }, (_, i) => (
        <SkeletonRow key={i} />
      ))}
    </View>
  );
}
