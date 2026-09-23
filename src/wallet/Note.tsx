import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, G, Path, Pattern, Rect } from "react-native-svg";
import { font } from "@/theme";

/**
 * A LAWFIC Credit — the paper inside the wallet.
 *
 * WHAT THIS DELIBERATELY IS NOT
 *
 * It is not a rupee note and must never become one. No Ashoka Lion Capital, no
 * portrait, no RBI name, seal, legend or signature, no serial in the real
 * format, no microtext. Those marks belong to a currency issuer, and drawing
 * them on a private token is not a design choice, it is a counterfeit.
 *
 * What it IS: a plainly-branded voucher for a closed-loop balance, in the
 * app's own gold, with a denomination, a guilloche rosette that is decorative
 * rather than imitative, and the words that say what it is. It should look
 * valuable and look nothing like legal tender.
 */

const PALETTE = {
  classic: { paper: "#F0E6CE", edge: "#D8C79B", ink: "#4A3A15", accent: "#A8842E" },
  sepia: { paper: "#E8D9C0", edge: "#CBB48C", ink: "#513B1E", accent: "#8F6B2C" },
  midnight: { paper: "#C9CEDE", edge: "#9AA3BC", ink: "#1F2740", accent: "#3D4B78" },
  forest: { paper: "#CFDCC9", edge: "#A3B79B", ink: "#20301C", accent: "#3F5E36" },
} as const;

export type NoteStyleId = keyof typeof PALETTE;

export function Note({
  value,
  width,
  height,
  styleId = "classic",
}: {
  /** In whole rupees. Denominations only — this is not a balance. */
  value: number;
  width: number;
  height: number;
  styleId?: NoteStyleId;
}) {
  const p = PALETTE[styleId];

  return (
    <View
      style={{
        width,
        height,
        borderRadius: 6,
        overflow: "hidden",
        backgroundColor: p.paper,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: p.edge,
      }}
    >
      <LinearGradient
        colors={[p.paper, p.edge]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          {/* A fine lattice, the way a voucher gets its security-paper feel
              without borrowing a single real security feature. */}
          <Pattern id="lattice" width={7} height={7} patternUnits="userSpaceOnUse">
            <Path d="M0 7 L7 0" stroke={p.accent} strokeOpacity={0.16} strokeWidth={0.5} />
            <Path d="M0 0 L7 7" stroke={p.accent} strokeOpacity={0.09} strokeWidth={0.5} />
          </Pattern>
        </Defs>

        <Rect x={0} y={0} width={width} height={height} fill="url(#lattice)" />

        {/* A decorative rosette. Concentric rings, not a guilloche engine. */}
        <G opacity={0.4}>
          {[0.36, 0.28, 0.2, 0.12].map((k, i) => (
            <Circle
              key={i}
              cx={width * 0.78}
              cy={height * 0.5}
              r={height * k}
              fill="none"
              stroke={p.accent}
              strokeOpacity={0.5}
              strokeWidth={0.6}
            />
          ))}
        </G>

        <Rect
          x={3}
          y={3}
          width={width - 6}
          height={height - 6}
          rx={4}
          fill="none"
          stroke={p.accent}
          strokeOpacity={0.45}
          strokeWidth={0.8}
        />
      </Svg>

      <View style={{ flex: 1, paddingHorizontal: 9, paddingVertical: 7, justifyContent: "space-between" }}>
        <Text
          style={{
            fontFamily: font.bodySemi,
            fontSize: 6.5,
            letterSpacing: 1.3,
            color: p.ink,
            opacity: 0.75,
          }}
        >
          LAWFIC CREDIT
        </Text>

        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 3 }}>
          <Text style={{ fontFamily: font.mono, fontSize: 11, color: p.ink, opacity: 0.8 }}>
            {"₹"}
          </Text>
          <Text
            style={{
              fontFamily: font.displayBold,
              fontSize: 20,
              color: p.ink,
              letterSpacing: -0.8,
              lineHeight: 22,
            }}
          >
            {value}
          </Text>
        </View>

        <Text style={{ fontFamily: font.body, fontSize: 5.8, color: p.ink, opacity: 0.55 }}>
          Spendable on LAWFIC services only
        </Text>
      </View>
    </View>
  );
}

/**
 * A balance, broken into the notes that would make it up.
 *
 * Greedy, largest first, and capped: a wallet showing forty notes is a
 * shredder. Anything past the cap is folded into the largest note, which is
 * what a person actually does with a thick wad.
 */
export function breakIntoNotes(rupees: number, max = 6): number[] {
  const DENOMS = [2000, 500, 200, 100, 50, 20];
  const out: number[] = [];
  let left = Math.max(0, Math.floor(rupees));

  for (const d of DENOMS) {
    while (left >= d && out.length < max) {
      out.push(d);
      left -= d;
    }
  }
  return out.length ? out : [20];
}
