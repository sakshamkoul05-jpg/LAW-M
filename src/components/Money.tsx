import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
} from "react-native";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { color as C, font, motion, tabular } from "@/theme";

const AnimatedInput = Animated.createAnimatedComponent(TextInput);

/**
 * Money on screen.
 *
 * INDIAN GROUPING, NOT THOUSANDS
 *
 * ₹24,35,000 — last three digits, then pairs. Formatting a rupee amount in
 * western thousands (₹2,435,000) is the detail that tells every Indian customer
 * the app was built for somewhere else, and it is one function away from being
 * right.
 *
 * Written out rather than handed to Intl.NumberFormat because the counting
 * version below has to format on the UI thread inside a worklet, where Intl is
 * not available. One implementation, used by both, so a static amount and an
 * animating one can never disagree about where the commas go.
 */
export function groupIndian(n: number): string {
  "worklet";
  const neg = n < 0;
  const s = Math.abs(Math.round(n)).toString();
  if (s.length <= 3) return (neg ? "-" : "") + s;

  const last3 = s.slice(-3);
  let rest = s.slice(0, -3);
  let out = "";
  while (rest.length > 2) {
    out = "," + rest.slice(-2) + out;
    rest = rest.slice(0, -2);
  }
  return (neg ? "-" : "") + rest + out + "," + last3;
}

/** Paise to a display string. The app stores paise; it never shows them. */
export function formatPaise(paise: number): string {
  return groupIndian(paise / 100);
}

/* ══════════════════════════════════════════════════════════════════════════ */

export function Money({
  paise,
  size = 16,
  tone = C.text,
  style,
  signed,
}: {
  paise: number;
  size?: number;
  tone?: string;
  style?: StyleProp<TextStyle>;
  /** Shows + or − and colours credits green. For a statement column. */
  signed?: boolean;
}) {
  const credit = paise >= 0;
  const colour = signed ? (credit ? C.green : tone) : tone;
  const sign = signed ? (credit ? "+" : "−") : "";

  return (
    <Text
      style={[
        { fontFamily: font.monoSemi, fontSize: size, color: colour, letterSpacing: -0.3 },
        tabular,
        style,
      ]}
    >
      {sign}
      {"₹"}
      {groupIndian(Math.abs(paise) / 100)}
    </Text>
  );
}

/**
 * The balance, counting up.
 *
 * WHY A TEXTINPUT AND NOT A TEXT
 *
 * Reanimated can drive a TextInput's `text` prop from the UI thread. A <Text>
 * cannot be written to that way — its content would have to come back through
 * React state on every frame, which means a re-render at 60fps and a number
 * that visibly stutters the moment anything else on the screen is busy. The
 * input is not editable and not focusable; it is a label that the animation
 * thread is allowed to write into.
 *
 * The easing decelerates and never overshoots. A balance that springs past its
 * value and settles back has, for a few frames, told the customer they have
 * more money than they do.
 */
export function CountingBalance({
  paise,
  size = 52,
  tone = C.text,
}: {
  paise: number;
  size?: number;
  tone?: string;
}) {
  const value = useSharedValue(0);

  useEffect(() => {
    value.value = withTiming(paise / 100, motion.count);
  }, [paise, value]);

  /* `text` is not in TextInput's public prop types — Reanimated writes it
     straight onto the native view. The cast is the documented way to do this
     and the reason the component below is a TextInput at all. */
  const animatedProps = useAnimatedProps(() => {
    const shown = "₹" + groupIndian(value.value);
    return { text: shown, defaultValue: shown } as unknown as TextInputProps;
  });

  return (
    <View style={{ flexDirection: "row" }}>
      <AnimatedInput
        editable={false}
        /* Off the tab order and out of the accessibility tree — the real value
           is announced by the label below, once, instead of being re-read on
           every frame of the count. */
        focusable={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        underlineColorAndroid="transparent"
        animatedProps={animatedProps}
        style={[
          styles.counter,
          tabular,
          { fontSize: size, color: tone, lineHeight: size * 1.12 },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  counter: {
    fontFamily: font.monoSemi,
    letterSpacing: -1.4,
    padding: 0,
    margin: 0,
    /* Without an explicit height the input reserves room for a caret and the
       number sits a few pixels high inside its own box. */
    includeFontPadding: false,
    textAlignVertical: "center",
  },
});
