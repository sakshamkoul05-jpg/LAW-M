import React, { useMemo, useState } from "react";
import { Platform, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Icon } from "@/icons/Icon";
import { useLayout } from "@/components/AppWidth";
import { allServices, categories, feePaise, iconFor, liveServices, searchServices } from "@/data/catalogue";
import { rupees } from "@/lib/format";
import { Badge, EmptyState, IconTile, Press, Reveal, Screen, SectionHeader, T } from "@/ui";
import { color as C, elevation, font, radius as R, space, text } from "@/theme";

/**
 * The services marketplace — the website's catalogue, 7 categories and 39
 * services, with its own search ranking (exact name, then prefix, then alias,
 * then anywhere; live services first on a tie).
 *
 * Four are "available now" with a full page. The rest are "on request": they
 * can be asked for and LAWFIC quotes them, exactly as on lawfic.pro. Nothing
 * here is invented, and no service is shown as bookable that is not.
 */
export default function Services() {
  const router = useRouter();
  const layout = useLayout();
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const [cat, setCat] = useState<string | null>(null);
  const results = useMemo(() => searchServices(q), [q]);
  const wide = layout !== "compact";
  const active = cat ? categories.find((c) => c.id === cat) : null;

  return (
    <Screen back title="Services" subtitle={`${allServices.length} registrations, licences and legal documents — ${liveServices.length} ready to start today.`}>
      <Reveal fade>
        <View style={[styles.search, focus && styles.searchOn]}>
          <Icon name="search" size={18} color={focus ? C.gold : C.textMuted} />
          <TextInput
            value={q}
            onChangeText={setQ}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            placeholder="Search GST, PAN, trademark, rent agreement…"
            placeholderTextColor={C.textMuted}
            selectionColor={C.gold}
            accessibilityLabel="Search services"
            returnKeyType="search"
            style={[styles.input, Platform.OS === "web" && ({ outlineStyle: "none" } as object)]}
          />
          {!!q && (
            <Press onPress={() => setQ("")} radius={12} accessibilityLabel="Clear search" hitSlop={10}>
              <Icon name="close" size={16} color={C.textMuted} />
            </Press>
          )}
        </View>
      </Reveal>

      {q.trim() ? (
        <View style={{ marginTop: space.xl }}>
          <T v="label" style={{ marginBottom: space.md }}>
            {results.length} {results.length === 1 ? "result" : "results"}
          </T>
          {results.length === 0 ? (
            <EmptyState icon="search" title="Nothing matches that" body="Try another word — or describe what you need to Panda AI and it will point you to the right service." cta="Ask Panda AI" onCta={() => router.push("/ai")} />
          ) : (
            <View style={styles.list}>
              {results.map((s, i) => (
                <Animated.View key={s.slug} entering={FadeIn.delay(Math.min(i, 8) * 30)}>
                  <ServiceRow slug={s.slug} name={s.name} blurb={s.blurb} live={s.status === "live"} first={i === 0} category={s.categoryName} onPress={() => router.push(`/service/${s.slug}`)} />
                </Animated.View>
              ))}
            </View>
          )}
        </View>
      ) : (
        <>
          <View style={{ marginTop: space.xxl }}>
            <SectionHeader kicker="Available now" title="Ready to start today" />
            <View style={[styles.featured, { flexDirection: wide ? "row" : "column" }]}>
              {liveServices.map((s, i) => (
                <Reveal key={s.slug} i={i} style={{ flex: wide ? 1 : undefined }}>
                  <Press onPress={() => router.push(`/service/${s.slug}`)} radius={R.xl} accessibilityLabel={s.name} style={[styles.feature, elevation.low]}>
                    <LinearGradient colors={["#1A1712", "#111110", "#0D0D0D"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
                    <View style={styles.featureTop}>
                      <IconTile icon={iconFor(s.slug)} gold />
                      <Badge label={s.turnaround} tone="gold" icon="clock" />
                    </View>
                    <T v="title3" style={{ marginTop: space.lg }} numberOfLines={2}>
                      {s.name}
                    </T>
                    <T v="caption" numberOfLines={2} style={{ marginTop: 4 }}>
                      {s.tagline}
                    </T>
                    <View style={styles.featureFoot}>
                      <View>
                        <T v="micro">LAWFIC fee</T>
                        <T v="headline" num>
                          {feePaise(s.slug) ? rupees(feePaise(s.slug)!) : "Quoted"}
                        </T>
                      </View>
                      <View style={styles.go}>
                        <Icon name="forward" size={16} color={C.ink} strokeWidth={2} />
                      </View>
                    </View>
                  </Press>
                </Reveal>
              ))}
            </View>
          </View>

          <View style={{ marginTop: space.section }}>
            <SectionHeader kicker="Browse" title="By category" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.md, paddingRight: space.lg }}>
              {categories.map((c) => {
                const on = cat === c.id;
                const live = c.services.filter((s) => s.status === "live").length;
                return (
                  <Press key={c.id} onPress={() => setCat(on ? null : c.id)} haptic="select" radius={R.lg} accessibilityLabel={c.name} accessibilityState={{ selected: on }} style={[styles.cat, on && styles.catOn]}>
                    <Icon name={c.icon} size={22} color={on ? C.gold : C.textDim} />
                    <View style={{ marginTop: "auto" }}>
                      <T v="calloutMedium" numberOfLines={2}>
                        {c.name}
                      </T>
                      <T v="caption" num>
                        {c.services.length} services{live ? ` · ${live} live` : ""}
                      </T>
                    </View>
                  </Press>
                );
              })}
            </ScrollView>
          </View>

          <View style={{ marginTop: space.xl, gap: space.xl }}>
            {(active ? [active] : categories).map((c, ci) => (
              <Animated.View key={c.id} entering={FadeInDown.delay(ci * 40).duration(360)}>
                <View style={{ marginBottom: space.md }}>
                  <T v="headline">{c.name}</T>
                  {active && (
                    <T v="callout" style={{ marginTop: 4 }}>
                      {c.summary}
                    </T>
                  )}
                </View>
                <View style={styles.list}>
                  {c.services.map((s, i) => (
                    <ServiceRow key={s.slug} slug={s.slug} name={s.name} blurb={s.blurb} live={s.status === "live"} first={i === 0} onPress={() => router.push(`/service/${s.slug}`)} />
                  ))}
                </View>
              </Animated.View>
            ))}
          </View>
        </>
      )}
    </Screen>
  );
}

