import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Icon } from "@/icons/Icon";
import { Button, Label, Touch } from "@/components/primitives";
import { color as C, font, radius, space, text } from "@/theme";

/**
 * Signing in.
 *
 * A PHONE NUMBER AND A CODE. NO PASSWORD.
 *
 * Nothing in this app is worth a password somebody will reuse, and a password
 * field is a place for a phishing page to aim at. The OTP flow is also what
 * every Indian customer already expects from a filing service.
 *
 * THE WARNING IS ON THE SIGN-IN SCREEN, NOT BURIED IN HELP
 *
 * "Nobody from LAWFIC will call and ask for your OTP." It belongs here, where
 * somebody reads it while a code is on its way, because OTP fraud is the single
 * most common attack against exactly this flow. It is one sentence and it is
 * the most valuable copy on the screen.
 */
export default function SignIn() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState("");

  const ready = phone.replace(/\D/g, "").length === 10;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.void }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* A single pool of gold light behind everything. The only decoration on
          the screen, and it does the job a hero image would without a download. */}
      <LinearGradient
        colors={["rgba(230,195,107,0.13)", "transparent"]}
        style={{ position: "absolute", left: 0, right: 0, top: 0, height: 420 }}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
      />

      <View
        style={{
          flex: 1,
          paddingHorizontal: space.xl,
          paddingTop: insets.top,
          paddingBottom: Math.max(insets.bottom, space.xl),
          justifyContent: "center",
          gap: space.xl,
        }}
      >
        <Animated.View entering={FadeIn.duration(500)}>
          <View style={styles.mark}>
            <Text style={styles.markText}>L</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(420)}>
          <Text style={[text.hero, { color: C.text }]}>
            Paperwork,{"\n"}without the queue.
          </Text>
          <Text style={[text.body, { color: C.textDim, marginTop: space.md, lineHeight: 22 }]}>
            Sign in with your phone number. We send a one-time code, so there is
            no password to forget.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(160).duration(420)} style={{ gap: space.md }}>
          <Label tone={C.gold}>Mobile number</Label>
          <View style={styles.field}>
            <Text style={[text.body, { color: C.text, fontFamily: font.mono }]}>+91</Text>
            <View style={styles.divider} />
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="00000 00000"
              placeholderTextColor={C.textFaint}
              keyboardType="phone-pad"
              maxLength={11}
              accessibilityLabel="Mobile number"
              style={styles.input}
            />
          </View>

          <Button
            label="Send code"
            disabled={!ready}
            onPress={() => router.replace("/(tabs)")}
          />

          <Touch
            onPress={() => router.replace("/(tabs)")}
            accessibilityLabel="Look around without signing in"
            style={{ minHeight: 44, alignItems: "center", justifyContent: "center" }}
          >
            <Text style={[text.small, { color: C.textDim }]}>Look around first</Text>
          </Touch>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).duration(420)} style={styles.warn}>
          <Icon name="shield" size={17} color={C.gold} />
          <Text style={[text.tiny, { color: C.textDim, flex: 1, lineHeight: 17 }]}>
            We never ask for your Aadhaar photocopy, your OTP or a bank password.
            Nobody from LAWFIC will call and ask for one.
          </Text>
        </Animated.View>

        <Text style={[text.tiny, { color: C.textFaint, lineHeight: 17 }]}>
          By continuing you accept the{" "}
          <Text style={{ color: C.gold }}>Terms</Text> and{" "}
          <Text style={{ color: C.gold }}>Privacy Policy</Text>.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  mark: {
    width: 58,
    height: 58,
    borderRadius: radius.md,
    backgroundColor: C.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  markText: {
    fontFamily: font.displayBold,
    fontSize: 26,
    color: "#1A1405",
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    minHeight: 58,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    backgroundColor: C.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.hairline,
  },
  divider: { width: StyleSheet.hairlineWidth, height: 24, backgroundColor: C.hairline },
  input: {
    flex: 1,
    minHeight: 52,
    color: C.text,
    fontFamily: font.mono,
    fontSize: 16,
    letterSpacing: 1,
    padding: 0,
  },
  warn: { flexDirection: "row", gap: space.md, alignItems: "flex-start" },
});
