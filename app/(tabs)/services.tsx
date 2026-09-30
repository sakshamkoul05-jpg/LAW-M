import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Icon } from "@/icons/Icon";
import { Chip, T, Touch } from "@/components/ui";
import { rupees } from "@/components/Money";
import { Screen } from "@/components/Screen";
import { useAppWidth } from "@/components/AppWidth";
import { color as C, font, gradient, radius, space, text } from "@/theme";
import { allServices, categories, type Service } from "@/data/catalogue";

/**
 * Services — a browsable grid, not a settings list.
 *
 * Category chips across the top filter the grid in place; search narrows it as
 * you type. A service the website has not launched yet renders dim with a
 * "Soon" chip and does not open — one line would let it through to a mocked
 * detail screen, and that line is how a demo starts promising services nobody
 * can deliver.
 */
const TINTS = [gradient.violet, gradient.midnight, gradient.obsidian, gradient.aurora];

export default function Services() {
  const router = useRouter();
  const width = useAppWidth();
  const [cat, setCat] = useState<string>("all");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return allServices.filter(
      (s) =>
        (cat === "all" || s.categoryId === cat) &&
        (!needle || s.name.toLowerCase().includes(needle) || s.blurb.toLowerCase().includes(needle)),
    );
  }, [cat, q]);

  const live = list.filter((s) => s.status === "live");
  const soon = list.filter((s) => s.status === "soon");
  const tileW = (width - space.lg * 2 - space.md) / 2;

  return (
    <Screen aurora="violet" auroraHeight={380}>
      <View style={styles.pad}>
        <T.Label>What we do</T.Label>
        <T.Title style={{ marginTop: 2 }}>Services</T.Title>

        <View style={styles.search}>
          <Icon name="search" size={18} color={C.textDim} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search 39 services"
            placeholderTextColor={C.textFaint}
            accessibilityLabel="Search services"
            style={styles.input}
            returnKeyType="search"
          />
          {q ? (
            <Touch onPress={() => setQ("")} accessibilityLabel="Clear search" haptic="select">
              <Icon name="close" size={16} color={C.textFaint} />
            </Touch>
          ) : null}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {[{ id: "all", name: "All", icon: "services" as const }, ...categories].map((c) => {
          const on = cat === c.id;
          return (
            <Touch
              key={c.id}
              onPress={() => setCat(c.id)}
              haptic="select"
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={c.name}
              style={[styles.chip, on && styles.chipOn]}
            >
              <Icon name={c.icon} size={15} color={on ? C.goldInk : C.textDim} />
              <Text style={[text.smallSemi, { color: on ? C.goldInk : C.textDim }]}>{c.name.replace(" & ", " & ")}</Text>
            </Touch>
          );
        })}
      </ScrollView>

      <View style={[styles.pad, { marginTop: space.lg }]}>
        <T.Tiny>
          {live.length} available · {soon.length} coming soon
        </T.Tiny>

        <View style={styles.grid}>
          {live.map((s, i) => (
            <Animated.View key={s.slug} entering={FadeInDown.delay(Math.min(i, 8) * 40).duration(340)}>
              <ServiceTile service={s} width={tileW} tint={TINTS[i % TINTS.length]!} onPress={() => router.push(`/service/${s.slug}`)} />
            </Animated.View>
          ))}
        </View>

        {soon.length > 0 && (
          <>
            <T.Label style={{ marginTop: space.xxl, marginBottom: space.md }}>Coming soon</T.Label>
            <View style={styles.soonList}>
              {soon.map((s, i) => {
                const c = categories.find((x) => x.id === s.categoryId)!;
                return (
                  <View key={s.slug} style={[styles.soonRow, i > 0 && styles.rule]} accessible accessibilityLabel={`${s.name}. Not available yet.`}>
                    <Icon name={c.icon} size={18} color={C.textFaint} />
                    <View style={{ flex: 1 }}>
                      <T.Small tone={C.textDim}>{s.name}</T.Small>
                    </View>
                    <Chip>Soon</Chip>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {list.length === 0 && (
          <View style={{ alignItems: "center", paddingVertical: space.xxxl }}>
            <Icon name="search" size={28} color={C.textFaint} />
            <T.Body style={{ marginTop: space.md, textAlign: "center" }}>
              Nothing matches that. The Panda can usually work out which service you need from a plain description.
            </T.Body>
          </View>
        )}
      </View>
    </Screen>
  );
}

function ServiceTile({
  service,
  width,
  tint,
  onPress,
}: {
  service: Service;
  width: number;
  tint: readonly [string, string, ...string[]];
  onPress: () => void;
}) {
  const c = categories.find((x) => x.id === service.categoryId)!;
  return (
    <Touch onPress={onPress} accessibilityLabel={service.name} style={[styles.tile, { width }]}>
      <LinearGradient colors={tint} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.45)"]} style={StyleSheet.absoluteFill} />
      <View style={styles.tileTop}>
        <View style={styles.tileIcon}>
          <Icon name={c.icon} size={20} color={C.gold} />
        </View>
        {service.turnaround && <Chip tone="gold">{service.turnaround}</Chip>}
      </View>
      <View style={{ flex: 1 }} />
      <Text style={[text.subhead, { color: C.text }]} numberOfLines={2}>
        {service.name}
      </Text>
      <Text style={[text.tiny, { color: C.textDim, marginTop: 3 }]} numberOfLines={1}>
        {service.blurb}
      </Text>
      <View style={styles.tileFoot}>
        <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: C.text, letterSpacing: -0.4 }}>
          {service.feePaise ? rupees(service.feePaise) : "Quote"}
        </Text>
        <View style={styles.go}>
          <Icon name="arrowUp" size={14} color={C.goldInk} />
        </View>
      </View>
    </Touch>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: space.lg },
  search: {
    marginTop: space.lg,
    height: 50,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: space.lg,
    backgroundColor: C.glassHigh,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.hairline,
  },
  input: { flex: 1, color: C.text, fontFamily: font.body, fontSize: 15, padding: 0, height: 46 },
  chips: { paddingHorizontal: space.lg, gap: space.sm, marginTop: space.lg },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 19,
    backgroundColor: C.glass,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.hairline,
  },
  chipOn: { backgroundColor: C.gold, borderColor: C.gold },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: space.md, marginTop: space.md },
  tile: {
    height: 212,
    borderRadius: radius.lg,
    overflow: "hidden",
    padding: space.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.hairlineStrong,
  },
  tileTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  tileIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(242,198,109,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  tileFoot: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: space.md },
  go: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.gold, alignItems: "center", justifyContent: "center" },
  soonList: {
    borderRadius: radius.lg,
    backgroundColor: C.glass,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.hairline,
    overflow: "hidden",
  },
  soonRow: { flexDirection: "row", alignItems: "center", gap: space.md, paddingHorizontal: space.lg, paddingVertical: 13 },
  rule: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.hairline },
});
