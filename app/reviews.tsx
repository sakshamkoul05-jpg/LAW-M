import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Icon } from "@/icons/Icon";
import { Button, Chip, Glass, T } from "@/components/ui";
import { Screen, StackHeader } from "@/components/Screen";
import { color as C, font, radius, space, text } from "@/theme";

/**
 * Reviews — the website's rules, the app's look.
 *
 * Every review is tied to a completed order, one per order, enforced by the
 * database on lawfic.pro. There are none published yet, so there are none
 * here: inventing "5 stars, a customer in Pune" is a fabricated endorsement of
 * a real company, and a sample label does not survive being screenshotted.
 * The distribution is drawn empty so the shape of the page is visible.
 */
export default function Reviews() {
  const router = useRouter();
  return (
    <Screen aurora="gold" auroraHeight={420} tabbed={false}>
      <StackHeader title="Reviews" />
      <View style={[styles.pad, { gap: space.xl }]}>
        <Animated.View entering={FadeInDown.duration(380)}>
          <T.Hero>On filings people actually bought</T.Hero>
          <T.Body style={{ marginTop: space.sm }}>
            You cannot review a service you have not used, and nobody can review the same order twice.
          </T.Body>
          <View style={{ flexDirection: "row", gap: space.sm, marginTop: space.lg }}>
            <Chip tone="gold" icon="shield">One per order</Chip>
            <Chip icon="check">Verified by order</Chip>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(70).duration(380)}>
          <Glass strong style={{ borderRadius: radius.xl }}>
            <View style={{ flexDirection: "row", gap: space.xl, alignItems: "center" }}>
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontFamily: font.displayBold, fontSize: 48, color: C.textFaint, letterSpacing: -2 }}>—</Text>
                <View style={{ flexDirection: "row", gap: 2, marginTop: 4 }}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Icon key={i} name="star" size={14} color={C.textFaint} />
                  ))}
                </View>
                <T.Tiny style={{ marginTop: 6 }}>0 reviews</T.Tiny>
              </View>
              <View style={{ flex: 1, gap: 7 }}>
                {[5, 4, 3, 2, 1].map((n) => (
                  <View key={n} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={[text.tiny, { color: C.textFaint, width: 16 }]}>{n}★</Text>
                    <View style={styles.bar} />
                    <Text style={[text.tiny, { color: C.textFaint, width: 12, textAlign: "right" }]}>0</Text>
                  </View>
                ))}
              </View>
            </View>
          </Glass>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(140).duration(380)}>
          <Glass style={{ borderRadius: radius.xl, alignItems: "center", paddingVertical: space.xxl }}>
            <Icon name="star" size={34} color={C.gold} />
            <T.Heading style={{ marginTop: space.md }}>No reviews yet</T.Heading>
            <T.Small style={{ textAlign: "center", marginTop: space.sm, lineHeight: 18 }}>
              Rather than fill this with examples, it stays empty until a real customer writes the first. An invented
              review would be worth less than nothing to the people reading it.
            </T.Small>
            <Button label="Review a filing you have had done" onPress={() => router.push("/(tabs)/orders")} style={{ alignSelf: "stretch", marginTop: space.xl }} />
          </Glass>
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: space.lg },
  bar: { flex: 1, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.08)" },
});
