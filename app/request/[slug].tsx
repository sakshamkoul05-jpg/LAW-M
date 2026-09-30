import React, { useState } from "react";
import { pop } from "@/ui/enter";
import { StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import type { IntakeField } from "@/lawfic/intake";
import { Icon } from "@/icons/Icon";
import { useStore } from "@/lib/store";
import { getIntake, iconFor, serviceName } from "@/data/catalogue";
import { Button, Field, IconTile, Press, Reveal, Screen, Surface, T, buzz } from "@/ui";
import { color as C, radius as R, space } from "@/theme";
import type { ServiceOrder } from "@/lawfic/orders";

/** When a document has no questions of its own, the website asks these. */
const GENERIC: IntakeField[] = [
  { name: "state", label: "State", type: "text", placeholder: "Maharashtra", required: true, hint: "Government fees and processing times differ by state." },
  { name: "urgency", label: "How soon do you need it?", type: "select", options: ["No particular rush", "Within a month", "Within a week", "Urgent — tell me what is possible"] },
  { name: "notes", label: "Tell us what you need", type: "textarea", placeholder: "In your own words — what it is for, and anything that has gone wrong before" },
];

/**
 * Requesting a service — the website's request-and-quote flow.
 *
 * The questions are the website's own (lib/intake.ts), per document. They
 * exist to make a quote possible and for nothing else, which is why none of
 * them asks for an Aadhaar number, a PAN or a scan: those do not change the
 * price, and a request form is the wrong place to collect them.
 */
export default function RequestService() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { request } = useStore();
  const intake = getIntake(slug);
  const fields = intake?.fields ?? GENERIC;
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState<ServiceOrder | null>(null);
  const name = serviceName(slug);

  const set = (k: string, v: string) => {
    setValues((s) => ({ ...s, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  };

  const submit = async () => {
    const e: Record<string, string> = {};
    for (const f of fields) {
      const v = (values[f.name] ?? "").trim();
      if (f.required && !v) e[f.name] = "We need this to price it.";
      if (f.type === "tel" && v && !/^[6-9]\d{9}$/.test(v.replace(/\D/g, ""))) e[f.name] = "Ten digits, starting 6, 7, 8 or 9.";
    }
    setErrors(e);
    if (Object.keys(e).length) return false;
    await new Promise((r) => setTimeout(r, 700));
    const details = fields
      .filter((f) => values[f.name]?.trim())
      .map((f) => `${f.label}: ${values[f.name]!.trim()}`)
      .join("\n");
    const r = request(slug, details);
    if (!r.ok) return false;
    setTimeout(() => {
      buzz("success");
      setSent(r.value);
    }, 400);
    return true;
  };

  if (sent) {
    return (
      <Screen back={() => router.replace("/filings")}>
        <View style={{ alignItems: "center", paddingTop: space.section }}>
          <Animated.View entering={pop(0, 12)} style={styles.done}>
            <Icon name="check" size={34} color={C.ink} strokeWidth={2.6} />
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(250)} style={{ alignItems: "center", marginTop: space.xl }}>
            <T v="label" tone="gold">
              Request sent · {sent.reference}
            </T>
            <T v="title1" center style={{ marginTop: 6 }}>
              We will price it
            </T>
            <T v="body" center style={{ marginTop: 8, maxWidth: 380 }}>
              You will get a quote for {name} with the government fee and LAWFiC's fee on separate lines. Nothing is owed until you accept it.
            </T>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(400)} style={{ width: "100%", maxWidth: 420, marginTop: space.section, gap: space.sm }}>
            <Button label="Track this filing" onPress={() => router.replace(`/filing/${sent.id}`)} />
            <Button label="Back to services" variant="ghost" onPress={() => router.replace("/services")} />
          </Animated.View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      back
      title={name}
      kicker="Request a quote"
      footer={<Button label="Send request" icon="send" onPress={submit} successLabel="Sent" />}
    >
      <Reveal fade>
        <Surface tone="gold" style={{ flexDirection: "row", gap: space.md, alignItems: "center" }}>
          <IconTile icon={iconFor(slug)} gold />
          <T v="callout" tone="dim" style={{ flex: 1 }}>
            {intake?.intro ?? "A few questions so we can price it. You owe nothing until you accept the quote."}
          </T>
        </Surface>
      </Reveal>

      <View style={{ gap: space.lg, marginTop: space.xl, maxWidth: 620 }}>
        {fields.map((f, i) => (
          <Reveal key={f.name} i={i + 1}>
            {f.type === "select" ? (
              <View>
                <T v="calloutMedium" style={{ marginBottom: space.sm }}>
                  {f.label}
                  {f.required ? "" : "  ·  optional"}
                </T>
                <View style={styles.options}>
                  {f.options!.map((o) => {
                    const on = values[f.name] === o;
                    return (
                      <Press key={o} onPress={() => set(f.name, o)} haptic="select" radius={R.pill} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={o} style={[styles.opt, on && styles.optOn]}>
                        {on && <Icon name="check" size={13} color={C.gold} strokeWidth={2.4} />}
                        <T v="captionMedium" color={on ? C.text : C.textDim}>
                          {o}
                        </T>
                      </Press>
                    );
                  })}
                </View>
                {errors[f.name] ? (
                  <T v="caption" color={C.red} style={{ marginTop: 6 }}>
                    {errors[f.name]}
                  </T>
                ) : f.hint ? (
                  <T v="caption" style={{ marginTop: 6 }}>
                    {f.hint}
                  </T>
                ) : null}
              </View>
            ) : (
              <Field
                label={`${f.label}${f.required ? "" : " (optional)"}`}
                value={values[f.name] ?? ""}
                onChangeText={(v) => set(f.name, v)}
                multiline={f.type === "textarea"}
                keyboardType={f.type === "tel" ? "phone-pad" : "default"}
                placeholder={f.type === "date" ? "DD / MM / YYYY" : undefined}
                hint={f.hint}
                error={errors[f.name] || null}
                prefix={f.type === "tel" ? "+91" : undefined}
              />
            )}
          </Reveal>
        ))}
        <T v="caption">We never ask for an Aadhaar number, PAN or document scans on a request. Those are collected later, privately, once you accept a quote.</T>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  options: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  opt: { flexDirection: "row", alignItems: "center", gap: 6, height: 38, paddingHorizontal: 14, borderRadius: 19, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line },
  optOn: { borderColor: C.gold, backgroundColor: "#15120C" },
  done: { width: 84, height: 84, borderRadius: 42, backgroundColor: C.gold, alignItems: "center", justifyContent: "center", shadowColor: C.gold, shadowOpacity: 0.4, shadowRadius: 24, shadowOffset: { width: 0, height: 8 } },
});
