import React, { useCallback } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Icon, type IconName } from "@/icons/Icon";
import { color as C, elevation, font, gradient, motion, radius, space, text } from "@/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/* ══════════════════════════════════════════════════════════════════════════
   TOUCH — everything tappable sinks under the finger, with a haptic on press-in.
   ══════════════════════════════════════════════════════════════════════════ */

export function Touch({
  children,
  onPress,
  style,
  haptic = "light",
  disabled,
  scaleTo = motion.PRESS_SCALE,
  accessibilityLabel,
  accessibilityRole = "button",
  ...rest
}: PressableProps & {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  haptic?: "light" | "medium" | "heavy" | "select" | "none";
  scaleTo?: number;
}) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const onIn = useCallback(() => {
    scale.value = withSpring(scaleTo, motion.press);
    if (disabled || haptic === "none") return;
    const p =
      haptic === "select"
        ? Haptics.selectionAsync()
        : Haptics.impactAsync(
            haptic === "heavy"
              ? Haptics.ImpactFeedbackStyle.Heavy
              : haptic === "medium"
                ? Haptics.ImpactFeedbackStyle.Medium
                : Haptics.ImpactFeedbackStyle.Light,
          );
    p.catch(() => {});
  }, [disabled, haptic, scale, scaleTo]);

  const onOut = useCallback(() => {
    scale.value = withSpring(1, motion.press);
  }, [scale]);

  return (
    <AnimatedPressable
      onPressIn={onIn}
      onPressOut={onOut}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      style={[animated, disabled && { opacity: 0.45 }, style]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   GLASS — translucent over the aurora, hairline, bright top edge.
   ══════════════════════════════════════════════════════════════════════════ */

function contentLayout(style: StyleProp<ViewStyle>): ViewStyle {
  const f = StyleSheet.flatten(style) ?? {};
  const out: ViewStyle = {};
  if (f.alignItems) out.alignItems = f.alignItems;
  if (f.justifyContent) out.justifyContent = f.justifyContent;
  if (f.flexDirection) out.flexDirection = f.flexDirection;
  if (f.flexWrap) out.flexWrap = f.flexWrap;
  if (f.gap != null) out.gap = f.gap;
  return out;
}

export function Glass({
  children,
  style,
  padded = true,
  strong,
  blur = true,
  radius: r = radius.lg,
}: {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  strong?: boolean;
  blur?: boolean;
  radius?: number;
}) {
  return (
    <View
      style={[
        {
          borderRadius: r,
          overflow: "hidden",
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: strong ? C.hairlineStrong : C.hairline,
          backgroundColor: strong ? C.glassHigh : C.glass,
        },
        style,
      ]}
    >
      {blur && <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />}
      <View
        style={[StyleSheet.absoluteFill, { backgroundColor: strong ? C.glassHigh : C.glass }]}
        pointerEvents="none"
      />
      {/* The lit edge — light falls from above, so the top of a raised thing
          catches it. It is most of why glass reads as glass. */}
      <LinearGradient
        colors={[C.litEdge, "rgba(255,255,255,0)"]}
        style={{ position: "absolute", left: 0, right: 0, top: 0, height: 1.2 }}
        pointerEvents="none"
      />
      {/* Layout props given to Glass are meant for its content, which lives in
          this inner view — pass them on, or `alignItems: "center"` on a Glass
          silently centres nothing. */}
      <View style={[padded ? { padding: space.lg } : undefined, contentLayout(style)]}>{children}</View>
    </View>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   TEXT
   ══════════════════════════════════════════════════════════════════════════ */

type TProps = { children: React.ReactNode; style?: StyleProp<TextStyle>; tone?: string; numberOfLines?: number };

export const T = {
  Hero: ({ children, style, tone = C.text }: TProps) => (
    <Text style={[text.hero, { color: tone }, style]}>{children}</Text>
  ),
  Title: ({ children, style, tone = C.text }: TProps) => (
    <Text style={[text.title, { color: tone }, style]}>{children}</Text>
  ),
  Heading: ({ children, style, tone = C.text, numberOfLines }: TProps) => (
    <Text numberOfLines={numberOfLines} style={[text.heading, { color: tone }, style]}>{children}</Text>
  ),
  Sub: ({ children, style, tone = C.text, numberOfLines }: TProps) => (
    <Text numberOfLines={numberOfLines} style={[text.subhead, { color: tone }, style]}>{children}</Text>
  ),
  Body: ({ children, style, tone = C.textDim, numberOfLines }: TProps) => (
    <Text numberOfLines={numberOfLines} style={[text.body, { color: tone }, style]}>{children}</Text>
  ),
  Small: ({ children, style, tone = C.textDim, numberOfLines }: TProps) => (
    <Text numberOfLines={numberOfLines} style={[text.small, { color: tone }, style]}>{children}</Text>
  ),
  Tiny: ({ children, style, tone = C.textFaint, numberOfLines }: TProps) => (
    <Text numberOfLines={numberOfLines} style={[text.tiny, { color: tone }, style]}>{children}</Text>
  ),
  Label: ({ children, style, tone = C.textFaint }: TProps) => (
    <Text style={[text.label, { color: tone }, style]}>{children}</Text>
  ),
};

/* ══════════════════════════════════════════════════════════════════════════
   BUTTONS
   ══════════════════════════════════════════════════════════════════════════ */

export function Button({
  label,
  onPress,
  variant = "gold",
  icon,
  disabled,
  style,
  sub,
  size = "lg",
}: {
  label: string;
  onPress?: () => void;
  variant?: "gold" | "violet" | "glass" | "ghost";
  icon?: IconName;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  sub?: string;
  size?: "md" | "lg";
}) {
  const filled = variant === "gold" || variant === "violet";
  const ink = variant === "gold" ? C.goldInk : C.text;
  const h = size === "lg" ? 56 : 46;

  return (
    <Touch
      onPress={onPress}
      disabled={disabled}
      haptic={filled ? "medium" : "light"}
      accessibilityLabel={label}
      style={[
        { height: sub ? h + 10 : h, borderRadius: radius.pill, overflow: "hidden" },
        variant === "gold" && !disabled && elevation.glowGold,
        variant === "violet" && !disabled && elevation.glowViolet,
        style,
      ]}
    >
      {variant === "gold" && (
        <LinearGradient colors={gradient.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      )}
      {variant === "violet" && (
        <LinearGradient colors={gradient.violet} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      )}
      {variant === "glass" && <View style={[StyleSheet.absoluteFill, { backgroundColor: C.glassHigh }]} />}
      {!filled && (
        <View
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: radius.pill, borderWidth: 1, borderColor: variant === "ghost" ? C.hairlineStrong : C.hairline },
          ]}
        />
      )}
      {filled && (
        <LinearGradient
          colors={["rgba(255,255,255,0.35)", "rgba(255,255,255,0)"]}
          style={{ position: "absolute", left: 0, right: 0, top: 0, height: h / 2 }}
        />
      )}
      <View style={styles.btnInner}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {icon && <Icon name={icon} size={18} color={ink} />}
          <Text style={[text.subhead, { color: ink, fontSize: size === "lg" ? 15.5 : 14 }]}>{label}</Text>
        </View>
        {sub ? <Text style={[text.tiny, { color: ink, opacity: 0.65, marginTop: 1 }]}>{sub}</Text> : null}
      </View>
    </Touch>
  );
}

/**
 * The Revolut row: a circle, an icon, a word underneath. Four of these under a
 * balance is the most recognisable pattern in fintech, and it works because
 * each action is one tap and one glance.
 */
export function CircleAction({
  icon,
  label,
  onPress,
  tone = "glass",
}: {
  icon: IconName;
  label: string;
  onPress?: () => void;
  tone?: "glass" | "gold" | "violet";
}) {
  const filled = tone !== "glass";
  return (
    <Touch onPress={onPress} accessibilityLabel={label} style={{ alignItems: "center", gap: 8, flex: 1 }} scaleTo={0.9}>
      <View
        style={[
          {
            width: 56,
            height: 56,
            borderRadius: 28,
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            borderWidth: filled ? 0 : StyleSheet.hairlineWidth,
            borderColor: C.hairlineStrong,
            backgroundColor: filled ? undefined : C.glassHigh,
          },
          tone === "gold" && elevation.glowGold,
          tone === "violet" && elevation.glowViolet,
        ]}
      >
        {tone === "gold" && <LinearGradient colors={gradient.gold} style={StyleSheet.absoluteFill} />}
        {tone === "violet" && <LinearGradient colors={gradient.violet} style={StyleSheet.absoluteFill} />}
        <Icon name={icon} size={22} color={tone === "gold" ? C.goldInk : C.text} />
      </View>
      <Text style={[text.tiny, { color: C.textDim }]}>{label}</Text>
    </Touch>
  );
}

export function IconButton({
  icon,
  onPress,
  label,
  badge,
  size = 44,
}: {
  icon: IconName;
  onPress?: () => void;
  label: string;
  badge?: boolean;
  size?: number;
}) {
  return (
    <Touch
      onPress={onPress}
      accessibilityLabel={label}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: C.glassHigh,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: C.hairline,
      }}
    >
      <Icon name={icon} size={20} color={C.text} />
      {badge && (
        <View
          style={{
            position: "absolute",
            top: 10,
            right: 11,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: C.red,
            borderWidth: 1.5,
            borderColor: C.void,
          }}
        />
      )}
    </Touch>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   SMALL THINGS
   ══════════════════════════════════════════════════════════════════════════ */

export function Chip({
  children,
  tone = "neutral",
  icon,
  style,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "gold" | "violet" | "green" | "amber" | "red" | "blue";
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}) {
  const map = {
    neutral: [C.glassHigh, C.textDim],
    gold: ["rgba(242,198,109,0.14)", C.gold],
    violet: ["rgba(139,108,255,0.16)", C.violetHot],
    green: [C.greenWash, C.green],
    amber: [C.amberWash, C.amber],
    red: [C.redWash, C.red],
    blue: [C.blueWash, C.blue],
  } as const;
  const [bg, fg] = map[tone];
  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          backgroundColor: bg,
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: radius.pill,
          alignSelf: "flex-start",
        },
        style,
      ]}
    >
      {icon && <Icon name={icon} size={12} color={fg} />}
      <Text style={[text.tiny, { color: fg }]}>{children}</Text>
    </View>
  );
}

