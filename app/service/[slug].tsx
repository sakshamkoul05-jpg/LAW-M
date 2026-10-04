import React, { useEffect, useState } from "react";
import { Share, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { Icon } from "@/icons/Icon";
import { useLayout } from "@/components/AppWidth";
import { useMembership, useStore } from "@/lib/store";
import { savingOn } from "@/lawfic/subscription";
import { allServices, categories, categoryOf, documents, feePaise, getService, iconFor, requestHref, serviceName } from "@/data/catalogue";
import { rupees } from "@/lib/format";
import { Badge, Button, EmptyState, IconButton, IconTile, Press, Reveal, Screen, SectionHeader, Surface, T, buzz } from "@/ui";
import { color as C, font, motion, radius as R, space, themed } from "@/theme";

/**
 * One service.
 *
 * A LIVE service carries the website's full write-up — who it is for, what to
 * keep ready, how it goes, the questions people actually ask — and the fee
 * split the website insists on: the government's fee and LAWFIC's fee on
 * separate lines, always.
 *
 * Anything else in the catalogue or the document list is ON REQUEST: the page
 * says what it is and that LAWFIC quotes it, and the button asks for a quote.
 * It does not pretend to a price or a turnaround nobody has published.
 */
export default function ServiceDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const layout = useLayout();
  const { state, toggleWishlist } = useStore();
  const { entitled, sub, plan } = useMembership();
  const live = getService(slug);
  const entry = allServices.find((s) => s.slug === slug);
  const doc = documents.find((d) => d.slug === slug);
  const cat = categoryOf(slug);
  const saved = state.wishlist.includes(slug);

  if (!live && !entry && !doc) {
    return (
      <Screen back title="Service">
        <EmptyState icon="search" title="We could not find that service" cta="All services" onCta={() => router.replace("/services")} />
      </Screen>
    );
  }

  const name = serviceName(slug);
  const fee = feePaise(slug);
  const member = entitled && sub && fee ? savingOn(fee, sub.planId) : null;
  const cta = live ? (requestHref(slug).startsWith("/apply") ? "Start application" : "Request this service") : "Request a quote";
  const wide = layout !== "compact";

  const right = (
    <>
      <Heart saved={saved} onPress={() => toggleWishlist(slug)} />
      <IconButton icon="share" label="Share" onPress={() => Share.share({ message: `${name} — LAWFIC\nhttps://lawfic.pro${live ? `/services/${slug}` : doc ? doc.href : "/services"}` }).catch(() => {})} />
    </>
  );

  return (
    <Screen
      back
      large={false}
      title={name}
      right={right}
      footer={
        <View style={{ gap: 6 }}>
          <Button label={cta} icon="forward" onPress={() => router.push(requestHref(slug) as never)} />
          <T v="caption" center>
            {live ? "You owe nothing until we quote — decline and pay nothing." : "LAWFIC prices it for you first. Nothing is charged until you accept."}
          </T>
        </View>
      }
    >
      <Reveal fade>
        <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
          <IconTile icon={iconFor(slug)} size={52} gold />
          <View style={{ flex: 1 }}>
            <T v="label" tone="gold">
              {live?.category ?? cat?.name ?? doc?.group ?? "Service"}
            </T>
            {live ? <Badge label="Available now" tone="good" /> : <Badge label="On request" />}
          </View>
        </View>
        <T v={wide ? "display" : "title1"} style={{ marginTop: space.lg }}>
          {name}
        </T>
        <T v="body" style={{ marginTop: space.sm, maxWidth: 640 }}>
          {live?.tagline ?? entry?.blurb ?? doc?.blurb}
        </T>
      </Reveal>

      {live ? (
        <View style={wide ? { flexDirection: "row", gap: space.xxxl, marginTop: space.xxl, alignItems: "flex-start" } : { marginTop: space.xxl, gap: space.xxl }}>
          <View style={{ flex: 1.4, gap: space.xxl }}>
            <Reveal i={1}>
              <T v="body" tone="text">
                {live.summary}
              </T>
              {live.advisoryOnly && (
                <View style={styles.note}>
                  <Icon name="info" size={16} color={C.gold} />
                  <T v="callout" style={{ flex: 1 }}>
                    LAWFIC prepares the paperwork and books the visit. The official act — biometrics, the update itself — happens at an authorised centre, in person.
                  </T>
                </View>
              )}
            </Reveal>

            <Reveal i={2}>
              <SectionHeader title="Who it is for" />
              <Checklist items={live.who} icon="check" />
            </Reveal>

            <Reveal i={3}>
              <SectionHeader title="What to keep ready" />
              <Checklist items={live.documents} icon="document" />
            </Reveal>

            <Reveal i={4}>
              <SectionHeader title="How it goes" />
              <Surface style={{ padding: space.xl }}>
                {live.steps.map((s, i) => (
                  <View key={s.title} style={{ flexDirection: "row", gap: space.md, paddingBottom: i === live.steps.length - 1 ? 0 : space.xl }}>
                    <View style={{ alignItems: "center" }}>
                      <View style={styles.num}>
                        <T v="captionMedium" tone="gold" num style={{ fontFamily: font.semibold }}>
                          {i + 1}
                        </T>
                      </View>
                      {i < live.steps.length - 1 && <View style={styles.numLine} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <T v="headline">{s.title}</T>
                      <T v="callout" style={{ marginTop: 4 }}>
                        {s.body}
                      </T>
                    </View>
                  </View>
                ))}
              </Surface>
            </Reveal>

            <Reveal i={5}>
              <SectionHeader title="Questions people ask" />
              <View style={styles.faq}>
                {live.faq.map((f, i) => (
                  <Faq key={f.q} q={f.q} a={f.a} first={i === 0} />
                ))}
              </View>
            </Reveal>
          </View>

          <View style={{ flex: 1, gap: space.lg }}>
            <Reveal i={1}>
              <Surface raised tone="gold" style={{ padding: space.xl }}>
                <T v="label">Fees</T>
                <View style={styles.feeRow}>
                  <View style={{ flex: 1 }}>
                    <T v="callout">LAWFIC fee</T>
                    {member && member.discountPaise > 0 && <T v="caption" tone="gold">{`${plan?.name} member price`}</T>}
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    {member && member.discountPaise > 0 && (
                      <T v="caption" num style={{ textDecorationLine: "line-through" }}>
                        {live.fee.professional}
                      </T>
                    )}
                    <T v="title2" num>
                      {member && member.discountPaise > 0 ? rupees(member.payablePaise) : live.fee.professional}
                    </T>
                  </View>
                </View>
                <View style={styles.feeRow}>
                  <T v="callout" style={{ flex: 1 }}>
                    Government fee
                  </T>
                  <T v="calloutMedium" style={{ flex: 1.3, textAlign: "right" }}>
                    {live.fee.government}
                  </T>
                </View>
                <View style={[styles.feeRow, { borderBottomWidth: 0 }]}>
                  <T v="callout" style={{ flex: 1 }}>
                    Usual time
                  </T>
                  <T v="calloutMedium">{live.turnaround}</T>
                </View>
                <T v="caption" style={{ marginTop: space.md }}>
                  The government fee is passed through at cost and never bundled into LAWFIC's price.
                </T>
              </Surface>
            </Reveal>
            {!entitled && (
              <Reveal i={2}>
                <Press onPress={() => router.push("/membership")} radius={R.lg} accessibilityLabel="Membership plans" style={styles.memberStrip}>
                  <Icon name="crown" size={18} color={C.gold} />
                  <T v="callout" tone="dim" style={{ flex: 1 }}>
                    Members save 5–18% on LAWFIC's fee.
                  </T>
                  <Icon name="chevron" size={15} color={C.textMuted} />
                </Press>
              </Reveal>
            )}
          </View>
        </View>
      ) : (
        <View style={{ marginTop: space.xxl, gap: space.lg }}>
          <Reveal i={1}>
            <Surface style={{ padding: space.xl }}>
              <T v="label">How this works</T>
              <T v="body" tone="text" style={{ marginTop: 6 }}>
                {cat?.summary ?? "LAWFIC prepares this document, checks it, and files or registers it where that is what makes it valid."}
              </T>
              <View style={{ gap: space.md, marginTop: space.xl }}>
                {["Tell us what you need — a few questions, no documents yet.", "We quote it: the government fee and LAWFIC's fee on separate lines.", "Accept and pay from your wallet, and the work starts."].map((t, i) => (
                  <View key={t} style={{ flexDirection: "row", gap: space.md, alignItems: "flex-start" }}>
                    <View style={styles.num}>
                      <T v="captionMedium" tone="gold" num>
                        {i + 1}
                      </T>
                    </View>
                    <T v="callout" tone="text" style={{ flex: 1, marginTop: 3 }}>
                      {t}
                    </T>
                  </View>
                ))}
              </View>
            </Surface>
          </Reveal>
          {cat && (
            <Reveal i={2}>
              <SectionHeader title={`More in ${cat.name}`} />
              <View style={styles.faq}>
                {categories
                  .find((c) => c.id === cat.id)!
                  .services.filter((s) => s.slug !== slug)
                  .slice(0, 5)
                  .map((s, i) => (
                    <Press key={s.slug} onPress={() => router.replace(`/service/${s.slug}`)} radius={0} scaleTo={0.99} accessibilityLabel={s.name} style={[styles.more, i > 0 && styles.rule]}>
                      <T v="bodyMedium" style={{ flex: 1 }} numberOfLines={1}>
                        {s.name}
                      </T>
                      {s.status === "live" && <Badge label="Available" tone="good" />}
                      <Icon name="chevron" size={15} color={C.textMuted} />
                    </Press>
                  ))}
              </View>
            </Reveal>
          )}
        </View>
      )}
    </Screen>
  );
}

function Checklist({ items, icon }: { items: string[]; icon: "check" | "document" }) {
  return (
    <Surface padded={false}>
      {items.map((t, i) => (
        <View key={t} style={[styles.check, i > 0 && styles.rule]}>
          <View style={styles.checkIcon}>
            <Icon name={icon} size={13} color={C.gold} strokeWidth={2} />
          </View>
          <T v="callout" tone="text" style={{ flex: 1 }}>
            {t}
          </T>
        </View>
      ))}
    </Surface>
  );
}

/** An accordion row: the chevron turns, the answer rises in. */
function Faq({ q, a, first }: { q: string; a: string; first: boolean }) {
  const [open, setOpen] = useState(false);
  const turn = useSharedValue(0);
  useEffect(() => {
    turn.value = withSpring(open ? 1 : 0, motion.press);
  }, [open, turn]);
  const chev = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.value * 180}deg` }] }));
  return (
    <View style={!first && styles.rule}>
      <Press onPress={() => setOpen((o) => !o)} radius={0} scaleTo={0.995} haptic="select" accessibilityLabel={q} accessibilityState={{ expanded: open }} style={styles.q}>
        <T v="bodyMedium" style={{ flex: 1 }}>
          {q}
        </T>
        <Animated.View style={chev}>
          <Icon name="chevronDown" size={18} color={open ? C.gold : C.textMuted} />
        </Animated.View>
      </Press>
      {open && (
        <Animated.View entering={FadeInDown.duration(240)} style={{ paddingHorizontal: space.lg, paddingBottom: space.lg }}>
          <T v="callout">{a}</T>
        </Animated.View>
      )}
    </View>
  );
}

/** Save: the heart pops, and a haptic confirms. */
function Heart({ saved, onPress }: { saved: boolean; onPress: () => void }) {
  const s = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <Press
      onPress={() => {
        s.value = withSequence(withTiming(0.7, { duration: 90 }), withSpring(1, { damping: 8, stiffness: 300 }));
        buzz(saved ? "light" : "success");
        onPress();
      }}
      radius={20}
      accessibilityLabel={saved ? "Remove from wish list" : "Save to wish list"}
      accessibilityState={{ selected: saved }}
      style={styles.heart}
    >
      <Animated.View style={style}>
        <Icon name="heart" size={18} color={saved ? C.gold : C.text} strokeWidth={saved ? 2.2 : 1.7} />
      </Animated.View>
    </Press>
  );
}

const styles = themed(() => ({
  note: { flexDirection: "row", gap: space.md, marginTop: space.lg, padding: space.lg, borderRadius: R.lg, backgroundColor: C.goldWash, borderWidth: StyleSheet.hairlineWidth, borderColor: C.goldLine },
  check: { flexDirection: "row", alignItems: "flex-start", gap: space.md, paddingHorizontal: space.lg, paddingVertical: 13 },
  checkIcon: { width: 24, height: 24, borderRadius: 8, backgroundColor: C.goldWash, alignItems: "center", justifyContent: "center", marginTop: -1 },
  rule: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.line },
  num: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: C.goldLine, alignItems: "center", justifyContent: "center", backgroundColor: C.goldWash },
  numLine: { flex: 1, width: 1, backgroundColor: C.goldLine, marginTop: 4 },
  faq: { borderRadius: R.xl, backgroundColor: C.surfaceHigh, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line, overflow: "hidden" },
  q: { flexDirection: "row", alignItems: "center", gap: space.md, paddingHorizontal: space.lg, paddingVertical: 15 },
  feeRow: { flexDirection: "row", alignItems: "center", gap: space.md, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.line },
  memberStrip: { flexDirection: "row", alignItems: "center", gap: space.md, padding: space.lg, borderRadius: R.lg, backgroundColor: C.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line },
  more: { flexDirection: "row", alignItems: "center", gap: space.md, paddingHorizontal: space.lg, paddingVertical: 13 },
  heart: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: C.surfaceHigh, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line },
}));
