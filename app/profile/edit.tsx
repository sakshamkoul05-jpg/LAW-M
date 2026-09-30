import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { EXAM_OPTIONS, JOB_OPTIONS, isValidEmail, isValidPhone } from "@/lawfic/profile";
import { Icon } from "@/icons/Icon";
import { useStore } from "@/lib/store";
import { Button, Field, Press, Reveal, Screen, SectionHeader, T, useToast } from "@/ui";
import { color as C, radius as R, space } from "@/theme";

/**
 * Personal information — the website's profile (lib/profile.ts), with its own
 * validation. The interests at the bottom are what "For you" on Home is built
 * from; they are optional and change nothing else.
 */
export default function EditProfile() {
  const router = useRouter();
  const toast = useToast();
  const { state, updateProfile, mode } = useStore();
  const p = state.profile;
  const [v, setV] = useState({ fullName: p.fullName, phone: p.phone, email: p.email, website: p.website, city: p.city, qualification: p.qualification });
  const [exams, setExams] = useState<string[]>(p.examsPreparing);
  const [jobs, setJobs] = useState<string[]>(p.jobsLooking);
  const [err, setErr] = useState<Record<string, string | null>>({});

  const save = async () => {
    const e: Record<string, string | null> = {
      fullName: v.fullName.trim() ? null : "Your name, as it should appear on documents.",
      phone: v.phone && !isValidPhone(v.phone) ? "Ten digits, starting 6, 7, 8 or 9." : null,
      email: v.email && !isValidEmail(v.email) ? "That does not look like an email address." : null,
    };
    setErr(e);
    if (Object.values(e).some(Boolean)) return false;
    await new Promise((r) => setTimeout(r, 400));
    const r = await updateProfile({ ...v, fullName: v.fullName.trim(), examsPreparing: exams, jobsLooking: jobs });
    if (!r.ok) {
      toast({ title: "Not saved", body: r.error, tone: "bad" });
      return false;
    }
    toast({ title: "Profile saved", body: mode === "live" ? "Also updated on lawfic.pro." : undefined });
    setTimeout(() => router.back(), 700);
    return true;
  };

  const set = (k: keyof typeof v) => (t: string) => {
    setV((s) => ({ ...s, [k]: t }));
    if (err[k]) setErr((s) => ({ ...s, [k]: null }));
  };

  return (
    <Screen back title="Personal information" footer={<Button label="Save" icon="check" onPress={save} successLabel="Saved" />}>
      <View style={{ gap: space.lg, maxWidth: 620 }}>
        <Reveal i={0}>
          <Field label="Full name" icon="account" value={v.fullName} onChangeText={set("fullName")} error={err.fullName} autoComplete="name" />
        </Reveal>
        <Reveal i={1}>
          <Field label="Mobile number" prefix="+91" value={v.phone} onChangeText={(t) => set("phone")(t.replace(/\D/g, "").slice(0, 10))} keyboardType="phone-pad" error={err.phone} hint="Where sign-in codes and filing updates go." />
        </Reveal>
        <Reveal i={2}>
          <Field label="Email" icon="mail" value={v.email} onChangeText={set("email")} keyboardType="email-address" autoCapitalize="none" error={err.email} />
        </Reveal>
        <Reveal i={3}>
          <Field label="Website" icon="globe" value={v.website} onChangeText={set("website")} autoCapitalize="none" keyboardType="url" />
        </Reveal>
        <Reveal i={4}>
          <Field label="City" icon="pin" value={v.city} onChangeText={set("city")} />
        </Reveal>
        <Reveal i={5}>
          <Field label="Highest qualification" icon="book" value={v.qualification} onChangeText={set("qualification")} />
        </Reveal>
      </View>

      <View style={{ marginTop: space.section, maxWidth: 720 }}>
        <SectionHeader kicker="Optional" title="What you are working towards" />
        <T v="callout" style={{ marginBottom: space.md }}>
          Used only to pick the services shown under "For you" on Home.
        </T>
        <T v="label" style={{ marginBottom: space.sm }}>
          Exams
        </T>
        <Chips options={EXAM_OPTIONS} value={exams} onChange={setExams} />
        <T v="label" style={{ marginTop: space.xl, marginBottom: space.sm }}>
          Work
        </T>
        <Chips options={JOB_OPTIONS} value={jobs} onChange={setJobs} />
      </View>
    </Screen>
  );
}

function Chips({ options, value, onChange }: { options: readonly string[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <Press key={o} onPress={() => onChange(on ? value.filter((x) => x !== o) : [...value, o])} haptic="select" radius={R.pill} accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={o} style={[styles.chip, on && styles.chipOn]}>
            {on && <Icon name="check" size={13} color={C.gold} strokeWidth={2.4} />}
            <T v="captionMedium" color={on ? C.text : C.textDim}>
              {o}
            </T>
          </Press>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { flexDirection: "row", alignItems: "center", gap: 6, height: 36, paddingHorizontal: 14, borderRadius: 18, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line },
  chipOn: { borderColor: C.gold, backgroundColor: "#15120C" },
});
