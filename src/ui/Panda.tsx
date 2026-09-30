import React, { useEffect, useRef, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { color as C } from "@/theme";

const OPEN = require("../../assets/brand/panda-open.png");
const BLINK = require("../../assets/brand/panda-blink.png");

/**
 * Panda — the website's assistant, in the website's own artwork.
 *
 * It blinks the way the website's panda does: irregularly, every two to six
 * seconds, and now and then twice in a row. A fixed interval reads as a
 * machine; this reads as somebody paying attention.
 *
 * Both frames are always mounted and one is shown, so a blink never flashes
 * a blank while the second image decodes.
 *
 *   halo      a faint warm glow behind, for the places Panda is the subject
 *   ring      a thin gold ring, for avatars in a list or a chat
 */
export function Panda({ size = 56, halo, ring, still }: { size?: number; halo?: boolean; ring?: boolean; still?: boolean }) {
  const [shut, setShut] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const breathe = useSharedValue(0);

  useEffect(() => {
    if (still) return;
    let alive = true;
    const schedule = () => {
      timer.current = setTimeout(() => blink(Math.random() < 0.25), 2000 + Math.random() * 4000);
    };
    const blink = (twice: boolean) => {
      if (!alive) return;
      setShut(true);
      timer.current = setTimeout(() => {
        if (!alive) return;
        setShut(false);
        if (twice) timer.current = setTimeout(() => blink(false), 180);
        else schedule();
      }, 130);
    };
    schedule();
    return () => {
      alive = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [still]);

  useEffect(() => {
    if (!halo || still) return;
    breathe.value = withRepeat(withSequence(withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: 2400, easing: Easing.inOut(Easing.sin) })), -1);
  }, [halo, still, breathe]);
  const glow = useAnimatedStyle(() => ({ opacity: 0.55 + breathe.value * 0.35, transform: [{ scale: 1 + breathe.value * 0.05 }] }));

  const img = size * (ring ? 0.86 : 1);
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }} accessibilityLabel="Panda" accessibilityRole="image">
      {halo && (
        <Animated.View style={[{ position: "absolute", width: size * 1.7, height: size * 1.7 }, glow]} pointerEvents="none">
          <Svg width={size * 1.7} height={size * 1.7}>
            <Defs>
              <RadialGradient id={`ph${size}`} cx="50%" cy="50%" r="50%">
                <Stop offset="0.35" stopColor="#C6A15B" stopOpacity={0.28} />
                <Stop offset="1" stopColor="#C6A15B" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx={size * 0.85} cy={size * 0.85} r={size * 0.85} fill={`url(#ph${size})`} />
          </Svg>
        </Animated.View>
      )}
      {ring && <View style={[StyleSheet.absoluteFill, { borderRadius: size / 2, backgroundColor: C.surfaceTop, borderWidth: 1, borderColor: C.goldLine }]} />}
      <View style={{ width: img, height: img }}>
        {/* Explicit sizes, not absoluteFill: on the web an asset's own 224px
            size overrides a fill and the panda escapes its circle. */}
        <Image source={OPEN} style={{ position: "absolute", left: 0, top: 0, width: img, height: img, opacity: shut ? 0 : 1 }} resizeMode="contain" />
        <Image source={BLINK} style={{ position: "absolute", left: 0, top: 0, width: img, height: img, opacity: shut ? 1 : 0 }} resizeMode="contain" />
      </View>
    </View>
  );
}
