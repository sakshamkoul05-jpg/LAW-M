import React, { useEffect, useState } from "react";
import { pop } from "@/ui/enter";
import { Platform, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeIn, FadeInDown, ZoomIn, useAnimatedProps, useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming } from "react-native-reanimated";
import Svg, { Circle, Path } from "react-native-svg";
import { MAX_TOPUP_PAISE, MIN_TOPUP_PAISE } from "@/lawfic/money";
import { Icon, type IconName } from "@/icons/Icon";
import { useStore } from "@/lib/store";
import { reconcile, startTopUp } from "@/lib/live";
import { useLock } from "@/lib/lock";
import { groupIndian, rupees } from "@/lib/format";
import { useDevice, useLayout } from "@/components/AppWidth";
import { AnimatedMoney, Button, Dots, Field, Glow, IconButton, Press, Sheet, T, buzz } from "@/ui";
import { color as C, font, motion, radius as R, space, themed } from "@/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const PRESETS = [500, 1000, 2500, 5000];
const METHODS: { id: string; label: string; icon: IconName; note: string }[] = [
  { id: "UPI", label: "UPI", icon: "upi", note: "Any UPI app" },
  { id: "Card", label: "Card", icon: "card", note: "Debit or credit" },
  { id: "Net banking", label: "Net banking", icon: "bank", note: "All major banks" },
];

/**
 * Adding money.
 *
 * The limits are the website's (lib/money.ts): at least ₹1, at most
 * ₹1,00,000 in one top-up, whole rupees. Type past the ceiling and the number
 * shakes once and says why — it does not silently stop accepting digits.
 *
 * PREVIEW: no gateway is called. On lawfic.pro this step hands over to
 * Cashfree; here the money is added to the sample wallet so the flow can be
 * felt end to end, and every screen says so.
 */
