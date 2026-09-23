import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Icon } from "@/icons/Icon";
import { Button, Label, Rule, Surface, Touch } from "@/components/primitives";
import { CountingBalance, Money } from "@/components/Money";
import { Wallet } from "@/wallet/Wallet";
import { color as C, font, radius, space, text } from "@/theme";
import { SAMPLE_BALANCE_PAISE, sampleEntries } from "@/data/sample";

/**
 * The wallet.
 *
 * ONE LOUD THING, AND IT IS THE OBJECT
 *
 * The wallet sits alone, at full width, on a pool of light, with nothing beside
 * it. The balance below it is the only other thing allowed to be large. Every
 * label, date and caption on this screen is small, dim and letterspaced, and
 * that restraint is what makes the object look expensive — a screen where four
 * things compete has no hero, and a wallet app with no hero is a list.
 *
 * The stage is a radial pool rather than a flat panel. Real objects sit in
 * light that falls off; a card on an evenly-lit rectangle reads as a sticker.
 */
export default function WalletScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: C.void }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + space.sm, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.head}>
          <Label>Your money</Label>
          <Text style={[text.title, { color: C.text, marginTop: 3 }]}>Wallet</Text>
        </View>

        {/* ── THE STAGE ── */}
        <Animated.View entering={FadeIn.duration(520)} style={styles.stage}>
          <LinearGradient
            colors={["rgba(230,195,107,0.10)", "rgba(230,195,107,0.02)", "transparent"]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.5, y: 0.1 }}
            end={{ x: 0.5, y: 1 }}
          />
          <Wallet
            balancePaise={SAMPLE_BALANCE_PAISE}
            open={open}
            onToggle={setOpen}
            engraving=""
          />
          <Text style={styles.hint}>
            {open ? "Tap to close" : "Tap to open"} {"·"} drag to turn
          </Text>
        </Animated.View>

        {/* ── THE BALANCE ── */}
        <Animated.View entering={FadeInDown.delay(140).duration(420)} style={styles.balance}>
          <Label>Available balance</Label>
          <View style={{ marginTop: space.sm }}>
            <CountingBalance paise={SAMPLE_BALANCE_PAISE} size={50} />
          </View>
          <Text
            style={[text.tiny, { color: C.textFaint, marginTop: 4 }]}
            accessibilityLabel={`Sample balance, ${SAMPLE_BALANCE_PAISE / 100} rupees`}
          >
            Sample balance {"·"} not your account
          </Text>
        </Animated.View>

        {/* ── ACTIONS ── */}
        <Animated.View entering={FadeInDown.delay(220).duration(420)} style={styles.actions}>
          <Button label="Add money" onPress={() => router.push("/pay")} style={{ flex: 1 }} />
          <Button label="Statement" variant="ghost" onPress={() => {}} style={{ flex: 1 }} />
        </Animated.View>

        {/* ── THE CLOSED LOOP, SAID PLAINLY ── */}
        <Animated.View entering={FadeInDown.delay(280).duration(420)} style={styles.note}>
          <Icon name="shield" size={16} color={C.textFaint} />
          <Text style={[text.tiny, { color: C.textFaint, flex: 1, lineHeight: 17 }]}>
            A closed wallet. Money here pays for LAWFIC services. It cannot be
            sent to another person or withdrawn as cash.
          </Text>
        </Animated.View>

        {/* ── STATEMENT ── */}
        <Animated.View entering={FadeInDown.delay(340).duration(420)} style={styles.section}>
          <View style={styles.sectionHead}>
            <Label>Recent</Label>
            <Text style={[text.tiny, { color: C.textFaint }]}>Example statement</Text>
          </View>

          <Surface padded={false}>
            {sampleEntries.map((e, i) => (
              <View key={e.id}>
                <View style={styles.row}>
                  <View style={[styles.dot, { backgroundColor: e.paise >= 0 ? C.greenWash : C.surfaceHigh }]}>
                    <Icon
                      name={e.paise >= 0 ? "plus" : "chevron"}
                      size={13}
                      color={e.paise >= 0 ? C.green : C.textFaint}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[text.small, { color: C.text, fontFamily: font.bodySemi }]} numberOfLines={1}>
                      {e.reason}
                    </Text>
                    <Text style={[text.tiny, { color: C.textFaint, marginTop: 2 }]}>{e.date}</Text>
                  </View>
                  <Money paise={e.paise} size={14} signed />
                </View>
                {i < sampleEntries.length - 1 && <Rule style={{ marginLeft: 58 }} />}
              </View>
            ))}
          </Surface>
        </Animated.View>

        <Touch
          onPress={() => {}}
          accessibilityLabel="Customise your wallet"
          style={styles.customise}
        >
          <Icon name="spark" size={15} color={C.gold} />
          <Text style={[text.small, { color: C.gold, fontFamily: font.bodySemi }]}>
            Customise the leather
          </Text>
        </Touch>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: space.lg, paddingBottom: space.lg },
  stage: {
    paddingVertical: space.xxl,
    alignItems: "center",
    overflow: "hidden",
  },
  hint: {
    ...text.tiny,
    color: C.textFaint,
    marginTop: space.xl,
    letterSpacing: 0.4,
  },
  balance: { alignItems: "center", marginTop: space.md },
  actions: {
    flexDirection: "row",
    gap: space.md,
    paddingHorizontal: space.lg,
    marginTop: space.xxl,
  },
  note: {
    flexDirection: "row",
    gap: space.sm + 2,
    alignItems: "flex-start",
    paddingHorizontal: space.lg,
    marginTop: space.xl,
  },
  section: { paddingHorizontal: space.lg, marginTop: space.xxl },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: space.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md + 2,
  },
  dot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  customise: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    minHeight: 48,
    marginTop: space.xl,
    marginHorizontal: space.lg,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.hairline,
  },
});
