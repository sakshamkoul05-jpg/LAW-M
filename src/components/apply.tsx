import React from "react";
import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { Icon, type IconName } from "@/icons/Icon";
import { color as C, font, motion, radius, space, text } from "@/theme";
import { Button, Touch } from "./ui";

/**
 * The parts both application flows are built from. One decision per screen,
 * answers you press rather than options you reveal, and a form that says what
 * each answer means the moment you give it.
 */

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 6 }} accessibilityLabel={`Step ${current + 1} of ${steps.length}`}>
      {steps.map((s, i) => (
        <View key={s} style={{ flex: 1, gap: 6 }}>
          <View style={styles.track}>
            <Fill pct={i < current ? 1 : i === current ? 0.5 : 0} />
          </View>
          <Text style={[text.tiny, { fontSize: 10, letterSpacing: 0.6, color: i === current ? C.text : i < current ? C.textDim : C.textFaint }]}>
            {s.toUpperCase()}
          </Text>
        </View>
      ))}
    </View>
  );
}

function Fill({ pct }: { pct: number }) {
  /* Animated as a number and written out as a percentage. Springing a "50%"
     string directly is not something every platform interpolates. */
  const v = useSharedValue(pct);
  React.useEffect(() => {
    v.value = withSpring(pct, motion.arrive);
  }, [pct, v]);
  const style = useAnimatedStyle(() => ({ width: `${Math.max(0, Math.min(1, v.value)) * 100}%` }));
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
      {choices.map((c) => {
        const on = value.includes(c.id);
        return (
          <Touch
            key={c.id}
            haptic="select"
            accessibilityRole={multiple ? "checkbox" : "radio"}
            accessibilityState={{ checked: on }}
            accessibilityLabel={c.label}
            onPress={() => onChange(multiple ? (on ? value.filter((v) => v !== c.id) : [...value, c.id]) : [c.id])}
            style={[
              styles.choice,
              columns === 2 ? styles.choiceTile : { width: "100%" },
              on && styles.choiceOn,
            ]}
          >
            {/* Two columns leave ~150px a tile: side by side, icon and radio
                squeeze the label to one word a line. Stacked, the label gets
                the full width. */}
            {columns === 2 ? (
              <View style={styles.tileHead}>
                {c.icon ? <Icon name={c.icon} size={20} color={on ? C.gold : C.textDim} active={on} /> : <View />}
                <View style={[styles.radio, on && styles.radioOn]}>{on && <Icon name="check" size={12} color={C.goldInk} />}</View>
              </View>
            ) : (
              c.icon && <Icon name={c.icon} size={20} color={on ? C.gold : C.textDim} active={on} />
            )}
            <View style={columns === 2 ? undefined : { flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <Text style={[text.bodySemi, { color: C.text }]}>{c.label}</Text>
                {c.chip && (
                  <View style={styles.miniChip}>
                    <Text style={[text.tiny, { fontSize: 10, color: C.textDim }]}>{c.chip}</Text>
                  </View>
                )}
              </View>
              {c.hint && <Text style={[text.small, { color: C.textFaint, marginTop: 2 }]}>{c.hint}</Text>}
            </View>
            {columns !== 2 && (
              <View style={[styles.radio, on && styles.radioOn]}>{on && <Icon name="check" size={12} color={C.goldInk} />}</View>
            )}
          </Touch>
        );
      })}
    </View>
  );
}

export function Field({
  label,
  hint,
  error,
  prefix,
  locked,
  ...input
}: TextInputProps & { label: string; hint?: string; error?: string | null; prefix?: string; locked?: string }) {
  return (
    <View>
      <Text style={[text.smallSemi, { color: C.text, marginBottom: 7 }]}>{label}</Text>
      <View style={[styles.field, error && { borderColor: C.red }]}>
        {prefix && <Text style={[text.body, { color: C.textDim, fontFamily: font.mono }]}>{prefix}</Text>}
        <TextInput placeholderTextColor={C.textFaint} accessibilityLabel={label} style={styles.input} {...input} />
      </View>
      {error ? (
        <Text style={[text.small, { color: C.red, marginTop: 6 }]}>{error}</Text>
      ) : hint ? (
        <Text style={[text.small, { color: C.textFaint, marginTop: 6 }]}>{hint}</Text>
      ) : null}
      {locked && (
        <View style={{ flexDirection: "row", gap: 6, marginTop: 6 }}>
          <Icon name="lock" size={12} color={C.textFaint} />
          <Text style={[text.tiny, { color: C.textFaint, flex: 1, lineHeight: 15 }]}>{locked}</Text>
        </View>
      )}
    </View>
  );
}

export function Callout({ tone = "info", title, children }: { tone?: "info" | "warn" | "good"; title?: string; children: React.ReactNode }) {
  const c = tone === "warn" ? C.red : tone === "good" ? C.green : C.violetHot;
  const bg = tone === "warn" ? C.redWash : tone === "good" ? C.greenWash : "rgba(139,108,255,0.12)";
  return (
    <Animated.View entering={FadeIn.duration(220)} style={[styles.callout, { backgroundColor: bg }]}>
      <Icon name={tone === "warn" ? "bell" : tone === "good" ? "check" : "spark"} size={17} color={c} />
      <View style={{ flex: 1 }}>
        {title && <Text style={[text.smallSemi, { color: C.text, marginBottom: 2 }]}>{title}</Text>}
        <Text style={[text.small, { color: C.textDim, lineHeight: 18 }]}>{children}</Text>
      </View>
    </Animated.View>
  );
}

export function StepHead({ kicker, title, blurb }: { kicker: string; title: string; blurb?: string }) {
  return (
    /* No entering animation: on web a slide-in on the heading froze part way,
       leaving the step title grey. The stepper bar already marks the change. */
    <View>
      <Text style={[text.label, { color: C.gold }]}>{kicker}</Text>
      <Text style={[text.title, { color: C.text, marginTop: 6 }]}>{title}</Text>
      {blurb && <Text style={[text.body, { color: C.textDim, marginTop: 6 }]}>{blurb}</Text>}
    </View>
  );
}

export function StepNav({
  onBack,
  onNext,
  nextLabel = "Continue",
  disabled,
  note,
}: {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  disabled?: boolean;
  note?: string;
}) {
  return (
    <View style={{ gap: space.sm, marginTop: space.md }}>
      <View style={{ flexDirection: "row", gap: space.sm }}>
        {onBack && <Button label="Back" variant="glass" onPress={onBack} style={{ width: 96 }} />}
        <Button label={nextLabel} onPress={onNext} disabled={disabled} style={{ flex: 1 }} />
      </View>
      {note && <Text style={[text.tiny, { color: C.textFaint, textAlign: "center" }]}>{note}</Text>}
    </View>
  );
}

export const digits = (v: string, max: number) => v.replace(/\D/g, "").slice(0, max);
export const panError = (v: string) => (!v ? null : /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v.toUpperCase()) ? null : "Five letters, four digits, a letter — like ABCDE1234F.");
export const mobileError = (v: string) => (!v ? null : /^[6-9][0-9]{9}$/.test(v) ? null : "Ten digits, starting 6, 7, 8 or 9.");
export const gstinError = (v: string) => (!v ? null : /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/.test(v.toUpperCase()) ? null : "Not a valid GSTIN — 15 characters, and it contains your PAN.");

const styles = StyleSheet.create({
  track: { height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.08)", overflow: "hidden" },
  fill: { height: "100%", backgroundColor: C.gold, borderRadius: 2 },
  choice: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundColor: C.glass,
    borderWidth: 1,
    borderColor: C.hairline,
  },
  choiceTile: { width: "48.8%", flexDirection: "column", alignItems: "stretch", gap: space.sm },
  tileHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  choiceOn: { borderColor: C.gold, backgroundColor: "rgba(242,198,109,0.08)" },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: C.hairlineStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOn: { backgroundColor: C.gold, borderColor: C.gold },
  miniChip: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999, backgroundColor: C.glassHigh },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 54,
    borderRadius: radius.md,
    paddingHorizontal: space.lg,
    backgroundColor: C.glass,
    borderWidth: 1,
    borderColor: C.hairline,
  },
  input: { flex: 1, color: C.text, fontFamily: font.body, fontSize: 15.5, padding: 0, height: 50 },
  callout: { flexDirection: "row", gap: space.md, padding: space.lg, borderRadius: radius.lg },
});
