import React from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Icon } from "@/icons/Icon";
import { useStore } from "@/lib/store";
import { useLayout } from "@/components/AppWidth";
import { serviceName } from "@/data/catalogue";
import { Badge, Button, Chip, Reveal, Screen, Surface, T } from "@/ui";
import { color as C, font, space } from "@/theme";

/**
 * Reviews — the website's rules, the app's look.
 *
 * Every review is tied to a completed order, one per order, enforced by the
 * database on lawfic.pro. None are published yet, so none are shown: inventing
 * "5 stars, a customer in Pune" is a fabricated endorsement of a real company.
 * The distribution is drawn empty so the shape of the page is visible, and a
 * completed filing of your own is offered as the way to write the first.
 */
export default function Reviews() {
  const router = useRouter();
  const layout = useLayout();
  const { state } = useStore();
  const done = state.orders.filter((o) => o.status === "completed");

  return (
    <Screen back title="Reviews" kicker="Verified by order" subtitle="You cannot review a service you have not used, and nobody can review the same order twice.">
      <View style={layout === "compact" ? { gap: space.xl } : { flexDirection: "row", gap: space.xxxl, alignItems: "flex-start" }}>
        <Reveal fade style={{ flex: 1 }}>
          <Surface raised style={{ padding: space.xl }}>
            <View style={{ flexDirection: "row", gap: space.xl, alignItems: "center" }}>
              <View style={{ alignItems: "center" }}>
                <T style={{ fontFamily: font.bold, fontSize: 48, color: C.textMuted, letterSpacing: -2 }}>—</T>
                <View style={{ flexDirection: "row", gap: 2, marginTop: 4 }}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Icon key={i} name="star" size={14} color={C.textMuted} />
                  ))}
                </View>
                <T v="caption" style={{ marginTop: 6 }}>
                  0 reviews
                </T>
              </View>
              <View style={{ flex: 1, gap: 8 }}>
                {[5, 4, 3, 2, 1].map((n) => (
                  <View key={n} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <T v="caption" style={{ width: 18 }} num>
                      {n}★
                    </T>
                    <View style={styles.bar} />
                    <T v="caption" num style={{ width: 12, textAlign: "right" }}>
                      0
                    </T>
                  </View>
                ))}
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: space.sm, marginTop: space.xl, flexWrap: "wrap" }}>
              <Chip label="One per order" tone="gold" icon="shield" />
              <Chip label="Only after completion" icon="check" />
            </View>
          </Surface>
        </Reveal>

        <Reveal i={1} style={{ flex: 1 }}>
          <Surface style={{ alignItems: "center", paddingVertical: space.xxl }}>
            <Icon name="star" size={32} color={C.gold} />
            <T v="headline" style={{ marginTop: space.md }}>
              No reviews yet
            </T>
            <T v="callout" center style={{ marginTop: space.sm, maxWidth: 360 }}>
              Rather than fill this with examples, it stays empty until a real customer writes the first. An invented review would be worth less than nothing to the people reading it.
            </T>
            {done.length > 0 ? (
              <View style={{ alignSelf: "stretch", marginTop: space.xl, gap: space.sm }}>
                <T v="label" style={{ marginLeft: 4 }}>
                  Completed filings you can review
                </T>
                {done.map((o) => (
                  <View key={o.id} style={styles.done}>
                    <T v="calloutMedium" style={{ flex: 1 }}>
                      {serviceName(o.service_slug)}
                    </T>
                    <Badge label="Reviews open on lawfic.pro" />
                  </View>
                ))}
              </View>
            ) : (
              <Button label="Your filings" variant="secondary" onPress={() => router.push("/filings")} style={{ marginTop: space.xl }} />
            )}
          </Surface>
        </Reveal>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bar: { flex: 1, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.07)" },
  done: { flexDirection: "row", alignItems: "center", gap: space.md, padding: space.md, borderRadius: 14, backgroundColor: C.surfaceTop },
});
