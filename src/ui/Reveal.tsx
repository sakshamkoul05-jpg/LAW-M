import React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { motion } from "@/theme";

/**
 * Content arriving: a short rise and a fade, staggered by `i`.
 *
 * The rise is 12px — enough to read as "arriving", small enough that nothing
 * seems to fly in. The stagger caps at eight so a long list does not keep
 * the last row waiting half a second. Reduced motion is honoured by
 * Reanimated itself (ReduceMotion.System is the default).
 */
export function Reveal({
  i = 0,
  children,
  style,
  fade,
}: {
  i?: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Fade only, no rise — for things that should not move, like a hero. */
  fade?: boolean;
}) {
  const delay = Math.min(i, 8) * motion.STAGGER + 40;
  const entering = fade
    ? FadeIn.delay(delay).duration(motion.duration.slow)
    : FadeInDown.delay(delay).duration(motion.duration.slow);
  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
}
