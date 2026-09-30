import React, { useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";
import { Icon } from "@/icons/Icon";
import { Button, Chip, CircleAction, Glass, IconButton, IconTile, SectionHeader, T } from "@/components/ui";
import { Screen, TxnList } from "@/components/Screen";
import { useAppWidth } from "@/components/AppWidth";
import { CardStack } from "@/wallet/CardStack";
import { passesFor } from "@/wallet/WalletCard";
import { useLock } from "@/lib/lock";
import { color as C, elevation, gradient, radius, space, text } from "@/theme";
import { SAMPLE_BALANCE_PAISE, profile, transactions } from "@/data/sample";

/**
 * The wallet.
 *
 * Three passes in an Apple Wallet stack. Tap one to lift it out; what is under
 * the stack changes to match — the ledger for the wallet, the benefits for the
 * membership, the referral code for credits. Tap it again to put it back.
 *
 * Face ID sits on top of all of it. When the lock is on and the wallet is
 * locked, the passes still show — their colour tells you what is there — but
 * every figure on them and below them is replaced with dots until you unlock.
 */
export default function WalletScreen() {
  const router = useRouter();
  const width = useAppWidth();
  const lock = useLock();
  const [selected, setSelected] = useState<string | null>("wallet");

  const hidden = lock.enabled && !lock.unlocked;
  const passes = passesFor({ balancePaise: SAMPLE_BALANCE_PAISE, holder: profile.name, member: profile.member });
  const cardW = width - space.lg * 2;

  return (
    <Screen aurora="wallet" auroraHeight={620}>
      <View style={styles.head}>
        <View style={{ flex: 1 }}>
          <T.Label>Your passes</T.Label>
          <T.Title style={{ marginTop: 2 }}>Wallet</T.Title>
        </View>
        {lock.enabled && (
          <IconButton
            icon={hidden ? "lock" : "faceid"}
            label={hidden ? "Unlock" : "Lock now"}
            onPress={() => (hidden ? lock.unlock() : lock.relock())}
          />
        )}
        <IconButton icon="plus" label="Add money" onPress={() => router.push("/pay")} />
      </View>

      <View style={{ paddingHorizontal: space.lg, marginTop: space.xl }}>
        <CardStack passes={passes} width={cardW} selected={selected} onSelect={setSelected} hideAmount={hidden} />
        <T.Tiny style={{ textAlign: "center", marginTop: space.md }}>
          {selected ? "Tap the pass to put it back · drag it to catch the light" : "Tap a pass to open it"}
        </T.Tiny>
      </View>

      {/* ── locked ── */}
      {hidden && (
        <Animated.View entering={FadeIn.duration(300)} style={styles.pad}>
          <Glass strong style={{ borderRadius: radius.xl, marginTop: space.xl }}>
            <View style={{ alignItems: "center", paddingVertical: space.lg }}>
              <View style={[styles.lockOrb, elevation.glowViolet]}>
                <LinearGradient colors={gradient.violet} style={StyleSheet.absoluteFill} />
                <Icon name={lock.kind === "fingerprint" ? "fingerprint" : "faceid"} size={34} color="#fff" />
              </View>
              <T.Heading style={{ marginTop: space.lg }}>Your wallet is locked</T.Heading>
              <T.Small style={{ marginTop: 4, textAlign: "center" }}>
                Unlock with {lock.label} to see your balance and what it paid for.
              </T.Small>
              <Button label={`Unlock with ${lock.label}`} icon="faceid" variant="violet" onPress={lock.unlock} style={{ marginTop: space.xl, alignSelf: "stretch" }} />
            </View>
          </Glass>
        </Animated.View>
      )}

      {/* ── what the selected pass opens into ── */}
      {!hidden && selected === "wallet" && (
        <Animated.View entering={FadeInUp.duration(360)} key="w">
          <View style={styles.actions}>
            <CircleAction icon="plus" label="Add money" tone="gold" onPress={() => router.push("/pay")} />
            <CircleAction icon="legal" label="Pay a filing" onPress={() => router.push("/services")} />
            <CircleAction icon="statement" label="Statement" />
            <CircleAction icon="chart" label="Insights" onPress={() => router.push("/insights")} />
          </View>

          <View style={[styles.pad, { marginTop: space.xl }]}>
            <Glass style={{ borderRadius: radius.lg }}>
              <View style={{ flexDirection: "row", gap: space.md, alignItems: "flex-start" }}>
                <Icon name="shield" size={18} color={C.gold} />
                <T.Small style={{ flex: 1, lineHeight: 18 }}>
                  A closed wallet. It pays for LAWFIC services and takes refunds back — it cannot send money to
                  another person or be withdrawn as cash.
                </T.Small>
              </View>
            </Glass>
          </View>

          <View style={[styles.pad, { marginTop: space.xxl }]}>
            <SectionHeader title="Activity" action="Insights" onAction={() => router.push("/insights")} />
            <TxnList items={transactions} />
          </View>
        </Animated.View>
      )}

      {!hidden && selected === "membership" && (
        <Animated.View entering={FadeInUp.duration(360)} key="m" style={[styles.pad, { marginTop: space.xl, gap: space.md }]}>
          <T.Heading>What membership covers</T.Heading>
          {[
            { icon: "bolt" as const, t: "10% off every filing", s: "One membership, every service on the site, all year." },
            { icon: "clock" as const, t: "Priority in the queue", s: "Your filings are picked up first." },
            { icon: "phone" as const, t: "A named person to call", s: "The same team member each time." },
          ].map((b) => (
            <Glass key={b.t} style={{ borderRadius: radius.lg }}>
              <View style={{ flexDirection: "row", gap: space.md, alignItems: "center" }}>
                <IconTile icon={b.icon} tone="violet" />
                <View style={{ flex: 1 }}>
                  <T.Sub>{b.t}</T.Sub>
                  <T.Small style={{ marginTop: 2 }}>{b.s}</T.Small>
                </View>
              </View>
            </Glass>
          ))}
          <Button label="Become a member" variant="violet" icon="crown" style={{ marginTop: space.sm }} />
          <T.Tiny style={{ textAlign: "center" }}>Price and terms as published on lawfic.pro/pricing.</T.Tiny>
        </Animated.View>
      )}

      {!hidden && selected === "credits" && (
        <Animated.View entering={FadeInUp.duration(360)} key="c" style={[styles.pad, { marginTop: space.xl, gap: space.md }]}>
          <T.Heading>Refer a friend</T.Heading>
          <T.Body>
            Share your code. When somebody you refer completes their first filing, credits land here — and they can
            only be spent on LAWFIC services, like the rest of the wallet.
          </T.Body>
          <Glass strong style={{ borderRadius: radius.lg }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ flex: 1 }}>
                <T.Label>Your code</T.Label>
                <Text style={[text.title, { color: C.gold, letterSpacing: 3, marginTop: 4 }]}>[CODE]</Text>
              </View>
              <Button label="Share" size="md" variant="gold" style={{ paddingHorizontal: 4 }} />
            </View>
          </Glass>
          <Chip tone="amber" icon="clock">Referral terms not yet published — sample only</Chip>
        </Animated.View>
      )}

      {/* ── security ── */}
      <Animated.View entering={FadeInDown.delay(120).duration(400)} style={[styles.pad, { marginTop: space.section }]}>
        <T.Label style={{ marginBottom: space.md }}>Security</T.Label>
        <Glass style={{ borderRadius: radius.lg }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
            <IconTile icon={lock.kind === "fingerprint" ? "fingerprint" : "faceid"} tone="violet" />
            <View style={{ flex: 1 }}>
              <T.Sub>Lock with {lock.available ? lock.label : "Face ID"}</T.Sub>
              <T.Small style={{ marginTop: 2 }}>
                {lock.available
                  ? "Hide every figure until it is you. Relocks when you leave the app."
                  : "Available in the installed app on a phone with Face ID or a fingerprint reader."}
              </T.Small>
            </View>
            <Switch
              value={lock.enabled}
              disabled={!lock.available}
              onValueChange={(on) => {
                if (on) void lock.enable();
                else lock.disable();
              }}
              trackColor={{ false: C.glassPress, true: C.violet }}
              thumbColor="#fff"
              accessibilityLabel={`Lock the wallet with ${lock.label}`}
            />
          </View>
        </Glass>
        <T.Tiny style={{ marginTop: space.sm, lineHeight: 15 }}>
          Your face and fingerprint never leave your phone. The app gets a yes or a no from it, nothing else.
        </T.Tiny>
      </Animated.View>

    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: space.lg },
  head: { flexDirection: "row", alignItems: "center", gap: space.md, paddingHorizontal: space.lg },
  actions: { flexDirection: "row", paddingHorizontal: space.md, marginTop: space.xl },
  lockOrb: {
    width: 76,
    height: 76,
    borderRadius: 38,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
});
