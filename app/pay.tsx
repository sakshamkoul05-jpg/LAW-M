import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { Icon, type IconName } from "@/icons/Icon";
import { Button, IconButton, IconTile, T, Touch } from "@/components/ui";
import { Aurora } from "@/components/Aurora";
import { groupIndian } from "@/components/Money";
import { color as C, font, motion, radius, space, text } from "@/theme";

const PRESETS = [500, 1000, 2500, 5000];
const MIN = 100;
const MAX = 50000;

/**
 * Adding money. A custom keypad with a haptic per key, because a system
 * keyboard on a money screen is half the screen and has a return key that means
 * nothing. Over the ceiling the amount shakes once — no dialog — and the
 * rejection lands on the thing that was wrong.
 */
export default function Pay() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [digits, setDigits] = useState("");
  const [method, setMethod] = useState<"upi" | "card" | "net">("upi");
  const [done, setDone] = useState(false);
  const shake = useSharedValue(0);
  const amount = Number(digits || "0");
  const valid = amount >= MIN && amount <= MAX;

  const refuse = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    shake.value = withSequence(withTiming(-10, { duration: 50 }), withTiming(10, { duration: 50 }), withTiming(-6, { duration: 50 }), withSpring(0, motion.press));
  }, [shake]);

  const tap = (k: string) => {
    if (k === "back") return setDigits((d) => d.slice(0, -1));
    setDigits((d) => {
      const next = (d + k).replace(/^0+/, "");
      if (Number(next) > MAX) {
        refuse();
        return d;
      }
      return next.slice(0, 6);
    });
  };

  const amountStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  if (done) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top, alignItems: "center", justifyContent: "center", padding: space.xl }]}>
        <Aurora preset="gold" height={600} />
        <Animated.View entering={FadeIn.duration(400)} style={{ alignItems: "center" }}>
          <View style={styles.okOrb}>
            <Icon name="check" size={40} color={C.goldInk} />
          </View>
          <Text style={{ fontFamily: font.displayBold, fontSize: 40, color: C.text, marginTop: space.xl, letterSpacing: -1.4 }}>
            ₹{groupIndian(amount)}
          </Text>
          <T.Body style={{ marginTop: 6 }}>would be on its way to your wallet</T.Body>
          <T.Tiny style={{ marginTop: space.md, textAlign: "center" }}>Front-end preview — no payment was taken.</T.Tiny>
          <Button label="Back to wallet" onPress={() => router.back()} style={{ marginTop: space.xxl, alignSelf: "stretch" }} />
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + space.sm, paddingBottom: Math.max(insets.bottom, space.lg) }]}>
      <Aurora preset="gold" height={420} />

      <View style={styles.head}>
        <IconButton icon="close" label="Close" onPress={() => router.back()} />
        <T.Sub style={{ flex: 1, textAlign: "center" }}>Add money</T.Sub>
        <View style={{ width: 44 }} />
      </View>

      <View style={{ alignItems: "center", marginTop: space.xxl }}>
        <T.Label>Amount</T.Label>
        <Animated.View style={[{ flexDirection: "row", alignItems: "flex-start", marginTop: space.sm }, amountStyle]}>
          <Text style={{ fontFamily: font.display, fontSize: 30, color: digits ? C.textDim : C.textFaint, marginTop: 8, marginRight: 4 }}>₹</Text>
          <Text style={{ fontFamily: font.displayBold, fontSize: 60, color: digits ? C.text : C.textFaint, letterSpacing: -2.4 }}>
            {digits ? groupIndian(amount) : "0"}
          </Text>
        </Animated.View>
        <T.Tiny style={{ marginTop: 4 }}>₹{MIN} minimum · ₹{groupIndian(MAX)} a day</T.Tiny>

        <View style={styles.presets}>
          {PRESETS.map((p) => (
            <Touch key={p} haptic="select" onPress={() => setDigits(String(p))} accessibilityLabel={`${p} rupees`} style={[styles.preset, amount === p && styles.presetOn]}>
              <Text style={[text.smallSemi, { color: amount === p ? C.goldInk : C.text }]}>₹{groupIndian(p)}</Text>
            </Touch>
          ))}
        </View>
      </View>

      <View style={styles.methods}>
        {([
          ["upi", "UPI", "bolt"],
          ["card", "Card", "wallet"],
          ["net", "Net banking", "business"],
        ] as [typeof method, string, IconName][]).map(([id, label, icon]) => {
          const on = method === id;
          return (
            <Touch key={id} haptic="select" onPress={() => setMethod(id)} accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={label} style={[styles.method, on && styles.methodOn]}>
              <IconTile icon={icon} tone={on ? "gold" : "neutral"} size={34} />
              <Text style={[text.smallSemi, { color: on ? C.text : C.textDim }]}>{label}</Text>
            </Touch>
          );
        })}
      </View>

      <View style={{ flex: 1 }} />

      <View style={styles.pad}>
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "back"].map((k, i) =>
          k === "" ? (
            <View key={`g${i}`} style={styles.key} />
          ) : (
            <Touch key={k} haptic="light" scaleTo={0.86} onPress={() => tap(k)} accessibilityLabel={k === "back" ? "Delete" : k} style={styles.key}>
              {k === "back" ? <Icon name="back" size={24} color={C.textDim} /> : <Text style={styles.keyText}>{k}</Text>}
            </Touch>
          ),
        )}
      </View>

      <View style={{ paddingHorizontal: space.lg, marginTop: space.md }}>
        <Button
          label={valid ? `Add ₹${groupIndian(amount)}` : "Enter an amount"}
          disabled={!valid}
          sub={valid ? "Front-end preview — no payment is taken" : undefined}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            setDone(true);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.void },
  head: { flexDirection: "row", alignItems: "center", paddingHorizontal: space.lg },
  presets: { flexDirection: "row", gap: space.sm, marginTop: space.xl },
  preset: { paddingHorizontal: 14, height: 38, justifyContent: "center", borderRadius: 19, backgroundColor: C.glassHigh, borderWidth: StyleSheet.hairlineWidth, borderColor: C.hairline },
  presetOn: { backgroundColor: C.gold, borderColor: C.gold },
  methods: { flexDirection: "row", gap: space.sm, paddingHorizontal: space.lg, marginTop: space.xxl },
  method: { flex: 1, alignItems: "center", gap: 8, paddingVertical: space.md, borderRadius: radius.lg, backgroundColor: C.glass, borderWidth: 1, borderColor: C.hairline },
  methodOn: { borderColor: C.gold, backgroundColor: "rgba(242,198,109,0.08)" },
  pad: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: space.xl },
  key: { width: "33.33%", height: 62, alignItems: "center", justifyContent: "center" },
  keyText: { fontFamily: font.display, fontSize: 28, color: C.text },
  okOrb: { width: 92, height: 92, borderRadius: 46, backgroundColor: C.gold, alignItems: "center", justifyContent: "center" },
});
