import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { drop } from "./enter";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { FadeOutUp, SlideInUp, runOnJS } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon, type IconName } from "@/icons/Icon";
import { color as C, elevation, space } from "@/theme";
import { Glass } from "./Surface";
import { T } from "./Text";
import { buzz } from "./Press";

type Tone = "good" | "bad" | "info" | "gold";
type Toast = { id: number; title: string; body?: string; tone: Tone; icon?: IconName };

const Ctx = createContext<(t: Omit<Toast, "id" | "tone"> & { tone?: Tone }) => void>(() => {});

const ICON: Record<Tone, IconName> = { good: "checkCircle", bad: "alert", info: "info", gold: "verified" };
const TINT: Record<Tone, string> = { good: C.green, bad: C.red, info: C.textDim, gold: C.gold };

/**
 * Toasts: one at a time, from the top, on a spring; gone after 2.8 s or
 * with a flick upwards. For confirming something that happened — money added,
 * a message sent — never for errors the person has to act on, which belong
 * next to the thing that failed.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();

  const dismiss = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setToast(null);
  }, []);

  const show = useCallback((t: Omit<Toast, "id" | "tone"> & { tone?: Tone }) => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ ...t, tone: t.tone ?? "good", id: Date.now() });
    buzz(t.tone === "bad" ? "medium" : "success");
    timer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  const fling = Gesture.Fling()
    .direction(4 /* up */)
    .onEnd(() => runOnJS(dismiss)());

  return (
    <Ctx.Provider value={show}>
      {children}
      <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, { paddingTop: insets.top + space.sm, alignItems: "center" }]}>
        {toast && (
          <GestureDetector gesture={fling}>
            <Animated.View key={toast.id} entering={drop()} exiting={FadeOutUp.duration(180)} style={[styles.wrap, elevation.card]}>
              <Glass radius={20} style={{ width: "100%" }}>
                <View style={styles.inner} accessibilityLiveRegion="polite" accessibilityRole="alert">
                  <Icon name={toast.icon ?? ICON[toast.tone]} size={20} color={TINT[toast.tone]} />
                  <View style={{ flex: 1 }}>
                    <T v="calloutMedium">{toast.title}</T>
                    {toast.body && <T v="caption" tone="dim">{toast.body}</T>}
                  </View>
                </View>
              </Glass>
            </Animated.View>
          </GestureDetector>
        )}
      </View>
    </Ctx.Provider>
  );
}

export function useToast() {
  return useContext(Ctx);
}

const styles = StyleSheet.create({
  wrap: { width: "92%", maxWidth: 420 },
  inner: { flexDirection: "row", alignItems: "center", gap: space.md, paddingHorizontal: space.lg, paddingVertical: 14 },
});
