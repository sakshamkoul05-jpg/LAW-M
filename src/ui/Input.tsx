import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import Animated, {
  FadeIn,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Icon, type IconName } from "@/icons/Icon";
import { color as C, font, radius as R, space, text } from "@/theme";
import { T } from "./Text";

/**
 * A text field.
 *
 *   label   sits inside the field as a placeholder, and floats up and shrinks
 *           when the field is focused or filled — so the label is never lost
 *           once you start typing, which a placeholder alone would be
 *   focus   the border warms to gold and a faint glow comes up
 *   error   the message slides in under the field and the field shakes once
 *
 * The error shakes only when it APPEARS, not on every keystroke while it is
 * showing. A field that twitches as you type is punishing you for fixing it.
 */
export function Field({
  label,
  hint,
  error,
  prefix,
  icon,
  value,
  onFocus,
  onBlur,
  multiline,
  placeholder,
  note,
  ...input
}: TextInputProps & { label: string; hint?: string; error?: string | null; prefix?: string; icon?: IconName; note?: string }) {
  const [focused, setFocused] = useState(false);
  const up = useSharedValue(value ? 1 : 0);
  const glow = useSharedValue(0);
  const shake = useSharedValue(0);

  useEffect(() => {
    up.value = withTiming(focused || !!value ? 1 : 0, { duration: 180 });
  }, [focused, value, up]);
  useEffect(() => {
    glow.value = withTiming(focused ? 1 : 0, { duration: 200 });
  }, [focused, glow]);
  useEffect(() => {
    if (error) shake.value = withSequence(withTiming(-5, { duration: 50 }), withTiming(5, { duration: 70 }), withTiming(-3, { duration: 60 }), withTiming(0, { duration: 50 }));
  }, [!!error]); // eslint-disable-line react-hooks/exhaustive-deps

  const box = useAnimatedStyle(() => ({
    borderColor: error ? C.red : interpolateColor(glow.value, [0, 1], [C.lineStrong, C.gold]),
    shadowOpacity: glow.value * 0.25,
    transform: [{ translateX: shake.value }],
  }));
  const lab = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(up.value, [0, 1], [0, -11]) }, { scale: interpolate(up.value, [0, 1], [1, 0.8]) }],
  }));

  const h = multiline ? 110 : 58;

  return (
    <View>
      <Animated.View style={[styles.box, { minHeight: h }, box]}>
        {icon && <Icon name={icon} size={18} color={focused ? C.gold : C.textMuted} />}
        {/* The prefix appears with the typed value, once the label has floated
            up — shown under a resting label it sits out of line with it. */}
        {prefix && (focused || !!value) && (
          <T v="bodyMedium" tone="dim" style={{ marginTop: 14 }}>
            {prefix}
          </T>
        )}
        <View style={{ flex: 1, justifyContent: multiline ? "flex-start" : "center" }}>
          <Animated.View pointerEvents="none" style={[styles.label, multiline && { top: 14 }, lab]}>
            <T v="callout" color={error ? C.red : focused ? C.gold : C.textMuted} style={{ transformOrigin: "left" }}>
              {label}
            </T>
          </Animated.View>
          <TextInput
            {...input}
            value={value}
            multiline={multiline}
            /* The label sits where a placeholder would. Show the placeholder
               only once the label has floated up, or the two overlap. */
            placeholder={focused ? placeholder : undefined}
            accessibilityLabel={label}
            placeholderTextColor={C.textMuted}
            selectionColor={C.gold}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            style={[
              styles.input,
              multiline && { minHeight: 70, textAlignVertical: "top", paddingTop: 30 },
              Platform.OS === "web" && ({ outlineStyle: "none" } as object),
            ]}
          />
        </View>
      </Animated.View>
      {error ? (
        <Animated.View entering={FadeIn.duration(180)} style={styles.msg}>
          <Icon name="alert" size={13} color={C.red} />
          <T v="caption" color={C.red} style={{ flex: 1 }}>
            {error}
          </T>
        </Animated.View>
      ) : hint ? (
        <T v="caption" style={{ marginTop: 6, marginLeft: 4 }}>
          {hint}
        </T>
      ) : null}
      {note && (
        <View style={styles.msg}>
          <Icon name="lock" size={12} color={C.textMuted} />
          <T v="caption" style={{ flex: 1 }}>
            {note}
          </T>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: space.lg,
    borderRadius: R.md,
    borderWidth: 1,
    backgroundColor: C.surface,
    shadowColor: C.gold,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  label: { position: "absolute", left: 0, right: 0 },
  input: { ...text.bodyMedium, color: C.text, fontFamily: font.medium, paddingTop: 20, paddingBottom: 6, padding: 0, margin: 0 },
  msg: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 7, marginLeft: 4 },
});