export default function AddMoney() {
  const router = useRouter();
  const params = useLocalSearchParams<{ amount?: string }>();
  const layout = useLayout();
  const { short } = useDevice();
  const insets = useSafeAreaInsets();
  const { topUp, balance, mode, refresh, onLive } = useStore();
  const live = mode === "live";
  const lock = useLock();
  const [amount, setAmount] = useState(params.amount ? String(Math.min(Number(params.amount) || 0, MAX_TOPUP_PAISE / 100)) : "");
  const [method, setMethod] = useState("UPI");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<number | null>(null);
  /* Live: waiting for Cashfree to confirm, and the phone number Cashfree
     needs on its receipt when the profile has none. */
  const [confirming, setConfirming] = useState<string | null>(null);
  const [askPhone, setAskPhone] = useState(false);
  const [phone, setPhone] = useState("");
  const [phoneErr, setPhoneErr] = useState<string | null>(null);
  const shake = useSharedValue(0);

  const rupeesN = Number(amount || "0");
  const paise = rupeesN * 100;
  const ok = paise >= MIN_TOPUP_PAISE && paise <= MAX_TOPUP_PAISE;

  const refuse = (msg: string) => {
    setError(msg);
    buzz("medium");
    shake.value = withSequence(withTiming(-10, { duration: 50 }), withTiming(10, { duration: 70 }), withTiming(-6, { duration: 60 }), withTiming(0, { duration: 60 }));
  };

  const press = (k: string) => {
    setError(null);
    if (k === "del") return setAmount((a) => a.slice(0, -1));
    const next = (amount + k).replace(/^0+(?=\d)/, "");
    if (Number(next) * 100 > MAX_TOPUP_PAISE) return refuse(`One top-up can be at most ${rupees(MAX_TOPUP_PAISE)}.`);
    if (next.length > 6) return;
    buzz("select");
    setAmount(next);
  };

  /* Desktop: type the amount on the keyboard. */
  useEffect(() => {
    if (Platform.OS !== "web" || done !== null) return;
    const h = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) press(e.key);
      else if (e.key === "Backspace") press("del");
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  const pay = async () => {
    if (!ok) {
      refuse(paise < MIN_TOPUP_PAISE ? `Enter at least ${rupees(MIN_TOPUP_PAISE)}.` : `At most ${rupees(MAX_TOPUP_PAISE)}.`);
      return false;
    }
    if (lock.enabled && !lock.unlocked && !(await lock.unlock())) return false;
    if (live) return payLive();
    await new Promise((r) => setTimeout(r, 900));
    const r = topUp(paise, method);
    if (!r.ok) {
      refuse(r.error);
      return false;
    }
    setTimeout(() => setDone(paise), 500);
    return true;
  };

  /**
   * A real top-up. The website opens the Cashfree order; Cashfree's own
   * checkout takes the payment in an in-app browser; then the app asks the
   * website to confirm it with Cashfree. The wallet is only ever credited by
   * the website — the webhook, or this reconcile — never by the app.
   */
  const payLive = async (withPhone?: string): Promise<boolean> => {
    const r = await startTopUp(rupeesN, withPhone);
    if (!r.ok) {
      if (r.needsPhone) {
        setAskPhone(true);
        setPhoneErr(withPhone ? r.error : null);
        return false;
      }
      refuse(r.error);
      return false;
    }
    setAskPhone(false);
    void confirm(r.value.orderId);
    return true;
  };

  const confirm = async (orderId: string) => {
    setConfirming(orderId);
    const before = balance;
    let landed = false;
    const off = onLive((e) => {
      if (e.kind === "credit") landed = true;
    });
    for (let i = 0; i < 40 && !landed; i++) {
      const state = await reconcile(orderId);
      if (state === "credited") landed = true;
      else if (state === "unknown") break;
      else await new Promise((res) => setTimeout(res, 2500));
    }
    off();
    await refresh();
    setConfirming(null);
    if (landed) setDone(paise);
    else refuse("Not confirmed yet. If you paid, it will reach your wallet on its own within a few minutes.");
    void before;
  };

  if (confirming) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: "center", justifyContent: "center", padding: space.xl, paddingTop: insets.top }}>
        <Glow height={520} strength={1.3} />
        <Dots color={C.gold} size={8} />
        <T v="title3" center style={{ marginTop: space.xl }}>
          Confirming with Cashfree
        </T>
        <T v="callout" center style={{ marginTop: 6, maxWidth: 320 }}>
          Finish paying in the window that opened. Your wallet updates the moment Cashfree confirms.
        </T>
        <Button label="I've closed the payment window" variant="ghost" onPress={() => void reconcile(confirming).then((s) => s === "credited" && setDone(paise))} style={{ marginTop: space.xxl }} full={false} />
      </View>
    );
  }

  if (done !== null) return <Success paise={done} balance={balance} onDone={() => (router.canGoBack() ? router.back() : router.replace("/wallet"))} />;

  const digits = amount ? groupIndian(rupeesN) : "0";
  const wide = layout !== "compact";

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top }}>
      <Glow height={420} />
      <View style={styles.bar}>
        <IconButton icon="close" label="Close" onPress={() => (router.canGoBack() ? router.back() : router.replace("/wallet"))} />
        <T v="headline">Add money</T>
        <View style={{ width: 40 }} />
      </View>

      <View style={[styles.body, { maxWidth: 520 }]}>
        <View style={{ alignItems: "center", marginTop: short ? space.sm : wide ? space.section : space.xl }}>
          <T v="label">Amount</T>
          <Animated.View style={[styles.amount, shakeStyle]} accessibilityLabel={`${digits} rupees`} accessibilityLiveRegion="polite">
            <T style={{ fontFamily: font.medium, fontSize: 30, color: C.textDim, marginTop: 10, marginRight: 4 }}>₹</T>
            {digits.split("").map((ch, i) => (
              <Animated.Text key={`${i}-${digits.length}`} entering={i === digits.length - 1 && amount ? pop() : undefined} style={[styles.digit, short && { fontSize: 50 }, !amount && { color: C.textMuted }]}>
                {ch}
              </Animated.Text>
            ))}
          </Animated.View>
          {error ? (
            <Animated.View entering={FadeIn} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Icon name="alert" size={13} color={C.red} />
              <T v="caption" color={C.red}>
                {error}
              </T>
            </Animated.View>
          ) : (
            <T v="caption">
              {rupees(MIN_TOPUP_PAISE)} to {rupees(MAX_TOPUP_PAISE)} · balance after {rupees(balance + (ok ? paise : 0))}
            </T>
          )}
        </View>

        <View style={[styles.presets, short && { marginTop: space.md }]}>
          {PRESETS.map((p) => (
            <Press
              key={p}
              onPress={() => {
                setError(null);
                setAmount(String(p));
              }}
              haptic="select"
              radius={R.pill}
              accessibilityLabel={`${p} rupees`}
              style={[styles.preset, { flex: 1 }, rupeesN === p && styles.presetOn]}
            >
              <T v="calloutMedium" num color={rupeesN === p ? C.gold : C.text}>
                {rupees(p * 100)}
              </T>
            </Press>
          ))}
        </View>

        {live ? (
          <View style={[styles.cashfree, short && { marginTop: space.md }]}>
            <Icon name="shield" size={18} color={C.gold} />
            <View style={{ flex: 1 }}>
              <T v="calloutMedium">Cashfree secure checkout</T>
              <T v="caption">UPI, cards and net banking. Your payment details go to Cashfree, never to LAWFIC.</T>
            </View>
          </View>
        ) : (
        <View style={[styles.methods, short && { marginTop: space.md }]} accessibilityRole="radiogroup">
          {METHODS.map((m) => {
            const on = method === m.id;
            return (
              <Press key={m.id} onPress={() => setMethod(m.id)} haptic="select" radius={R.lg} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={m.label} style={[styles.method, on && styles.methodOn]}>
                <Icon name={m.icon} size={20} color={on ? C.gold : C.textDim} />
                <T v="captionMedium" color={on ? C.text : C.textDim}>
                  {m.label}
                </T>
                <T v="micro">{m.note}</T>
                {on && (
                  <Animated.View entering={pop()} style={styles.tick}>
                    <Icon name="check" size={10} color={C.ink} strokeWidth={3} />
                  </Animated.View>
                )}
              </Press>
            );
          })}
        </View>
        )}

        <View style={{ flex: 1 }} />

        {!wide && (
          <View style={styles.pad}>
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", "del"].map((k) => (
              <Press key={k} onPress={() => press(k)} lift={false} haptic="none" radius={R.lg} accessibilityLabel={k === "del" ? "Delete" : k} style={[styles.key, short && { height: 46 }]}>
                {k === "del" ? <Icon name="chevronLeft" size={24} color={C.text} /> : <T style={{ fontFamily: font.medium, fontSize: 26, color: C.text }}>{k}</T>}
              </Press>
            ))}
          </View>
        )}
        {wide && (
          <T v="caption" center style={{ marginBottom: space.lg }}>
            Type the amount on your keyboard, or pick one above.
          </T>
        )}

        <View style={{ paddingBottom: Math.max(insets.bottom, space.lg), gap: 8 }}>
          <Button label={ok ? (live ? `Pay ${rupees(paise)} securely` : `Add ${rupees(paise)} with ${method}`) : "Enter an amount"} icon={lock.enabled ? "faceid" : live ? "lock" : undefined} onPress={pay} disabled={!amount} />
          <T v="caption" center>
            {live ? "Credited to your LAWFIC wallet on lawfic.pro and in the app" : "Demo · no payment is taken"}
          </T>
        </View>
      </View>

      <Sheet open={askPhone} onClose={() => setAskPhone(false)} title="A mobile number for the receipt" subtitle="Cashfree needs one on every payment. It is saved to your profile so you are asked only once.">
        <View style={{ gap: space.md }}>
          <Field label="Mobile number" prefix="+91" value={phone} onChangeText={(t) => { setPhone(t.replace(/\D/g, "").slice(0, 10)); setPhoneErr(null); }} keyboardType="phone-pad" error={phoneErr} />
          <Button label={`Continue to pay ${rupees(paise)}`} onPress={() => (/^[6-9]\d{9}$/.test(phone) ? payLive(phone) : (setPhoneErr("Ten digits, starting 6, 7, 8 or 9."), false))} />
        </View>
      </Sheet>
    </View>
  );
}

