import React, { useEffect } from "react";
import { pop } from "@/ui/enter";
import { StyleSheet, View, type TextInputProps } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeIn, FadeInDown, ZoomIn, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { Icon, type IconName } from "@/icons/Icon";
import { Button, Field as BaseField, Press, T, buzz } from "@/ui";
import { color as C, font, motion, radius as R, space } from "@/theme";

/**
 * The pieces the application flows are built from (Udyam, Aadhaar).
 *
 * A stepper whose bars fill on a spring, a heading per step, choice tiles that
 * behave like radios or checkboxes, a callout for the one thing to know, and
 * a Back / Continue pair. The rules each flow applies come from the website's
 * own files (src/lib/msme.ts, src/lib/aadhaar.ts), not from here.
 */

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 6 }} accessibilityLabel={`Step ${current + 1} of ${steps.length}`}>
      {steps.map((s, i) => (
        <View key={s} style={{ flex: 1, gap: 7 }}>
          <View style={styles.track}>
            <Fill pct={i < current ? 1 : i === current ? 0.5 : 0} />
          </View>
          <T v="micro" color={i === current ? C.text : i < current ? C.textDim : C.textMuted} style={{ letterSpacing: 0.8, fontFamily: font.semibold }}>
            {s.toUpperCase()}
          </T>
        </View>
      ))}
    </View>
  );
}

function Fill({ pct }: { pct: number }) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withSpring(pct, motion.arrive);
  }, [pct, v]);
  const style = useAnimatedStyle(() => ({ transform: [{ scaleX: Math.max(0, Math.min(1, v.value)) }] }));
  return <Animated.View style={[styles.fill, style]} />;
}

export type Choice = { id: string; label: string; hint?: string; icon?: IconName; chip?: string };

export function Choices({
  choices,
  value,
  onChange,
  multiple,
  columns = 1,
}: {
  choices: Choice[];
  value: string[];
  onChange: (v: string[]) => void;
  multiple?: boolean;
  columns?: 1 | 2;
}) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
      {choices.map((c, i) => {
        const on = value.includes(c.id);
        return (
          <Animated.View key={c.id} entering={FadeInDown.delay(i * 35).duration(300)} style={columns === 2 ? { width: "48.8%" } : { width: "100%" }}>
            <Press
              haptic="select"
              radius={R.lg}
              accessibilityRole={multiple ? "checkbox" : "radio"}
              accessibilityState={{ checked: on }}
              accessibilityLabel={c.label}
              onPress={() => onChange(multiple ? (on ? value.filter((v) => v !== c.id) : [...value, c.id]) : [c.id])}
              style={[styles.choice, columns === 2 && styles.choiceTile, on && styles.choiceOn]}
            >
              {columns === 2 ? (
                <View style={styles.tileHead}>
                  {c.icon ? <Icon name={c.icon} size={20} active={on} /> : <View />}
                  <Mark on={on} multiple={multiple} />
                </View>
              ) : (
                c.icon && <Icon name={c.icon} size={20} active={on} />
              )}
              <View style={columns === 2 ? undefined : { flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <T v="bodyMedium">{c.label}</T>
                  {c.chip && (
                    <View style={styles.miniChip}>
                      <T v="micro" tone="dim">
                        {c.chip}
                      </T>
                    </View>
                  )}
                </View>
                {c.hint && (
                  <T v="caption" style={{ marginTop: 2 }}>
                    {c.hint}
                  </T>
                )}
              </View>
              {columns !== 2 && <Mark on={on} multiple={multiple} />}
            </Press>
          </Animated.View>
        );
      })}
    </View>
  );
}

function Mark({ on, multiple }: { on: boolean; multiple?: boolean }) {
  return (
    <View style={[styles.radio, multiple && { borderRadius: 7 }, on && styles.radioOn]}>
      {on && (
        <Animated.View entering={pop()}>
          <Icon name="check" size={12} color={C.ink} strokeWidth={3} />
        </Animated.View>
      )}
    </View>
  );
}

/** The field, plus `locked`: a note about exactly how little is kept. */
export function Field({ locked, ...p }: TextInputProps & { label: string; hint?: string; error?: string | null; prefix?: string; locked?: string }) {
  return <BaseField {...p} note={locked} />;
}

export function Callout({ title, children, tone = "info" }: { title: string; children: React.ReactNode; tone?: "info" | "warn" | "good" }) {
  const t = tone === "warn" ? { c: C.amber, bg: C.amberWash, i: "alert" as const } : tone === "good" ? { c: C.green, bg: C.greenWash, i: "checkCircle" as const } : { c: C.gold, bg: C.goldWash, i: "info" as const };
  return (
    <Animated.View entering={FadeIn.duration(220)} style={[styles.callout, { backgroundColor: t.bg }]}>
      <Icon name={t.i} size={17} color={t.c} />
      <View style={{ flex: 1 }}>
        <T v="calloutMedium">{title}</T>
        <T v="callout" style={{ marginTop: 3 }}>
          {children}
        </T>
      </View>
    </Animated.View>
  );
}

