import React, { useEffect } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Icon, type IconName } from "@/icons/Icon";
import { color as C, font, motion, radius, space } from "@/theme";
import { Touch } from "./primitives";
import { useAppWidth } from "./AppWidth";

/**
 * The tab bar.
 *
 * WHY IT IS HAND-BUILT
 *
 * The stock bar is fine and looks like the stock bar. Three things here are
 * worth the file:
 *
 *   1. A LIT PILL that slides between tabs on a spring. It is the only thing
 *      that moves, so the eye tracks it and the icons stay still — swapping
 *      which icon is bright makes the bar flicker; sliding one highlight
 *      underneath does not.
 *   2. THE ICON DOES NOT CHANGE SHAPE when selected. It gains a soft fill in
 *      the same hue. Silhouette-swapping (outline to solid) is the most common
 *      tab-bar mistake: in peripheral vision the shape changing reads as the
 *      icon being replaced, and people lose their place.
 *   3. A SELECTION haptic, and only on a real change. Tapping the tab you are
 *      already on buzzes for nothing, which is how a phone teaches somebody to
 *      ignore its haptics.
 *
 * The bar floats over the content on blur rather than sitting on an opaque
 * strip, so a list scrolling under it stays visible. That is what makes a
 * screen feel taller than the phone.
 */
/**
 * Route name to icon. Explicit rather than derived: the home route is called
 * "index" because that is what the router requires of a folder's default
 * screen, and deriving an icon from a filename convention would leave exactly
 * one tab silently blank.
 */
const ROUTE_ICON: Record<string, IconName> = {
  index: "home",
  services: "services",
  orders: "orders",
  wallet: "wallet",
  account: "account",
};

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  /* The app's width, not the window's: inside the web preview's phone frame
     they differ, and sizing five slots off the window leaves four of them off
     the side of the phone. */
  const width = useAppWidth();

  const SIDE = space.lg;
  const barWidth = width - SIDE * 2;
  const slot = barWidth / state.routes.length;
  const PILL = slot - 10;

  const x = useSharedValue(state.index * slot + (slot - PILL) / 2);

  useEffect(() => {
    x.value = withSpring(state.index * slot + (slot - PILL) / 2, motion.arrive);
  }, [state.index, slot, PILL, x]);

  const pill = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <View
      style={{
        position: "absolute",
        left: SIDE,
        right: SIDE,
        bottom: Math.max(insets.bottom, space.md),
      }}
    >
      <View style={styles.shell}>
        <BlurView
          intensity={Platform.OS === "ios" ? 42 : 24}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
        {/* Blur alone is too transparent over a bright photo, and the icons go
            unreadable exactly when a flyer scrolls under the bar. */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(12,14,20,0.72)" }]} />
        <LinearGradient
          colors={[C.litEdge, "transparent"]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.5 }}
        />

        <Animated.View style={[styles.pill, { width: PILL }, pill]} pointerEvents="none">
          <LinearGradient
            colors={["rgba(230,195,107,0.16)", "rgba(230,195,107,0.04)"]}
            style={[StyleSheet.absoluteFill, { borderRadius: radius.md }]}
          />
        </Animated.View>

        <View style={{ flexDirection: "row" }}>
          {state.routes.map((route, i) => {
            const { options } = descriptors[route.key];
            const focused = state.index === i;
            const label = (options.title ?? route.name) as string;
            const icon = ROUTE_ICON[route.name] ?? "home";

            return (
              <Touch
                key={route.key}
                haptic="none"
                accessibilityRole="tab"
                accessibilityState={{ selected: focused }}
                accessibilityLabel={label}
                onPress={() => {
                  const event = navigation.emit({
                    type: "tabPress",
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (focused || event.defaultPrevented) return;
                  Haptics.selectionAsync().catch(() => {});
                  navigation.navigate(route.name);
                }}
                style={{ width: slot, alignItems: "center", paddingVertical: 11 }}
              >
                <TabIcon name={icon} focused={focused} />
                <Text
                  style={{
                    fontFamily: focused ? font.bodySemi : font.body,
                    fontSize: 9.5,
                    letterSpacing: 0.3,
                    marginTop: 4,
                    color: focused ? C.gold : C.textFaint,
                  }}
                >
                  {label}
                </Text>
              </Touch>
            );
          })}
        </View>
      </View>
    </View>
  );
}

/** A small lift on selection. Enough to notice, not enough to bounce. */
function TabIcon({ name, focused }: { name: IconName; focused: boolean }) {
  const lift = useSharedValue(0);

  useEffect(() => {
    lift.value = withTiming(focused ? 1 : 0, motion.fade);
  }, [focused, lift]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -lift.value * 1.5 }, { scale: 1 + lift.value * 0.06 }],
  }));

  return (
    <Animated.View style={style}>
      <Icon name={name} size={23} color={focused ? C.gold : C.textFaint} active={focused} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: radius.xl,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.hairline,
    shadowColor: "#000",
    shadowOpacity: 0.55,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 16,
  },
  pill: {
    position: "absolute",
    top: 6,
    bottom: 6,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(230,195,107,0.22)",
    overflow: "hidden",
  },
});
