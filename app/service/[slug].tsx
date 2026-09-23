import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Icon } from "@/icons/Icon";
import { Button, Chip, Label, Rule, Surface, Touch } from "@/components/primitives";
import { Money } from "@/components/Money";
import { color as C, elevation, font, radius, space, text } from "@/theme";
import { getCategory, getService } from "@/data/catalogue";
import { udyamDocuments, udyamSteps } from "@/data/sample";

/**
 * One service.
 *
 * THE PRICE IS PINNED TO THE BOTTOM
 *
 * The fee and the action ride in a bar that never scrolls away. Somebody
 * halfway down a document list should not have to scroll back up to remember
 * what it costs, and a buy button that has to be hunted for is a buy button
 * that gets hunted for once.
 *
 * WHAT IS REAL ON THIS SCREEN
 *
 * The name, blurb, fee and turnaround come from the website. The document list
 * and the three steps are the real Udyam ones and are shown only for that
 * service; every other service says plainly that its checklist is not written
 * yet rather than borrowing Udyam's and being wrong.
 */
export default function ServiceDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const service = getService(String(slug));
  const category = service ? getCategory(service.categoryId) : undefined;

  if (!service) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + space.xxl, alignItems: "center" }]}>
        <Text style={[text.body, { color: C.textDim }]}>That service does not exist.</Text>
        <Button label="Go back" variant="ghost" onPress={() => router.back()} style={{ marginTop: space.xl }} />
      </View>
    );
  }

  const hasChecklist = service.slug === "msme-udyam";

  return (
    <View style={styles.screen}>
      {/* ── header ── */}
      <View style={[styles.header, { paddingTop: insets.top + space.sm }]}>
        <Touch onPress={() => router.back()} accessibilityLabel="Back" style={styles.back}>
          <Icon name="back" size={20} color={C.text} />
        </Touch>
        <Text style={[text.small, { color: C.textDim, flex: 1 }]}>{category?.name}</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: space.lg, paddingBottom: 150 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(360)}>
          <View style={{ flexDirection: "row", gap: space.sm, marginBottom: space.md }}>
            <Chip tone="green">Live</Chip>
            {service.turnaround ? <Chip tone="amber">{service.turnaround}</Chip> : null}
          </View>

          <Text style={[text.hero, { color: C.text, fontSize: 28, lineHeight: 34 }]}>
            {service.name}
          </Text>
          <Text style={[text.body, { color: C.textDim, marginTop: space.sm, lineHeight: 22 }]}>
            {service.blurb}
          </Text>
        </Animated.View>

        {/* ── fee ── */}
        <Animated.View entering={FadeInDown.delay(70).duration(360)} style={{ marginTop: space.xl }}>
          <Surface level="high">
            <View style={styles.feeRow}>
              <Text style={[text.small, { color: C.textDim }]}>Government fee</Text>
              <Text style={[text.small, { color: C.text, fontFamily: font.mono }]}>
                {service.slug === "msme-udyam" ? "Free" : "As applicable"}
              </Text>
            </View>
            <Rule style={{ marginVertical: space.md }} />
            <View style={styles.feeRow}>
              <Text style={[text.small, { color: C.textDim }]}>LAWFIC fee</Text>
              {service.feePaise ? (
                <Money paise={service.feePaise} size={20} tone={C.gold} />
              ) : (
                <Text style={[text.small, { color: C.textDim }]}>On request</Text>
              )}
            </View>
          </Surface>
        </Animated.View>

        {/* ── what we need ── */}
        <Animated.View entering={FadeInDown.delay(140).duration(360)} style={{ marginTop: space.xxl }}>
          <Label style={{ marginBottom: space.md }}>What we need from you</Label>
          <Surface>
            {hasChecklist ? (
              udyamDocuments.map((d) => (
                <View key={d} style={styles.check}>
                  <Icon name="check" size={15} color={C.green} />
                  <Text style={[text.small, { color: C.text, flex: 1, lineHeight: 19 }]}>{d}</Text>
                </View>
              ))
            ) : (
              <Text style={[text.small, { color: C.textDim, lineHeight: 19 }]}>
                The document checklist for this service is not written up yet.
                Start the filing and we will tell you exactly what to send, or
                ask the Panda first.
              </Text>
            )}
          </Surface>
        </Animated.View>

        {/* ── how it runs ── */}
        {hasChecklist && (
          <Animated.View entering={FadeInDown.delay(210).duration(360)} style={{ marginTop: space.xxl }}>
            <Label style={{ marginBottom: space.md }}>How it runs</Label>
            <Surface>
              {udyamSteps.map((s, i) => (
                <View key={s.title} style={[styles.step, i > 0 && { marginTop: space.lg }]}>
                  <View style={styles.stepNo}>
                    <Text style={[text.tiny, { color: C.gold, fontFamily: font.bodyBold }]}>
                      {i + 1}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[text.bodySemi, { color: C.text }]}>{s.title}</Text>
                    <Text style={[text.small, { color: C.textDim, marginTop: 3, lineHeight: 19 }]}>
                      {s.body}
                    </Text>
                  </View>
                </View>
              ))}
            </Surface>
          </Animated.View>
        )}

        <Touch
          onPress={() => router.push("/panda")}
          accessibilityLabel="Ask the Panda about this service"
          style={styles.ask}
        >
          <Icon name="spark" size={16} color={C.panda} />
          <Text style={[text.small, { color: C.panda, fontFamily: font.bodySemi }]}>
            Ask the Panda about this
          </Text>
        </Touch>
      </ScrollView>

      {/* ── the pinned bar ── */}
      <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, space.lg) }]}>
        <View>
          {service.feePaise ? (
            <Money paise={service.feePaise} size={19} />
          ) : (
            <Text style={[text.small, { color: C.textDim }]}>Price on request</Text>
          )}
          <Text style={[text.tiny, { color: C.textFaint }]}>
            {service.feePaise ? "all in" : "we will quote"}
          </Text>
        </View>
        <Button
          label="Start this filing"
          onPress={() => router.push(`/start/${service.slug}`)}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.void },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -space.sm,
  },
  feeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  check: { flexDirection: "row", gap: space.sm + 2, alignItems: "flex-start", paddingVertical: 6 },
  step: { flexDirection: "row", gap: space.md },
  stepNo: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: C.goldWash,
    alignItems: "center",
    justifyContent: "center",
  },
  ask: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    minHeight: 50,
    marginTop: space.xxl,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(199,75,240,0.3)",
    backgroundColor: "rgba(199,75,240,0.07)",
  },
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: space.lg,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    backgroundColor: C.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.hairline,
    ...elevation.floating,
  },
});
