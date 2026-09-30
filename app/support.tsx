import React, { useState } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { company } from "@/lawfic/company";
import { liveServices } from "@/data/catalogue";
import { Icon, type IconName } from "@/icons/Icon";
import { Badge, Press, Reveal, Screen, SectionHeader, Surface, T, useToast } from "@/ui";
import { color as C, motion, radius as R, space } from "@/theme";

/**
 * Talk to the team.
 *
 * Every contact here is the one in the website's company file
 * (lib/company.ts), and each one really opens WhatsApp, the dialler or mail. A
 * contact that has not been supplied is not shown with a made-up number.
 *
 * "Book a free consultancy" is on the website's quick actions but its page is
 * not built yet, so it is shown here as coming, not as a booking form that
 * books nothing.
 */
export default function Support() {
  const router = useRouter();
  const toast = useToast();
  const open = (url: string) => Linking.openURL(url).catch(() => toast({ title: "That could not be opened on this device", tone: "bad" }));

  const channels: { icon: IconName; title: string; sub: string; url: string | null }[] = [
    { icon: "chat", title: "WhatsApp", sub: company.whatsapp ? `+${company.whatsapp.slice(0, 2)} ${company.whatsapp.slice(2, 7)} ${company.whatsapp.slice(7)}` : "", url: company.whatsapp ? `https://wa.me/${company.whatsapp}?text=${encodeURIComponent("Hello LAWFIC, I need some help.")}` : null },
    { icon: "phone", title: "Call us", sub: company.supportPhone ?? "", url: company.supportPhone ? `tel:${company.supportPhone.replace(/\s+/g, "")}` : null },
    { icon: "mail", title: "Email", sub: company.supportEmail ?? "", url: company.supportEmail ? `mailto:${company.supportEmail}` : null },
  ];
  const faqs = liveServices.flatMap((s) => s.faq.map((f) => ({ ...f, service: s.name })));

  return (
    <Screen back title="Talk to the team" subtitle={company.supportHours}>
      <View style={styles.channels}>
        {channels
          .filter((c) => c.url)
          .map((c, i) => (
            <Reveal key={c.title} i={i} style={{ flex: 1, minWidth: 200 }}>
              <Press onPress={() => open(c.url!)} radius={R.xl} accessibilityLabel={`${c.title}, ${c.sub}`} style={styles.channel}>
                <View style={styles.channelIcon}>
                  <Icon name={c.icon} size={22} color={C.gold} />
                </View>
                <T v="headline" style={{ marginTop: space.lg }}>
                  {c.title}
                </T>
                <T v="caption" num numberOfLines={1}>
                  {c.sub}
                </T>
                <View style={styles.open}>
                  <T v="captionMedium" tone="gold">
                    Open
                  </T>
                  <Icon name="arrowUpRight" size={13} color={C.gold} />
                </View>
              </Press>
            </Reveal>
          ))}
      </View>

      <Reveal i={3} style={{ marginTop: space.xl }}>
        <Surface style={styles.row}>
          <Icon name="calendarCheck" size={20} color={C.textDim} />
          <View style={{ flex: 1 }}>
            <T v="calloutMedium">Book a free consultancy</T>
            <T v="caption">Pick a time to talk to an advisor. Booking is not open yet — WhatsApp or call and we will set a time.</T>
          </View>
          <Badge label="Coming soon" />
        </Surface>
      </Reveal>

      <Reveal i={4} style={{ marginTop: space.md }}>
        <Press onPress={() => router.push("/ai")} radius={R.xl} accessibilityLabel="Ask Panda AI" style={[styles.row, styles.ai]}>
          <Icon name="panda" size={20} color={C.gold} />
          <View style={{ flex: 1 }}>
            <T v="calloutMedium">Ask Panda AI first</T>
            <T v="caption">Answers straight away, any hour, from LAWFIC's own service pages.</T>
          </View>
          <Icon name="chevron" size={16} color={C.textMuted} />
        </Press>
      </Reveal>

      <View style={{ marginTop: space.section }}>
        <SectionHeader kicker="FAQ" title="Common questions" />
        <View style={styles.faq}>
          {faqs.map((f, i) => (
            <Faq key={f.q} {...f} first={i === 0} />
          ))}
        </View>
      </View>
    </Screen>
  );
}

function Faq({ q, a, service, first }: { q: string; a: string; service: string; first: boolean }) {
  const [open, setOpen] = useState(false);
  const r = useSharedValue(0);
  const chev = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.value * 180}deg` }] }));
  return (
    <View style={!first && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.line }}>
      <Press
        onPress={() => {
          r.value = withSpring(open ? 0 : 1, motion.press);
          setOpen(!open);
        }}
        radius={0}
        scaleTo={0.995}
        haptic="select"
        accessibilityLabel={q}
        accessibilityState={{ expanded: open }}
        style={styles.q}
      >
        <View style={{ flex: 1 }}>
          <T v="micro" tone="gold">
            {service}
          </T>
          <T v="bodyMedium" style={{ marginTop: 2 }}>
            {q}
          </T>
        </View>
        <Animated.View style={chev}>
          <Icon name="chevronDown" size={18} color={open ? C.gold : C.textMuted} />
        </Animated.View>
      </Press>
      {open && (
        <Animated.View entering={FadeInDown.duration(220)} style={{ paddingHorizontal: space.lg, paddingBottom: space.lg }}>
          <T v="callout">{a}</T>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  channels: { flexDirection: "row", flexWrap: "wrap", gap: space.md },
  channel: { padding: space.xl, borderRadius: R.xl, backgroundColor: C.surfaceHigh, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line },
  channelIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: C.goldWash, borderWidth: StyleSheet.hairlineWidth, borderColor: C.goldLine, alignItems: "center", justifyContent: "center" },
  open: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: space.lg },
  row: { flexDirection: "row", alignItems: "center", gap: space.md },
  ai: { padding: space.lg, borderRadius: R.xl, backgroundColor: C.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: C.goldLine },
  faq: { borderRadius: R.xl, backgroundColor: C.surfaceHigh, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line, overflow: "hidden" },
  q: { flexDirection: "row", alignItems: "center", gap: space.md, paddingHorizontal: space.lg, paddingVertical: 14 },
});
