import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import Animated, { Easing, FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { isValidPhone } from "@/lawfic/profile";
import { useAppWidth, useDevice, useLayout } from "@/components/AppWidth";
import { useStore } from "@/lib/store";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { Button, Field, Glow, Logo, T } from "@/ui";
import { color as C, space } from "@/theme";
import { Icon } from "@/icons/Icon";

/**
 * Welcome.
 *
 * The LAWFIC logo leads — the brand's own gold badge, drifting a few points on
 * a slow breath with a warm light behind it. Then two fields and one button.
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
  const [name, setName] = useState(state.profile.fullName);
  const [phone, setPhone] = useState(state.profile.phone);
  const [err, setErr] = useState<{ name?: string; phone?: string }>({});
  const wide = layout !== "compact";

  const drift = useSharedValue(0);
  useEffect(() => {
    drift.value = withRepeat(withSequence(withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: 3200, easing: Easing.inOut(Easing.sin) })), -1);
  }, [drift]);
  const float = useAnimatedStyle(() => ({
    transform: [{ translateY: -6 * drift.value }],
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

  const { short } = useDevice();
  const logoW = Math.min(width * 0.56, short ? 170 : 230);
  const glow = useAnimatedStyle(() => ({ opacity: 0.6 + drift.value * 0.4 }));

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Glow height={620} strength={1.6} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.wrap, { paddingTop: insets.top + space.xl, paddingBottom: insets.bottom + space.xl }, wide && styles.wide]} keyboardShouldPersistTaps="handled">
          <View style={[wide && { flex: 1, alignItems: "center" }]}>
            <Animated.View entering={FadeIn.duration(900)} style={{ alignItems: "center", justifyContent: "center", marginTop: short ? space.md : space.xxxl, marginBottom: short ? space.lg : space.xxxl }}>
              <Animated.View style={[{ position: "absolute", width: logoW * 1.9, height: logoW * 1.9 }, glow]} pointerEvents="none">
                <Svg width={logoW * 1.9} height={logoW * 1.9}>
                  <Defs>
                    <RadialGradient id="logoGlow" cx="50%" cy="50%" r="50%">
                      <Stop offset="0.2" stopColor="#E0B83A" stopOpacity={0.16} />
                      <Stop offset="1" stopColor="#E0B83A" stopOpacity={0} />
                    </RadialGradient>
                  </Defs>
                  <Circle cx={logoW * 0.95} cy={logoW * 0.95} r={logoW * 0.95} fill="url(#logoGlow)" />
                </Svg>
              </Animated.View>
              <Animated.View style={float}>
                <Logo size={logoW} />
              </Animated.View>
            </Animated.View>
          </View>

          <View style={[{ gap: space.lg }, wide && { flex: 1, maxWidth: 440 }]}>
            <Animated.View entering={FadeInDown.delay(300).duration(600)}>
              <T v={wide ? "display" : "title1"} center>
                Your legal wallet.
              </T>
              <T v="body" center style={{ marginTop: 8 }}>
                Filings, documents and payments for your registrations and certificates — in one place, handled properly the first time.
              </T>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(450).duration(600)} style={{ gap: space.md }}>
              <Field label="Your name" icon="account" value={name} onChangeText={(t) => { setName(t); setErr((e) => ({ ...e, name: undefined })); }} error={err.name} autoComplete="name" />
              <Field label="Mobile number" prefix="+91" value={phone} onChangeText={(t) => { setPhone(t.replace(/\D/g, "").slice(0, 10)); setErr((e) => ({ ...e, phone: undefined })); }} keyboardType="phone-pad" error={err.phone} />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(600).duration(600)} style={{ gap: space.sm }}>
              <Button label="Continue" icon="forward" onPress={() => go()} successLabel="Welcome" />
              <Button label="Look around first" variant="ghost" onPress={() => go(true)} />
              <View style={styles.note}>
                <Icon name="shield" size={15} color={C.textMuted} />
                <T v="caption" style={{ flex: 1 }}>
                  A one-time code confirms your number — there is no password. This demo skips the code and keeps everything on your phone. LAWFIC will never ask for your OTP or an Aadhaar photocopy.
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
