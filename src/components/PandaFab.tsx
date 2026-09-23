import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Easing,
  ReduceMotion,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { Icon } from "@/icons/Icon";
import { color as C, font, radius } from "@/theme";
import { Touch } from "./primitives";

/**
 * The Panda, floating over Home and Services.
 *
 * It breathes. A slow scale between 1 and 1.045 on a ten-second cycle, with a
 * halo that pulses out of phase with it. That is the entire animation, and it
 * is deliberately almost too slow to notice — a floating button that pulses on
 * a one-second loop is a notification badge, and people learn to tune it out
 * within a day. Something that moves at the speed of breathing reads as alive
 * and stays comfortable to sit beside.
 *
 * Not a sixth tab: five is the comfortable limit for a bar, and a cramped
 * sixth tab would make the assistant easier to miss, not harder.
 */
export function PandaFab({ onPress }: { onPress: () => void }) {
  const breath = useSharedValue(0);
  const halo = useSharedValue(0);

  useEffect(() => {
    const loop = (v: SharedValue<number>, ms: number) =>
      withRepeat(
        withSequence(
          withTiming(1, { duration: ms, easing: Easing.inOut(Easing.sin), reduceMotion: ReduceMotion.System }),
          withTiming(0, { duration: ms, easing: Easing.inOut(Easing.sin), reduceMotion: ReduceMotion.System }),
        ),
        -1,
        false,
      );
    breath.value = loop(breath, 5000);
    /* Out of phase on purpose. Two things pulsing together read as one thing
       flashing; offset, they read as depth. */
    halo.value = loop(halo, 3400);
  }, [breath, halo]);

  const orb = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(breath.value, [0, 1], [1, 1.045]) }],
  }));

  const glow = useAnimatedStyle(() => ({
    opacity: interpolate(halo.value, [0, 1], [0.28, 0.55]),
    transform: [{ scale: interpolate(halo.value, [0, 1], [1, 1.22]) }],
  }));

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <Animated.View style={[styles.halo, glow]} pointerEvents="none" />

      <Touch
        onPress={onPress}
        haptic="medium"
        accessibilityLabel="Chat with Panda AI"
        accessibilityHint="Opens the assistant"
      >
        <Animated.View style={[styles.orb, orb]}>
          <LinearGradient
            colors={[C.pandaHot, C.panda, C.pandaDeep]}
            locations={[0, 0.4, 1]}
            start={{ x: 0.25, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {/* The specular dot. One highlight, top-left, is what turns a filled
              circle into a sphere. */}
          <View style={styles.specular} />
          <Icon name="spark" size={22} color="#FFFFFF" active fill="rgba(255,255,255,0.35)" />
        </Animated.View>
      </Touch>

      <Text style={styles.caption}>PANDA</Text>
    </View>
  );
}

const SIZE = 58;

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    right: 18,
    bottom: 104,
    alignItems: "center",
  },
  halo: {
    position: "absolute",
    top: -6,
    width: SIZE + 12,
    height: SIZE + 12,
    borderRadius: (SIZE + 12) / 2,
    backgroundColor: C.panda,
  },
  orb: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.42)",
    shadowColor: C.pandaDeep,
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 14,
  },
  specular: {
    position: "absolute",
    top: 7,
    left: 11,
    width: 17,
    height: 11,
    borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.5)",
    transform: [{ rotate: "-22deg" }],
  },
  caption: {
    fontFamily: font.bodyBold,
    fontSize: 8,
    letterSpacing: 1.4,
    color: C.textFaint,
    marginTop: 5,
  },
});

export const PANDA_FAB_HEIGHT = SIZE + radius.sm;
