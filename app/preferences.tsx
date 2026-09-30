import React from "react";
import { View } from "react-native";
import { useStore, type Prefs } from "@/lib/store";
import { Group, Reveal, Row, Screen, SectionHeader, Switch, T } from "@/ui";
import { space } from "@/theme";

/**
 * Dashboard preference — the website's "Set Dash Board Preference" row,
 * backed by the same idea as its "home.sections" setting: which blocks Home
 * shows. The passes, your filings and the quick actions always show; they are
 * what the app is for.
 */
const SECTIONS: { key: keyof Prefs["homeSections"]; title: string; sub: string }[] = [
  { key: "promotions", title: "Offers and banners", sub: "LAWFiC's current promotions" },
  { key: "forYou", title: "For you", sub: "Services picked from your interests" },
  { key: "services", title: "Popular services", sub: "The four you can start today" },
  { key: "activity", title: "Recent activity", sub: "Your latest wallet movements" },
];

export default function Preferences() {
  const { state, setPrefs } = useStore();
  const p = state.prefs;
  return (
    <Screen back title="Preferences" kicker="Home & privacy">
      <Reveal>
        <SectionHeader title="On your Home screen" />
        <Group>
          {SECTIONS.map((s) => (
            <Row
              key={s.key}
              title={s.title}
              subtitle={s.sub}
              trailingNode={<Switch label={s.title} value={p.homeSections[s.key]} onChange={(on) => setPrefs({ homeSections: { ...p.homeSections, [s.key]: on } })} />}
            />
          ))}
        </Group>
      </Reveal>
      <Reveal i={2} style={{ marginTop: space.xxl }}>
        <SectionHeader title="Privacy" />
        <Group>
          <Row
            icon="eyeOff"
            title="Hide balances"
            subtitle="Amounts show as ₹ •••• until you tap the eye in the wallet — for using the app in public."
            trailingNode={<Switch label="Hide balances" value={p.hideBalance} onChange={(on) => setPrefs({ hideBalance: on })} />}
          />
        </Group>
        <View style={{ marginTop: space.md, marginHorizontal: 4 }}>
          <T v="caption">Who can see your details is managed with your account on lawfic.pro. Nothing in this preview leaves this device except what you ask LAWFiC AI.</T>
        </View>
      </Reveal>
    </Screen>
  );
}
