import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Icon } from "@/icons/Icon";
import { Button, Label, Surface, Touch } from "@/components/primitives";
import { groupIndian } from "@/components/Money";
import { color as C, font, motion, radius, space, text } from "@/theme";

const PRESETS = [500, 1000, 2500, 5000];
const MIN = 100;
const MAX = 50000;

/**
 * Adding money.
 *
 * THE KEYPAD IS THE INTERACTION
 *
 * A system keyboard on a money screen is a wasted opportunity and a worse
 * experience: it is half the screen, it has a return key that means nothing,
 * and its keys are sized for prose. This one has 60pt keys, a spring on every
 * press, and a haptic per digit, so entering an amount feels like counting
 * rather than typing.
 *
 * THE AMOUNT SHAKES WHEN IT IS REFUSED
 *
 * Over the ceiling, the number shakes once and the phone gives a warning
 * haptic. No dialog, no red banner. The rejection lands on the thing that was
 * wrong, instantly, and the customer never leaves the screen — which is the
 * whole reason to build a custom keypad in the first place.
 */
export default function Pay() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [digits, setDigits] = useState("");
  const [method, setMethod] = useState<"wallet" | "upi" | "card">("upi");

  const shake = useSharedValue(0);
  const amount = Number(digits || "0");
  const valid = amount >= MIN && amount <= MAX;

  const refuse = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    shake.value = withSequence(
      withTiming(-9, { duration: 55 }),
      withTiming(9, { duration: 55 }),
      withTiming(-5, { duration: 55 }),
      withSpring(0, motion.press),
    );
  }, [shake]);

  const tap = useCallback(
    (key: string) => {
      if (key === "back") {
        setDigits((d) => d.slice(0, -1));
        return;
      }
      setDigits((d) => {
        const next = (d + key).replace(/^0+/, "");
        if (Number(next) > MAX) {
          refuse();
          return d;
        }
        return next.slice(0, 6);
      });
    },
    [refuse],
  );

  const amountStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  return (
    <View style={{ flex: 1, backgroundColor: C.void }}>
      <View style={[styles.header, { paddingTop: insets.top + space.sm }]}>
        <Touch onPress={() => router.back()} accessibilityLabel="Close" style={styles.back}>
          <Icon name="close" size={19} color={C.text} />
        </Touch>
        <Text style={[text.bodySemi, { color: C.text, flex: 1 }]}>Add money</Text>
      </View>

      {/* ── the amount ── */}
      <Animated.View entering={FadeIn.duration(320)} style={styles.amountWrap}>
        <Label>Amount</Label>
        <Animated.View style={[{ flexDirection: "row", alignItems: "center" }, amountStyle]}>
          <Text style={[styles.rupee, !digits && { color: C.textFaint }]}>{"₹"}</Text>
          <Text
            style={[styles.amount, !digits && { color: C.textFaint }]}
            accessibilityLabel={digits ? `${amount} rupees` : "No amount entered"}
          >
            {digits ? groupIndian(amount) : "0"}
          </Text>
        </Animated.View>
        <Text style={[text.tiny, { color: C.textFaint }]}>
          {"₹"}
          {MIN} minimum {"·"} {"₹"}
          {groupIndian(MAX)} a day
        </Text>
      </Animated.View>

      {/* ── presets ── */}
      <View style={styles.presets}>
        {PRESETS.map((p) => (
          <Touch
            key={p}
            onPress={() => setDigits(String(p))}
            accessibilityLabel={`${p} rupees`}
            style={styles.preset}
          >
            <Text style={[text.small, { color: C.text, fontFamily: font.mono }]}>
              {"₹"}
              {groupIndian(p)}
            </Text>
          </Touch>
        ))}
      </View>

      {/* ── method ── */}
      <Animated.View entering={FadeInDown.delay(80).duration(340)} style={{ paddingHorizontal: space.lg }}>
        <Surface padded={false}>
          {(
            [
              { id: "upi", label: "UPI", sub: "Any UPI app" },
              { id: "card", label: "Card or net banking", sub: "Visa, Mastercard, RuPay" },
              { id: "wallet", label: "LAWFIC wallet", sub: "Not available for a top-up" },
            ] as const
          ).map((m, i) => {
            const on = method === m.id;
            const disabled = m.id === "wallet";
            return (
              <Touch
                key={m.id}
                disabled={disabled}
                onPress={() => setMethod(m.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: on, disabled }}
                accessibilityLabel={`${m.label}. ${m.sub}`}
                style={[
                  styles.method,
                  i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.hairlineSoft },
                ]}
              >
                <View style={[styles.radio, on && { borderColor: C.gold, borderWidth: 6 }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[text.body, { color: disabled ? C.textFaint : C.text }]}>{m.label}</Text>
                  <Text style={[text.tiny, { color: C.textFaint, marginTop: 1 }]}>{m.sub}</Text>
                </View>
              </Touch>
            );
          })}
        </Surface>
      </Animated.View>

      {/* ── keypad ── */}
      <View style={styles.pad}>
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "back"].map((k, i) =>
          k === "" ? (
            <View key={`gap${i}`} style={styles.key} />
          ) : (
            <Touch
              key={k}
              onPress={() => tap(k)}
              haptic="light"
              accessibilityLabel={k === "back" ? "Delete" : k}
              style={styles.key}
            >
              {k === "back" ? (
                <Icon name="back" size={21} color={C.textDim} />
              ) : (
                <Text style={styles.keyText}>{k}</Text>
              )}
            </Touch>
          ),
        )}
      </View>

      <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, space.lg) }]}>
        <Button
          label={valid ? `Add ₹${groupIndian(amount)}` : "Enter an amount"}
          disabled={!valid}
          sub={valid ? "Front-end preview — no payment is taken" : undefined}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            router.back();
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
  },
  back: { width: 40, height: 40, alignItems: "center", justifyContent: "center", marginLeft: -space.sm },
  amountWrap: { alignItems: "center", paddingVertical: space.xl, gap: 4 },
  rupee: { fontFamily: font.mono, fontSize: 26, color: C.text, marginRight: 4 },
  amount: {
    fontFamily: font.monoSemi,
    fontSize: 46,
    letterSpacing: -1.6,
    color: C.text,
  },
  presets: {
    flexDirection: "row",
    justifyContent: "center",
    gap: space.sm,
    paddingHorizontal: space.lg,
    marginBottom: space.xl,
  },
  preset: {
    minHeight: 38,
    paddingHorizontal: space.md + 2,
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: C.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.hairline,
  },
  method: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingHorizontal: space.lg,
    minHeight: 62,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.hairline,
  },
  pad: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: space.xl,
    marginTop: space.lg,
  },
  key: {
    width: "33.33%",
    height: 58,
    alignItems: "center",
    justifyContent: "center",
  },
  keyText: {
    fontFamily: font.mono,
    fontSize: 24,
    color: C.text,
    letterSpacing: -0.5,
  },
  bar: { paddingHorizontal: space.lg, paddingTop: space.sm },
});
