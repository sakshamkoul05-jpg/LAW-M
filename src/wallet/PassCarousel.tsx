import React, { useRef, useState } from "react";
import { Platform, ScrollView, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";
import { Press } from "@/ui";
import { color as C, space } from "@/theme";
import { Pass, PASS_RATIO, type PassData, type PassKind } from "./Pass";

/**
 * The passes, side by side, swiped like cards on a table.
 *
 * The centred pass is full size; its neighbours sit a little smaller and
 * dimmer and turn slightly away, so the row reads as a physical stack you are
 * leafing through rather than a strip of images. The dots under it stretch
 * into a bar for the current pass — position you can read in peripheral
 * vision.
 */
export function PassCarousel({
  width,
  kinds,
  data,
  onOpen,
}: {
  width: number;
  kinds: PassKind[];
  data: PassData;
  onOpen: (k: PassKind) => void;
}) {
  const cardW = Math.min(width - 48, 420);
  const gap = space.md;
  const step = cardW + gap;
  const sidePad = (width - cardW) / 2;
  const x = useSharedValue(0);
  const [index, setIndex] = useState(0);
  const ref = useRef<ScrollView>(null);

  const onScroll = useAnimatedScrollHandler((e) => {
    x.value = e.contentOffset.x;
  });

  return (
    <View>
      <Animated.ScrollView
        ref={ref as never}
        horizontal
        onScroll={onScroll}
        scrollEventThrottle={16}
        snapToInterval={step}
        decelerationRate="fast"
        disableIntervalMomentum
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / step))}
        onScrollEndDrag={Platform.OS === "web" ? (e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / step)) : undefined}
        contentContainerStyle={{ paddingHorizontal: sidePad, gap, paddingVertical: 28 }}
        style={{ marginVertical: -28, overflow: "visible" }}
      >
        {kinds.map((k, i) => (
          <Slide key={k} i={i} x={x} step={step}>
            <Pass kind={k} width={cardW} data={data} onPress={() => onOpen(k)} />
          </Slide>
        ))}
      </Animated.ScrollView>

      <View style={{ flexDirection: "row", justifyContent: "center", gap: 6, marginTop: space.lg }} accessibilityRole="tablist">
        {kinds.map((k, i) => (
          <Press key={k} onPress={() => { ref.current?.scrollTo({ x: i * step, animated: true }); setIndex(i); }} lift={false} haptic="select" radius={6} accessibilityRole="tab" accessibilityLabel={`Pass ${i + 1} of ${kinds.length}`} accessibilityState={{ selected: index === i }} hitSlop={10}>
            <Dot i={i} x={x} step={step} />
          </Press>
        ))}
      </View>
    </View>
  );
}

function Slide({ i, x, step, children }: { i: number; x: SharedValue<number>; step: number; children: React.ReactNode }) {
  const style = useAnimatedStyle(() => {
    const d = (x.value - i * step) / step;
    return {
      opacity: interpolate(Math.abs(d), [0, 1], [1, 0.5], Extrapolation.CLAMP),
      transform: [
        { perspective: 1200 },
        { scale: interpolate(Math.abs(d), [0, 1], [1, 0.9], Extrapolation.CLAMP) },
        { rotateY: `${interpolate(d, [-1, 0, 1], [-10, 0, 10], Extrapolation.CLAMP)}deg` },
      ],
    };
  });
  return <Animated.View style={style}>{children}</Animated.View>;
}

function Dot({ i, x, step }: { i: number; x: SharedValue<number>; step: number }) {
  const style = useAnimatedStyle(() => {
    const d = Math.abs(x.value / step - i);
    const t = interpolate(d, [0, 1], [1, 0], Extrapolation.CLAMP);
    return { width: 6 + t * 16, opacity: 0.3 + t * 0.7 };
  });
  return <Animated.View style={[{ height: 6, borderRadius: 3, backgroundColor: C.gold }, style]} />;
}

export const passHeight = (w: number) => Math.round(Math.min(w - 48, 420) / PASS_RATIO);
