import React, { useMemo } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, Path, RadialGradient, Rect, Stop } from "react-native-svg";
import { color as C, radius } from "@/theme";

/**
 * A leather panel.
 *
 * SKEUOMORPHISM THAT IS NOT A TEXTURE FILE
 *
 * The temptation is to ship a photograph of leather. It is the wrong answer on
 * a phone: it is a megabyte, it tiles visibly, it cannot change colour when the
 * customer picks a different hide, and it looks like a photograph of leather
 * rather than leather. Four cheap layers do better, because each one is a thing
 * real leather actually does:
 *
 *   1. a base gradient, lighter at the top — the panel is lit from above;
 *   2. GRAIN: a scatter of soft, uneven dark blooms. Real grain is irregular,
 *      so the scatter is pseudo-random but SEEDED, which means it is stable
 *      across renders. Grain that reshuffles every frame reads as television
 *      static and instantly destroys the illusion;
 *   3. a pull-up sheen: leather that has been handled is lighter where it has
 *      been stretched over an edge, so the top and the outer edge lift;
 *   4. a burnished rim — the darkest part of any leather panel is the 2mm at
 *      its edge, where it has been folded, sealed and rubbed.
 *
 * All four are vector, so the whole wallet scales to any size and recolours by
 * changing three strings.
 */

/** Deterministic noise. Same seed, same grain, every render and every device. */
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    /* xorshift32: eight instructions, no dependency, and good enough for
       scattering blobs. Nothing here is cryptographic. */
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 10000) / 10000;
  };
}

export function Leather({
  width,
  height,
  tone = C.leather,
  lit = C.leatherLit,
  deep = C.leatherDeep,
  corner = radius.lg,
  seed = 7,
  style,
  children,
}: {
  width: number;
  height: number;
  tone?: string;
  lit?: string;
  deep?: string;
  corner?: number;
  seed?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}) {
  /* Computed once per size. Regenerating on every render is what turns grain
     into static. */
  const grain = useMemo(() => {
    const rnd = seeded(seed);
    /* Tuned against the rendered object, not in the abstract. The first pass
       used radii up to 32 at up to 11% opacity, which on a 300pt wallet is a
       blob a tenth of its width — the panel read as soap bubbles rather than
       as hide. Grain is small, dense and nearly invisible one mark at a time;
       it is the ACCUMULATION that reads as texture. */
    return Array.from({ length: 70 }, () => ({
      cx: rnd() * width,
      cy: rnd() * height,
      r: 2 + rnd() * 9,
      o: 0.018 + rnd() * 0.032,
      dark: rnd() > 0.38,
    }));
  }, [width, height, seed]);

  return (
    <View
      style={[
        { width, height, borderRadius: corner, overflow: "hidden", backgroundColor: tone },
        style,
      ]}
    >
      {/* 1 — lit from above */}
      <LinearGradient
        colors={[lit, tone, deep]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* 2 and 4 — grain, and the burnished rim */}
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="pull" cx="30%" cy="18%" r="82%">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.07} />
            <Stop offset="0.55" stopColor="#FFFFFF" stopOpacity={0.015} />
            <Stop offset="1" stopColor="#000000" stopOpacity={0.22} />
          </RadialGradient>
        </Defs>

        {grain.map((g, i) => (
          <Circle
            key={i}
            cx={g.cx}
            cy={g.cy}
            r={g.r}
            fill={g.dark ? "#000000" : "#FFFFFF"}
            opacity={g.o}
          />
        ))}

        {/* 3 — pull-up */}
        <Rect x={0} y={0} width={width} height={height} rx={corner} fill="url(#pull)" />

        {/* 4 — the burnished edge. Two strokes, the inner one softer, because a
            single hard line reads as a border rather than a rolled edge. */}
        <Rect
          x={0.9}
          y={0.9}
          width={width - 1.8}
          height={height - 1.8}
          rx={corner}
          fill="none"
          stroke="#000000"
          strokeOpacity={0.42}
          strokeWidth={1.8}
        />
        <Rect
          x={3.4}
          y={3.4}
          width={width - 6.8}
          height={height - 6.8}
          rx={Math.max(corner - 3, 2)}
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity={0.05}
          strokeWidth={1}
        />
      </Svg>

      {children}
    </View>
  );
}

/**
 * Saddle stitching, inset from the edge.
 *
 * A dashed path, not a row of dashes in a border: the dash has to follow the
 * corner radius or the stitch visibly breaks at every corner, which is the
 * first thing an eye notices as wrong on a rendered leather object.
 */
export function Stitching({
  width,
  height,
  inset = 9,
  corner = radius.lg,
  tone = C.thread,
}: {
  width: number;
  height: number;
  inset?: number;
  corner?: number;
  tone?: string;
}) {
  const w = width - inset * 2;
  const h = height - inset * 2;
  const r = Math.max(corner - inset, 3);

  const d = `M ${inset + r} ${inset}
     h ${w - r * 2} a ${r} ${r} 0 0 1 ${r} ${r}
     v ${h - r * 2} a ${r} ${r} 0 0 1 ${-r} ${r}
     h ${-(w - r * 2)} a ${r} ${r} 0 0 1 ${-r} ${-r}
     v ${-(h - r * 2)} a ${r} ${r} 0 0 1 ${r} ${-r} z`;

  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* The trench the thread sits in, drawn first and one step darker. Thread
          laid straight onto a surface looks printed; thread in a groove looks
          sewn. */}
      {/* Tighter, thinner and much quieter than the first pass, which at 2pt
          and 72% opacity read as a dashed CSS border sitting on top of the
          panel rather than as thread sunk into it. Real saddle stitch is a
          short dash with a short gap, close in value to the leather. */}
      <Path
        d={d}
        fill="none"
        stroke="#000000"
        strokeOpacity={0.4}
        strokeWidth={2.6}
        strokeDasharray="3.6 3.2"
        strokeLinecap="round"
      />
      <Path
        d={d}
        fill="none"
        stroke={tone}
        strokeOpacity={0.42}
        strokeWidth={1.3}
        strokeDasharray="3.6 3.2"
        strokeLinecap="round"
      />
    </Svg>
  );
}
