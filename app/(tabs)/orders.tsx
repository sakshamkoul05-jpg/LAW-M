import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Icon } from "@/icons/Icon";
import { Chip, Label, Surface, Touch } from "@/components/primitives";
import { Money } from "@/components/Money";
import { color as C, font, radius, space, text } from "@/theme";
import { sampleOrders, STATUS_COPY, type Order } from "@/data/sample";

type Filter = "active" | "done" | "all";

/**
 * Orders.
 *
 * THE FILTER DEFAULTS TO ACTIVE
 *
 * Nobody opens this screen to look at a filing that finished in March. The
 * default is the work in flight, and the completed ones are one tap away. A
 * list that opens on "All" makes the customer scroll past history to find the
 * thing they came for.
 */
export default function Orders() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<Filter>("active");

  const shown = useMemo(() => {
    if (filter === "all") return sampleOrders;
    if (filter === "done") return sampleOrders.filter((o) => o.status === "done");
    return sampleOrders.filter((o) => o.status !== "done");
  }, [filter]);

  return (
    <View style={{ flex: 1, backgroundColor: C.void }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + space.sm, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.head}>
          <Label>Your filings</Label>
          <Text style={[text.title, { color: C.text, marginTop: 3 }]}>Orders</Text>
        </View>

        <View style={styles.filters}>
          {(["active", "done", "all"] as Filter[]).map((f) => {
            const on = filter === f;
            return (
              <Touch
                key={f}
                onPress={() => setFilter(f)}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                accessibilityLabel={`Show ${f} orders`}
                style={[styles.filter, on && styles.filterOn]}
              >
                <Text
                  style={[
                    text.small,
                    {
                      color: on ? "#1A1405" : C.textDim,
                      fontFamily: font.bodySemi,
                      textTransform: "capitalize",
                    },
                  ]}
                >
                  {f}
                </Text>
              </Touch>
            );
          })}
        </View>

        <View style={{ paddingHorizontal: space.lg, marginTop: space.xl, gap: space.md }}>
          {shown.map((o, i) => (
            <Animated.View key={o.id} entering={FadeInDown.delay(i * 55).duration(340)}>
              <OrderCard order={o} onPress={() => router.push(`/order/${o.id}`)} />
            </Animated.View>
          ))}

          {shown.length === 0 && (
            <Surface style={{ alignItems: "center", paddingVertical: space.xxxl }}>
              <Icon name="orders" size={28} color={C.textFaint} />
              <Text style={[text.body, { color: C.textDim, marginTop: space.md }]}>
                Nothing here yet.
              </Text>
            </Surface>
          )}
        </View>

        <Text style={styles.footnote}>
          Sample orders. Numbers and dates are placeholders.
        </Text>
      </ScrollView>
    </View>
  );
}

function OrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  const status = STATUS_COPY[order.status];
  const done = order.status === "done";

  return (
    <Touch onPress={onPress} accessibilityLabel={`${order.name}, ${status.label}`}>
      <Surface>
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: space.md }}>
          <View style={{ flex: 1 }}>
            <Text style={[text.bodySemi, { color: done ? C.textDim : C.text }]}>{order.name}</Text>
            <Text style={[text.tiny, { color: C.textFaint, marginTop: 3 }]}>
              {order.id} {"·"} {order.step}
            </Text>
          </View>
          <Chip tone={status.tone}>{status.label}</Chip>
        </View>

        {!done && (
          <View style={styles.rail}>
            <View
              style={[
                styles.railFill,
                {
                  width: `${order.progress * 100}%`,
                  backgroundColor: order.status === "needs-you" ? C.red : C.gold,
                },
              ]}
            />
          </View>
        )}

        <View style={styles.foot}>
          {order.paidPaise != null ? (
            <Money paise={order.paidPaise} size={13} tone={C.textDim} />
          ) : (
            <Text style={[text.tiny, { color: C.textFaint }]}>Not paid yet</Text>
          )}
          <Text style={[text.tiny, { color: C.textFaint }]}>
            {order.expectedOn ? `Expected ${order.expectedOn}` : order.startedOn}
          </Text>
        </View>
      </Surface>
    </Touch>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: space.lg, paddingBottom: space.lg },
  filters: { flexDirection: "row", gap: space.sm, paddingHorizontal: space.lg },
  filter: {
    minHeight: 38,
    paddingHorizontal: space.lg,
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.hairline,
    backgroundColor: C.surface,
  },
  filterOn: { backgroundColor: C.gold, borderColor: C.gold },
  rail: {
    height: 4,
    borderRadius: 2,
    backgroundColor: C.surfaceHigh,
    marginTop: space.md,
    overflow: "hidden",
  },
  railFill: { height: "100%", borderRadius: 2 },
  foot: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: space.md,
  },
  footnote: {
    ...text.tiny,
    color: C.textFaint,
    textAlign: "center",
    marginTop: space.xxl,
  },
});
