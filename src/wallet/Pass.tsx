import React, { useEffect, useMemo } from "react";
import { Image, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Defs, LinearGradient as SvgLinear, Path, RadialGradient, Rect, Stop } from "react-native-svg";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  Easing,
  type SharedValue,
} from "react-native-reanimated";
import { Icon, type IconName } from "@/icons/Icon";
import { AnimatedMoney, T, buzz } from "@/ui";
import { pad2 } from "@/lib/format";
import { color as C, elevation, font, motion } from "@/theme";

/**
 * The LAWFIC pass.
 *
 * WHAT IT IS, AND WHAT IT IS NOT
 *
 * A pass, not a payment card. LAWFIC issues no card and nothing it holds can
 * be tapped at a till, so the face carries no chip, no sixteen-digit number,
 * no network mark and no expiry — the four things that would tell somebody it
 * works in a shop. It carries what a legal wallet actually holds: the balance,
 * the filings in motion, the documents kept.
 *
 * WHY IT MOVES
 *
 * On a desktop the pass turns a few degrees toward the cursor and a soft light
 * follows the pointer across its face. On a phone the same happens under a
 * finger. That light is the whole trick: a gradient rectangle becomes an object
 * with a surface the moment something catches on it. It is kept to single
 * degrees on purpose — the goal is "that is a real card", not "that is an
 * effect".
 */

export type PassKind = "wallet" | "filings" | "vault" | "membership";

export const PASS_RATIO = 1.586;

type Material = { bg: readonly [string, string, string]; ink: string; dim: string; accent: string; line: string };

const MATERIAL: Record<PassKind, Material> = {
  wallet: { bg: ["#23201B", "#0F0E0D", "#060606"], ink: C.text, dim: "rgba(245,243,238,0.5)", accent: C.gold, line: "rgba(198,161,91,0.16)" },
  filings: { bg: ["#1D1D1F", "#111112", "#08080A"], ink: C.text, dim: "rgba(245,243,238,0.5)", accent: C.goldLight, line: "rgba(255,255,255,0.07)" },
  vault: { bg: ["#2A2118", "#15110D", "#0A0806"], ink: "#F3E7D3", dim: "rgba(243,231,211,0.52)", accent: C.goldLight, line: "rgba(224,199,131,0.12)" },
  membership: { bg: ["#EAD7A6", "#CBAA67", "#9C7A3C"], ink: "#1C150A", dim: "rgba(28,21,10,0.58)", accent: "#1C150A", line: "rgba(28,21,10,0.12)" },
};

export type PassData = {
  balancePaise: number;
  hidden: boolean;
  active: number;
  awaiting: number;
  documents: number;
  verified: number;
  secured: boolean;
  plan: string | null;
  discount: number | null;
  holder: string | null;
  /** Increments when money lands, so the pass can catch the light. */
  flash?: number;
};

