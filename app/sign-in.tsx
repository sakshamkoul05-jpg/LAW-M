import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Icon } from "@/icons/Icon";
import { Button, T, Touch } from "@/components/ui";
import { Aurora } from "@/components/Aurora";
import { useAppWidth } from "@/components/AppWidth";
import { WalletCard, passesFor } from "@/wallet/WalletCard";
import { color as C, elevation, font, gradient, radius, space, text } from "@/theme";
import { SAMPLE_BALANCE_PAISE } from "@/data/sample";

/**
 * Signing in — phone and a code, no password. The wallet pass floats above the
 * form so the first thing anybody sees is the object they are signing in to.
 * The OTP warning is on this screen, where it is read while a code is on its
 * way, because OTP fraud is the most common attack on exactly this flow.
 */
export default function SignIn() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const width = useAppWidth();
  const [phone, setPhone] = useState("");
  const ready = phone.replace(/\D/g, "").length === 10;
  const pass = passesFor({ balancePaise: SAMPLE_BALANCE_PAISE, holder: "[Your name]", member: false })[0]!;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.void }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Aurora preset="home" height={640} />
      <View style={{ flex: 1, paddingTop: insets.top + space.xl, paddingHorizontal: space.xl, paddingBottom: Math.max(insets.bottom, space.xl) }}>
        <Animated.View entering={FadeIn.duration(600)} style={[{ alignItems: "center", transform: [{ rotate: "-6deg" }] }, elevation.card]}>
          <WalletCard pass={pass} width={Math.min(width - 80, 320)} hideAmount />
        </Animated.View>

        <View style={{ flex: 1 }} />

        <Animated.View entering={FadeInDown.delay(120).duration(460)}>
          <T.Hero>Paperwork,{"\n"}without the queue.</T.Hero>
          <T.Body style={{ marginTop: space.md }}>Sign in with your phone. We send a one-time code — there is no password to forget.</T.Body>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(460)} style={{ gap: space.md, marginTop: space.xl }}>
          <View style={styles.field}>
            <Text style={[text.bodySemi, { color: C.text, fontFamily: font.mono }]}>+91</Text>
            <View style={styles.divider} />
            <TextInput value={phone} onChangeText={setPhone} placeholder="00000 00000" placeholderTextColor={C.textFaint} keyboardType="phone-pad" maxLength={11} accessibilityLabel="Mobile number" style={styles.input} />
          </View>
          <Button label="Send code" disabled={!ready} onPress={() => router.replace("/(tabs)")} />
          <Touch onPress={() => router.replace("/(tabs)")} accessibilityLabel="Look around first" style={{ alignItems: "center", paddingVertical: space.sm }}>
            <T.Small tone={C.textDim}>Look around first</T.Small>
          </Touch>
        </Animated.View>

        <View style={styles.warn}>
          <View style={styles.warnIcon}>
            <LinearGradient colors={gradient.gold} style={StyleSheet.absoluteFill} />
            <Icon name="shield" size={14} color={C.goldInk} />
          </View>
          <T.Tiny style={{ flex: 1, lineHeight: 15, color: C.textDim }}>
            We never ask for your OTP, your Aadhaar photocopy or a bank password. Nobody from LAWFIC will call and ask for one.
          </T.Tiny>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  field: { flexDirection: "row", alignItems: "center", gap: space.md, height: 58, borderRadius: radius.pill, paddingHorizontal: space.xl, backgroundColor: C.glassHigh, borderWidth: StyleSheet.hairlineWidth, borderColor: C.hairlineStrong },
  divider: { width: StyleSheet.hairlineWidth, height: 24, backgroundColor: C.hairlineStrong },
  input: { flex: 1, color: C.text, fontFamily: font.mono, fontSize: 17, letterSpacing: 1, padding: 0, height: 54 },
  warn: { flexDirection: "row", gap: space.md, alignItems: "flex-start", marginTop: space.xl },
  warnIcon: { width: 24, height: 24, borderRadius: 12, overflow: "hidden", alignItems: "center", justifyContent: "center" },
});
