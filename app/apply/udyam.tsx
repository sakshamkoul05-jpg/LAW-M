import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { Screen, Surface, T } from "@/ui";
import { useStore } from "@/lib/store";
import { useToast } from "@/ui";
import { Callout, Choices, Field, Sent, StepHead, StepNav, Stepper, digits, gstinError, mobileError, panError } from "@/components/apply";
import { color as C, font, gradient, motion, radius, space, themed } from "@/theme";
import {
  ACTIVITIES,
  ORG_TYPES,
  SLABS,
  SLABS_EFFECTIVE_FROM,
  TRADING_CAVEAT,
  classify,
  groupIndian,
  inWords,
} from "@/lib/msme";

/**
 * Udyam, as an application. The classifier is the product: LAWFIC's own copy
 * says the first thing it does is work out micro, small or medium, so step two
 * does it live. Same rule as the website — the higher of the two tests, never
 * the lower — from the same source file.
 */
const STEPS = ["Business", "Size", "Details", "Review"];

export default function UdyamApply() {
  const { request } = useStore();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [org, setOrg] = useState("");
  const [activity, setActivity] = useState("");
  const [name, setName] = useState("");
  const [inv, setInv] = useState("");
  const [turn, setTurn] = useState("");
  const [pan, setPan] = useState("");
  const [aad, setAad] = useState("");
  const [mobile, setMobile] = useState("");
  const [gstin, setGstin] = useState("");
  const [sent, setSent] = useState<string | null>(null);

  const investment = Number(inv) || 0;
  const turnover = Number(turn) || 0;
  const has = inv !== "" && turn !== "";
  const result = useMemo(() => (has ? classify(investment, turnover) : null), [has, investment, turnover]);
  const orgChoice = ORG_TYPES.find((o) => o.id === org);

  const can = [
    Boolean(org && activity && name.trim()),
    has && result?.result !== "beyond",
    Boolean(pan && !panError(pan) && aad.length === 4 && mobile && !mobileError(mobile) && !gstinError(gstin)),
  ];

  if (sent) {
    return (
      <Screen back>
        <Sent title="With the Udyam team" body="Nothing has been filed and nothing charged. They check the classification against your accounts and come back with anything missing." orderId={sent} />
      </Screen>
    );
  }

  /* The filing's notes carry what prices it — never the PAN or Aadhaar digits,
     which go to the portal from you when LAWFIC files. */
  const send = async () => {
    const r = await request(
      "msme-udyam",
      [`Enterprise: ${name.trim()}`, `Constitution: ${orgChoice?.label ?? "—"}`, `Activity: ${ACTIVITIES.find((a) => a.id === activity)?.label ?? "—"}`, `Estimated class: ${result?.label ?? "—"}`, `GST registered: ${gstin ? "yes" : "no"}`].join("\n"),
    );
    if (r.ok) setSent(r.value.id);
    else toast({ title: "Not sent", body: r.error, tone: "bad" });
  };

  return (
    <Screen back title="MSME Udyam" kicker="Apply">
      <View style={{ gap: space.xl, maxWidth: 680 }}>
        <Stepper steps={STEPS} current={step} />

        {step === 0 && (
          <>
            <StepHead kicker="Step 1 of 4" title="What are we registering?" blurb="Udyam runs against one person's Aadhaar — which person depends on how the business is constituted." />
            <Choices
              columns={2}
              value={org ? [org] : []}
              onChange={([v]) => setOrg(v ?? "")}
              choices={ORG_TYPES.map((o) => ({ id: o.id, label: o.label, hint: `Against ${o.aadhaarOf}'s Aadhaar`, icon: "business" }))}
            />
            <T v="label">Main activity</T>
            <Choices
              value={activity ? [activity] : []}
              onChange={([v]) => setActivity(v ?? "")}
              choices={ACTIVITIES.map((a) => ({ id: a.id, label: a.label, hint: a.hint, icon: a.id === "trading" ? "shop" : a.id === "service" ? "briefcase" : "business" }))}
            />
            {activity === "trading" && <Callout tone="warn" title="Traders get a narrower registration">{TRADING_CAVEAT}</Callout>}
            <Field label="Name of the enterprise" hint="Exactly as on the PAN — matched character for character." value={name} onChangeText={setName} placeholder="As printed on the PAN" />
            <StepNav onNext={() => setStep(1)} disabled={!can[0]} note="Nothing is filed or paid for yet." />
          </>
        )}

        {step === 1 && (
          <>
            <StepHead kicker="Step 2 of 4" title="Which band are you in?" blurb="Type the two figures and watch. This is the portal's own rule." />
            <Field
              label="Investment in plant, machinery and equipment"
              prefix="₹"
              keyboardType="number-pad"
              value={inv ? groupIndian(investment) : ""}
              onChangeText={(v) => setInv(digits(v, 12))}
              placeholder="0"
              hint={inv ? `₹${inWords(investment)}` : "Written-down value, not the purchase price."}
            />
            <Field
              label="Annual turnover"
              prefix="₹"
              keyboardType="number-pad"
              value={turn ? groupIndian(turnover) : ""}
              onChangeText={(v) => setTurn(digits(v, 12))}
              placeholder="0"
              hint={turn ? `₹${inWords(turnover)}` : "Excluding exports."}
            />

            {has && (
              <Surface>
                <T v="label" style={{ marginBottom: space.md }}>Where you sit</T>
                <Band label="Investment" value={investment} max={SLABS[2]!.investmentMax} keyName="investmentMax" />
                <Band label="Turnover" value={turnover} max={SLABS[2]!.turnoverMax} keyName="turnoverMax" />
                <T v="caption" style={{ marginTop: space.sm }}>Whichever marker sits further right decides the class.</T>
              </Surface>
            )}

            {result &&
              (result.result === "beyond" ? (
                <Callout tone="warn" title={result.label}>{result.note}</Callout>
              ) : (
                <Animated.View entering={FadeIn.duration(260)} key={result.result} style={styles.verdict}>
                  <LinearGradient colors={gradient.gold} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
                  <T v="label" color={C.ink} style={{ opacity: 0.7 }}>On these figures you are</T>
                  <T style={{ fontFamily: font.bold, fontSize: 40, color: C.ink, letterSpacing: -1.4, marginTop: 2 }}>
                    {result.label}
                  </T>
                  <T v="callout" color={C.ink} style={{ opacity: 0.75, marginTop: 4 }}>{result.note}</T>
                </Animated.View>
              ))}

            <T v="caption">Slabs as notified from {SLABS_EFFECTIVE_FROM}. An estimate on your figures — confirmed against your accounts before filing.</T>
            <StepNav onBack={() => setStep(0)} onNext={() => setStep(2)} disabled={!can[1]} />
          </>
        )}

        {step === 2 && (
          <>
            <StepHead
              kicker="Step 3 of 4"
              title="The numbers the portal needs"
              blurb={orgChoice ? `The Aadhaar is ${orgChoice.aadhaarOf}'s.` : undefined}
            />
            <Field label="PAN of the business" autoCapitalize="characters" value={pan} onChangeText={(v) => setPan(v.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10).toUpperCase())} placeholder="ABCDE1234F" error={pan.length === 10 ? panError(pan) : null} />
            <Field
              label="Last 4 digits of Aadhaar"
              prefix="XXXX XXXX"
              keyboardType="number-pad"
              value={aad}
              onChangeText={(v) => setAad(digits(v, 4))}
              placeholder="0000"
              locked="Four digits is all we ask for and all we keep. The full number goes into the portal from you, when we file."
            />
            <Field label="Mobile linked to that Aadhaar" prefix="+91" keyboardType="phone-pad" value={mobile} onChangeText={(v) => setMobile(digits(v, 10))} placeholder="00000 00000" error={mobile.length === 10 ? mobileError(mobile) : null} hint="The portal's OTP goes here." />
            <Field label="GSTIN — only if you have one" autoCapitalize="characters" value={gstin} onChangeText={(v) => setGstin(v.replace(/[^a-zA-Z0-9]/g, "").slice(0, 15).toUpperCase())} placeholder="Optional" error={gstin.length === 15 ? gstinError(gstin) : null} />
            <StepNav onBack={() => setStep(1)} onNext={() => setStep(3)} disabled={!can[2]} nextLabel="Review" />
          </>
        )}

        {step === 3 && (
          <>
            <StepHead kicker="Step 4 of 4" title="Check it before it goes" />
            <Surface padded={false}>
              {[
                ["Enterprise", name],
                ["Constitution", orgChoice?.label ?? "—"],
                ["Activity", ACTIVITIES.find((a) => a.id === activity)?.label ?? "—"],
                ["Classification", result?.label ?? "—"],
                ["Investment", `₹${inWords(investment)}`],
                ["Turnover", `₹${inWords(turnover)}`],
                ["PAN", pan],
                ["Aadhaar", `XXXX XXXX ${aad}`],
                ["Mobile", `+91 ${mobile}`],
                ["GSTIN", gstin || "Not registered"],
              ].map(([k, v], i) => (
                <View key={k} style={[styles.row, i > 0 && styles.rule]}>
                  <T v="callout" tone="muted" style={{ width: 118 }}>{k}</T>
                  <T v="bodyMedium" color={k === "Classification" ? C.gold : C.text} style={{ flex: 1 }}>{v}</T>
                </View>
              ))}
            </Surface>
            <Callout title="What happens when you send this">
              Nothing is filed. The Udyam team checks it and comes back with anything missing. You pay once they
              confirm — ₹499, and Udyam itself is free.
            </Callout>
            <StepNav onBack={() => setStep(2)} onNext={send} nextLabel="Send to the Udyam team" />
          </>
        )}
      </View>
    </Screen>
  );
}

