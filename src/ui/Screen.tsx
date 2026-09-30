import React from "react";
import { Platform, RefreshControl, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import Animated, {
  Extrapolation,
  FadeIn,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { PHONE_COLUMN, useDevice, useLayout } from "@/components/AppWidth";
import { color as C, gradient, MAX_CONTENT, space } from "@/theme";
import { IconButton } from "./Button";
import { T } from "./Text";

/**
 * The frame every screen sits in.
 *
 * THE LARGE TITLE
 *
 * A screen opens with its name set large, the way iOS does it. As you scroll,
 * the large title slides up and fades, and the same name appears small in a
 * bar that frosts in over the content. It keeps you oriented without spending
 * a hundred pixels of every screen on a permanent header.
 *
 * THE GROUND
 *
 * A single, very faint warm glow at the top — the only "lighting" in the
 * product, and dim enough that you notice it only when it is missing.
 *
 * WIDE SCREENS
 *
 * Content is held to MAX_CONTENT and centred, with more side padding. The
 * screen does not stretch because the window did.
 */
export function Screen({
  title,
  kicker,
  subtitle,
  back,
  right,
  header,
  children,
  tabbed = false,
  footer,
  onRefresh,
  refreshing = false,
  contentStyle,
  glow = true,
  scrollY: externalY,
  large = true,
}: {
  title?: string;
  kicker?: string;
  subtitle?: string;
  /** Show a back button. `true` goes back; a function does whatever it says. */
  back?: boolean | (() => void);
  right?: React.ReactNode;
  /** Replaces the large title entirely (Home). */
  header?: React.ReactNode;
  children: React.ReactNode;
  /** Leaves room for the bottom navigation on a phone. */
  tabbed?: boolean;
  /** Pinned to the bottom, over a fade — a primary action that must stay in reach. */
  footer?: React.ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  glow?: boolean;
  scrollY?: SharedValue<number>;
  /** False when the screen draws its own hero: the title then lives only in the bar. */
  large?: boolean;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const layout = useLayout();
  const wide = layout !== "compact";
  const own = useSharedValue(0);
  const y = externalY ?? own;

  const onScroll = useAnimatedScrollHandler((e) => {
    y.value = e.contentOffset.y;
  });

  const barBg = useAnimatedStyle(() => ({ opacity: interpolate(y.value, [10, 60], [0, 1], Extrapolation.CLAMP) }));
  const smallTitle = useAnimatedStyle(() => ({
    opacity: interpolate(y.value, [40, 80], [0, 1], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(y.value, [40, 80], [6, 0], Extrapolation.CLAMP) }],
  }));
  const largeTitle = useAnimatedStyle(() => ({
    opacity: interpolate(y.value, [0, 70], [1, 0], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(y.value, [-80, 0, 80], [16, 0, -10], Extrapolation.CLAMP) },
      { scale: interpolate(y.value, [-120, 0], [1.06, 1], Extrapolation.CLAMP) },
    ],
  }));

  const barH = insets.top + 56;
  const { narrow } = useDevice();
  const side = narrow ? space.lg : space.xl;
  const goBack = typeof back === "function" ? back : () => (router.canGoBack() ? router.back() : router.replace("/"));
  const hasBar = !!(back || right || title);

  return (
    <View style={styles.fill}>
      {glow && <Glow />}

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.gold} progressViewOffset={barH} /> : undefined}
        contentContainerStyle={{
          paddingTop: hasBar && !header ? barH : insets.top + space.md,
          paddingBottom: (tabbed && !wide ? 118 : space.hero) + (footer ? 84 : 0) + insets.bottom,
        }}
      >
        <View style={[styles.column, { paddingHorizontal: side }]}>
          {header ?? (
            title && large && (
              <Animated.View style={[styles.large, largeTitle]}>
                {kicker && <T v="label" tone="gold" style={{ marginBottom: 6 }}>{kicker}</T>}
                <T v={wide ? "display" : "title1"} accessibilityRole="header">
                  {title}
                </T>
                {subtitle && (
                  <T v="body" style={{ marginTop: 6, maxWidth: 560 }}>
                    {subtitle}
                  </T>
                )}
              </Animated.View>
            )
          )}
          <Animated.View entering={FadeIn.duration(260)} style={contentStyle}>
            {children}
          </Animated.View>
        </View>
      </Animated.ScrollView>

      {hasBar && (
        <View style={[styles.bar, { height: barH, paddingTop: insets.top }]} pointerEvents="box-none">
          <Animated.View style={[StyleSheet.absoluteFill, barBg]} pointerEvents="none">
            {Platform.OS === "ios" || Platform.OS === "web" ? (
              <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
            ) : null}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: Platform.OS === "android" ? "rgba(5,5,5,0.97)" : "rgba(5,5,5,0.7)" }]} />
            <View style={styles.barRule} />
          </Animated.View>
          <View style={[styles.barRow, styles.column, { paddingHorizontal: side - 4 }]} pointerEvents="box-none">
            <View style={styles.barSide}>{back ? <IconButton icon="back" label="Back" onPress={goBack} size={38} /> : null}</View>
            <Animated.View style={[styles.barTitle, smallTitle]} pointerEvents="none">
              {title && (
                <T v="headline" numberOfLines={1}>
                  {title}
                </T>
              )}
            </Animated.View>
            <View style={[styles.barSide, { alignItems: "flex-end" }]}>
              <View style={{ flexDirection: "row", gap: 8 }}>{right}</View>
            </View>
          </View>
        </View>
      )}

      {footer && (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, space.lg) + (tabbed && !wide ? 96 : 0) }]} pointerEvents="box-none">
          <LinearGradient colors={gradient.fadeDown} style={StyleSheet.absoluteFill} pointerEvents="none" />
          <View style={[styles.column, { paddingHorizontal: side, width: "100%" }, wide && { maxWidth: 560 }]}>{footer}</View>
        </View>
      )}
    </View>
  );
}

/** The one light in the room: a faint warm radial at the top. Static — no cost. */
export function Glow({ height = 460, strength = 1 }: { height?: number; strength?: number }) {
  return (
    <View style={[styles.glow, { height }]} pointerEvents="none">
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <RadialGradient id="g" cx="50%" cy="0%" rx="75%" ry="100%">
            <Stop offset="0" stopColor="#C6A15B" stopOpacity={0.13 * strength} />
            <Stop offset="0.45" stopColor="#C6A15B" stopOpacity={0.04 * strength} />
            <Stop offset="1" stopColor="#C6A15B" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#g)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: C.bg },
  column: { width: "100%", maxWidth: PHONE_COLUMN, alignSelf: "center" },
  large: { marginBottom: space.xxl, marginTop: space.xs },
  bar: { position: "absolute", left: 0, right: 0, top: 0 },
  barRule: { position: "absolute", left: 0, right: 0, bottom: 0, height: StyleSheet.hairlineWidth, backgroundColor: C.line },
  barRow: { flex: 1, flexDirection: "row", alignItems: "center" },
  barSide: { width: 96, justifyContent: "center" },
  barTitle: { flex: 1, alignItems: "center" },
  footer: { position: "absolute", left: 0, right: 0, bottom: 0, paddingTop: space.xxl, alignItems: "center" },
  glow: { position: "absolute", left: 0, right: 0, top: 0 },
});
