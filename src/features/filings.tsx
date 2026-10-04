import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from "react-native-reanimated";
import type { ServiceOrder, OrderStatus } from "@/lawfic/orders";
import { STATUS_META, TIMELINE, orderTotalPaise, timelineIndex } from "@/lawfic/orders";
import { Icon } from "@/icons/Icon";
import { iconFor, serviceName } from "@/data/catalogue";
import { ago, dateLong, rupees, time } from "@/lib/format";
import { Badge, IconTile, Press, ProgressRing, StepBar, T, type BadgeTone } from "@/ui";
import { color as C, elevation, font, motion, radius as R, space, themed } from "@/theme";

/**
 * Filings — what the spec calls "matters".
 *
 * LAWFIC's unit of work is a filing: a registration, a certificate, a
 * correction, requested, quoted, paid for and carried through to issue. The
 * statuses, their wording and their order are the website's (lib/orders.ts),
 * so a filing reads the same in the app, on lawfic.pro and in the back office.
 */

export const TONE_FOR: Record<STATUS_META_TONE, BadgeTone> = { neutral: "neutral", action: "action", good: "good", bad: "bad" };
type STATUS_META_TONE = (typeof STATUS_META)[OrderStatus]["tone"];

export function statusBadge(o: ServiceOrder) {
  const meta = STATUS_META[o.status];
  return <Badge label={meta.label} tone={TONE_FOR[meta.tone]} live={o.status === "in_progress"} />;
}

/** 0..1 along the website's five-step timeline. */
export function progressOf(o: ServiceOrder): number {
  if (o.status === "rejected") return 1;
  return timelineIndex(o.status) / (TIMELINE.length - 1);
}

/** The one line that says what happens next, and whose move it is. */
export function nextStep(o: ServiceOrder): { text: string; yours: boolean } {
  switch (o.status) {
    case "submitted":
      return { text: "We are pricing it. Nothing is owed yet.", yours: false };
    case "quoted":
      return { text: `Pay ${rupees(orderTotalPaise(o))} from your wallet to start`, yours: true };
    case "paid":
      return { text: "Queued to be prepared", yours: false };
    case "in_progress":
      return { text: "Filed — with the registry", yours: false };
    case "completed":
      return { text: "Done. Certificate issued", yours: false };
    case "rejected":
      return { text: "Closed. Anything paid was refunded to your wallet", yours: false };
  }
}

/** The most recent thing that happened to a filing. */
export function lastActivity(o: ServiceOrder): string {
  return o.completed_at ?? o.paid_at ?? o.quoted_at ?? o.created_at;
}

/**
 * A filing, as a card. Reads top to bottom the way you would ask about it:
 * what is it, where is it, what happens next.
 */
export function FilingCard({ order, onPress, featured }: { order: ServiceOrder; onPress: () => void; featured?: boolean }) {
  const next = nextStep(order);
  const p = progressOf(order);
  const done = order.status === "completed";
  const bad = order.status === "rejected";

  return (
    <Press onPress={onPress} radius={R.xl} accessibilityLabel={`${serviceName(order.service_slug)}, ${STATUS_META[order.status].label}`} style={[styles.card, featured && styles.featured, featured && elevation.mid]}>
      <View style={styles.cardTop}>
        <IconTile icon={iconFor(order.service_slug)} gold={next.yours} size={40} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <T v="label" numberOfLines={1}>
            {order.reference}
          </T>
          <T v="headline" numberOfLines={2} style={{ marginTop: 3 }}>
            {serviceName(order.service_slug)}
          </T>
        </View>
        <ProgressRing value={p} size={48} stroke={3.5} tone={bad ? C.red : done ? C.green : C.gold} label={done || bad ? null : p === 0 ? "New" : undefined} />
        {(done || bad) && (
          <View style={styles.ringIcon} pointerEvents="none">
            <Icon name={done ? "check" : "close"} size={18} color={done ? C.green : C.red} strokeWidth={2.2} />
          </View>
        )}
      </View>

      <View style={{ marginTop: space.lg }}>
        <StepBar steps={TIMELINE.length} current={timelineIndex(order.status)} bad={bad} tone={done ? C.green : C.gold} />
      </View>

      <View style={styles.cardFoot}>
        {statusBadge(order)}
        <T v="caption" style={{ marginLeft: "auto" }}>
          {ago(lastActivity(order))}
        </T>
      </View>
      <View style={[styles.next, next.yours && styles.nextYours]}>
        <Icon name={next.yours ? "bolt" : "clock"} size={14} color={next.yours ? C.gold : C.textMuted} />
        <T v="captionMedium" color={next.yours ? C.goldLight : C.textDim} style={{ flex: 1 }} numberOfLines={1}>
          {next.text}
        </T>
        <Icon name="chevron" size={14} color={next.yours ? C.gold : C.textMuted} />
      </View>
    </Press>
  );
}