/** Money arrived: a ring draws, a check strokes in, the new balance counts up. */
function Success({ paise, balance, onDone }: { paise: number; balance: number; onDone: () => void }) {
  const ring = useSharedValue(0);
  const tick = useSharedValue(0);
  const scale = useSharedValue(0.6);
  useEffect(() => {
    buzz("success");
    scale.value = withSpring(1, motion.arrive);
    ring.value = withTiming(1, { duration: 700 });
    tick.value = withDelay(450, withTiming(1, { duration: 380 }));
  }, [ring, tick, scale]);
  const R0 = 46;
  const circ = 2 * Math.PI * R0;
  const ringProps = useAnimatedProps(() => ({ strokeDashoffset: circ * (1 - ring.value) }));
  const tickProps = useAnimatedProps(() => ({ strokeDashoffset: 60 * (1 - tick.value) }));
  const pop = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, alignItems: "center", justifyContent: "center", padding: space.xl }}>
      <Glow height={520} strength={1.6} />
      <Animated.View style={pop}>
        <Svg width={110} height={110}>
          <Circle cx={55} cy={55} r={R0} stroke={C.goldWash} strokeWidth={4} fill="none" />
          <AnimatedCircle cx={55} cy={55} r={R0} stroke={C.gold} strokeWidth={4} fill="none" strokeLinecap="round" strokeDasharray={`${circ} ${circ}`} animatedProps={ringProps} transform="rotate(-90 55 55)" />
          <AnimatedPath d="M36 56 L50 69 L75 42" stroke={C.gold} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="60 60" animatedProps={tickProps} />
        </Svg>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(500).duration(420)} style={{ alignItems: "center", marginTop: space.xl }}>
        <T v="label" tone="gold">
          Added to your wallet
        </T>
        <T v="display" num style={{ marginTop: 6 }}>
          {rupees(paise)}
        </T>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: space.lg }}>
          <T v="callout">New balance</T>
        </View>
        <AnimatedMoney paise={balance} size={30} />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(700)} style={{ width: "100%", maxWidth: 420, marginTop: space.section }}>
        <Button label="Done" onPress={onDone} />
        <T v="caption" center style={{ marginTop: 8 }}>
          A receipt is in your document vault.
        </T>
      </Animated.View>
    </View>
  );
}

