import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Defs, LinearGradient as SvgLinear, Path, Stop, Circle } from "react-native-svg";
import Animated, {
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";
import { groupIndian } from "@/components/Money";
import { color as C, font, tabular } from "@/theme";

/**
 * A pass in the wallet.
 *
 * PASSES, NOT PAYMENT CARDS — AND THAT IS A FACT, NOT A STYLE
 *
 * The website retired its card design because it was untrue: LAWFIC issues no
 * card, and nothing it holds can be tapped at a till. So these carry no chip,
 * no sixteen-digit number, no network mark and no expiry — the four things that
 * would tell a customer this works in a shop. What they carry instead are pass
 * fields, the way Apple Wallet lays out a boarding pass or a loyalty card: a
 * label in small caps over a value.
 *
 * THREE MATERIALS, BECAUSE THE STACK HAS TO READ AT A GLANCE
 *
 *   obsidian  — the wallet itself. Near-black, a gold guilloche, the one that
 *               holds money. Metal-card weight, CRED and Centurion.
 *   aurora    — membership. Violet into indigo with soft orbs. Revolut Metal.
 *   champagne — referral credits. Warm gold with dark ink. Apple Card.
 *
 * THE SHEEN
 *
 * `tilt` is -1..1, driven by the finger. A bright band sweeps across the face
 * and a faint spectral wash shifts under it — the holographic foil every
 * premium card has, and the single detail that makes a gradient rectangle look
 * like an object with a surface.
 */

export type PassKind = "wallet" | "membership" | "credits";

export type Pass = {
  id: string;
  kind: PassKind;
  title: string;
  /** The big number or word on the face. */
  headline: string;
  headlineLabel: string;
  fields: { label: string; value: string }[];
  holder: string;
};

const MATERIAL = {
  wallet: {
    bg: ["#26252E", "#101016", "#060609"] as const,
    ink: C.text,
    inkDim: "rgba(245,244,249,0.55)",
    accent: C.gold,
    pattern: "rgba(242,198,109,0.22)",
  },
  membership: {
    bg: ["#9F84FF", "#5B3FE0", "#1D1566"] as const,
    ink: "#FFFFFF",
    inkDim: "rgba(255,255,255,0.62)",
    accent: "#FFFFFF",
    pattern: "rgba(255,255,255,0.14)",
  },
  credits: {
    bg: ["#FFF1D2", "#EBC987", "#B98C45"] as const,
    ink: "#2A1C06",
    inkDim: "rgba(42,28,6,0.6)",
    accent: "#2A1C06",
    pattern: "rgba(42,28,6,0.12)",
  },
} as const;

export function WalletCard({
  pass,
  width,
  tilt,
  hideAmount,
}: {
  pass: Pass;
  width: number;
  tilt?: SharedValue<number>;
  hideAmount?: boolean;
}) {
  const H = Math.round(width / 1.586);
  const m = MATERIAL[pass.kind];

  const sheen = useAnimatedStyle(() => {
    const t = tilt?.value ?? 0;
    return {
      transform: [{ translateX: interpolate(t, [-1, 1], [-width * 0.9, width * 0.9]) }, { rotate: "22deg" }],
      opacity: interpolate(Math.abs(t), [0, 1], [0.35, 0.8]),
    };
  });

  const holo = useAnimatedStyle(() => ({
    opacity: interpolate(Math.abs(tilt?.value ?? 0), [0, 1], [0.08, 0.3]),
    transform: [{ translateX: interpolate(tilt?.value ?? 0, [-1, 1], [-40, 40]) }],
  }));

  return (
    <View style={[styles.card, { width, height: H }]}>
      <LinearGradient colors={m.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />

      <Pattern kind={pass.kind} w={width} h={H} tone={m.pattern} />

      {/* Spectral wash — the foil. Very faint at rest, stronger as it turns. */}
      <Animated.View style={[StyleSheet.absoluteFill, holo]} pointerEvents="none">
        <LinearGradient
          colors={["rgba(255,120,200,0.5)", "rgba(120,200,255,0.5)", "rgba(160,255,180,0.5)", "rgba(255,220,120,0.5)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* The sheen band. */}
      <Animated.View style={[styles.sheen, { height: H * 2, top: -H / 2 }, sheen]} pointerEvents="none">
        <LinearGradient
          colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.28)", "rgba(255,255,255,0)"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Edge light — the rim of a metal card. */}
      <View style={[StyleSheet.absoluteFill, styles.rim]} pointerEvents="none" />

      <View style={styles.face}>
        <View style={styles.top}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Mark tone={m.accent} />
            <Text style={[styles.brand, { color: m.ink }]}>LAWFIC</Text>
          </View>
          <Text style={[styles.kind, { color: m.inkDim }]}>{pass.title.toUpperCase()}</Text>
        </View>

        <View>
          <Text style={[styles.fieldLabel, { color: m.inkDim }]}>{pass.headlineLabel}</Text>
          <Text style={[styles.headline, tabular, { color: m.ink }]} numberOfLines={1} adjustsFontSizeToFit>
            {hideAmount && pass.kind === "wallet" ? "₹ ••••••" : pass.headline}
          </Text>
        </View>

        <View style={styles.bottom}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.fieldLabel, { color: m.inkDim }]}>HOLDER</Text>
            <Text style={[styles.fieldValue, { color: m.ink }]} numberOfLines={1}>
              {pass.holder}
            </Text>
          </View>
          {pass.fields.slice(0, 2).map((f) => (
            <View key={f.label} style={{ alignItems: "flex-end", marginLeft: 14 }}>
              <Text style={[styles.fieldLabel, { color: m.inkDim }]}>{f.label.toUpperCase()}</Text>
              <Text style={[styles.fieldValue, { color: m.ink }]}>{f.value}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

/** The IL monogram, reduced to a mark that holds up at 18px. */
function Mark({ tone }: { tone: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20">
      <Circle cx={10} cy={10} r={9} stroke={tone} strokeWidth={1.4} fill="none" />
      <Path d="M7.4 5.6v8.8M11 5.6v8.8h3.4" stroke={tone} strokeWidth={1.6} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

/**
 * The surface of each material, drawn not photographed.
 *
 * Obsidian gets a guilloche — the interlaced sine lines on banknotes and metal
 * cards, which read as "engraved" and "valuable" before anybody knows why.
 * Aurora gets soft orbs. Champagne gets fine diagonal brushing.
 */
function Pattern({ kind, w, h, tone }: { kind: PassKind; w: number; h: number; tone: string }) {
  const paths = useMemo(() => {
    if (kind === "wallet") {
      /* Twelve phase-shifted sine waves: the interference between them is the
         guilloche. Each is a single path, so the whole pattern is twelve
         elements rather than thousands. */
      return Array.from({ length: 12 }, (_, i) => {
        const amp = h * (0.08 + i * 0.012);
        const y0 = h * 0.62;
        const phase = i * 0.42;
        let d = `M 0 ${y0}`;
        for (let x = 0; x <= w; x += 6) {
          const y = y0 + Math.sin(x / (w / 5.2) + phase) * amp + Math.cos(x / (w / 2.1) + phase * 2) * amp * 0.35;
          d += ` L ${x} ${y.toFixed(1)}`;
        }
        return d;
      });
    }
    if (kind === "credits") {
      return Array.from({ length: 28 }, (_, i) => {
        const x = (i / 28) * w * 1.6 - w * 0.3;
        return `M ${x} 0 L ${x + h * 0.9} ${h}`;
      });
    }
    return [];
  }, [kind, w, h]);

  return (
    <Svg width={w} height={h} style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <SvgLinear id="fadeL" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={tone} stopOpacity="0.2" />
          <Stop offset="0.5" stopColor={tone} stopOpacity="1" />
          <Stop offset="1" stopColor={tone} stopOpacity="0.3" />
        </SvgLinear>
      </Defs>
      {kind === "membership" && (
        <>
          <Circle cx={w * 0.85} cy={h * 0.1} r={h * 0.55} fill="rgba(255,255,255,0.08)" />
          <Circle cx={w * 0.72} cy={h * 0.95} r={h * 0.42} fill="rgba(255,255,255,0.06)" />
          <Circle cx={w * 0.1} cy={h * 1.05} r={h * 0.5} fill="rgba(0,0,0,0.12)" />
        </>
      )}
      {paths.map((d, i) => (
        <Path key={i} d={d} stroke="url(#fadeL)" strokeWidth={kind === "wallet" ? 0.8 : 0.6} fill="none" />
      ))}
    </Svg>
  );
}

/** Build the three passes from what the account holds. */
export function passesFor({
  balancePaise,
  holder,
  member,
}: {
  balancePaise: number;
  holder: string;
  member: boolean;
}): Pass[] {
  return [
    {
      id: "wallet",
      kind: "wallet",
      title: "Wallet",
      headlineLabel: "AVAILABLE BALANCE",
      /* Floor, never round. Rounding put ₹24,351 on the pass while Home said
         ₹24,350.50 — a pass that shows more than you have is the one error a
         wallet cannot make. */
      headline: `₹${groupIndian(Math.floor(balancePaise / 100))}.${String(balancePaise % 100).padStart(2, "0")}`,
      holder,
      fields: [{ label: "Type", value: "Closed" }],
    },
    {
      id: "membership",
      kind: "membership",
      title: "Membership",
      headlineLabel: member ? "YOUR BENEFIT" : "NOT A MEMBER YET",
      headline: member ? "10% off" : "Join",
      holder,
      fields: [{ label: "Covers", value: "Every filing" }],
    },
    {
      id: "credits",
      kind: "credits",
      title: "Referral",
      headlineLabel: "REFERRAL CREDITS",
      headline: "₹[0]",
      holder,
      fields: [{ label: "Status", value: "Sample" }],
    },
  ];
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    overflow: "hidden",
  },
  rim: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  sheen: {
    position: "absolute",
    width: 70,
    left: "40%",
  },
  face: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brand: { fontFamily: font.displayBold, fontSize: 15, letterSpacing: 2.4 },
  kind: { fontFamily: font.bodyBold, fontSize: 10, letterSpacing: 1.6 },
  headline: { fontFamily: font.displayBold, fontSize: 34, letterSpacing: -1.2, marginTop: 2 },
  bottom: { flexDirection: "row", alignItems: "flex-end" },
  fieldLabel: { fontFamily: font.bodyBold, fontSize: 9, letterSpacing: 1.3 },
  fieldValue: { fontFamily: font.bodySemi, fontSize: 13, marginTop: 2 },
});