export function StepHead({ kicker, title, blurb }: { kicker: string; title: string; blurb?: string }) {
  return (
    <View>
      <T v="label" tone="gold">
        {kicker}
      </T>
      <T v="title2" style={{ marginTop: 6 }}>
        {title}
      </T>
      {blurb && (
        <T v="body" style={{ marginTop: 6 }}>
          {blurb}
        </T>
      )}
    </View>
  );
}

export function StepNav({ onBack, onNext, nextLabel = "Continue", disabled, note }: { onBack?: () => void; onNext?: () => void; nextLabel?: string; disabled?: boolean; note?: string }) {
  return (
    <View style={{ gap: space.sm, marginTop: space.md }}>
      <View style={{ flexDirection: "row", gap: space.sm }}>
        {onBack && <Button label="Back" icon="back" variant="secondary" full={false} onPress={onBack} style={{ minWidth: 110 }} />}
        <View style={{ flex: 1 }}>
          <Button label={nextLabel} onPress={onNext} disabled={disabled} />
        </View>
      </View>
      {note && <T v="caption" center>{note}</T>}
    </View>
  );
}

/** A "take this with you" list. */
export function Take({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <View style={styles.take}>
      <T v="headline">{title}</T>
      <View style={{ gap: 7, marginTop: space.sm }}>
        {items.map((d) => (
          <View key={d} style={{ flexDirection: "row", gap: 10 }}>
            <Icon name="check" size={14} color={C.gold} strokeWidth={2.2} />
            <T v="callout" style={{ flex: 1 }}>
              {d}
            </T>
          </View>
        ))}
      </View>
    </View>
  );
}

/** Sent: a filing now exists, and this says where to follow it. */
export function Sent({ title, body, orderId }: { title: string; body: string; orderId: string }) {
  const router = useRouter();
  useEffect(() => buzz("success"), []);
  return (
    <View style={{ alignItems: "center", paddingTop: space.section }}>
      <Animated.View entering={pop(0, 12)} style={styles.done}>
        <Icon name="check" size={34} color={C.ink} strokeWidth={2.6} />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(250)} style={{ alignItems: "center", marginTop: space.xl }}>
        <T v="title1" center>
          {title}
        </T>
        <T v="body" center style={{ marginTop: space.sm, maxWidth: 400 }}>
          {body}
        </T>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(400)} style={{ width: "100%", maxWidth: 420, marginTop: space.section, gap: space.sm }}>
        <Button label="Track this filing" onPress={() => router.replace(`/filing/${orderId}`)} />
        <Button label="Back to Home" variant="ghost" onPress={() => router.replace("/")} />
      </Animated.View>
    </View>
  );
}

export const digits = (v: string, max: number) => v.replace(/\D/g, "").slice(0, max);
export const panError = (v: string) => (!v ? null : /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v.toUpperCase()) ? null : "Five letters, four digits, a letter — like ABCDE1234F.");
export const mobileError = (v: string) => (!v ? null : /^[6-9][0-9]{9}$/.test(v) ? null : "Ten digits, starting 6, 7, 8 or 9.");
export const gstinError = (v: string) => (!v ? null : /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/.test(v.toUpperCase()) ? null : "Not a valid GSTIN — 15 characters, and it contains your PAN.");

const styles = StyleSheet.create({
  track: { height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.08)", overflow: "hidden" },
  fill: { flex: 1, backgroundColor: C.gold, borderRadius: 2, transformOrigin: "left" },
  choice: { flexDirection: "row", alignItems: "center", gap: space.md, padding: space.lg, borderRadius: R.lg, backgroundColor: C.surfaceHigh, borderWidth: 1, borderColor: C.line },
  choiceTile: { flexDirection: "column", alignItems: "stretch", gap: space.sm, minHeight: 120 },
  tileHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  choiceOn: { borderColor: C.gold, backgroundColor: "#15120C" },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: C.lineStrong, alignItems: "center", justifyContent: "center" },
  radioOn: { backgroundColor: C.gold, borderColor: C.gold },
  miniChip: { paddingHorizontal: 7, height: 18, borderRadius: 9, backgroundColor: C.surfaceTop, justifyContent: "center" },
  callout: { flexDirection: "row", gap: space.md, padding: space.lg, borderRadius: R.lg },
  take: { padding: space.lg, borderRadius: R.lg, backgroundColor: C.surfaceHigh, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line },
  done: { width: 84, height: 84, borderRadius: 42, backgroundColor: C.gold, alignItems: "center", justifyContent: "center", shadowColor: C.gold, shadowOpacity: 0.4, shadowRadius: 24, shadowOffset: { width: 0, height: 8 } },
});
