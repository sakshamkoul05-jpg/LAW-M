import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Icon } from "@/icons/Icon";
import { Press, Screen, Segmented, T } from "@/ui";
import { useStore } from "@/lib/store";
import { Callout, Choices, Field, Sent, StepHead, StepNav, Stepper, Take, digits, mobileError } from "@/components/apply";
import { color as C, radius, space } from "@/theme";
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
  const { request } = useStore();
  const [mode, setMode] = useState<Mode>("enrol");
  const [step, setStep] = useState(0);
  const [sent, setSent] = useState<string | null>(null);

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
      <Screen back>
        <Sent title="With the Aadhaar team" body="No appointment is booked yet. We check your file first and come back with anything missing." orderId={sent} />
      </Screen>
    );
  }

  /* Notes carry what prices the file and books the slot — never Aadhaar digits. */
  const send = () => {
    const lines =
      mode === "enrol"
        ? ["New enrolment", `For: ${path?.label ?? "—"}`, `Identity proof: ${poi.join(", ") || "—"}`, `Address proof: ${noPoa ? "Head of family route" : poa.join(", ") || "—"}`, `City: ${city || "—"}`]
        : ["Correction", `Fields: ${chosen.map((f) => f.label).join(", ")}`, `City: ${city || "—"}`];
    const r = request("aadhaar", lines.join("\n"));
    if (r.ok) setSent(r.value.id);
  };

  const steps = mode === "enrol" ? ["Who", "Proofs", "You", "Review"] : ["What", "Check", "You", "Review"];

  return (
    <Screen back title="Aadhaar" kicker="Apply or correct">
      <View style={{ gap: space.xl, maxWidth: 680 }}>
        <Segmented<Mode>
          value={mode}
          onChange={switchMode}
          options={[
            { id: "enrol", label: "Apply for new" },
            { id: "update", label: "Correct existing" },
          ]}
        />

        <View style={styles.banner}>
          <Icon name="fingerprint" size={16} color={C.gold} />
          <T v="callout" style={{ flex: 1 }}>
            <T v="callout" tone="text">This does not issue or change an Aadhaar.</T> That takes biometrics at an
            authorised centre. We make sure the file you take is right, and book the slot.
          </T>
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
            <T v="label">Proof of identity</T>
            <Choices multiple columns={2} value={poi} onChange={setPoi} choices={POI_DOCS.map((d) => ({ id: d, label: d }))} />
            <T v="label">Proof of address</T>
            <Choices multiple columns={2} value={poa} onChange={(v) => { setPoa(v); if (v.length) setNoPoa(false); }} choices={POA_DOCS.map((d) => ({ id: d, label: d }))} />
            <Press onPress={() => { setNoPoa(!noPoa); if (!noPoa) setPoa([]); }} haptic="select" radius={radius.lg} accessibilityRole="checkbox" accessibilityState={{ checked: noPoa }} accessibilityLabel="I have none of these" style={[styles.toggle, noPoa && styles.toggleOn]}>
              <T v="bodyMedium" color={noPoa ? C.text : C.textDim}>I have none of these in my own name</T>
            </Press>
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
            <StepNav onBack={() => setStep(2)} onNext={send} nextLabel="Send to the team" />
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
                  <T v="headline">{f.label} <T v="callout" tone="muted">· {limit === 1 ? "once in a lifetime" : `${limit} in a lifetime`}</T></T>
                  <View style={{ flexDirection: "row", gap: space.sm }}>
                    {Array.from({ length: limit + 1 }, (_, n) => {
                      const on = used[f.id] === n;
                      const left = limit - n;
                      return (
                        <Press key={n} haptic="select" radius={radius.md} onPress={() => setUsed({ ...used, [f.id]: n })} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={`${n} times`} style={[styles.count, on && styles.countOn]}>
                          <T v="bodyMedium">{n === 0 ? "Never" : n === 1 ? "Once" : `${n}×`}</T>
                          <T v="caption" color={left === 0 ? C.red : C.textMuted} style={{ marginTop: 2 }}>{left === 0 ? "none left" : `${left} left`}</T>
                        </Press>
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
            <StepNav onBack={() => setStep(2)} onNext={send} nextLabel="Send to the team" />
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: "row", gap: space.md, padding: space.lg, borderRadius: radius.lg, backgroundColor: C.goldWash, borderWidth: StyleSheet.hairlineWidth, borderColor: C.goldLine },
  toggle: { padding: space.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: C.line, backgroundColor: C.surfaceHigh },
  toggleOn: { borderColor: C.gold, backgroundColor: "#15120C" },
  count: { flex: 1, padding: space.md, borderRadius: radius.md, borderWidth: 1, borderColor: C.line, backgroundColor: C.surfaceHigh },
  countOn: { borderColor: C.gold, backgroundColor: "#15120C" },
});
