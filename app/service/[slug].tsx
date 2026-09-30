import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Icon } from "@/icons/Icon";
import { Button, Chip, Glass, T } from "@/components/ui";
import { rupees } from "@/components/Money";
import { Screen, StackHeader } from "@/components/Screen";
import { color as C, font, gradient, radius, space, text } from "@/theme";
import { getCategory, getService } from "@/data/catalogue";
import { udyamDocuments, udyamSteps } from "@/data/sample";

/** Services that have a bespoke application flow, like the website's ApplySlot. */
const APPLY: Record<string, string> = { "msme-udyam": "/apply/udyam", aadhaar: "/apply/aadhaar" };

export default function ServiceDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const service = getService(String(slug));

  if (!service) {
    return (
      <Screen tabbed={false}>
        <StackHeader />
        <T.Body style={{ textAlign: "center", marginTop: space.xxxl }}>That service does not exist.</T.Body>
      </Screen>
    );
  }

  const cat = getCategory(service.categoryId)!;
  const hasChecklist = service.slug === "msme-udyam";
  const applyTo = APPLY[service.slug];

  return (
    <View style={{ flex: 1, backgroundColor: C.void }}>
      <Screen aurora="violet" auroraHeight={420} tabbed={false} contentStyle={{ paddingBottom: 140 }}>
        <StackHeader right="star" rightLabel="Save" />

        <Animated.View entering={FadeInDown.duration(400)} style={styles.pad}>
          <View style={styles.heroIcon}>
            <LinearGradient colors={gradient.gold} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
            <Icon name={cat.icon} size={30} color={C.goldInk} />
          </View>
          <T.Label style={{ marginTop: space.lg }}>{cat.name}</T.Label>
          <T.Hero style={{ marginTop: 4 }}>{service.name}</T.Hero>
          <T.Body style={{ marginTop: space.sm }}>{service.blurb}</T.Body>
          <View style={{ flexDirection: "row", gap: space.sm, marginTop: space.lg }}>
            <Chip tone="green" icon="check">Available</Chip>
            {service.turnaround && <Chip tone="gold" icon="clock">{service.turnaround}</Chip>}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(70).duration(400)} style={[styles.pad, { marginTop: space.xxl }]}>
          <Glass strong style={{ borderRadius: radius.xl }}>
            <View style={styles.priceRow}>
              <View>
                <T.Label>LAWFIC fee</T.Label>
                <Text style={{ fontFamily: font.displayBold, fontSize: 34, color: C.text, letterSpacing: -1, marginTop: 4 }}>
                  {service.feePaise ? rupees(service.feePaise) : "On request"}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <T.Label>Government fee</T.Label>
                <T.Sub style={{ marginTop: 6 }}>{service.slug === "msme-udyam" ? "Free" : "As applicable"}</T.Sub>
              </View>
            </View>
          </Glass>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(140).duration(400)} style={[styles.pad, { marginTop: space.xxl }]}>
          <T.Heading style={{ marginBottom: space.md }}>What we need from you</T.Heading>
          <Glass style={{ borderRadius: radius.xl }}>
            {hasChecklist ? (
              udyamDocuments.map((d, i) => (
                <View key={d} style={[styles.doc, i > 0 && styles.rule]}>
                  <View style={styles.tick}>
                    <Icon name="check" size={12} color={C.green} />
                  </View>
                  <T.Small tone={C.text} style={{ flex: 1 }}>{d}</T.Small>
                </View>
              ))
            ) : (
              <T.Small>
                The document checklist for this service is not written up yet. Start and we will tell you exactly what to
                send — or ask the Panda first.
              </T.Small>
            )}
          </Glass>
        </Animated.View>

        {hasChecklist && (
          <Animated.View entering={FadeInDown.delay(210).duration(400)} style={[styles.pad, { marginTop: space.xxl }]}>
            <T.Heading style={{ marginBottom: space.md }}>How it runs</T.Heading>
            {udyamSteps.map((s, i) => (
              <View key={s.title} style={{ flexDirection: "row", gap: space.md, marginBottom: space.lg }}>
                <View style={styles.stepNo}>
                  <Text style={[text.smallSemi, { color: C.gold }]}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <T.Sub>{s.title}</T.Sub>
                  <T.Small style={{ marginTop: 2 }}>{s.body}</T.Small>
                </View>
              </View>
            ))}
          </Animated.View>
        )}

        <View style={[styles.pad, { marginTop: space.md }]}>
          <Button label="Ask the Panda about this" variant="glass" icon="spark" onPress={() => router.push("/panda")} />
        </View>
      </Screen>

      <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, space.lg) }]}>
        <LinearGradient colors={["rgba(6,6,9,0)", "rgba(6,6,9,0.95)", C.void]} style={StyleSheet.absoluteFill} />
        <Button
          label={applyTo ? "Start application" : "Request this service"}
          icon="arrowUp"
          sub={service.feePaise ? `${rupees(service.feePaise)} · nothing charged until we check it` : "We will quote before you pay"}
          onPress={() => router.push((applyTo ?? "/panda") as never)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: space.lg },
  heroIcon: { width: 64, height: 64, borderRadius: 22, overflow: "hidden", alignItems: "center", justifyContent: "center", marginTop: space.lg },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  doc: { flexDirection: "row", gap: space.md, alignItems: "center", paddingVertical: 11 },
  rule: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.hairline },
  tick: { width: 24, height: 24, borderRadius: 12, backgroundColor: C.greenWash, alignItems: "center", justifyContent: "center" },
  stepNo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(242,198,109,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  bar: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: space.lg, paddingTop: space.xxl },
});
