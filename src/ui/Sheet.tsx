import React, { useEffect, useState } from "react";
import { Modal, Platform, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { BlurView } from "expo-blur";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { layoutFor } from "@/components/AppWidth";
import { color as C, elevation, motion, radius as R, space, themed } from "@/theme";
import { IconButton } from "./Button";
import { T } from "./Text";

/**
 * A modal sheet.
 *
 * ON A PHONE it rises from the bottom on a spring, with a handle, and a drag
 * down past a third of its height (or a flick) dismisses it — the gesture a
 * sheet is expected to have.
 *
 * ON A WIDE SCREEN a bottom sheet 1,400px wide is absurd, so the same content
 * becomes a centred dialog that scales up from 96% and fades in.
 *
 * Behind either, the page dims and blurs: the sheet is in front of the app,
 * not beside it.
 */
export function Sheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  scroll = true,
  maxHeight = 0.88,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  scroll?: boolean;
  maxHeight?: number;
}) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const wide = layoutFor(width) !== "compact";
  const [visible, setVisible] = useState(open);

  const shown = useSharedValue(0);
  const drag = useSharedValue(0);
  const sheetH = useSharedValue(height * maxHeight);

  useEffect(() => {
    if (open) {
      setVisible(true);
      drag.value = 0;
      shown.value = withSpring(1, motion.arrive);
    } else if (visible) {
      shown.value = withTiming(0, { duration: 200 }, (done) => {
        if (done) runOnJS(setVisible)(false);
      });
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const pan = Gesture.Pan()
    .enabled(!wide)
    .activeOffsetY(8)
    .onChange((e) => {
      drag.value = Math.max(0, drag.value + e.changeY);
    })
    .onEnd((e) => {
      if (drag.value > sheetH.value / 3 || e.velocityY > 900) runOnJS(onClose)();
      else drag.value = withSpring(0, motion.arrive);
    });

  const backdrop = useAnimatedStyle(() => ({ opacity: shown.value }));
  const sheet = useAnimatedStyle(() =>
    wide
      ? { opacity: shown.value, transform: [{ scale: 0.96 + shown.value * 0.04 }] }
      : { transform: [{ translateY: (1 - shown.value) * sheetH.value + drag.value }] },
  );

  if (!visible) return null;

  const body = scroll ? (
    <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: space.lg }} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  ) : (
    children
  );

  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Animated.View style={[StyleSheet.absoluteFill, backdrop]}>
          {Platform.OS !== "android" && <BlurView intensity={18} tint="dark" style={StyleSheet.absoluteFill} />}
          <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: C.scrim }]} onPress={onClose} accessibilityLabel="Close" accessibilityRole="button" />
        </Animated.View>

        <View style={[StyleSheet.absoluteFill, wide ? styles.centre : styles.bottom]} pointerEvents="box-none">
          <GestureDetector gesture={pan}>
            <Animated.View
              onLayout={(e) => (sheetH.value = e.nativeEvent.layout.height)}
              accessibilityViewIsModal
              style={[
                styles.sheet,
                elevation.card,
                wide
                  ? { width: Math.min(520, width - 48), maxHeight: height * 0.86, borderRadius: R.xxl }
                  : { width: "100%", maxHeight: height * maxHeight, paddingBottom: Math.max(insets.bottom, space.lg) },
                sheet,
              ]}
            >
              {!wide && <View style={styles.handle} />}
              {(title || subtitle) && (
                <View style={styles.head}>
                  <View style={{ flex: 1 }}>
                    {title && <T v="title3">{title}</T>}
                    {subtitle && (
                      <T v="callout" style={{ marginTop: 3 }}>
                        {subtitle}
                      </T>
                    )}
                  </View>
                  <IconButton icon="close" label="Close" onPress={onClose} size={34} />
                </View>
              )}
              <View style={{ paddingHorizontal: space.xl, flexShrink: 1 }}>{body}</View>
            </Animated.View>
          </GestureDetector>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = themed(() => ({
  bottom: { justifyContent: "flex-end" },
  centre: { justifyContent: "center", alignItems: "center" },
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: R.xxl,
    borderTopRightRadius: R.xxl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.lineStrong,
    overflow: "hidden",
  },
  handle: { alignSelf: "center", width: 38, height: 4, borderRadius: 2, backgroundColor: C.handle, marginTop: 8 },
  head: { flexDirection: "row", alignItems: "flex-start", gap: space.md, paddingHorizontal: space.xl, paddingTop: space.lg, paddingBottom: space.lg },
}));