/**
 * The timeline. Each step's dot pops in after the one before it and the line
 * between them draws downward, so opening a filing replays how far it has come.
 */
export function FilingTimeline({ order }: { order: ServiceOrder }) {
  const idx = timelineIndex(order.status);
  const bad = order.status === "rejected";
  const stamps: Partial<Record<OrderStatus, string | null>> = {
    submitted: order.created_at,
    quoted: order.quoted_at,
    paid: order.paid_at,
    in_progress: order.paid_at && order.status !== "paid" ? order.paid_at : null,
    completed: order.status === "completed" ? order.completed_at : null,
  };
  const steps: { key: OrderStatus; title: string; body: string }[] = TIMELINE.map((k) => ({ key: k, title: STATUS_META[k].label, body: STATUS_META[k].blurb }));
  if (bad) steps.push({ key: "rejected", title: STATUS_META.rejected.label, body: STATUS_META.rejected.blurb });

  return (
    <View>
      {steps.map((s, i) => {
        const reached = bad ? i <= idx || s.key === "rejected" : i <= idx;
        const current = bad ? s.key === "rejected" : i === idx;
        const at = s.key === "rejected" ? order.completed_at : stamps[s.key];
        return (
          <Step
            key={s.key}
            i={i}
            last={i === steps.length - 1}
            reached={reached}
            current={current}
            tone={s.key === "rejected" ? C.red : s.key === "completed" && reached ? C.green : C.gold}
            title={s.title}
            body={current || !reached ? s.body : undefined}
            at={reached && at ? `${dateLong(at)} · ${time(at)}` : undefined}
            nextReached={bad ? i + 1 <= idx || steps[i + 1]?.key === "rejected" : i + 1 <= idx}
          />
        );
      })}
    </View>
  );
}

function Step({
  i,
  last,
  reached,
  current,
  nextReached,
  tone,
  title,
  body,
  at,
}: {
  i: number;
  last: boolean;
  reached: boolean;
  current: boolean;
  nextReached: boolean;
  tone: string;
  title: string;
  body?: string;
  at?: string;
}) {
  const pop = useSharedValue(0);
  const line = useSharedValue(0);
  useEffect(() => {
    pop.value = withDelay(120 + i * 110, withSpring(1, motion.arrive));
    if (nextReached) line.value = withDelay(200 + i * 110, withTiming(1, { duration: 320 }));
  }, [i, nextReached, pop, line]);
  const dot = useAnimatedStyle(() => ({ transform: [{ scale: 0.4 + pop.value * 0.6 }], opacity: pop.value }));
  const fill = useAnimatedStyle(() => ({ transform: [{ scaleY: line.value }] }));

  return (
    <View style={{ flexDirection: "row", gap: space.md }}>
      <View style={{ alignItems: "center", width: 22 }}>
        <Animated.View
          style={[
            styles.dot,
            reached ? { backgroundColor: tone, borderColor: tone } : { backgroundColor: "transparent", borderColor: C.lineStrong },
            current && { shadowColor: tone, shadowOpacity: 0.6, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } },
            dot,
          ]}
        >
          {reached && !current && <Icon name="check" size={11} color={C.ink} strokeWidth={3} />}
          {current && <View style={styles.dotCore} />}
        </Animated.View>
        {!last && (
          <View style={styles.track}>
            <Animated.View style={[styles.trackFill, { backgroundColor: tone }, fill]} />
          </View>
        )}
      </View>
      <View style={{ flex: 1, paddingBottom: last ? 0 : space.xl }}>
        <T v="bodyMedium" color={reached ? C.text : C.textMuted} style={{ fontFamily: current ? font.semibold : font.medium }}>
          {title}
        </T>
        {at && (
          <T v="caption" num style={{ marginTop: 2 }}>
            {at}
          </T>
        )}
        {body && (
          <T v="callout" tone={current ? "dim" : "muted"} style={{ marginTop: 4 }}>
            {body}
          </T>
        )}
      </View>
    </View>
  );
}

const styles = themed(() => ({
  card: {
    padding: space.lg,
    borderRadius: R.xl,
    backgroundColor: C.surfaceHigh,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.line,
  },
  featured: { borderColor: C.goldLine },
  cardTop: { flexDirection: "row", alignItems: "center", gap: space.md },
  ringIcon: { position: "absolute", right: 0, top: 0, width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  cardFoot: { flexDirection: "row", alignItems: "center", marginTop: space.md },
  next: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: space.md,
    paddingHorizontal: space.md,
    height: 38,
    borderRadius: R.sm,
    backgroundColor: C.press,
  },
  nextYours: { backgroundColor: C.goldWash },
  dot: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  dotCore: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.ink },
  track: { flex: 1, width: 2, backgroundColor: C.line, marginVertical: 4, borderRadius: 1, overflow: "hidden" },
  trackFill: { flex: 1, transformOrigin: "top" },
}));
