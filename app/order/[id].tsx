import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Icon } from "@/icons/Icon";
import { Button, Chip, Glass, T } from "@/components/ui";
import { Money } from "@/components/Money";
import { Screen, StackHeader } from "@/components/Screen";
import { color as C, radius, space, text } from "@/theme";
import { STATUS, orders, timeline } from "@/data/sample";

/**
 * One order, as a timeline. A progress bar says 60%; a named timeline says what
 * the other 40% is, whether anybody is waiting on you, and what happens next —
 * the three questions every support call about a filing actually is.
 */
export default function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const order = orders.find((o) => o.id === String(id)) ?? orders[0]!;
  const st = STATUS[order.status];

  return (
    <Screen aurora="quiet" auroraHeight={320} tabbed={false}>
      <StackHeader title={order.id} right="more" rightLabel="More" />

      <Animated.View entering={FadeInDown.duration(380)} style={styles.pad}>
        <Chip tone={st.tone}>{st.label}</Chip>
        <T.Title style={{ marginTop: space.md }}>{order.name}</T.Title>
        {order.paidPaise != null && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 }}>
            <Money paise={order.paidPaise} size={14} tone={C.textDim} />
            <T.Small tone={C.textFaint}>paid from wallet · {order.startedOn}</T.Small>
          </View>
        )}
      </Animated.View>

      {order.status === "needs-you" && (
        <Animated.View entering={FadeInDown.delay(60).duration(380)} style={[styles.pad, { marginTop: space.xl }]}>
          <Glass strong style={{ borderRadius: radius.xl, borderColor: "rgba(248,113,113,0.45)" }}>
            <View style={{ flexDirection: "row", gap: space.md }}>
              <Icon name="bell" size={20} color={C.red} />
              <View style={{ flex: 1 }}>
                <T.Sub>We are waiting on you</T.Sub>
                <T.Small style={{ marginTop: 3 }}>{order.step}. Nothing moves until it arrives.</T.Small>
              </View>
            </View>
            <Button label="Upload it" icon="upload" size="md" style={{ marginTop: space.lg }} />
          </Glass>
        </Animated.View>
      )}

      <Animated.View entering={FadeInDown.delay(120).duration(380)} style={[styles.pad, { marginTop: space.xxl }]}>
        <T.Label style={{ marginBottom: space.md }}>Where it has got to</T.Label>
        <Glass style={{ borderRadius: radius.xl }}>
          {timeline.map((title, i) => {
            const state = i < order.stepIndex ? "done" : i === order.stepIndex ? "now" : "later";
            return (
              <View key={title} style={{ flexDirection: "row", gap: space.md }}>
                <View style={{ alignItems: "center", width: 26 }}>
                  <View
                    style={[
                      styles.node,
                      state === "done" && { backgroundColor: C.green, borderColor: C.green },
                      state === "now" && { borderColor: st.color, borderWidth: 3 },
                    ]}
                  >
                    {state === "done" && <Icon name="check" size={12} color="#04130C" />}
                  </View>
                  {i < timeline.length - 1 && (
                    <View style={[styles.spine, { backgroundColor: state === "done" ? C.green : C.hairline }]} />
                  )}
                </View>
                <View style={{ flex: 1, paddingBottom: i < timeline.length - 1 ? space.xl : 0 }}>
                  <Text style={[text.bodySemi, { color: state === "later" ? C.textFaint : C.text }]}>{title}</Text>
                  <Text style={[text.small, { color: state === "now" ? st.color : C.textFaint, marginTop: 1 }]}>
                    {state === "done" ? "[date]" : state === "now" ? "In progress" : "Up next"}
                  </Text>
                </View>
              </View>
            );
          })}
        </Glass>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(180).duration(380)} style={[styles.pad, { marginTop: space.xxl, gap: space.md }]}>
        <T.Label>Messages</T.Label>
        <View style={styles.bubble}>
          <T.Small tone={C.text}>[Message from the LAWFIC team handling this order.]</T.Small>
          <T.Tiny style={{ marginTop: 6 }}>[time]</T.Tiny>
        </View>
        <Button label="Message the team" variant="glass" icon="mail" onPress={() => router.push("/panda")} />
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: space.lg },
  node: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.hairlineStrong,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surface,
  },
  spine: { width: 2, flex: 1, marginTop: 3, borderRadius: 1 },
  bubble: {
    alignSelf: "flex-start",
    maxWidth: "88%",
    padding: space.lg,
    borderRadius: radius.lg,
    borderTopLeftRadius: 6,
    backgroundColor: C.glassHigh,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.hairline,
  },
});
