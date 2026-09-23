import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Icon } from "@/icons/Icon";
import { Button, Chip, Label, Surface, Touch } from "@/components/primitives";
import { Money } from "@/components/Money";
import { color as C, font, radius, space, text } from "@/theme";
import { sampleOrders, sampleTimeline, STATUS_COPY } from "@/data/sample";

/**
 * One order.
 *
 * THE TIMELINE IS FIVE STEPS AND IT SAYS WHAT EACH ONE IS
 *
 * A progress bar tells somebody they are 60% done. It does not tell them what
 * the other 40% consists of, whether anybody is waiting on them, or what
 * happens next week. Every support call about a filing is one of those three
 * questions, and a named timeline answers all three without a call.
 *
 * The step in progress is the only one with a ring rather than a tick. One
 * live marker, so the eye lands on "where is it now" first.
 */
export default function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const order = sampleOrders.find((o) => o.id === String(id)) ?? sampleOrders[0];
  const status = STATUS_COPY[order.status];

  return (
    <View style={{ flex: 1, backgroundColor: C.void }}>
      <View style={[styles.header, { paddingTop: insets.top + space.sm }]}>
        <Touch onPress={() => router.back()} accessibilityLabel="Back" style={styles.back}>
          <Icon name="back" size={20} color={C.text} />
        </Touch>
        <Text style={[text.small, { color: C.textDim, flex: 1 }]}>{order.id}</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(340)}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm }}>
            <Text style={[text.title, { color: C.text, flex: 1 }]}>{order.name}</Text>
            <Chip tone={status.tone}>{status.label}</Chip>
          </View>
          {order.paidPaise != null && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 }}>
              <Money paise={order.paidPaise} size={13} tone={C.textDim} />
              <Text style={[text.tiny, { color: C.textFaint }]}>
                paid from wallet on {order.startedOn}
              </Text>
            </View>
          )}
        </Animated.View>

        {order.status === "needs-you" && (
          <Animated.View entering={FadeInDown.delay(60).duration(340)} style={{ marginTop: space.xl }}>
            <Surface style={{ borderColor: C.red, backgroundColor: C.redWash }}>
              <View style={{ flexDirection: "row", gap: space.md, alignItems: "flex-start" }}>
                <Icon name="bell" size={18} color={C.red} />
                <View style={{ flex: 1 }}>
                  <Text style={[text.bodySemi, { color: C.text }]}>We are waiting on you</Text>
                  <Text style={[text.small, { color: C.textDim, marginTop: 3, lineHeight: 19 }]}>
                    {order.step}. Nothing moves until it arrives.
                  </Text>
                </View>
              </View>
              <Button label="Upload it" onPress={() => {}} style={{ marginTop: space.md }} />
            </Surface>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(120).duration(340)} style={{ marginTop: space.xxl }}>
          <Label style={{ marginBottom: space.md }}>Where it has got to</Label>
          <Surface>
            {sampleTimeline.map((s, i) => (
              <View key={s.title} style={{ flexDirection: "row", gap: space.md }}>
                <View style={{ alignItems: "center", width: 24 }}>
                  <Marker state={s.state} />
                  {i < sampleTimeline.length - 1 && (
                    <View
                      style={[
                        styles.spine,
                        { backgroundColor: s.state === "done" ? C.green : C.hairline },
                      ]}
                    />
                  )}
                </View>
                <View style={{ flex: 1, paddingBottom: i < sampleTimeline.length - 1 ? space.lg : 0 }}>
                  <Text
                    style={[
                      text.bodySemi,
                      { color: s.state === "later" ? C.textFaint : C.text },
                    ]}
                  >
                    {s.title}
                  </Text>
                  <Text
                    style={[
                      text.tiny,
                      { color: s.state === "now" ? C.gold : C.textFaint, marginTop: 2 },
                    ]}
                  >
                    {s.when}
                  </Text>
                </View>
              </View>
            ))}
          </Surface>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).duration(340)} style={{ marginTop: space.xxl }}>
          <Label style={{ marginBottom: space.md }}>Messages</Label>
          <Surface>
            <Text style={[text.small, { color: C.textDim, lineHeight: 19 }]}>
              [Message from the LAWFIC team handling this order.]
            </Text>
            <Text style={[text.tiny, { color: C.textFaint, marginTop: 6 }]}>[time]</Text>
          </Surface>

          <Touch onPress={() => {}} accessibilityLabel="Message the team" style={styles.reply}>
            <Icon name="phone" size={16} color={C.gold} />
            <Text style={[text.small, { color: C.gold, fontFamily: font.bodySemi }]}>
              Message the team
            </Text>
          </Touch>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function Marker({ state }: { state: "done" | "now" | "later" }) {
  if (state === "done") {
    return (
      <View style={[styles.marker, { backgroundColor: C.green }]}>
        <Icon name="check" size={11} color="#06130E" />
      </View>
    );
  }
  if (state === "now") {
    return <View style={[styles.marker, { borderWidth: 3, borderColor: C.gold, backgroundColor: C.surface }]} />;
  }
  return <View style={[styles.marker, { borderWidth: 1.5, borderColor: C.hairline, backgroundColor: "transparent" }]} />;
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
  },
  back: { width: 40, height: 40, alignItems: "center", justifyContent: "center", marginLeft: -space.sm },
  marker: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  spine: { width: 2, flex: 1, marginTop: 2, borderRadius: 1 },
  reply: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    minHeight: 50,
    marginTop: space.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.hairline,
  },
});
