import React, { useEffect, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, TextInput, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { color as C, font, radius as R } from "@/theme";
import { pop } from "./enter";
import { T } from "./Text";
import { buzz } from "./Press";

/**
 * The six-digit code, as six boxes.
 *
 * One real TextInput sits invisibly on top, so paste, the SMS/email one-time
 * code autofill on iOS and Android, and the system keyboard all work as they
 * would on a plain field. The boxes are only the drawing: the next empty box
 * carries a blinking caret and a gold edge, and each digit pops in as it is
 * typed. A wrong code shakes the row once.
 */
export function CodeInput({ value, onChange, error, length = 6, autoFocus = true }: { value: string; onChange: (v: string) => void; error?: boolean; length?: number; autoFocus?: boolean }) {
  const ref = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const shake = useSharedValue(0);
  const caret = useSharedValue(1);

  useEffect(() => {
    caret.value = withRepeat(withSequence(withTiming(0, { duration: 500 }), withTiming(1, { duration: 500 })), -1);
  }, [caret]);
  useEffect(() => {
    if (error) {
      buzz("medium");
      shake.value = withSequence(withTiming(-8, { duration: 50 }), withTiming(8, { duration: 70 }), withTiming(-5, { duration: 60 }), withTiming(0, { duration: 60 }));
    }
  }, [error, shake]);

  const row = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));
  const blink = useAnimatedStyle(() => ({ opacity: caret.value }));

  return (
    <Pressable onPress={() => ref.current?.focus()} accessibilityLabel="Verification code" accessibilityHint={`Enter the ${length}-digit code`}>
      <Animated.View style={[styles.row, row]}>
        {Array.from({ length }, (_, i) => {
          const ch = value[i];
          const active = focused && i === Math.min(value.length, length - 1) && value.length < length;
          return (
            <View key={i} style={[styles.box, active && styles.active, !!ch && styles.filled, error && styles.bad]}>
              {ch ? (
                <Animated.View key={ch + i} entering={pop()}>
                  <T style={styles.digit} num>
                    {ch}
                  </T>
                </Animated.View>
              ) : active ? (
                <Animated.View style={[styles.caret, blink]} />
              ) : null}
            </View>
          );
        })}
      </Animated.View>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={(t) => {
          const d = t.replace(/\D/g, "").slice(0, length);
          if (d.length > value.length) buzz("select");
          onChange(d);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete={Platform.OS === "android" ? "sms-otp" : "one-time-code"}
        maxLength={length}
        autoFocus={autoFocus}
        caretHidden
        style={styles.hidden}
        accessibilityLabel="Verification code"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8, justifyContent: "center" },
  box: { flex: 1, maxWidth: 52, aspectRatio: 0.82, borderRadius: R.sm, backgroundColor: C.surface, borderWidth: 1, borderColor: C.lineStrong, alignItems: "center", justifyContent: "center" },
  active: { borderColor: C.gold, shadowColor: C.gold, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } },
  filled: { borderColor: C.goldLine, backgroundColor: C.surfaceHigh },
  bad: { borderColor: C.red },
  digit: { fontFamily: font.semibold, fontSize: 24, color: C.text },
  caret: { width: 2, height: 24, borderRadius: 1, backgroundColor: C.gold },
  hidden: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, opacity: 0.02, color: "transparent" },
});
