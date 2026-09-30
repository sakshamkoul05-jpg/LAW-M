import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn } from "react-native-reanimated";
import { Icon } from "@/icons/Icon";
import { Glass, Segmented, T, Touch } from "@/components/ui";
import { Screen, StackHeader } from "@/components/Screen";
import { Callout, Choices, Field, StepHead, StepNav, Stepper, digits, mobileError } from "@/components/apply";
import { color as C, gradient, radius, space, text } from "@/theme";
import {
  CENTRE_FEE_NOTE,
  ENROLMENT_FEE_NOTE,
  ENROL_PATHS,
  HEAD_OF_FAMILY_NOTE,
  MASKED_ONLY_NOTE,
  POA_DOCS,
  POI_DOCS,
  UPDATE_FIELDS,
  type UpdateFieldId,
} from "@/lib/aadhaar";

/**
 * Aadhaar — apply for a new one, or correct an existing one. Two processes,
 * not one with a flag: different fees, different documents, and only one has
 * a lifetime limit to check. Ported from the website's rules file.
 */
type Mode = "enrol" | "update";

export default function AadhaarApply() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("enrol");
  const [step, setStep] = useState(0);
  const [sent, setSent] = useState(false);

  /* enrol */
  const [who, setWho] = useState("");
  const [poi, setPoi] = useState<string[]>([]);
  const [poa, setPoa] = useState<string[]>([]);
  const [noPoa, setNoPoa] = useState(false);
  const [fullName, setFullName] = useState("");
  /* update */
  const [fields, setFields] = useState<UpdateFieldId[]>([]);
  const [used, setUsed] = useState<Partial<Record<UpdateFieldId, number>>>({});
  const [aad, setAad] = useState("");
  /* both */
  const [mobile, setMobile] = useState("");
  const [city, setCity] = useState("");

  const switchMode = (m: Mode) => {
    if (m === mode) return;
    setMode(m);
    setStep(0);
    setWho(""); setPoi([]); setPoa([]); setNoPoa(false); setFullName("");
    setFields([]); setUsed({}); setAad(""); setMobile(""); setCity("");
  };

  const chosen = useMemo(() => UPDATE_FIELDS.filter((f) => fields.includes(f.id)), [fields]);
  const capped = chosen.filter((f) => f.lifetimeLimit !== null);
  const blocked = capped.filter((f) => (used[f.id] ?? 0) >= (f.lifetimeLimit ?? 99));
  const path = ENROL_PATHS.find((p) => p.id === who);

  if (sent) {
    return (
      <Screen aurora="violet" tabbed={false}>
        <StackHeader />
        <Animated.View entering={FadeIn.duration(400)} style={[styles.pad, { alignItems: "center", marginTop: space.section }]}>
          <View style={styles.doneOrb}>
            <LinearGradient colors={gradient.violet} style={StyleSheet.absoluteFill} />
            <Icon name="check" size={38} color="#fff" />
          </View>
          <T.Title style={{ marginTop: space.xl, textAlign: "center" }}>With the Aadhaar team</T.Title>
          <T.Body style={{ textAlign: "center", marginTop: space.sm }}>
            No appointment is booked yet. We check your file first and come back with anything missing.
          </T.Body>
          <StepNav onNext={() => router.replace("/(tabs)/orders")} nextLabel="See my orders" />
        </Animated.View>
      </Screen>
    );
  }

  const steps = mode === "enrol" ? ["Who", "Proofs", "You", "Review"] : ["What", "Check", "You", "Review"];

  return (
    <Screen aurora="violet" auroraHeight={360} tabbed={false}>
      <StackHeader title="Aadhaar" />
      <View style={[styles.pad, { gap: space.xl }]}>
        <Segmented
          value={mode}
          onChange={switchMode}
          options={[
            { id: "enrol", label: "Apply for new" },
            { id: "update", label: "Correct existing" },
          ]}
        />

        <View style={styles.banner}>
          <Icon name="fingerprint" size={16} color={C.violetHot} />
          <Text style={[text.small, { color: C.textDim, flex: 1, lineHeight: 17 }]}>
            <Text style={{ color: C.text }}>This does not issue or change an Aadhaar.</Text> That takes biometrics at an
            authorised centre. We make sure the file you take is right, and book the slot.
          </Text>
        </View>

        <Stepper steps={steps} current={step} />

        {/* ══ ENROL ══ */}
        {mode === "enrol" && step === 0 && (
          <>
            <StepHead kicker="Step 1 of 4" title="Who is it for?" blurb="Children are enrolled differently, and a first enrolment is free." />
            <Choices value={who ? [who] : []} onChange={([v]) => setWho(v ?? "")} choices={ENROL_PATHS.map((p) => ({ id: p.id, label: p.label, hint: p.blurb, icon: p.id.startsWith("child") ? "account" : "identity" }))} />
            {path && <Callout title="At the centre">{path.biometrics}{path.extras.length ? ` Bring: ${path.extras.join("; ")}.` : ""}</Callout>}
            <StepNav onNext={() => setStep(1)} disabled={!who} note="Free at the centre — UIDAI charges nothing for a first enrolment." />
          </>
        )}
        {mode === "enrol" && step === 1 && (
          <>
            <StepHead kicker="Step 2 of 4" title="What can you show?" blurb="One proof of identity and one of address. A passport does both." />
            <T.Label>Proof of identity</T.Label>
            <Choices multiple columns={2} value={poi} onChange={setPoi} choices={POI_DOCS.map((d) => ({ id: d, label: d }))} />
            <T.Label>Proof of address</T.Label>
            <Choices multiple columns={2} value={poa} onChange={(v) => { setPoa(v); if (v.length) setNoPoa(false); }} choices={POA_DOCS.map((d) => ({ id: d, label: d }))} />
            <Touch onPress={() => { setNoPoa(!noPoa); if (!noPoa) setPoa([]); }} haptic="select" accessibilityLabel="I have none of these" style={[styles.toggle, noPoa && styles.toggleOn]}>
              <Text style={[text.bodySemi, { color: noPoa ? C.text : C.textDim }]}>I have none of these in my own name</Text>
            </Touch>
            {noPoa && <Callout title="There is a route for that">{HEAD_OF_FAMILY_NOTE}</Callout>}
            {poi.includes("Passport") && <Callout tone="good" title="Your passport is enough on its own">It is accepted as identity and address together.</Callout>}
            <StepNav onBack={() => setStep(0)} onNext={() => setStep(2)} disabled={!poi.length || (!poa.length && !noPoa)} />
          </>
        )}
        {mode === "enrol" && step === 2 && (
          <>
            <StepHead kicker="Step 3 of 4" title="Enough to book the slot" />
            <Field label={who.startsWith("child") ? "The child's full name" : "Full name"} hint="Exactly as on the identity document." value={fullName} onChangeText={setFullName} placeholder="As printed on the proof" />
            <Field label="Mobile" prefix="+91" keyboardType="phone-pad" value={mobile} onChangeText={(v) => setMobile(digits(v, 10))} placeholder="00000 00000" hint="Becomes the number linked to the Aadhaar." error={mobile.length === 10 ? mobileError(mobile) : null} />
            <Field label="City for the centre" value={city} onChangeText={setCity} placeholder="City" />
            <StepNav onBack={() => setStep(1)} onNext={() => setStep(3)} disabled={!fullName.trim() || mobile.length !== 10 || !!mobileError(mobile)} nextLabel="Review" />
          </>
        )}
        {mode === "enrol" && step === 3 && (
          <>
            <StepHead kicker="Step 4 of 4" title="What to take with you" />
            <Take title="Proof of identity" items={poi} />
            {noPoa ? <Callout title="Address — the family route">{HEAD_OF_FAMILY_NOTE}</Callout> : <Take title="Proof of address" items={poa} />}
            {path && path.extras.length > 0 && <Take title="Also required" items={path.extras} />}
            <Callout title="The fee, in full">{ENROLMENT_FEE_NOTE} LAWFIC&apos;s fee is ₹199, payable once we confirm your documents will be accepted.</Callout>
            <StepNav onBack={() => setStep(2)} onNext={() => setSent(true)} nextLabel="Send to the team" />
          </>
        )}

        {/* ══ UPDATE ══ */}
        {mode === "update" && step === 0 && (
          <>
            <StepHead kicker="Step 1 of 4" title="What needs correcting?" blurb="Pick everything — several corrections can go in one visit." />
            <Choices
              multiple
              value={fields}
              onChange={(v) => setFields(v as UpdateFieldId[])}
              choices={UPDATE_FIELDS.map((f) => ({ id: f.id, label: f.label, hint: f.note, chip: f.lifetimeLimit === null ? "no limit" : f.lifetimeLimit === 1 ? "once only" : `${f.lifetimeLimit} in a lifetime` }))}
            />
            <StepNav onNext={() => setStep(1)} disabled={!fields.length} note="₹50 at the centre, per update." />
          </>
        )}
        {mode === "update" && step === 1 && (
          <>
            <StepHead kicker="Step 2 of 4" title="Changed these before?" blurb="UIDAI caps some for life. Better to find out now than at the counter." />
            {capped.length === 0 && <Callout tone="good" title="No lifetime cap on these">{chosen.map((f) => f.label).join(", ")} can be updated as often as needed.</Callout>}
            {capped.map((f) => {
              const limit = f.lifetimeLimit ?? 0;
              return (
                <View key={f.id} style={{ gap: space.sm }}>
                  <T.Sub>{f.label} <Text style={[text.small, { color: C.textFaint }]}>· {limit === 1 ? "once in a lifetime" : `${limit} in a lifetime`}</Text></T.Sub>
                  <View style={{ flexDirection: "row", gap: space.sm }}>
                    {Array.from({ length: limit + 1 }, (_, n) => {
                      const on = used[f.id] === n;
                      const left = limit - n;
                      return (
                        <Touch key={n} haptic="select" onPress={() => setUsed({ ...used, [f.id]: n })} accessibilityLabel={`${n} times`} style={[styles.count, on && styles.countOn]}>
                          <Text style={[text.bodySemi, { color: C.text }]}>{n === 0 ? "Never" : n === 1 ? "Once" : `${n}×`}</Text>
                          <Text style={[text.tiny, { color: left === 0 ? C.red : C.textFaint, marginTop: 2 }]}>{left === 0 ? "none left" : `${left} left`}</Text>
                        </Touch>
                      );
                    })}
                  </View>
                </View>
              );
            })}
            {blocked.length > 0 && (
              <Callout tone="warn" title="This one cannot be changed again">
                {blocked.map((f) => f.label).join(" and ")} {blocked.length === 1 ? "has" : "have"} reached UIDAI&apos;s lifetime limit, so a centre will refuse it. We will not book an appointment that cannot succeed. If the record is wrong there is a grievance route — ask us, at no charge.
              </Callout>
            )}
            <StepNav onBack={() => setStep(0)} onNext={() => setStep(2)} disabled={!capped.every((f) => used[f.id] !== undefined) || blocked.length > 0} />
          </>
        )}
        {mode === "update" && step === 2 && (
          <>
            <StepHead kicker="Step 3 of 4" title="Enough to find you" />
            <Field label="Last 4 digits of your Aadhaar" prefix="XXXX XXXX" keyboardType="number-pad" value={aad} onChangeText={(v) => setAad(digits(v, 4))} placeholder="0000" locked={MASKED_ONLY_NOTE} />
            <Field label="Mobile" prefix="+91" keyboardType="phone-pad" value={mobile} onChangeText={(v) => setMobile(digits(v, 10))} placeholder="00000 00000" error={mobile.length === 10 ? mobileError(mobile) : null} />
            <Field label="City for the centre" value={city} onChangeText={setCity} placeholder="City" />
            <StepNav onBack={() => setStep(1)} onNext={() => setStep(3)} disabled={aad.length !== 4 || mobile.length !== 10 || !!mobileError(mobile)} nextLabel="Review" />
          </>
        )}
        {mode === "update" && step === 3 && (
          <>
            <StepHead kicker="Step 4 of 4" title="What to take with you" />
            {chosen.map((f) => <Take key={f.id} title={f.label} items={f.proofs} />)}
            <Callout title="The fee, in full">{CENTRE_FEE_NOTE} LAWFIC&apos;s fee is ₹199, payable once we confirm your proof will be accepted.</Callout>
            <StepNav onBack={() => setStep(2)} onNext={() => setSent(true)} nextLabel="Send to the team" />
          </>
        )}
      </View>
    </Screen>
  );
}

function Take({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <Glass style={{ borderRadius: radius.lg }}>
      <T.Sub>{title}</T.Sub>
      <View style={{ gap: 6, marginTop: space.sm }}>
        {items.map((d) => (
          <View key={d} style={{ flexDirection: "row", gap: 8 }}>
            <View style={styles.dot} />
            <T.Small style={{ flex: 1 }}>{d}</T.Small>
          </View>
        ))}
      </View>
    </Glass>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: space.lg },
  banner: { flexDirection: "row", gap: space.md, padding: space.lg, borderRadius: radius.lg, backgroundColor: "rgba(139,108,255,0.1)" },
  toggle: { padding: space.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: C.hairline, backgroundColor: C.glass },
  toggleOn: { borderColor: C.violet, backgroundColor: "rgba(139,108,255,0.12)" },
  count: { flex: 1, padding: space.md, borderRadius: radius.md, borderWidth: 1, borderColor: C.hairline, backgroundColor: C.glass },
  countOn: { borderColor: C.gold, backgroundColor: "rgba(242,198,109,0.08)" },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.gold, marginTop: 7 },
  doneOrb: { width: 88, height: 88, borderRadius: 44, overflow: "hidden", alignItems: "center", justifyContent: "center" },
});