/** The interactive wrapper: tilt, light, press. Faces render inside it. */
export function TiltCard({
  width,
  onPress,
  children,
  label,
  interactive = true,
}: {
  width: number;
  onPress?: () => void;
  children: (light: { px: SharedValue<number>; py: SharedValue<number>; on: SharedValue<number> }) => React.ReactNode;
  label: string;
  interactive?: boolean;
}) {
  const height = Math.round(width / PASS_RATIO);
  const rx = useSharedValue(0);
  const ry = useSharedValue(0);
  const px = useSharedValue(0.3);
  const py = useSharedValue(0.2);
  const on = useSharedValue(0);
  const scale = useSharedValue(1);

  const track = (x: number, y: number) => {
    "worklet";
    const nx = Math.max(0, Math.min(1, x / width));
    const ny = Math.max(0, Math.min(1, y / height));
    px.value = nx;
    py.value = ny;
    ry.value = withSpring((nx - 0.5) * 2, motion.press);
    rx.value = withSpring(-(ny - 0.5) * 2, motion.press);
  };
  const release = () => {
    "worklet";
    rx.value = withSpring(0, motion.arrive);
    ry.value = withSpring(0, motion.arrive);
    on.value = withTiming(0, { duration: 400 });
  };

  const hover = Gesture.Hover()
    .enabled(interactive)
    .onBegin(() => {
      on.value = withTiming(1, { duration: 220 });
    })
    .onUpdate((e) => track(e.x, e.y))
    .onEnd(release)
    .onFinalize(release);

  /* Press-and-hold to tilt. A quick swipe belongs to whatever scrolls the
     pass (the Home carousel); holding first says "I want to handle this". */
  const pan = Gesture.Pan()
    .enabled(interactive)
    .activateAfterLongPress(220)
    .onBegin((e) => {
      on.value = withTiming(1, { duration: 160 });
      track(e.x, e.y);
    })
    .onUpdate((e) => track(e.x, e.y))
    .onFinalize(release);

  const tap = Gesture.Tap()
    .maxDuration(300)
    .onBegin(() => {
      scale.value = withSpring(0.975, motion.press);
    })
    .onFinalize((_e, ok) => {
      scale.value = withSpring(1, motion.press);
      if (ok && onPress) {
        runOnJS(buzz)("medium");
        runOnJS(onPress)();
      }
    });

  const style = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateX: `${rx.value * 6}deg` },
      { rotateY: `${ry.value * 8}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={Gesture.Simultaneous(hover, pan, tap)}>
      <Animated.View
        accessibilityRole={onPress ? "button" : "image"}
        accessibilityLabel={label}
        style={[{ width, height }, elevation.card, style]}
      >
        {children({ px, py, on })}
      </Animated.View>
    </GestureDetector>
  );
}

/** Surface effects shared by every face: engraving, sheen, pointer light, rim. */
function Finish({
  kind,
  width,
  height,
  px,
  py,
  on,
  flash,
}: {
  kind: PassKind;
  width: number;
  height: number;
  px: SharedValue<number>;
  py: SharedValue<number>;
  on: SharedValue<number>;
  flash?: number;
}) {
  const m = MATERIAL[kind];
  const light = kind === "membership";



  /* A sheen crosses the pass every few seconds. Slow, and once — a card on a
     desk catching a window, not a loading bar. */
  const sweep = useSharedValue(-1);
  useEffect(() => {
    sweep.value = withDelay(
      900,
      withRepeat(withSequence(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.cubic) }), withTiming(1, { duration: 6000 }), withTiming(-1, { duration: 0 })), -1),
    );
  }, [sweep]);
  const sheen = useAnimatedStyle(() => ({ transform: [{ translateX: sweep.value * width * 1.2 }, { rotate: "18deg" }] }));

  /* Money landed: a warm burst across the whole pass and a fast sheen, once.
     The only time the pass moves on its own — which is why it registers. */
  const burst = useSharedValue(0);
  useEffect(() => {
    if (!flash) return;
    burst.value = withSequence(withTiming(1, { duration: 260 }), withTiming(0, { duration: 1100 }));
    sweep.value = withSequence(withTiming(-1, { duration: 0 }), withTiming(1, { duration: 750, easing: Easing.out(Easing.cubic) }));
  }, [flash]); // eslint-disable-line react-hooks/exhaustive-deps
  const burstStyle = useAnimatedStyle(() => ({ opacity: burst.value * 0.32 }));

  const spot = width * 1.3;
  const glare = useAnimatedStyle(() => ({
    opacity: on.value * (light ? 0.35 : 0.9),
    transform: [{ translateX: px.value * width - spot / 2 }, { translateY: py.value * height - spot / 2 }],
  }));
  /* A counter-shadow on the far side of the light, so the tilt reads as depth
     and not just as a brighter patch. */
  const falloff = useAnimatedStyle(() => ({ opacity: on.value * interpolate(px.value, [0, 1], [0.35, 0.1]) }));

  return (
    <>
      <Engraving kind={kind} w={width} h={height} tone={m.line} />
      <Animated.View pointerEvents="none" style={[styles.sheen, { height: height * 2.2, top: -height * 0.6, left: width * 0.3 }, sheen]}>
        <LinearGradient
          colors={["rgba(255,255,255,0)", light ? "rgba(255,255,255,0.35)" : "rgba(255,241,214,0.07)", "rgba(255,255,255,0)"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <Animated.View pointerEvents="none" style={[{ position: "absolute", width: spot, height: spot, left: 0, top: 0 }, glare]}>
        <Svg width={spot} height={spot}>
          <Defs>
            <RadialGradient id={`spot-${kind}`} cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#FFF4DD" stopOpacity={0.16} />
              <Stop offset="0.5" stopColor="#FFF4DD" stopOpacity={0.04} />
              <Stop offset="1" stopColor="#FFF4DD" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect width={spot} height={spot} fill={`url(#spot-${kind})`} />
        </Svg>
      </Animated.View>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, falloff]}>
        <LinearGradient colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.5)"]} start={{ x: 0.3, y: 0.3 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      </Animated.View>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, burstStyle]}>
        <LinearGradient colors={["rgba(224,184,58,0.9)", "rgba(198,161,91,0.25)", "rgba(198,161,91,0)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      </Animated.View>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.rim, light && { borderColor: "rgba(255,255,255,0.35)" }]} />
      <LinearGradient
        pointerEvents="none"
        colors={[light ? "rgba(255,255,255,0.7)" : "rgba(255,244,221,0.18)", "rgba(255,255,255,0)"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.topEdge}
      />
    </>
  );
}

/**
 * Fine engraved lines — a guilloche. Interlaced curves are how banknotes and
 * metal cards say "valuable" before anyone knows why. Here they are one
 * pixel, faint, and fade out toward the text so they never compete with it.
 */
function Engraving({ kind, w, h, tone }: { kind: PassKind; w: number; h: number; tone: string }) {
  const paths = useMemo(() => {
    const out: string[] = [];
    const n = kind === "membership" ? 10 : 16;
    for (let i = 0; i < n; i++) {
      const amp = h * (0.05 + i * 0.008);
      const y0 = h * (kind === "filings" ? 0.78 : 0.7) - i * 1.2;
      const ph = i * 0.36;
      let d = `M -4 ${y0.toFixed(1)}`;
      for (let x = 0; x <= w + 8; x += 8) {
        const y = y0 + Math.sin(x / (w / 4.2) + ph) * amp + Math.cos(x / (w / 1.7) + ph * 1.6) * amp * 0.4;
        d += ` L ${x} ${y.toFixed(1)}`;
      }
      out.push(d);
    }
    return out;
  }, [kind, w, h]);

  return (
    <Svg width={w} height={h} style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <SvgLinear id={`eng-${kind}`} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={tone} stopOpacity={0.15} />
          <Stop offset="0.55" stopColor={tone} stopOpacity={1} />
          <Stop offset="1" stopColor={tone} stopOpacity={0.4} />
        </SvgLinear>
      </Defs>
      {paths.map((d, i) => (
        <Path key={i} d={d} stroke={`url(#eng-${kind})`} strokeWidth={0.7} fill="none" />
      ))}
    </Svg>
  );
}

/* ──────────────────────────────────────────────────────────────── the faces */

function Stat({ value, label, m, icon }: { value: string; label: string; m: Material; icon?: IconName }) {
  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
        {icon && <Icon name={icon} size={13} color={m.accent} strokeWidth={2} />}
        <T num style={{ fontFamily: font.semibold, fontSize: 15, color: m.ink, letterSpacing: -0.2 }}>
          {value}
        </T>
      </View>
      <T style={{ fontFamily: font.semibold, fontSize: 8.5, letterSpacing: 1.1, color: m.dim, marginTop: 2 }}>{label.toUpperCase()}</T>
    </View>
  );
}

