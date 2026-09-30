import React, { useEffect } from "react";
import { TextInput, View, type TextInputProps, type TextStyle } from "react-native";
import Animated, { useAnimatedProps, useSharedValue, withTiming } from "react-native-reanimated";
import { groupIndian } from "@/lib/format";
import { color as C, font, motion, tabular } from "@/theme";
import { T } from "./Text";

const AnimatedInput = Animated.createAnimatedComponent(TextInput);

/**
 * A number that counts to its value.
 *
 * Driven through an animated TextInput so the count runs on the UI thread
 * instead of re-rendering React sixty times a second. It counts on mount and
 * again whenever the value changes — money arriving in the wallet should be
 * SEEN arriving, which is the whole reason to animate a balance at all.
 *
 * Width is computed from the final string so the text never reflows mid-count
 * (web gives a TextInput the full row otherwise, and the paise float away).
 */
function useCount(target: number) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withTiming(target, motion.count);
  }, [target, v]);
  return v;
}

export function AnimatedMoney({
  paise,
  size = 44,
  hidden,
  color = C.text,
  dimColor = C.textDim,
}: {
  paise: number;
  size?: number;
  hidden?: boolean;
  color?: string;
  dimColor?: string;
}) {
  const rupees = Math.floor(Math.max(0, paise) / 100);
  const v = useCount(rupees);
  const props = useAnimatedProps(() => {
    const s = groupIndian(Math.floor(v.value));
    return { text: s, defaultValue: s } as unknown as TextInputProps;
  });

  const shown = groupIndian(rupees);
  const commas = (shown.match(/,/g) ?? []).length;
  const w = Math.ceil((shown.length - commas) * size * 0.6 + commas * size * 0.28 + 6);
  const p = String(Math.round(Math.max(0, paise)) % 100).padStart(2, "0");

  if (hidden) {
    return (
      <T style={{ fontFamily: font.semibold, fontSize: size, letterSpacing: size * 0.06, color, lineHeight: size * 1.15 }} accessibilityLabel="Balance hidden">
        ₹ ••••••
      </T>
    );
  }

  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start" }} accessible accessibilityLabel={`₹${shown}.${p}`}>
      <T style={{ fontFamily: font.medium, fontSize: size * 0.5, color: dimColor, marginTop: size * 0.14, marginRight: 3 }}>₹</T>
      <AnimatedInput
        editable={false}
        focusable={false}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
        underlineColorAndroid="transparent"
        animatedProps={props}
        style={[
          { fontFamily: font.semibold, fontSize: size, color, letterSpacing: -size * 0.035, padding: 0, margin: 0, width: w, height: size * 1.18 },
          tabular,
        ]}
      />
      <T style={{ fontFamily: font.medium, fontSize: size * 0.4, color: dimColor, marginTop: size * 0.13, marginLeft: 1 }} num>
        .{p}
      </T>
    </View>
  );
}

/** A plain count that ticks up — "03 active filings". */
export function AnimatedCount({ value, style, pad = false }: { value: number; style?: TextStyle; pad?: boolean }) {
  const v = useCount(value);
  const props = useAnimatedProps(() => {
    const n = Math.round(v.value);
    const s = pad && n < 10 ? `0${n}` : String(n);
    return { text: s, defaultValue: s } as unknown as TextInputProps;
  });
  const size = (style?.fontSize as number) ?? 16;
  const chars = Math.max(pad ? 2 : 1, String(value).length);
  return (
    <AnimatedInput
      editable={false}
      focusable={false}
      underlineColorAndroid="transparent"
      animatedProps={props}
      accessibilityLabel={String(value)}
      style={[{ padding: 0, margin: 0, color: C.text, width: chars * size * 0.66 + 4, height: size * 1.25 }, tabular, style]}
    />
  );
}