function ServiceRow({ slug, name, blurb, live, first, category, onPress }: { slug: string; name: string; blurb: string; live: boolean; first: boolean; category?: string; onPress: () => void }) {
  return (
    <Press onPress={onPress} radius={0} scaleTo={0.99} accessibilityLabel={`${name}${live ? "" : ", on request"}`} style={[styles.row, !first && styles.rule]}>
      <IconTile icon={iconFor(slug)} size={36} gold={live} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <T v="bodyMedium" numberOfLines={1}>
          {name}
        </T>
        <T v="caption" numberOfLines={1}>
          {category ? `${category} · ` : ""}
          {blurb}
        </T>
      </View>
      {live ? <Badge label="Available" tone="good" /> : <T v="captionMedium" tone="muted">On request</T>}
      <Icon name="chevron" size={15} color={C.textMuted} />
    </Press>
  );
}

const styles = StyleSheet.create({
  search: { flexDirection: "row", alignItems: "center", gap: 10, height: 54, paddingHorizontal: space.lg, borderRadius: 27, backgroundColor: C.surfaceHigh, borderWidth: 1, borderColor: C.line },
  searchOn: { borderColor: C.goldLine, shadowColor: C.gold, shadowOpacity: 0.18, shadowRadius: 14, shadowOffset: { width: 0, height: 0 } },
  input: { flex: 1, ...text.bodyMedium, color: C.text, fontFamily: font.medium, height: 50 },
  list: { borderRadius: R.xl, backgroundColor: C.surfaceHigh, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: space.md, paddingHorizontal: space.lg, paddingVertical: 12 },
  rule: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.line },
  featured: { gap: space.md },
  feature: { padding: space.xl, borderRadius: R.xl, overflow: "hidden", borderWidth: StyleSheet.hairlineWidth, borderColor: C.goldLine, minHeight: 220 },
  featureTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  featureFoot: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: "auto", paddingTop: space.lg },
  go: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.gold, alignItems: "center", justifyContent: "center" },
  cat: { width: 150, height: 128, padding: space.lg, borderRadius: R.lg, backgroundColor: C.surfaceHigh, borderWidth: 1, borderColor: C.line },
  catOn: { borderColor: C.gold, backgroundColor: "#15120C" },
});
