import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Icon, type IconName } from "@/icons/Icon";
import { Button, Label, Rule, Surface, Touch } from "@/components/primitives";
import { color as C, font, radius, space, text } from "@/theme";

type Row = { icon: IconName; label: string; meta?: string; onPress?: () => void };

export default function Account() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const mine: Row[] = [
    { icon: "legal", label: "My documents", meta: "[00] files" },
    { icon: "services", label: "Saved businesses", meta: "[0]" },
    { icon: "bell", label: "Notifications" },
    { icon: "shield", label: "Privacy & data" },
  ];

  const help: Row[] = [
    { icon: "spark", label: "Ask the Panda", onPress: () => router.push("/panda") },
    { icon: "phone", label: "Talk to a person" },
    { icon: "legal", label: "Terms, refunds & policies" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: C.void }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + space.sm, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.head}>
          <Label>You</Label>
          <Text style={[text.title, { color: C.text, marginTop: 3 }]}>Account</Text>
        </View>

        <Animated.View entering={FadeInDown.duration(360)} style={styles.section}>
          <Surface level="high">
            <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
              <View style={styles.avatar}>
                <Icon name="account" size={24} color={C.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[text.heading, { color: C.text }]}>[Full name]</Text>
                <Text style={[text.small, { color: C.textDim, marginTop: 2 }]}>
                  +91 [00000 00000]
                </Text>
              </View>
              <Touch accessibilityLabel="Edit your profile" style={styles.edit} onPress={() => {}}>
                <Text style={[text.small, { color: C.text, fontFamily: font.bodySemi }]}>Edit</Text>
              </Touch>
            </View>
          </Surface>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(360)} style={styles.section}>
          <Label style={{ marginBottom: space.md }}>Yours</Label>
          <RowGroup rows={mine} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(140).duration(360)} style={styles.section}>
          <Label style={{ marginBottom: space.md }}>Help</Label>
          <RowGroup rows={help} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(360)} style={styles.section}>
          <Button label="Sign out" variant="ghost" onPress={() => router.replace("/sign-in")} />
        </Animated.View>

        <Text style={styles.version}>LAWFIC [version] {"·"} front-end preview</Text>
      </ScrollView>
    </View>
  );
}

function RowGroup({ rows }: { rows: Row[] }) {
  return (
    <Surface padded={false}>
      {rows.map((r, i) => (
        <View key={r.label}>
          <Touch onPress={r.onPress ?? (() => {})} accessibilityLabel={r.label} style={styles.row}>
            <Icon name={r.icon} size={19} color={C.textDim} />
            <Text style={[text.body, { color: C.text, flex: 1 }]}>{r.label}</Text>
            {r.meta ? (
              <Text style={[text.small, { color: C.textFaint }]}>{r.meta}</Text>
            ) : null}
            <Icon name="chevron" size={14} color={C.textFaint} />
          </Touch>
          {i < rows.length - 1 && <Rule style={{ marginLeft: 52 }} />}
        </View>
      ))}
    </Surface>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: space.lg, paddingBottom: space.lg },
  section: { paddingHorizontal: space.lg, marginTop: space.xl },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: C.goldWash,
    alignItems: "center",
    justifyContent: "center",
  },
  edit: {
    minHeight: 40,
    paddingHorizontal: space.lg,
    justifyContent: "center",
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.hairline,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingHorizontal: space.lg,
    minHeight: 54,
  },
  version: {
    ...text.tiny,
    color: C.textFaint,
    textAlign: "center",
    marginTop: space.xxl,
  },
});
