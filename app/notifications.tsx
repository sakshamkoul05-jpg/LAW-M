import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeOut } from "react-native-reanimated";
import { Icon, type IconName } from "@/icons/Icon";
import { useStore, type Notice } from "@/lib/store";
import { ago, dayBucket } from "@/lib/format";
import { EmptyState, Press, Reveal, Screen, Segmented, T, Button } from "@/ui";
import { color as C, radius as R, space } from "@/theme";

type Filter = "all" | "unread";

const ICON: Record<Notice["kind"], IconName> = { order: "filings", message: "chat", wallet: "credit" };
const TINT: Record<Notice["tone"], string> = { neutral: C.textDim, action: C.gold, good: C.green, bad: C.red };

/**
 * Notifications, grouped the way you remember things: today, yesterday,
 * earlier. Unread ones carry a small gold dot and slightly brighter type —
 * enough to find, not enough to nag. Opening one marks it read and goes to
 * the thing it is about.
 */
export default function Notifications() {
  const router = useRouter();
  const { state, notices, unread, markRead } = useStore();
  const [filter, setFilter] = useState<Filter>("all");
  const shown = notices.filter((n) => filter === "all" || !state.read.includes(n.id));
  const groups = (["Today", "Yesterday", "Earlier"] as const).map((b) => ({ b, items: shown.filter((n) => dayBucket(n.at) === b) })).filter((g) => g.items.length);

  let i = 0;
  return (
    <Screen
      back
      title="Notifications"
      kicker={unread ? `${unread} unread` : "All caught up"}
      right={unread ? <Button label="Mark all read" size="sm" variant="secondary" full={false} onPress={() => markRead(notices.map((n) => n.id))} /> : undefined}
    >
      <View style={{ marginBottom: space.xl, maxWidth: 360 }}>
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { id: "all", label: "All" },
            { id: "unread", label: "Unread" },
          ]}
          counts={{ unread }}
        />
      </View>
      {groups.length === 0 ? (
        <EmptyState icon="bell" title={filter === "unread" ? "Nothing unread" : "No notifications yet"} body="Quotes, payments, messages from the team and money arriving will show up here." />
      ) : (
        <View style={{ gap: space.xl, maxWidth: 760 }}>
          {groups.map((g) => (
            <View key={g.b}>
              <T v="label" style={{ marginBottom: space.sm, marginLeft: 4 }}>
                {g.b}
              </T>
              <View style={styles.group}>
                {g.items.map((n, k) => {
                  const isUnread = !state.read.includes(n.id);
                  return (
                    <Animated.View key={n.id} exiting={filter === "unread" ? FadeOut.duration(200) : undefined}>
                      <Reveal i={i++}>
                        <Press
                          onPress={() => {
                            markRead([n.id]);
                            router.push(n.href as never);
                          }}
                          radius={0}
                          scaleTo={0.99}
                          accessibilityLabel={`${isUnread ? "Unread. " : ""}${n.title}. ${n.body}`}
                          style={[styles.row, k > 0 && styles.rule, isUnread && { backgroundColor: "rgba(198,161,91,0.035)" }]}
                        >
                          <View style={[styles.icon, { borderColor: n.tone === "action" ? C.goldLine : C.line }]}>
                            <Icon name={ICON[n.kind]} size={17} color={TINT[n.tone]} />
                          </View>
                          <View style={{ flex: 1, minWidth: 0 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                              <T v="calloutMedium" color={isUnread ? C.text : C.textDim} style={{ flex: 1 }} numberOfLines={1}>
                                {n.title}
                              </T>
                              <T v="micro" num>
                                {ago(n.at)}
                              </T>
                            </View>
                            <T v="caption" numberOfLines={2} style={{ marginTop: 2 }}>
                              {n.body}
                            </T>
                          </View>
                          <View style={[styles.dot, !isUnread && { opacity: 0 }]} />
                        </Press>
                      </Reveal>
                    </Animated.View>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { borderRadius: R.xl, backgroundColor: C.surfaceHigh, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: space.md, paddingHorizontal: space.lg, paddingVertical: 14 },
  rule: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.line },
  icon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: C.surfaceTop, borderWidth: StyleSheet.hairlineWidth },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.gold },
});
