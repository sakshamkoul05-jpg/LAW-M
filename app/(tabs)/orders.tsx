import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Icon } from "@/icons/Icon";
import { Chip, Glass, Segmented, T, Touch } from "@/components/ui";
import { Money } from "@/components/Money";
import { Screen } from "@/components/Screen";
import { color as C, radius, space, text } from "@/theme";
import { STATUS, orders, timeline, type Order } from "@/data/sample";

type Filter = "active" | "done" | "all";

/**
 * Orders. Defaults to what is in flight — nobody opens this to look at a
 * filing that finished in March. Anything that needs the customer floats to
 * the top and is the only card with a red edge.
 */
export default function Orders() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("active");

  const shown = useMemo(() => {
    const base = filter === "all" ? orders : filter === "done" ? orders.filter((o) => o.status === "done") : orders.filter((o) => o.status !== "done");
    return [...base].sort((a, b) => Number(b.status === "needs-you") - Number(a.status === "needs-you"));
  }, [filter]);

  const waiting = orders.filter((o) => o.status === "needs-you").length;

  return (
    <Screen aurora="quiet" auroraHeight={360}>
      <View style={styles.pad}>
        <T.Label>Your filings</T.Label>
        <T.Title style={{ marginTop: 2 }}>Orders</T.Title>
        {waiting > 0 && (
          <View style={styles.alert}>
            <Icon name="bell" size={16} color={C.red} />
            <T.Small tone={C.text} style={{ flex: 1 }}>
              {waiting} {waiting === 1 ? "filing is" : "filings are"} waiting on you
            </T.Small>
          </View>
        )}
        <View style={{ marginTop: space.lg }}>
          <Segmented
            value={filter}
            onChange={setFilter}
            options={[
              { id: "active", label: "Active" },
              { id: "done", label: "Done" },
              { id: "all", label: "All" },
            ]}
          />
        </View>
      </View>

      <View style={[styles.pad, { marginTop: space.lg, gap: space.md }]}>
        {shown.map((o, i) => (
          <Animated.View key={o.id} entering={FadeInDown.delay(i * 60).duration(360)}>
            <OrderCard order={o} onPress={() => router.push(`/order/${o.id}`)} />
          </Animated.View>
        ))}
        {shown.length === 0 && (
          <Glass style={{ alignItems: "center", paddingVertical: space.xxxl, borderRadius: radius.xl }}>
            <Icon name="orders" size={30} color={C.textFaint} />
            <T.Body style={{ marginTop: space.md }}>Nothing here yet.</T.Body>
          </Glass>
        )}
        <T.Tiny style={{ textAlign: "center", marginTop: space.md }}>Sample orders. Numbers and dates are placeholders.</T.Tiny>
      </View>
    </Screen>
  );
}

function OrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  const st = STATUS[order.status];
  const urgent = order.status === "needs-you";
  return (
    <Touch onPress={onPress} accessibilityLabel={`${order.name}, ${st.label}`}>
      <Glass strong={urgent} style={[{ borderRadius: radius.xl }, urgent && { borderColor: "rgba(248,113,113,0.45)" }]}>
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: space.md }}>
          <View style={{ flex: 1 }}>
            <Chip tone={st.tone}>{st.label}</Chip>
            <T.Sub style={{ marginTop: 10 }}>{order.name}</T.Sub>
            <T.Small style={{ marginTop: 2 }}>{order.step}</T.Small>
          </View>
          <Icon name="chevron" size={18} color={C.textFaint} />
        </View>

        {/* The five stages as segments, lit up to where it has got to. */}
        <View style={styles.segments}>
          {timeline.map((_, i) => (
            <View
              key={i}
              style={[
                styles.segment,
                { backgroundColor: i < order.stepIndex ? C.green : i === order.stepIndex ? st.color : "rgba(255,255,255,0.08)" },
              ]}
            />
          ))}
        </View>

        <View style={styles.foot}>
          <Text style={[text.tiny, { color: C.textFaint }]}>
            {order.id} · step {Math.min(order.stepIndex + 1, 5)} of 5
          </Text>
          {order.paidPaise != null && <Money paise={order.paidPaise} size={13} tone={C.textDim} />}
        </View>
      </Glass>
    </Touch>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: space.lg },
  alert: {
    marginTop: space.md,
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: C.redWash,
  },
  segments: { flexDirection: "row", gap: 5, marginTop: space.lg },
  segment: { flex: 1, height: 5, borderRadius: 3 },
  foot: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: space.md },
});
