import React, { useEffect, useRef, useState } from "react";
import { pop } from "./enter";
import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Icon, type IconName } from "@/icons/Icon";
import { color as C, elevation, font, gradient, radius as R, themed } from "@/theme";
import { Press, buzz } from "./Press";
import { T } from "./Text";

export type ButtonState = "idle" | "loading" | "success" | "error";

/**
 * The button, with the four states a real button has.
 *
 *   idle      the label
 *   loading   three dots breathing in place of the label; the width does not
 *             move, so the layout does not jump while you wait
 *   success   a check that springs in, a success haptic, then back to idle
 *   error     a restrained shake — two small oscillations, not a tantrum
 *
 * Pass `onPress` returning a Promise and the button runs the states itself:
 * resolve to anything but `false` for success, `false` (or throw) for error.
 * Or drive `state` yourself.
 *
 * `primary` is the gold one, and a screen has at most one.
 */
export function Button({
  label,
  onPress,
  variant = "primary",
  icon,
  size = "lg",
  state: controlled,
  disabled,
  style,
  full = true,
  successLabel,
  accessibilityLabel,
}: {
  label: string;
  onPress?: () => unknown;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  icon?: IconName;
  size?: "lg" | "md" | "sm";
  state?: ButtonState;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  full?: boolean;
  successLabel?: string;
  accessibilityLabel?: string;
}) {
  const [own, setOwn] = useState<ButtonState>("idle");
  const state = controlled ?? own;
  const shake = useSharedValue(0);
  const mounted = useRef(true);
  useEffect(() => () => void (mounted.current = false), []);

  useEffect(() => {
    if (state === "error") {
      shake.value = withSequence(
        withTiming(-6, { duration: 55 }),
        withTiming(6, { duration: 70 }),
        withTiming(-4, { duration: 60 }),
        withTiming(3, { duration: 55 }),
        withTiming(0, { duration: 50 }),
      );
      buzz("medium");
    }
    if (state === "success") buzz("success");
  }, [state, shake]);

  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  const run = async () => {
    if (!onPress || state === "loading") return;
    const r = onPress();
    if (!(r instanceof Promise) || controlled) return;
    setOwn("loading");
    try {
      const v = await r;
      if (!mounted.current) return;
      setOwn(v === false ? "error" : "success");
    } catch {
      if (mounted.current) setOwn("error");
    }
    setTimeout(() => mounted.current && setOwn("idle"), 1100);
  };

  const h = size === "lg" ? 54 : size === "md" ? 46 : 36;
  const primary = variant === "primary";
  const ink = primary ? C.ink : variant === "danger" ? C.red : C.text;

  return (
    <Animated.View style={[full && { alignSelf: "stretch" }, shakeStyle, style]}>
      <Press
        onPress={run}
        disabled={disabled}
        haptic={primary ? "medium" : "light"}
        radius={h / 2}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ busy: state === "loading", disabled: !!disabled }}
        style={[
          styles.base,
          { height: h, borderRadius: h / 2, paddingHorizontal: size === "sm" ? 14 : 22 },
          primary && elevation.gold,
          variant === "secondary" && styles.secondary,
          variant === "ghost" && styles.ghost,
          variant === "danger" && styles.danger,
          state === "error" && variant !== "primary" && { borderColor: C.red },
        ]}
      >
        {primary && (
          <LinearGradient
            colors={state === "error" ? ["#EB9A8F", "#D9776C", "#B85E54"] : gradient.gold}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: h / 2 }]}
          />
        )}
        {primary && <View pointerEvents="none" style={[styles.topShine, { borderTopLeftRadius: h / 2, borderTopRightRadius: h / 2 }]} />}

        <View style={styles.content}>
          {state === "loading" ? (
            <Animated.View key="l" entering={FadeIn.duration(140)} exiting={FadeOut.duration(100)}>
              <Dots color={ink} />
            </Animated.View>
          ) : state === "success" ? (
            <Animated.View key="s" entering={pop()} style={styles.row}>
              <Icon name="check" size={18} color={ink} strokeWidth={2.4} />
              {successLabel && <T v="headline" color={ink}>{successLabel}</T>}
            </Animated.View>
          ) : (
            <Animated.View key="i" entering={FadeIn.duration(160)} style={styles.row}>
              {icon && <Icon name={icon} size={size === "sm" ? 15 : 18} color={ink} strokeWidth={1.9} />}
              <T v={size === "sm" ? "captionMedium" : "headline"} color={ink} style={{ fontFamily: font.semibold }}>
                {label}
              </T>
            </Animated.View>
          )}
        </View>
      </Press>
    </Animated.View>
  );
}

