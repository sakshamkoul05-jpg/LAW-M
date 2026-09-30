import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, type LayoutRectangle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { color as C, font, motion, radius as R } from "@/theme";
import { Press } from "./Press";
import { T } from "./Text";

/**
 * A segmented control whose selection SLIDES.
 *
 * The indicator is one element that springs between measured positions, not a
 * background that switches on under each option. The eye follows it, which is
 * how you know which way you moved — the difference between a control and a
 * row of buttons.
 *
 * `scroll` makes it a horizontally scrolling tab strip for more options than
 * fit (the filing workspace has five).
 */
export function Segmented<K extends string>({
  options,
  value,
  onChange,
  scroll,
  counts,
}: {
  options: { id: K; label: string }[];
  value: K;
  onChange: (id: K) => void;
  scroll?: boolean;
  counts?: Partial<Record<K, number>>;
}) {
  const [layouts, setLayouts] = useState<Partial<Record<K, LayoutRectangle>>>({});
  const x = useSharedValue(0);
  const w = useSharedValue(0);
  const ready = useSharedValue(0);

  useEffect(() => {
    const l = layouts[value];
    if (!l) return;
    if (!ready.value) {
      x.value = l.x;
      w.value = l.width;
      ready.value = 1;
    } else {
      x.value = withSpring(l.x, motion.slide);
      w.value = withSpring(l.width, motion.slide);
    }
  }, [layouts, value, x, w, ready]);

  const pill = useAnimatedStyle(() => ({ opacity: ready.value, width: w.value, transform: [{ translateX: x.value }] }));

  const row = (
    <View style={[styles.track, scroll && { alignSelf: "flex-start" }]} accessibilityRole="tablist">
      <Animated.View style={[styles.pill, pill]} />
      {options.map((o) => {
        const on = o.id === value;
        const n = counts?.[o.id];
        return (
          <Press
            key={o.id}
            lift={false}
            haptic="select"
            radius={R.pill}
            onPress={() => onChange(o.id)}
            accessibilityRole="tab"
            accessibilityLabel={o.label}
            accessibilityState={{ selected: on }}
            onLayout={(e) => {
              const l = e.nativeEvent.layout;
              setLayouts((cur) => (cur[o.id]?.x === l.x && cur[o.id]?.width === l.width ? cur : { ...cur, [o.id]: l }));
            }}
            style={[styles.opt, !scroll && { flex: 1 }]}
          >
            <T v="calloutMedium" numberOfLines={1} color={on ? C.text : C.textMuted} style={{ fontFamily: on ? font.semibold : font.medium }}>
              {o.label}
            </T>
            {n != null && n > 0 && (
              <View style={[styles.count, on && { backgroundColor: C.gold }]}>
                <T v="micro" color={on ? C.ink : C.textDim} style={{ fontFamily: font.bold, fontSize: 10 }} num>
                  {n}
                </T>
              </View>
            )}
          </Press>
        );
      })}
    </View>
  );

  if (!scroll) return row;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 8 }}>
      {row}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    padding: 4,
    borderRadius: R.pill,
    backgroundColor: C.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.line,
  },
  pill: {
    position: "absolute",
    top: 4,
    bottom: 4,
    left: 0,
    borderRadius: R.pill,
    backgroundColor: C.surfaceTop,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.lineStrong,
  },
  opt: { height: 36, paddingHorizontal: 16, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6 },
  count: { minWidth: 18, height: 18, paddingHorizontal: 5, borderRadius: 9, backgroundColor: C.surfaceTop, alignItems: "center", justifyContent: "center" },
});
