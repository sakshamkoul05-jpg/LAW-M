import React from "react";
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { color as C, elevation, radius as R, space, themed, themeMode } from "@/theme";

/**
 * A raised surface.
 *
 * Depth is three things, all quiet: a step up in ground colour, a soft black
 * shadow, and a one-pixel lit edge along the top — light falls from above, so
 * the top of a raised thing catches it. A white outline would make a card look
 * like a form field.
 *
 * `tone="gold"` is for the one surface on a screen that is the point of it.
 */
export function Surface({
  children,
  style,
  padded = true,
  radius = R.xl,
  tone = "default",
  raised = false,
}: {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  radius?: number;
  tone?: "default" | "high" | "gold" | "sunken";
  raised?: boolean;
}) {
  const bg = tone === "high" ? C.surfaceTop : tone === "sunken" ? C.bgDeep : C.surfaceHigh;
  return (
    <View
      style={[
        {
          borderRadius: radius,
          backgroundColor: bg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: tone === "gold" ? C.goldLine : C.line,
          overflow: "hidden",
        },
        raised && elevation.mid,
        padded && { padding: space.lg },
        style,
      ]}
    >
      {tone === "gold" && (
        <LinearGradient
          colors={["rgba(198,161,91,0.10)", "rgba(198,161,91,0.02)", "rgba(198,161,91,0)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      )}
      {tone !== "sunken" && (
        <LinearGradient
          colors={[tone === "gold" ? "rgba(224,199,131,0.35)" : C.edge, "rgba(255,255,255,0)"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.edge}
          pointerEvents="none"
        />
      )}
      {children}
    </View>
  );
}

/** Glass — only for things floating over content: bars, sheets, toasts. */
export function Glass({
  children,
  style,
  radius = R.xl,
  intensity = 40,
}: {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  intensity?: number;
}) {
  return (
    <View style={[{ borderRadius: radius, overflow: "hidden", borderWidth: StyleSheet.hairlineWidth, borderColor: C.lineStrong }, style]}>
      <BlurView intensity={intensity} tint={themeMode() === "light" ? "light" : "dark"} style={StyleSheet.absoluteFill} />
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: Platform.OS === "android" ? C.glassSolid : C.glass }]}
      />
      <LinearGradient colors={[C.edge, "rgba(255,255,255,0)"]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.edge} pointerEvents="none" />
      {children}
    </View>
  );
}

export function Divider({ inset = 0, style }: { inset?: number; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: C.line, marginLeft: inset }, style]} />;
}

const styles = themed(() => ({
  edge: { position: "absolute", left: 0, right: 0, top: 0, height: 1 },
}));
