import React, { useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { Extrapolation, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, type SharedValue } from "react-native-reanimated";
import { Icon } from "@/icons/Icon";
import { flyers, type Flyer } from "@/data/flyers";
import { Press, T } from "@/ui";
import { color as C, elevation, font, space } from "@/theme";

/**
 * The website's promotional banners (lib/promotional.ts), with the website's
 * own photography from lawfic.pro. The photo sits wider than its card and
 * drifts against the swipe — a parallax of a few pixels, which is what makes a
 * banner feel placed rather than pasted.
 */
export function FlyerCarousel({ width, inset = 0, onOpen }: { width: number; inset?: number; onOpen: (f: Flyer) => void }) {
  const gap = space.md;
  /* The next banner peeks in from the edge — the cue that there is more,
     without dots. */
  const card = Math.floor(width - inset * 2 - (inset ? 28 : 0));
  const stride = card + gap;
  const x = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    x.value = e.contentOffset.x;
  });

  return (
    <Animated.ScrollView
      horizontal
      snapToInterval={stride}
      decelerationRate="fast"
      showsHorizontalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={16}
      contentContainerStyle={{ gap, paddingHorizontal: inset }}
    >
      {flyers.map((f, i) => (
        <FlyerCard key={f.id} flyer={f} i={i} width={card} stride={stride} x={x} onPress={() => onOpen(f)} />
      ))}
    </Animated.ScrollView>
  );
}

function FlyerCard({ flyer, i, width, stride, x, onPress }: { flyer: Flyer; i: number; width: number; stride: number; x: SharedValue<number>; onPress: () => void }) {
  const h = Math.round(Math.min(width * 0.56, 260));
  const [failed, setFailed] = useState(false);
  const range = [(i - 1) * stride, i * stride, (i + 1) * stride];
  const photo = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(x.value, range, [width * 0.12, 0, -width * 0.12], Extrapolation.CLAMP) }, { scale: 1.2 }],
  }));

  return (
    <Press onPress={onPress} radius={24} accessibilityLabel={`${flyer.title}. ${flyer.cta}`} style={[{ width, height: h, borderRadius: 24, overflow: "hidden", backgroundColor: C.surfaceHigh }, elevation.mid]}>
      {!failed && (
        <Animated.View style={[StyleSheet.absoluteFill, photo]}>
          <Image source={{ uri: flyer.photo }} onError={() => setFailed(true)} style={StyleSheet.absoluteFill} resizeMode="cover" accessibilityIgnoresInvertColors />
        </Animated.View>
      )}
      <LinearGradient colors={["rgba(5,5,5,0.92)", "rgba(5,5,5,0.55)", "rgba(5,5,5,0.05)"]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
      <View style={styles.body}>
        <View style={styles.kicker}>
          <Icon name={flyer.icon} size={13} color={C.gold} />
          <T v="label" tone="gold" style={{ fontSize: 10 }}>
            {flyer.kicker}
          </T>
        </View>
        <T v="title3" style={{ maxWidth: "70%", marginTop: space.sm }} numberOfLines={3}>
          {flyer.title}
        </T>
        <View style={{ flex: 1 }} />
        <View style={styles.cta}>
          <T v="captionMedium" style={{ fontFamily: font.semibold }}>
            {flyer.cta}
          </T>
          <Icon name="forward" size={14} color={C.text} />
        </View>
      </View>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: 24, borderWidth: StyleSheet.hairlineWidth, borderColor: C.lineStrong }]} />
    </Press>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, padding: space.xl },
  kicker: { flexDirection: "row", alignItems: "center", gap: 6 },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.18)",
  },
});
