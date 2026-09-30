import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { Icon, type IconName } from "@/icons/Icon";
import { useLayout } from "@/components/AppWidth";
import { useStore } from "@/lib/store";
import { Avatar, Press, T, Wordmark, Mark } from "@/ui";
import { color as C, font, gradient, motion, radius as R, space } from "@/theme";
import { QuickActions } from "./QuickActions";

/**
 * Navigation on a tablet or desktop.
 *
 * A narrow rail, not a sidebar: on a desktop the content is the product, and a
 * 280px panel of links is a website's idea of an app. At "medium" widths it is
 * icons only, each with a tooltip on hover; at "expanded" it carries labels.
 * The selection is a single highlight that slides between items.
 */
const ITEMS: { href: string; label: string; icon: IconName; match: (p: string) => boolean }[] = [
  { href: "/", label: "Overview", icon: "home", match: (p) => p === "/" },
  { href: "/filings", label: "Filings", icon: "filings", match: (p) => p.startsWith("/filing") },
  { href: "/documents", label: "Documents", icon: "vault", match: (p) => p.startsWith("/document") },
  { href: "/wallet", label: "Wallet", icon: "wallet", match: (p) => p.startsWith("/wallet") },
  { href: "/services", label: "Services", icon: "services", match: (p) => p.startsWith("/service") || p.startsWith("/request") || p.startsWith("/apply") },
  { href: "/ai", label: "LAWFiC AI", icon: "panda", match: (p) => p === "/ai" },
  { href: "/notifications", label: "Notifications", icon: "bell", match: (p) => p === "/notifications" },
];

const ITEM_H = 46;

export function Rail() {
  const layout = useLayout();
  const router = useRouter();
  const path = usePathname();
  const { state, unread } = useStore();
  const [open, setOpen] = useState(false);
  const labels = layout === "expanded";
  const w = labels ? 232 : 76;

  const active = ITEMS.findIndex((i) => i.match(path));
  const y = useSharedValue(Math.max(0, active) * ITEM_H);
  const shown = useSharedValue(active >= 0 ? 1 : 0);
  useEffect(() => {
    if (active >= 0) y.value = withSpring(active * ITEM_H, motion.slide);
    shown.value = withSpring(active >= 0 ? 1 : 0, motion.slide);
  }, [active, y, shown]);
  const hl = useAnimatedStyle(() => ({ opacity: shown.value, transform: [{ translateY: y.value }] }));

  if (layout === "compact") return null;
  const awaiting = state.orders.filter((o) => o.status === "quoted").length;

  return (
    <View style={[styles.rail, { width: w }]} accessibilityRole="menu">
      <View style={[styles.brand, !labels && { alignItems: "center", paddingHorizontal: 0 }]}>{labels ? <Wordmark size={14} /> : <Mark size={26} />}</View>

      <Press onPress={() => setOpen(true)} haptic="medium" radius={R.md} accessibilityLabel="New" style={[styles.new, !labels && { width: 48, alignSelf: "center", paddingHorizontal: 0, justifyContent: "center" }]}>
        <LinearGradient colors={gradient.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFill, { borderRadius: R.md }]} />
        <Icon name="plus" size={18} color={C.ink} strokeWidth={2.2} />
        {labels && (
          <T v="calloutMedium" color={C.ink} style={{ fontFamily: font.semibold }}>
            New
          </T>
        )}
      </Press>

      <View style={{ marginTop: space.lg }}>
        <Animated.View style={[styles.highlight, { width: labels ? w - 24 : 52, left: labels ? 12 : 12 }, hl]} />
        {ITEMS.map((it, i) => (
          <RailItem
            key={it.href}
            item={it}
            active={i === active}
            labels={labels}
            badge={it.href === "/filings" ? awaiting : it.href === "/notifications" ? unread : 0}
            onPress={() => router.navigate(it.href as never)}
          />
        ))}
      </View>

      <View style={{ flex: 1 }} />
      <Press onPress={() => router.navigate("/profile")} radius={R.md} accessibilityLabel="Profile" style={[styles.me, !labels && { justifyContent: "center", paddingHorizontal: 0 }, path.startsWith("/profile") && { backgroundColor: C.surfaceTop }]}>
        <Avatar name={state.profile.fullName} uri={state.profile.photoUri} size={34} ring={path.startsWith("/profile")} />
        {labels && (
          <View style={{ flex: 1, minWidth: 0 }}>
            <T v="calloutMedium" numberOfLines={1}>
              {state.profile.fullName || "Your profile"}
            </T>
            <T v="caption" numberOfLines={1}>
              Profile & settings
            </T>
          </View>
        )}
      </Press>
      <QuickActions open={open} onClose={() => setOpen(false)} />
    </View>
  );
}

