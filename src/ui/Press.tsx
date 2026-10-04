import React, { useCallback, useState } from "react";
import { Platform, Pressable, StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { color as C, motion } from "@/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type Haptic = "light" | "medium" | "heavy" | "select" | "success" | "none";

export function buzz(kind: Haptic = "light") {
  if (kind === "none" || Platform.OS === "web") return;
  const p =
    kind === "select"
      ? Haptics.selectionAsync()
      : kind === "success"
        ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        : Haptics.impactAsync(
            kind === "heavy" ? Haptics.ImpactFeedbackStyle.Heavy : kind === "medium" ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light,
          );
  p.catch(() => {});
}

/**
 * Everything tappable in the app goes through this.
 *
 *   press   sinks on a stiff spring and springs back — mass, not a fade.
 *   hover   (pointer devices) a faint lift and a lighter surface. It is the
 *           desktop's version of "this responds to you", and without it a web
 *           build feels dead under the cursor.
 *   focus   a gold ring for keyboard users. Premium that cannot be tabbed
 *           through is not premium, it is inaccessible.
 *   haptic  on press-in, not on release: the tap should be felt the moment the
 *           finger lands, the way a physical button clicks on the way down.
 */
export function Press({
  children,
  onPress,
  style,
  haptic = "light",
  disabled,
  scaleTo = motion.PRESS_SCALE,
  lift = true,
  radius = 16,
  accessibilityLabel,
  accessibilityRole = "button",
  ...rest
}: Omit<PressableProps, "style" | "children"> & {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  haptic?: Haptic;
  scaleTo?: number;
  /** Hover lift and highlight. Off for things inside a larger hover target. */
  lift?: boolean;
  /** Radius of the hover wash and focus ring, to match the element. */
  radius?: number;
}) {
  const scale = useSharedValue(1);
  const hover = useSharedValue(0);
  const [focused, setFocused] = useState(false);

  const animated = useAnimatedStyle(() => ({
    transform: [{ translateY: hover.value * -1.5 }, { scale: scale.value }],
  }));
  const wash = useAnimatedStyle(() => ({ opacity: hover.value }));

  const onIn = useCallback(() => {
    scale.value = withSpring(scaleTo, motion.press);
    if (!disabled) buzz(haptic);
  }, [disabled, haptic, scale, scaleTo]);
  const onOut = useCallback(() => {
    scale.value = withSpring(1, motion.press);
  }, [scale]);

  return (
    <AnimatedPressable
      onPressIn={onIn}
      onPressOut={onOut}
      onPress={onPress}
      onHoverIn={lift ? () => (hover.value = withTiming(1, { duration: 160 })) : undefined}
      onHoverOut={lift ? () => (hover.value = withTiming(0, { duration: 220 })) : undefined}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      style={[animated, disabled && { opacity: 0.4 }, style]}
      {...rest}
    >
      {children}
      {lift && (
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: radius, backgroundColor: C.press }, wash]} />
      )}
      {focused && Platform.OS === "web" && (
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: radius, borderWidth: 2, borderColor: C.gold, margin: -3 }]} />
      )}
    </AnimatedPressable>
  );
}
