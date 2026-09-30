import React, { useEffect } from "react";
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { color as C, motion } from "@/theme";
import { Press } from "./Press";

/** A switch. The knob springs across; the track warms to gold. */
export function Switch({ value, onChange, label, disabled }: { value: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  const v = useSharedValue(value ? 1 : 0);
  useEffect(() => {
    v.value = withSpring(value ? 1 : 0, motion.slide);
  }, [value, v]);
  const track = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(v.value, [0, 1], [C.surfaceTop, C.gold]) }));
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: v.value * 20 }], backgroundColor: interpolateColor(v.value, [0, 1], [C.textDim, "#FFFFFF"]) }));
  return (
    <Press
      onPress={() => onChange(!value)}
      disabled={disabled}
      haptic="select"
      lift={false}
      radius={16}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value, disabled: !!disabled }}
      hitSlop={8}
    >
      <Animated.View style={[{ width: 48, height: 28, borderRadius: 14, padding: 3, borderWidth: 1, borderColor: C.lineStrong }, track]}>
        <Animated.View style={[{ width: 20, height: 20, borderRadius: 10 }, knob]} />
      </Animated.View>
    </Press>
  );
}
