import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import Animated, { Easing, FadeIn, FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { isValidPhone } from "@/lawfic/profile";
import { useAppWidth, useDevice } from "@/components/AppWidth";
import { useAuth } from "@/lib/auth";
import { OTP_LENGTH } from "@/lib/supabase-config";
import { useStore } from "@/lib/store";
import { Icon } from "@/icons/Icon";
import { Button, CodeInput, Field, Glow, IconButton, Logo, Press, T, useToast } from "@/ui";
import { color as C, radius as R, space, themed } from "@/theme";

type Step = "start" | "signin" | "signup" | "verify" | "setup" | "forgot";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Welcome, and your LAWFIC account.
 *
 * The same account as lawfic.pro: email and password, and a new account
 * confirms its address with the code Supabase emails (OTP_LENGTH digits). Sign up here and you can sign in
 * on the website, and the other way round — both read the same filings,
 * wallet and messages.
 *
 * The badge logo leads, drifting on a slow breath. Each step slides in from
 * below; the logo shrinks once a form needs the room.
 */
export default function Welcome() {
  const router = useRouter();
  const width = useAppWidth();
  const { short } = useDevice();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const auth = useAuth();
  const { state, updateProfile } = useStore();

  const [step, setStep] = useState<Step>("start");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState<Record<string, string | undefined>>({});
  const [codeBad, setCodeBad] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const drift = useSharedValue(0);
  useEffect(() => {
    drift.value = withRepeat(withSequence(withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: 3200, easing: Easing.inOut(Easing.sin) })), -1);
  }, [drift]);
  const float = useAnimatedStyle(() => ({ transform: [{ translateY: -6 * drift.value }] }));
  const glow = useAnimatedStyle(() => ({ opacity: 0.6 + drift.value * 0.4 }));

  /* Signed in with nothing left to ask: straight in. */
  useEffect(() => {
    if (auth.mode === "live" && step !== "setup" && step !== "verify") router.replace("/");
  }, [auth.mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const big = step === "start";
  const logoW = big ? Math.min(width * 0.56, short ? 170 : 230) : short ? 90 : 120;

  const go = (s: Step) => {
    setErr({});
    setNote(null);
    setStep(s);
  };

  const signIn = async () => {
    const e: typeof err = {};
    if (!EMAIL_RE.test(email.trim())) e.email = "Enter your email address.";
    if (!password) e.password = "Enter your password.";
    setErr(e);
    if (e.email || e.password) return false;
    const r = await auth.signIn(email, password);
    if (!r.ok) {
      if (/confirm your email/i.test(r.error)) {
        await auth.resendCode(email);
        go("verify");
        setNote("Your email is not confirmed yet. We sent a new code.");
        return false;
      }
      setErr({ form: r.error });
      return false;
    }
    return true;
  };

  const signUp = async () => {
    const e: typeof err = {};
    if (!EMAIL_RE.test(email.trim())) e.email = "Enter a valid email address.";
    if (password.length < 8) e.password = "Use at least 8 characters.";
    setErr(e);
    if (e.email || e.password) return false;
    const r = await auth.signUp(email, password);
    if (!r.ok) {
      setErr({ form: r.error });
      return false;
    }
    if ("alreadyConfirmed" in r) {
      go("signin");
      setNote("That email already has an account. Sign in with its password.");
      return true;
    }
    go("verify");
    return true;
  };

  const shakeCode = () => {
    setCodeBad(true);
    setTimeout(() => setCodeBad(false), 400);
  };

  const verify = async () => {
    if (code.length !== OTP_LENGTH) {
      shakeCode();
      return false;
    }
    const r = await auth.verifyCode(email, code);
    if (!r.ok) {
      setErr({ code: r.error });
      shakeCode();
      return false;
    }
    go("setup");
    return true;
  };

  const saveSetup = async () => {
    const e: typeof err = {};
    if (!name.trim()) e.name = "What should we call you?";
    if (phone && !isValidPhone(phone)) e.phone = "Ten digits, starting 6, 7, 8 or 9.";
    setErr(e);
    if (e.name || e.phone) return false;
    const r = await updateProfile({ fullName: name.trim(), phone, onboarded: true });
    if (!r.ok) {
      setErr({ form: r.error });
      return false;
    }
    setTimeout(() => router.replace("/"), 400);
    return true;
  };

  const forgot = async () => {
    if (!EMAIL_RE.test(email.trim())) {
      setErr({ email: "Enter the email on your account." });
      return false;
    }
    const r = await auth.resetPassword(email);
    if (!r.ok) {
      setErr({ form: r.error });
      return false;
    }
    setNote(`If ${email.trim()} has an account, a link to set a new password is on its way. It opens lawfic.pro.`);
    return true;
  };

  const demo = () => {
    auth.enterDemo();
    void updateProfile({ onboarded: true, fullName: state.profile.fullName || "Guest" });
    router.replace("/");
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Glow height={620} strength={1.6} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.wrap, { paddingTop: insets.top + space.md, paddingBottom: insets.bottom + space.xl }]} keyboardShouldPersistTaps="handled">
          <View style={styles.top}>{step !== "start" && step !== "setup" ? <IconButton icon="back" label="Back" onPress={() => go(step === "verify" ? "signup" : "start")} size={38} /> : null}</View>

          <Animated.View entering={FadeIn.duration(900)} style={[styles.logoWrap, { marginTop: big ? (short ? space.md : space.xxl) : 0, marginBottom: big ? (short ? space.lg : space.xxxl) : space.xl }]}>
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

          <Animated.View key={step} entering={FadeInUp.duration(380)} style={{ gap: space.lg }}>
            {step === "start" && (
              <>
                <View>
                  <T v="title1" center>
                    Your legal wallet.
                  </T>
                  <T v="body" center style={{ marginTop: 8 }}>
                    Filings, documents and payments for your registrations and certificates — one LAWFIC account, on the app and on lawfic.pro.
                  </T>
                </View>
                <View style={{ gap: space.sm, marginTop: space.sm }}>
                  <Button label="Sign in" onPress={() => go("signin")} />
                  <Button label="Create an account" variant="secondary" onPress={() => go("signup")} />
                  <Button label="Explore the demo first" variant="ghost" onPress={demo} />
                </View>
                <Safety />
              </>
            )}

            {step === "signin" && (
              <>
                <Heading title="Welcome back" body="Sign in with the email and password you use on lawfic.pro." />
                {note && <Note text={note} />}
                <Field label="Email" icon="mail" value={email} onChangeText={(t) => { setEmail(t); setErr({}); }} error={err.email} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="username" />
                <Field label="Password" icon="key" value={password} onChangeText={(t) => { setPassword(t); setErr({}); }} error={err.password} secureTextEntry autoComplete="password" textContentType="password" />
                {err.form && <FormError text={err.form} />}
                <Button label="Sign in" icon="forward" onPress={signIn} successLabel="Signed in" />
                <View style={styles.links}>
                  <Press onPress={() => go("forgot")} radius={10} lift={false} accessibilityLabel="Forgot password" hitSlop={8}>
                    <T v="calloutMedium" tone="gold">
                      Forgot password?
                    </T>
                  </Press>
                  <Press onPress={() => go("signup")} radius={10} lift={false} accessibilityLabel="Create an account" hitSlop={8}>
                    <T v="calloutMedium" tone="dim">
                      New here? Create an account
                    </T>
                  </Press>
                </View>
              </>
            )}

            {step === "signup" && (
              <>
                <Heading title="Create your account" body="One account for the app and lawfic.pro. We will email you a code to confirm it is you." />
                <Field label="Email" icon="mail" value={email} onChangeText={(t) => { setEmail(t); setErr({}); }} error={err.email} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="username" />
                <Field label="Choose a password" icon="key" value={password} onChangeText={(t) => { setPassword(t); setErr({}); }} error={err.password} hint="At least 8 characters." secureTextEntry autoComplete="new-password" textContentType="newPassword" />
                <PasswordMeter value={password} />
                {err.form && <FormError text={err.form} />}
                <Button label="Send my code" icon="send" onPress={signUp} />
                <Press onPress={() => go("signin")} radius={10} lift={false} accessibilityLabel="Sign in instead" style={{ alignSelf: "center" }} hitSlop={8}>
                  <T v="calloutMedium" tone="dim">
                    Already have an account? Sign in
                  </T>
                </Press>
              </>
            )}

            {step === "verify" && (
              <>
                <Heading title="Check your email" body={`Enter the ${OTP_LENGTH}-digit code we sent to ${email.trim()}.`} />
                {note && <Note text={note} />}
                <CodeInput length={OTP_LENGTH} value={code} onChange={(v) => { setCode(v); setErr({}); }} error={codeBad} />
                {err.code && <FormError text={err.code} />}
                <Button label="Confirm" icon="check" onPress={verify} successLabel="Confirmed" disabled={code.length !== OTP_LENGTH} />
                <Press
                  onPress={async () => {
                    const r = await auth.resendCode(email);
                    if (r.ok) toast({ title: "New code sent", body: "Use the newest one — older codes stop working." });
                    else toast({ title: r.error, tone: "bad" });
                  }}
                  radius={10}
                  lift={false}
                  accessibilityLabel="Send a new code"
                  style={{ alignSelf: "center" }}
                  hitSlop={8}
                >
                  <T v="calloutMedium" tone="gold">
                    Send a new code
                  </T>
                </Press>
                <T v="caption" center>
                  Not there? Check spam or promotions. Codes expire after a few minutes.
                </T>
              </>
            )}

            {step === "setup" && (
              <>
                <Heading title="You're in" body="Two details and your account is ready. The same profile shows on lawfic.pro." />
                <Field label="Your name" icon="account" value={name} onChangeText={(t) => { setName(t); setErr({}); }} error={err.name} autoComplete="name" />
                <Field label="Mobile number" prefix="+91" value={phone} onChangeText={(t) => { setPhone(t.replace(/\D/g, "").slice(0, 10)); setErr({}); }} error={err.phone} hint="Optional — Cashfree needs it on payment receipts." keyboardType="phone-pad" />
                {err.form && <FormError text={err.form} />}
                <Button label="Open my wallet" icon="forward" onPress={saveSetup} successLabel="Welcome" />
              </>
            )}

            {step === "forgot" && (
              <>
                <Heading title="Reset your password" body="We will email a link. It opens lawfic.pro, where you choose a new password — then sign in here with it." />
                {note && <Note text={note} />}
                <Field label="Email" icon="mail" value={email} onChangeText={(t) => { setEmail(t); setErr({}); }} error={err.email} keyboardType="email-address" autoCapitalize="none" />
                {err.form && <FormError text={err.form} />}
                <Button label="Email me a link" icon="send" onPress={forgot} successLabel="Sent" />
              </>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Heading({ title, body }: { title: string; body: string }) {
  return (
    <View>
      <T v="title2" center>
        {title}
      </T>
      <T v="callout" center style={{ marginTop: 6 }}>
        {body}
      </T>
    </View>
  );
}

function Note({ text }: { text: string }) {
  return (
    <Animated.View entering={FadeInDown.duration(260)} style={styles.note}>
      <Icon name="info" size={15} color={C.gold} />
      <T v="caption" tone="dim" style={{ flex: 1 }}>
        {text}
      </T>
    </Animated.View>
  );
}

function FormError({ text }: { text: string }) {
  return (
    <Animated.View entering={FadeInDown.duration(220)} style={[styles.note, { backgroundColor: C.redWash }]} accessibilityRole="alert">
      <Icon name="alert" size={15} color={C.red} />
      <T v="caption" color={C.red} style={{ flex: 1 }}>
        {text}
      </T>
    </Animated.View>
  );
}

/** A quiet four-step strength bar — length and variety, nothing preachy. */
function PasswordMeter({ value }: { value: string }) {
  const score = !value ? 0 : Math.min(4, (value.length >= 8 ? 1 : 0) + (value.length >= 12 ? 1 : 0) + (/[A-Z]/.test(value) && /[a-z]/.test(value) ? 1 : 0) + (/\d/.test(value) || /[^A-Za-z0-9]/.test(value) ? 1 : 0));
  const label = ["", "Fair", "Good", "Strong", "Very strong"][score];
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: -space.sm, paddingHorizontal: 4 }}>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: i < score ? (score >= 3 ? C.green : C.gold) : C.surfaceTop }} />
      ))}
      <T v="micro" style={{ width: 70, textAlign: "right" }}>
        {label}
      </T>
    </View>
  );
}

function Safety() {
  return (
    <View style={[styles.note, { backgroundColor: "transparent", paddingHorizontal: 0, marginTop: space.md }]}>
      <Icon name="shield" size={15} color={C.textMuted} />
      <T v="caption" style={{ flex: 1 }}>
        LAWFIC will never ask for your password, an OTP or an Aadhaar photocopy on a call or message.
      </T>
    </View>
  );
}

const styles = themed(() => ({
  wrap: { flexGrow: 1, paddingHorizontal: space.xl, width: "100%", maxWidth: 480, alignSelf: "center" },
  top: { height: 40, justifyContent: "center" },
  logoWrap: { alignItems: "center", justifyContent: "center" },
  links: { flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", gap: space.md },
  note: { flexDirection: "row", gap: 10, padding: space.md, borderRadius: R.md, backgroundColor: C.goldWash, alignItems: "flex-start" },
}));
