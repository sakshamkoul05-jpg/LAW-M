import React from "react";
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Icon, type IconName } from "@/icons/Icon";
import { initial } from "@/lib/format";
import { color as C, font, motion, radius as R, space } from "@/theme";
import { Press } from "./Press";
import { T } from "./Text";

/** A section title with an optional action on the right. */
export function SectionHeader({
  title,
  kicker,
  action,
  onAction,
  style,
}: {
  title: string;
  kicker?: string;
  action?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.head, style]}>
      <View style={{ flex: 1 }}>
        {kicker && <T v="label" style={{ marginBottom: 4 }}>{kicker}</T>}
        <T v="title3">{title}</T>
      </View>
      {action && onAction && (
        <Press onPress={onAction} haptic="select" radius={10} accessibilityLabel={action} style={styles.action} hitSlop={8}>
          <T v="calloutMedium" tone="gold">
            {action}
          </T>
          <Icon name="chevron" size={15} color={C.gold} />
        </Press>
      )}
    </View>
  );
}

/** A square tile holding an icon. Gold wash only when `gold`. */
export function IconTile({ icon, size = 40, gold, tone }: { icon: IconName; size?: number; gold?: boolean; tone?: string }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: gold ? C.goldWash : C.surfaceTop,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: gold ? C.goldLine : C.line,
      }}
    >
      <Icon name={icon} size={size * 0.46} color={tone ?? (gold ? C.gold : C.textDim)} />
    </View>
  );
}

/**
 * A list row: tile, title, subtitle, trailing value, chevron.
 * With no `onPress` it is information and draws no chevron — a chevron on a
 * row that goes nowhere is a promise the row cannot keep.
 */
export function Row({
  icon,
  gold,
  title,
  subtitle,
  trailing,
  trailingNode,
  onPress,
  danger,
  index = 0,
  animate = false,
}: {
  icon?: IconName;
  gold?: boolean;
  title: string;
  subtitle?: string;
  trailing?: string;
  trailingNode?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
  index?: number;
  animate?: boolean;
}) {
  const body = (
    <View style={styles.row}>
      {icon && <IconTile icon={icon} gold={gold} tone={danger ? C.red : undefined} size={36} />}
      <View style={{ flex: 1, minWidth: 0 }}>
        <T v="bodyMedium" color={danger ? C.red : C.text} numberOfLines={1}>
          {title}
        </T>
        {subtitle && (
          <T v="caption" numberOfLines={2} style={{ marginTop: 1 }}>
            {subtitle}
          </T>
        )}
      </View>
      {trailing && (
        <T v="callout" tone="dim" num numberOfLines={1} style={{ maxWidth: 150 }}>
          {trailing}
        </T>
      )}
      {trailingNode}
      {onPress && <Icon name="chevron" size={16} color={C.textMuted} />}
    </View>
  );
  const node = onPress ? (
    <Press onPress={onPress} accessibilityLabel={title} radius={0} scaleTo={0.985}>
      {body}
    </Press>
  ) : (
    body
  );
  if (!animate) return node;
  return <Animated.View entering={FadeInDown.delay(index * motion.STAGGER).duration(360)}>{node}</Animated.View>;
}

/** A grouped list of rows on one surface, with hairlines between. */
export function Group({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const items = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={[styles.group, style]}>
      {items.map((c, i) => (
        <View key={i}>
          {i > 0 && <View style={styles.rule} />}
          {c}
        </View>
      ))}
    </View>
  );
}

export function Avatar({ name, uri, size = 40, ring }: { name?: string | null; uri?: string | null; size?: number; ring?: boolean }) {
  return (
    <View
      style={[
        { width: size, height: size, borderRadius: size / 2, overflow: "hidden", alignItems: "center", justifyContent: "center" },
        ring && { borderWidth: 1.5, borderColor: C.goldLine },
      ]}
      accessibilityLabel={name ? `${name}'s photo` : "Profile"}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: "100%", height: "100%" }} />
      ) : (
        <>
          <LinearGradient colors={["#2A261F", "#15130F"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          <T style={{ fontFamily: font.semibold, fontSize: size * 0.4, color: C.goldLight }}>{initial(name)}</T>
        </>
      )}
    </View>
  );
}

const LOGO = require("../../assets/brand/lawfic-logo.png");
const LOGO_RATIO = 525 / 475;

/**
 * The LAWFIC logo — the brand's own gold badge (LAWFIC · EST 2026 · Quality
 * Service With Love), exactly as on lawfic.pro. `size` is its width.
 */
export function Logo({ size = 120 }: { size?: number }) {
  return <Image source={LOGO} style={{ width: size, height: size / LOGO_RATIO }} resizeMode="contain" accessibilityLabel="LAWFIC" accessibilityIgnoresInvertColors />;
}

/** The logo with the name beside it, for places a badge alone is too small to read. */
export function Wordmark({ size = 15, color = C.text }: { size?: number; color?: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: size * 0.55 }} accessibilityLabel="LAWFIC">
      <Logo size={size * 2.2} />
      <T style={{ fontFamily: font.semibold, fontSize: size, letterSpacing: size * 0.3, color }}>LAWFIC</T>
    </View>
  );
}

/** The logo at a given height — kept as `Mark` for the places sized by height. */
export function Mark({ size = 20 }: { size?: number }) {
  return <Logo size={size * LOGO_RATIO} />;
}

const styles = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "flex-end", marginBottom: space.md },
  action: { flexDirection: "row", alignItems: "center", gap: 2, paddingVertical: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: space.md, paddingHorizontal: space.lg, paddingVertical: 13, minHeight: 56 },
  group: { borderRadius: R.xl, backgroundColor: C.surfaceHigh, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line, overflow: "hidden" },
  rule: { height: StyleSheet.hairlineWidth, backgroundColor: C.line, marginLeft: 64 },
});
