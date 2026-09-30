import React, { useEffect } from "react";
import { Text, TextInput, View, type StyleProp, type TextInputProps, type TextStyle } from "react-native";
import Animated, { useAnimatedProps, useSharedValue, withTiming } from "react-native-reanimated";
import { color as C, font, motion, tabular } from "@/theme";

const AnimatedInput = Animated.createAnimatedComponent(TextInput);

/** Last three digits, then pairs: ₹24,35,000, never ₹2,435,000. Worklet-safe. */
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

/** Whole rupees when the paise are zero, otherwise to the paisa. Floored, never
    rounded: ₹24,350.50 must not read as ₹24,351 anywhere in a wallet. */
export function rupees(paise: number): string {
  const abs = Math.round(Math.abs(paise));
  const r = groupIndian(Math.floor(abs / 100));
  const p = abs % 100;
  return p ? `₹${r}.${String(p).padStart(2, "0")}` : `₹${r}`;
}

/** An amount in a row. Credits green and signed, debits plain. */
export function Money({
  paise,
  size = 15,
  tone = C.text,
  signed,
  style,
}: {
  paise: number;
  size?: number;
  tone?: string;
  signed?: boolean;
  style?: StyleProp<TextStyle>;
}) {
  const credit = paise >= 0;
  const colour = signed && credit ? C.green : tone;
  const sign = signed ? (credit ? "+" : "−") : "";
  return (
    <Text style={[{ fontFamily: font.display, fontSize: size, color: colour, letterSpacing: -0.3 }, tabular, style]}>
      {sign}
      {rupees(paise)}
    </Text>
  );
}

/**
 * The balance, counting up — large, tight, in the display face.
 *
 * Driven through an animated TextInput so the count runs on the UI thread and
 * does not re-render React sixty times a second. The paise are set smaller and
 * dimmer than the rupees, the way Revolut and Apple Card do it: the whole
 * number is what you read, the fraction is what you check.
 */
export function Balance({
  paise,
  size = 50,
  hidden,
}: {
  paise: number;
  size?: number;
  hidden?: boolean;
}) {
  const v = useSharedValue(0);

  useEffect(() => {
    v.value = withTiming(paise / 100, motion.count);
  }, [paise, v]);

  const props = useAnimatedProps(() => {
    const s = groupIndian(Math.floor(v.value));
    return { text: s, defaultValue: s } as unknown as TextInputProps;
  });

  const paisePart = String(Math.round(paise) % 100).padStart(2, "0");
  const shown = groupIndian(Math.floor(paise / 100));
  const commas = (shown.match(/,/g) ?? []).length;
  const inputW = Math.ceil((shown.length - commas) * size * 0.64 + commas * size * 0.3 + 4);

  if (hidden) {
    return (
      <Text style={{ fontFamily: font.displayBold, fontSize: size, color: C.text, letterSpacing: -1.5 }}>
        ₹ ••••••
      </Text>
    );
  }

  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
      <Text style={{ fontFamily: font.display, fontSize: size * 0.52, color: C.textDim, marginTop: size * 0.12, marginRight: 4 }}>
        ₹
      </Text>
      <AnimatedInput
        editable={false}
        focusable={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        underlineColorAndroid="transparent"
        animatedProps={props}
        style={[
          {
            fontFamily: font.displayBold,
            fontSize: size,
            color: C.text,
            letterSpacing: -size * 0.04,
            padding: 0,
            margin: 0,
            includeFontPadding: false,
            width: inputW,
          },
          tabular,
        ]}
      />
      <Text style={{ fontFamily: font.display, fontSize: size * 0.4, color: C.textFaint, marginTop: size * 0.14, marginLeft: 2 }}>
        .{paisePart}
      </Text>
    </View>
  );
}
