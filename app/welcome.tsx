import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import Animated, { Easing, FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { isValidPhone } from "@/lawfic/profile";
import { useAppWidth, useLayout } from "@/components/AppWidth";
import { useStore } from "@/lib/store";
import { Pass } from "@/wallet/Pass";
import { usePassData } from "@/wallet/usePassData";
import { Button, Field, Glow, T, Wordmark } from "@/ui";
import { color as C, space } from "@/theme";
import { Icon } from "@/icons/Icon";

/**
 * Welcome.
 *
 * The pass floats — a slow drift and a degree of turn, like a card resting on
 * water — so the first thing anybody sees is the object the product is built
 * around. Then two fields and one button.
 *
 * On lawfic.pro, sign-in is a one-time code to the mobile number, with no
 * password. The preview has no account connection, so it cannot send a code;
 * it says so on the button rather than pretending one was sent.
 */
export default function Welcome() {
  const router = useRouter();
  const width = useAppWidth();
  const layout = useLayout();
  const insets = useSafeAreaInsets();
  const { updateProfile, state } = useStore();
  const pass = usePassData();
  const [name, setName] = useState(state.profile.fullName);
  const [phone, setPhone] = useState(state.profile.phone);
  const [err, setErr] = useState<{ name?: string; phone?: string }>({});
  const wide = layout !== "compact";

  const drift = useSharedValue(0);
  useEffect(() => {
    drift.value = withRepeat(withSequence(withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: 3200, easing: Easing.inOut(Easing.sin) })), -1);
  }, [drift]);
  const float = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { translateY: -8 * drift.value }, { rotateX: `${8 - drift.value * 3}deg` }, { rotateZ: `${-4 + drift.value * 1.5}deg` }],
  }));

  const go = async (skip?: boolean) => {
    if (!skip) {
      const e: typeof err = {};
      if (!name.trim()) e.name = "What should we call you?";
      if (!isValidPhone(phone)) e.phone = "Ten digits, starting 6, 7, 8 or 9.";
      setErr(e);
      if (e.name || e.phone) return false;
      await new Promise((r) => setTimeout(r, 600));
    }
    updateProfile(skip ? { onboarded: true } : { fullName: name.trim(), phone, onboarded: true });
    setTimeout(() => router.replace("/"), skip ? 0 : 500);
    return true;
  };

  const passW = Math.min(wide ? 420 : width - 72, 420);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Glow height={620} strength={1.6} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.wrap, { paddingTop: insets.top + space.xl, paddingBottom: insets.bottom + space.xl }, wide && styles.wide]} keyboardShouldPersistTaps="handled">
          <View style={[wide && { flex: 1, alignItems: "center" }]}>
            <Animated.View entering={FadeIn.duration(600)} style={{ alignItems: wide ? "flex-start" : "center", alignSelf: "stretch" }}>
              <Wordmark size={15} />
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(150).duration(800)} style={[{ alignItems: "center", marginTop: wide ? space.hero : space.section, marginBottom: space.section }, float]}>
              <Pass kind="wallet" width={passW} data={{ ...pass, hidden: true }} interactive={false} />
            </Animated.View>
          </View>

          <View style={[{ gap: space.lg }, wide && { flex: 1, maxWidth: 440 }]}>
            <Animated.View entering={FadeInDown.delay(300).duration(600)}>
              <T v="label" tone="gold">
                LAWFiC
              </T>
              <T v={wide ? "display" : "title1"} style={{ marginTop: 6 }}>
                Your legal wallet.
              </T>
              <T v="body" style={{ marginTop: 8 }}>
                Filings, documents and payments for your registrations and certificates — in one place, handled properly the first time.
              </T>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(450).duration(600)} style={{ gap: space.md }}>
              <Field label="Your name" icon="account" value={name} onChangeText={(t) => { setName(t); setErr((e) => ({ ...e, name: undefined })); }} error={err.name} autoComplete="name" />
              <Field label="Mobile number" prefix="+91" value={phone} onChangeText={(t) => { setPhone(t.replace(/\D/g, "").slice(0, 10)); setErr((e) => ({ ...e, phone: undefined })); }} keyboardType="phone-pad" error={err.phone} />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(600).duration(600)} style={{ gap: space.sm }}>
              <Button label="Continue in preview" icon="forward" onPress={() => go()} successLabel="Welcome" />
              <Button label="Look around first" variant="ghost" onPress={() => go(true)} />
              <View style={styles.note}>
                <Icon name="shield" size={15} color={C.textMuted} />
                <T v="caption" style={{ flex: 1 }}>
                  In the live app a one-time code is sent to this number — there is no password. This preview skips the code and keeps everything on this device. LAWFiC will never ask for your OTP or Aadhaar photocopy.
                </T>
              </View>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, paddingHorizontal: space.xl, width: "100%", maxWidth: 1180, alignSelf: "center" },
  wide: { flexDirection: "row", alignItems: "center", gap: space.hero, paddingHorizontal: space.section },
  note: { flexDirection: "row", gap: 10, marginTop: space.md },
});