/** One test on a log-scale ladder, with a marker that springs as you type. */
function Band({ label, value, max, keyName }: { label: string; value: number; max: number; keyName: "investmentMax" | "turnoverMax" }) {
  const pos = (v: number) => (v <= 0 ? 0 : Math.min(1, Math.log10(v + 1) / Math.log10(max + 1)));
  const x = useSharedValue(pos(value));
  React.useEffect(() => {
    x.value = withSpring(pos(value), motion.arrive);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  const marker = useAnimatedStyle(() => ({ left: `${x.value * 100}%` }));

  return (
    <View style={{ marginBottom: space.lg }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
        <T v="calloutMedium">{label}</T>
        <T v="callout">₹{inWords(value)}</T>
      </View>
      <View style={{ height: 22, justifyContent: "center" }}>
        <View style={styles.bandTrack}>
          {SLABS.map((s, i) => {
            const from = i === 0 ? 0 : pos(SLABS[i - 1]![keyName]);
            return <View key={s.id} style={{ width: `${(pos(s[keyName]) - from) * 100}%`, height: "100%", backgroundColor: `rgba(198,161,91,${0.25 + i * 0.25})` }} />;
          })}
        </View>
        <Animated.View style={[styles.marker, marker]} />
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
        {SLABS.map((s) => (
          <T v="micro" key={s.id}>{s.label}</T>
        ))}
      </View>
    </View>
  );
}

const styles = themed(() => ({
  verdict: { borderRadius: radius.xl, padding: space.xl, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: space.lg, paddingVertical: 13 },
  rule: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.line },
  bandTrack: { flexDirection: "row", height: 10, borderRadius: 5, overflow: "hidden", backgroundColor: C.track },
  marker: { position: "absolute", width: 4, height: 22, marginLeft: -2, borderRadius: 2, backgroundColor: C.text },
}));