function RailItem({ item, active, labels, badge, onPress }: { item: (typeof ITEMS)[number]; active: boolean; labels: boolean; badge: number; onPress: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <View>
      <Press
        onPress={onPress}
        haptic="select"
        lift={false}
        radius={R.sm}
        accessibilityRole="menuitem"
        accessibilityLabel={item.label}
        accessibilityState={{ selected: active }}
        onHoverIn={() => setHover(true)}
        onHoverOut={() => setHover(false)}
        style={[styles.item, !labels && { justifyContent: "center", paddingHorizontal: 0 }, hover && !active && { backgroundColor: "rgba(255,255,255,0.03)" }]}
      >
        <View>
          <Icon name={item.icon} size={20} active={active} color={active ? C.gold : hover ? C.text : C.textMuted} />
          {!labels && badge > 0 && <View style={styles.dot} />}
        </View>
        {labels && (
          <>
            <T v="calloutMedium" color={active ? C.text : hover ? C.text : C.textDim} style={{ flex: 1, fontFamily: active ? font.semibold : font.medium }}>
              {item.label}
            </T>
            {badge > 0 && (
              <View style={styles.count}>
                <T v="micro" color={C.ink} style={{ fontFamily: font.bold }} num>
                  {badge > 9 ? "9+" : badge}
                </T>
              </View>
            )}
          </>
        )}
      </Press>
      {!labels && hover && Platform.OS === "web" && (
        <Animated.View entering={FadeIn.duration(120)} exiting={FadeOut.duration(80)} style={styles.tip} pointerEvents="none">
          <T v="captionMedium">{item.label}</T>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: { paddingVertical: space.xl, borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: C.line, backgroundColor: C.bgDeep, zIndex: 10 },
  brand: { height: 36, justifyContent: "center", paddingHorizontal: 22, marginBottom: space.lg },
  new: { flexDirection: "row", alignItems: "center", gap: 8, height: 44, marginHorizontal: 12, paddingHorizontal: 14, borderRadius: R.md, overflow: "hidden" },
  highlight: { position: "absolute", top: 0, height: ITEM_H - 6, marginTop: 3, borderRadius: R.sm, backgroundColor: C.surfaceTop, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line },
  item: { height: ITEM_H, flexDirection: "row", alignItems: "center", gap: 12, marginHorizontal: 12, paddingHorizontal: 12 },
  dot: { position: "absolute", right: -4, top: -2, width: 8, height: 8, borderRadius: 4, backgroundColor: C.gold },
  count: { minWidth: 20, height: 18, paddingHorizontal: 5, borderRadius: 9, backgroundColor: C.gold, alignItems: "center", justifyContent: "center" },
  tip: { position: "absolute", left: 70, top: 9, paddingHorizontal: 10, height: 28, justifyContent: "center", borderRadius: 8, backgroundColor: C.surfaceTop, borderWidth: StyleSheet.hairlineWidth, borderColor: C.lineStrong },
  me: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 12, padding: 8, borderRadius: R.md },
});