function Top({ m, title }: { m: Material; title: string }) {
  return (
    <View style={styles.top}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}>
        <MarkOn m={m} />
        <T style={{ fontFamily: font.semibold, fontSize: 13, letterSpacing: 3.4, color: m.ink }}>LAWFIC</T>
      </View>
      <T style={{ fontFamily: font.semibold, fontSize: 9, letterSpacing: 1.6, color: m.dim }}>{title}</T>
    </View>
  );
}

/**
 * The LAWFIC badge. On the champagne pass it sits on a small dark disc, or its
 * gold would vanish into the card's gold.
 */
function MarkOn({ m }: { m: Material }) {
  const onGold = m.accent !== C.gold && m.accent !== C.goldLight;
  return (
    <View style={onGold ? { width: 30, height: 30, borderRadius: 15, backgroundColor: "#0E0C08", alignItems: "center", justifyContent: "center" } : undefined}>
      <Image source={require("../../assets/brand/lawfic-logo.png")} style={{ width: onGold ? 26 : 30, height: onGold ? 24 : 27 }} resizeMode="contain" />
    </View>
  );
}

export function Pass({
  kind,
  width,
  data,
  onPress,
  interactive = true,
}: {
  kind: PassKind;
  width: number;
  data: PassData;
  onPress?: () => void;
  interactive?: boolean;
}) {
  const height = Math.round(width / PASS_RATIO);
  const m = MATERIAL[kind];
  const label =
    kind === "wallet"
      ? `Legal wallet pass${data.hidden ? "" : `, balance ₹${Math.floor(data.balancePaise / 100)}`}`
      : kind === "filings"
        ? `Filings pass, ${data.active} active`
        : kind === "vault"
          ? `Document vault pass, ${data.documents} documents`
          : `Membership pass, ${data.plan ?? "pay per filing"}`;

  return (
    <TiltCard width={width} onPress={onPress} label={label} interactive={interactive}>
      {({ px, py, on }) => (
        <View style={[styles.card, { width, height }]}>
          <LinearGradient colors={m.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          <Finish kind={kind} width={width} height={height} px={px} py={py} on={on} flash={data.flash} />

          <View style={[styles.face, { padding: width * 0.06 }]}>
            {kind === "wallet" && (
              <>
                <Top m={m} title="LEGAL WALLET" />
                <View>
                  <T style={{ fontFamily: font.semibold, fontSize: 9, letterSpacing: 1.4, color: m.dim, marginBottom: 2 }}>AVAILABLE BALANCE</T>
                  <AnimatedMoney paise={data.balancePaise} size={Math.min(38, width * 0.105)} hidden={data.hidden} dimColor={m.dim} />
                </View>
                <View style={[styles.bottom, { gap: Math.min(22, width * 0.05) }]}>
                  <Stat value={pad2(data.active)} label="Active filings" m={m} />
                  <Stat value={pad2(data.documents)} label="Documents" m={m} />
                  <View style={{ flex: 1 }} />
                  <View style={[styles.secured, { borderColor: data.secured ? "rgba(198,161,91,0.45)" : "rgba(255,255,255,0.12)" }]}>
                    <Icon name={data.secured ? "shield" : "lock"} size={11} color={data.secured ? C.gold : m.dim} strokeWidth={2} />
                    <T numberOfLines={1} style={{ fontFamily: font.semibold, fontSize: 8.5, letterSpacing: 1.2, color: data.secured ? C.gold : m.dim }}>
                      {data.secured ? "SECURED" : width < 360 ? "CLOSED" : "CLOSED-LOOP"}
                    </T>
                  </View>
                </View>
              </>
            )}

            {kind === "filings" && (
              <>
                <Top m={m} title="FILINGS" />
                <View>
                  <T style={{ fontFamily: font.semibold, fontSize: 9, letterSpacing: 1.4, color: m.dim, marginBottom: 4 }}>IN MOTION</T>
                  <T num style={{ fontFamily: font.semibold, fontSize: Math.min(38, width * 0.105), letterSpacing: -1.2, color: m.ink }}>
                    {pad2(data.active)}
                    <T style={{ fontFamily: font.medium, fontSize: 15, color: m.dim, letterSpacing: 0 }}> active</T>
                  </T>
                </View>
                <View style={styles.bottom}>
                  <Stat value={pad2(data.awaiting)} label="Need you" m={m} icon={data.awaiting ? "alert" : undefined} />
                  <View style={{ flex: 1 }} />
                  <T style={{ fontFamily: font.medium, fontSize: 11, color: m.dim }}>Tap to open your filings</T>
                </View>
              </>
            )}

            {kind === "vault" && (
              <>
                <Top m={m} title="DOCUMENT VAULT" />
                <View>
                  <T style={{ fontFamily: font.semibold, fontSize: 9, letterSpacing: 1.4, color: m.dim, marginBottom: 4 }}>HELD FOR YOU</T>
                  <T num style={{ fontFamily: font.semibold, fontSize: Math.min(38, width * 0.105), letterSpacing: -1.2, color: m.ink }}>
                    {pad2(data.documents)}
                    <T style={{ fontFamily: font.medium, fontSize: 15, color: m.dim, letterSpacing: 0 }}> documents</T>
                  </T>
                </View>
                <View style={styles.bottom}>
                  <Stat value={pad2(data.verified)} label="Issued by LAWFIC" m={m} icon="verified" />
                  <View style={{ flex: 1 }} />
                  <Icon name="vault" size={18} color={m.dim} />
                </View>
              </>
            )}

            {kind === "membership" && (
              <>
                <Top m={m} title="MEMBERSHIP" />
                <View>
                  <T style={{ fontFamily: font.semibold, fontSize: 9, letterSpacing: 1.4, color: m.dim, marginBottom: 4 }}>{data.plan ? "YOUR PLAN" : "CURRENTLY"}</T>
                  <T style={{ fontFamily: font.semibold, fontSize: Math.min(30, width * 0.085), letterSpacing: -0.9, color: m.ink }}>{data.plan ?? "Pay per filing"}</T>
                </View>
                <View style={styles.bottom}>
                  <Stat value={data.discount ? `${data.discount}%` : "—"} label="Off every filing" m={m} />
                  <View style={{ flex: 1 }} />
                  <T style={{ fontFamily: font.semibold, fontSize: 11.5, color: m.ink }}>{data.plan ? "Manage" : "See plans"} →</T>
                </View>
              </>
            )}
          </View>
        </View>
      )}
    </TiltCard>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, overflow: "hidden", backgroundColor: "#0B0B0B" },
  face: { flex: 1, justifyContent: "space-between" },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  bottom: { flexDirection: "row", alignItems: "flex-end", gap: 22 },
  secured: { flexDirection: "row", alignItems: "center", gap: 5, height: 22, paddingHorizontal: 8, borderRadius: 11, borderWidth: 1 },
  sheen: { position: "absolute", width: 90 },
  rim: { borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.09)" },
  topEdge: { position: "absolute", left: 18, right: 18, top: 0, height: 1 },
});