const styles = themed(() => ({
  bar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.lg, height: 56 },
  body: { flex: 1, width: "100%", alignSelf: "center", paddingHorizontal: space.xl },
  amount: { flexDirection: "row", alignItems: "flex-start", marginVertical: space.md, minHeight: 72 },
  digit: { fontFamily: font.semibold, fontSize: 62, letterSpacing: -2.4, color: C.text, fontVariant: ["tabular-nums"] },
  presets: { flexDirection: "row", justifyContent: "center", gap: space.sm, marginTop: space.xl },
  preset: { height: 38, paddingHorizontal: 6, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: C.surface, borderWidth: 1, borderColor: C.line },
  presetOn: { borderColor: C.gold, backgroundColor: C.goldWash },
  methods: { flexDirection: "row", gap: space.sm, marginTop: space.xl },
  method: { flex: 1, alignItems: "center", gap: 4, paddingVertical: space.md, borderRadius: R.lg, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line },
  methodOn: { borderColor: C.gold, backgroundColor: C.goldSelect },
  cashfree: { flexDirection: "row", alignItems: "center", gap: space.md, marginTop: space.xl, padding: space.lg, borderRadius: R.lg, backgroundColor: C.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: C.goldLine },
  tick: { position: "absolute", top: 6, right: 6, width: 16, height: 16, borderRadius: 8, backgroundColor: C.gold, alignItems: "center", justifyContent: "center" },
  pad: { flexDirection: "row", flexWrap: "wrap", marginBottom: space.md },
  key: { width: "33.33%", height: 58, alignItems: "center", justifyContent: "center" },
}));
