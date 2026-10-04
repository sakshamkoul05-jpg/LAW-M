import React from "react";
import { View } from "react-native";
import { useStore, type Prefs } from "@/lib/store";
import { Icon, type IconName } from "@/icons/Icon";
import { Group, Reveal, Row, Screen, SectionHeader, Switch, T } from "@/ui";
import { color as C, space } from "@/theme";
import { useThemeChoice, type ThemeChoice } from "@/theme/ThemeProvider";

const THEMES: { id: ThemeChoice; title: string; sub: string; icon: IconName }[] = [
  { id: "dark", title: "Dark", sub: "Obsidian and champagne — LAWFIC's own look", icon: "moon" },
  { id: "light", title: "Light", sub: "Ivory and gold, easier in bright daylight", icon: "sun" },
  { id: "system", title: "Same as phone", sub: "Follows your phone's light or dark setting", icon: "sunMoon" },
];

/**
 * Dashboard preference — the website's "Set Dash Board Preference" row,
 * backed by the same idea as its "home.sections" setting: which blocks Home
 * shows. The passes, your filings and the quick actions always show; they are
 * what the app is for.
 */
const SECTIONS: { key: keyof Prefs["homeSections"]; title: string; sub: string }[] = [
  { key: "promotions", title: "Offers and banners", sub: "LAWFIC's current promotions" },
  { key: "forYou", title: "For you", sub: "Services picked from your interests" },
  { key: "services", title: "Popular services", sub: "The four you can start today" },
  { key: "activity", title: "Recent activity", sub: "Your latest wallet movements" },
];

export default function Preferences() {
  const { state, setPrefs } = useStore();
  const p = state.prefs;
  const theme = useThemeChoice();
  return (
    <Screen back title="Preferences" kicker="Appearance, Home & privacy">
      <Reveal>
        <SectionHeader title="Appearance" />
        <Group>
          {THEMES.map((t) => (
            <Row
              key={t.id}
              icon={t.icon}
              title={t.title}
              subtitle={t.sub}
              onPress={() => theme.setChoice(t.id)}
              trailingNode={theme.choice === t.id ? <Icon name="checkCircle" size={20} color={C.gold} /> : <View style={{ width: 20 }} />}
            />
          ))}
        </Group>
      </Reveal>
      <Reveal i={1} style={{ marginTop: space.xxl }}>
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
          <T v="caption">Who can see your details is managed with your account on lawfic.pro. Nothing in this demo leaves your phone except what you ask Panda.</T>
        </View>
      </Reveal>
    </Screen>
  );
}