/** Three dots breathing, staggered. Used in place of a spinner everywhere. */
export function Dots({ color = C.text, size = 6 }: { color?: string; size?: number }) {
  return (
    <View style={{ flexDirection: "row", gap: size * 0.8, alignItems: "center", height: size * 3 }}>
      {[0, 1, 2].map((i) => (
        <Dot key={i} i={i} color={color} size={size} />
      ))}
    </View>
  );
}

function Dot({ i, color, size }: { i: number; color: string; size: number }) {
  const v = useSharedValue(0);
  useEffect(() => {
    const t = setTimeout(() => {
      v.value = withRepeat(withSequence(withTiming(1, { duration: 380, easing: Easing.out(Easing.quad) }), withTiming(0, { duration: 420 })), -1);
    }, i * 140);
    return () => clearTimeout(t);
  }, [i, v]);
  const s = useAnimatedStyle(() => ({ opacity: 0.35 + v.value * 0.65, transform: [{ translateY: -v.value * size * 0.5 }] }));
  return <Animated.View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }, s]} />;
}

/** A round icon button — back, close, share. */
export function IconButton({
  icon,
  onPress,
  label,
  size = 40,
  tone = "surface",
  badge,
  active,
}: {
  icon: IconName;
  onPress?: () => void;
  label: string;
  size?: number;
  tone?: "surface" | "clear" | "gold";
  badge?: number | boolean;
  active?: boolean;
}) {
  return (
    <Press
      onPress={onPress}
      accessibilityLabel={label}
      haptic="select"
      radius={size / 2}
      hitSlop={Math.max(0, (44 - size) / 2)}
      style={[
        { width: size, height: size, borderRadius: size / 2, alignItems: "center", justifyContent: "center" },
        tone === "surface" && { backgroundColor: C.surfaceHigh, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line },
        tone === "gold" && { backgroundColor: C.goldWash, borderWidth: StyleSheet.hairlineWidth, borderColor: C.goldLine },
      ]}
    >
      <Icon name={icon} size={size * 0.46} color={tone === "gold" || active ? C.gold : C.text} />
      {!!badge && (
        <Animated.View entering={pop()} style={styles.badge}>
          {typeof badge === "number" && badge > 0 ? (
            <T v="micro" color={C.ink} style={{ fontFamily: font.bold, fontSize: 9.5 }}>
              {badge > 9 ? "9+" : badge}
            </T>
          ) : null}
        </Animated.View>
      )}
    </Press>
  );
}

export function Spinner() {
  return <ActivityIndicator color={C.gold} />;
}

const styles = themed(() => ({
  base: { alignItems: "center", justifyContent: "center", overflow: "visible" },
  secondary: { backgroundColor: C.surfaceTop, borderWidth: StyleSheet.hairlineWidth, borderColor: C.lineStrong },
  ghost: { backgroundColor: "transparent" },
  danger: { backgroundColor: C.redWash, borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(235,122,111,0.3)" },
  topShine: { position: "absolute", left: 1, right: 1, top: 1, height: "45%", backgroundColor: "rgba(255,255,255,0.14)" },
  content: { alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: C.gold,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: C.bg,
  },
}));
