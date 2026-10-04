import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Icon, type IconName } from "@/icons/Icon";
import { color as C, space, themed } from "@/theme";
import { Button } from "./Button";
import { T } from "./Text";

/**
 * Empty and error states.
 *
 * No illustration. An icon in a quiet ring, one sentence that says what will
 * appear here, and the one action that makes it appear. A cartoon of an empty
 * box is the stock-template tell this product is trying hardest to avoid.
 */
export function EmptyState({
  icon,
  title,
  body,
  cta,
  onCta,
  compact,
}: {
  icon: IconName;
  title: string;
  body?: string;
  cta?: string;
  onCta?: () => void;
  compact?: boolean;
}) {
  return (
    <Animated.View entering={FadeInDown.duration(420)} style={[styles.wrap, compact && { paddingVertical: space.xxl }]}>
      <View style={styles.ring}>
        <View style={styles.inner}>
          <Icon name={icon} size={22} color={C.gold} />
        </View>
      </View>
      <T v="headline" center style={{ marginTop: space.lg }}>
        {title}
      </T>
      {body && (
        <T v="callout" center style={{ marginTop: 6, maxWidth: 300 }}>
          {body}
        </T>
      )}
      {cta && onCta && <Button label={cta} onPress={onCta} size="md" full={false} style={{ marginTop: space.xl }} />}
    </Animated.View>
  );
}

export function ErrorState({ title = "Something went wrong", body, onRetry }: { title?: string; body?: string; onRetry?: () => void }) {
  return (
    <Animated.View entering={FadeInDown.duration(420)} style={styles.wrap} accessibilityRole="alert">
      <View style={[styles.ring, { borderColor: "rgba(235,122,111,0.22)" }]}>
        <View style={[styles.inner, { backgroundColor: C.redWash }]}>
          <Icon name="alert" size={22} color={C.red} />
        </View>
      </View>
      <T v="headline" center style={{ marginTop: space.lg }}>
        {title}
      </T>
      {body && (
        <T v="callout" center style={{ marginTop: 6, maxWidth: 300 }}>
          {body}
        </T>
      )}
      {onRetry && <Button label="Try again" icon="refresh" variant="secondary" onPress={onRetry} size="md" full={false} style={{ marginTop: space.xl }} />}
    </Animated.View>
  );
}

const styles = themed(() => ({
  wrap: { alignItems: "center", paddingVertical: space.section, paddingHorizontal: space.xl },
  ring: { width: 72, height: 72, borderRadius: 36, borderWidth: 1, borderColor: C.goldLine, alignItems: "center", justifyContent: "center" },
  inner: { width: 56, height: 56, borderRadius: 28, backgroundColor: C.goldWash, alignItems: "center", justifyContent: "center" },
}));