/** A segmented control whose selection slides. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: "row",
        padding: 4,
        borderRadius: radius.pill,
        backgroundColor: C.glass,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: C.hairline,
      }}
    >
      {options.map((o) => {
        const on = o.id === value;
        return (
          <Touch
            key={o.id}
            haptic="select"
            onPress={() => onChange(o.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={o.label}
            style={{
              flex: 1,
              height: 38,
              borderRadius: radius.pill,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: on ? C.glassPress : "transparent",
            }}
          >
            <Text style={[text.smallSemi, { color: on ? C.text : C.textFaint }]}>{o.label}</Text>
          </Touch>
        );
      })}
    </View>
  );
}

export function SectionHeader({
  title,
  action,
  onAction,
  style,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginBottom: space.md }, style]}>
      <Text style={[text.heading, { color: C.text }]}>{title}</Text>
      {action && (
        <Touch onPress={onAction} accessibilityLabel={action} haptic="select">
          <Text style={[text.smallSemi, { color: C.gold }]}>{action}</Text>
        </Touch>
      )}
    </View>
  );
}

export function Rule({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: C.hairline }, style]} />;
}

/** An icon in a rounded tile — the leading element of most rows. */
export function IconTile({
  icon,
  tone = "neutral",
  size = 42,
}: {
  icon: IconName;
  tone?: "neutral" | "gold" | "violet" | "green" | "red" | "blue" | "amber";
  size?: number;
}) {
  const map = {
    neutral: [C.glassHigh, C.text],
    gold: ["rgba(242,198,109,0.14)", C.gold],
    violet: ["rgba(139,108,255,0.16)", C.violetHot],
    green: [C.greenWash, C.green],
    red: [C.redWash, C.red],
    blue: [C.blueWash, C.blue],
    amber: [C.amberWash, C.amber],
  } as const;
  const [bg, fg] = map[tone];
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.34,
        backgroundColor: bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon name={icon} size={size * 0.48} color={fg} />
    </View>
  );
}

/** The customer's face, or their initial on a gradient. */
export function Avatar({ uri, name, size = 44 }: { uri?: string | null; name?: string; size?: number }) {
  if (uri) {
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  /* The first LETTER, not the first character — a placeholder like "[Name]"
     would otherwise put a bracket in the circle. */
  const initial = ((name ?? "").match(/\p{L}/u)?.[0] ?? "L").toUpperCase();
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, overflow: "hidden", alignItems: "center", justifyContent: "center" }}>
      <LinearGradient colors={gradient.violet} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
      <Text style={{ fontFamily: font.displayBold, fontSize: size * 0.4, color: C.text }}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  btnInner: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: space.xl },
});
