import React, { useEffect } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { color as C, motion, radius, space, text } from "@/theme";

/**
 * A bottom sheet — how Revolut and Phantom present every action.
 *
 * An action that opens a whole new screen takes the customer away from what
 * they were looking at; a sheet keeps it visible, dimmed, behind. Add money,
 * pick a photo source, confirm a payment: all sheets.
 *
 * Drag the handle down past a third of its height, or flick it, and it goes.
 * The backdrop fades with the drag rather than snapping at the end, so the
 * gesture feels continuous.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const y = useSharedValue(600);
  const fade = useSharedValue(0);

  useEffect(() => {
    if (open) {
      y.value = 600;
      y.value = withSpring(0, motion.arrive);
      fade.value = withTiming(1, motion.fade);
    }
  }, [open, y, fade]);

  const close = () => {
    fade.value = withTiming(0, motion.fade);
    y.value = withTiming(700, { duration: 220 }, (done) => {
      if (done) runOnJS(onClose)();
    });
  };

  const drag = Gesture.Pan()
    .onChange((e) => {
      y.value = Math.max(0, y.value + e.changeY);
      fade.value = Math.max(0, 1 - y.value / 500);
    })
    .onEnd((e) => {
      if (y.value > 140 || e.velocityY > 900) {
        fade.value = withTiming(0, motion.fade);
        y.value = withTiming(700, { duration: 200 }, (done) => {
          if (done) runOnJS(onClose)();
        });
      } else {
        y.value = withSpring(0, motion.arrive);
        fade.value = withTiming(1, motion.fade);
      }
    });

  const sheet = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  const backdrop = useAnimatedStyle(() => ({ opacity: fade.value }));

  return (
    <Modal visible={open} transparent animationType="none" onRequestClose={close} statusBarTranslucent>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Animated.View style={[StyleSheet.absoluteFill, backdrop]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Close">
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.55)" }]} />
          </Pressable>
        </Animated.View>

        <Animated.View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, space.lg) + space.sm }, sheet]}>
          <GestureDetector gesture={drag}>
            <View style={styles.grab} accessibilityLabel="Drag down to close">
              <View style={styles.handle} />
              {title ? <Text style={[text.heading, { color: C.text, marginTop: space.md }]}>{title}</Text> : null}
            </View>
          </GestureDetector>
          <View style={{ paddingHorizontal: space.xl }}>{children}</View>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#121219",
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.hairlineStrong,
    maxWidth: 520,
    alignSelf: "center",
    width: "100%",
  },
  grab: { alignItems: "center", paddingTop: 10, paddingBottom: space.lg },
  handle: { width: 38, height: 5, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.22)" },
});
