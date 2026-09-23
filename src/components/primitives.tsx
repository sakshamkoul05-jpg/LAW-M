import React, { useCallback } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { color as C, elevation, HIT, motion, radius, space, text } from "@/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/* ══════════════════════════════════════════════════════════════════════════
   SURFACE — the slab every card in this app is made of.
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * A raised surface with a lit top edge.
 *
 * The lit edge is the whole point. A 1px gradient along the top, white at about
 * 7%, fading to nothing by a third of the way down. It is the difference
 * between a rectangle filled with a dark colour and something that looks like
 * it is sitting above the screen — light comes from above, so the top edge of a
 * raised thing catches it. Remove it and every card in the app goes flat at
 * once, which is the quickest way to see what it is doing.
 */
export function Surface({
  children,
  style,
  level = "raised",
  lit = true,
  padded = true,
}: {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  level?: "flat" | "raised" | "high";
  lit?: boolean;
  padded?: boolean;
}) {
  const bg =
    level === "high" ? C.surfaceHigh : level === "flat" ? C.surface : C.surfaceRaised;

  return (
    <View
      style={[
        {
          backgroundColor: bg,
          borderRadius: radius.lg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: C.hairline,
          overflow: "hidden",
        },
        level !== "flat" && elevation.raised,
        padded && { padding: space.lg },
        style,
      ]}
    >
      {lit && (
        <LinearGradient
          colors={[C.litEdge, "transparent"]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.35 }}
        />
      )}
      {children}
    </View>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PRESSABLE — everything tappable, with weight.
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * A pressable that sinks under the finger and springs back.
 *
 * Two things make this feel like hardware rather than a web button:
 *
 *   1. it scales on a spring, so a quick tap settles fast and a held press
 *      settles slowly — the same motion a physical key has;
 *   2. it fires a haptic on press-IN, not on release. The phone answers at the
 *      moment of contact, which is when a real button would. Firing on release
 *      lands a fraction late and reads as lag rather than feedback.
 */
export function Touch({
  children,
  onPress,
  style,
  haptic = "light",
  disabled,
  accessibilityLabel,
  accessibilityRole = "button",
  ...rest
}: PressableProps & {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  haptic?: "light" | "medium" | "heavy" | "none";
}) {
  const scale = useSharedValue(1);

  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const onIn = useCallback(() => {
    scale.value = withSpring(motion.PRESS_SCALE, motion.press);
    if (haptic !== "none" && !disabled) {
      const style =
        haptic === "heavy"
          ? Haptics.ImpactFeedbackStyle.Heavy
          : haptic === "medium"
            ? Haptics.ImpactFeedbackStyle.Medium
            : Haptics.ImpactFeedbackStyle.Light;
      /* Fire and forget: a failed haptic (simulator, a phone with the motor
         disabled) must never reject into an unhandled rejection. */
      Haptics.impactAsync(style).catch(() => {});
    }
  }, [disabled, haptic, scale]);

  const onOut = useCallback(() => {
    scale.value = withSpring(1, motion.press);
  }, [scale]);

  return (
    <AnimatedPressable
      onPressIn={onIn}
      onPressOut={onOut}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      style={[animated, { opacity: disabled ? 0.45 : 1 }, style]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   TEXT
   ══════════════════════════════════════════════════════════════════════════ */

/** The letterspaced micro-label that sits above almost every section. */
export function Label({
  children,
  style,
  tone = C.textFaint,
}: {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  tone?: string;
}) {
  return <Text style={[text.label, { color: tone }, style]}>{children}</Text>;
}

export function Title({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[text.title, { color: C.text }, style]}>{children}</Text>;
}

export function Body({
  children,
  style,
  dim,
}: {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  dim?: boolean;
}) {
  return <Text style={[text.body, { color: dim ? C.textDim : C.text }, style]}>{children}</Text>;
}

/* ══════════════════════════════════════════════════════════════════════════
   CHIP and BUTTON
   ══════════════════════════════════════════════════════════════════════════ */

export function Chip({
  children,
  tone = "neutral",
  style,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "gold" | "green" | "amber" | "red" | "panda";
  style?: StyleProp<ViewStyle>;
}) {
  const map = {
    neutral: [C.surfaceHigh, C.textDim],
    gold: [C.goldWash, C.gold],
    green: [C.greenWash, C.green],
    amber: [C.amberWash, C.amber],
    red: [C.redWash, C.red],
    panda: ["rgba(199,75,240,0.14)", C.panda],
  } as const;
  const [bg, fg] = map[tone];

  return (
    <View
      style={[
        {
          backgroundColor: bg,
          paddingHorizontal: space.md - 2,
          paddingVertical: 4,
          borderRadius: radius.pill,
          alignSelf: "flex-start",
        },
        style,
      ]}
    >
      <Text style={[text.tiny, { color: fg, fontWeight: "600" }]}>{children}</Text>
    </View>
  );
}

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled,
  style,
  sub,
}: {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "ghost" | "quiet";
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  /** A second line, smaller. Used to say what a button will NOT do yet. */
  sub?: string;
}) {
  const primary = variant === "primary";
  const ghost = variant === "ghost";

  return (
    <Touch
      onPress={onPress}
      disabled={disabled}
      haptic={primary ? "medium" : "light"}
      accessibilityLabel={label}
      style={[
        {
          minHeight: 54,
          borderRadius: radius.md,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: space.xl,
          backgroundColor: primary ? C.gold : ghost ? "transparent" : C.surfaceHigh,
          borderWidth: ghost ? StyleSheet.hairlineWidth : 0,
          borderColor: C.hairline,
        },
        primary && elevation.raised,
        style,
      ]}
    >
      <Text
        style={[
          text.bodySemi,
          { color: primary ? "#1A1405" : C.text, fontSize: 15.5 },
        ]}
      >
        {label}
      </Text>
      {sub ? (
        <Text style={[text.tiny, { color: primary ? "rgba(26,20,5,0.62)" : C.textFaint, marginTop: 1 }]}>
          {sub}
        </Text>
      ) : null}
    </Touch>
  );
}

/** A hairline. Its own component only so the colour lives in one place. */
export function Rule({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: C.hairline }, style]} />
  );
}

/** Minimum size for anything tappable, exported so screens can assert it. */
export const MIN_TOUCH = HIT;
