import React from "react";
import { ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon, type IconName } from "@/icons/Icon";
import { color as C, space, text } from "@/theme";
import { Aurora } from "./Aurora";
import { IconButton, Touch } from "./ui";
import { groupByDay, CATEGORY, type Txn } from "@/data/sample";
import { Money } from "./Money";
import { IconTile } from "./ui";

/**
 * The frame every screen sits in: the aurora behind, a scroll view in front,
 * room at the bottom for the floating tab bar.
 */
export function Screen({
  children,
  aurora = "quiet",
  auroraHeight = 460,
  tabbed = true,
  contentStyle,
}: {
  children: React.ReactNode;
  aurora?: React.ComponentProps<typeof Aurora>["preset"] | null;
  auroraHeight?: number;
  tabbed?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: C.void }}>
      {aurora && <Aurora preset={aurora} height={auroraHeight} />}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          { paddingTop: insets.top + space.sm, paddingBottom: tabbed ? 130 : space.xxxl + insets.bottom },
          contentStyle,
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </View>
  );
}

/** A pushed screen's header: back, title, an optional action. */
export function StackHeader({
  title,
  right,
  onRight,
  rightLabel,
}: {
  title?: string;
  right?: IconName;
  onRight?: () => void;
  rightLabel?: string;
}) {
  const router = useRouter();
  return (
    <View style={styles.header}>
      <IconButton icon="back" label="Back" onPress={() => router.back()} />
      <Text style={[text.subhead, { color: C.text, flex: 1, textAlign: "center" }]} numberOfLines={1}>
        {title ?? ""}
      </Text>
      {right ? <IconButton icon={right} label={rightLabel ?? ""} onPress={onRight} /> : <View style={{ width: 44 }} />}
    </View>
  );
}

/**
 * Transactions grouped by day — Revolut's list.
 *
 * Each day has a heading and its net for the day on the right, so scanning a
 * week is reading seven numbers rather than adding thirty. Pending entries are
 * marked, because a debit that has not settled is the one people ring about.
 */
export function TxnList({ items, hidden, limit }: { items: Txn[]; hidden?: boolean; limit?: number }) {
  const groups = groupByDay(limit ? items.slice(0, limit) : items);
  return (
    <View style={{ gap: space.lg }}>
      {groups.map((g) => (
        <View key={g.label}>
          <View style={styles.dayHead}>
            <Text style={[text.label, { color: C.textFaint }]}>{g.label}</Text>
            {!hidden && <Money paise={g.net} size={12} tone={C.textFaint} signed />}
          </View>
          <View style={styles.dayCard}>
            {g.items.map((t, i) => (
              <Touch key={t.id} style={[styles.row, i > 0 && styles.rowRule]} accessibilityLabel={`${t.title}, ${t.subtitle}`}>
                <IconTile icon={t.icon} tone={t.paise >= 0 ? "green" : CATEGORY[t.category].tone} />
                <View style={{ flex: 1 }}>
                  <Text style={[text.bodySemi, { color: C.text }]} numberOfLines={1}>
                    {t.title}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 1 }}>
                    <Text style={[text.small, { color: C.textFaint }]}>{t.subtitle}</Text>
                    {t.status === "pending" && (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                        <Icon name="clock" size={11} color={C.amber} />
                        <Text style={[text.tiny, { color: C.amber }]}>Pending</Text>
                      </View>
                    )}
                  </View>
                </View>
                {hidden ? (
                  <Text style={[text.bodySemi, { color: C.textFaint }]}>••••</Text>
                ) : (
                  <Money paise={t.paise} size={15} signed />
                )}
              </Touch>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
  },
  dayHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: space.sm,
    paddingHorizontal: 4,
  },
  dayCard: {
    borderRadius: 22,
    backgroundColor: C.glass,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.hairline,
    overflow: "hidden",
  },
  row: { flexDirection: "row", alignItems: "center", gap: space.md, paddingHorizontal: space.lg, paddingVertical: 13 },
  rowRule: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.hairline },
});
