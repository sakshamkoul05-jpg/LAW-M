import React, { useEffect } from "react";
import { Text, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient as SvgLinear, Path, Stop } from "react-native-svg";
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { color as C, font, text } from "@/theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * Where the money went — a donut of spend by category.
 *
 * The segments draw themselves in, one after another, on first appearance.
 * That is not decoration: a chart that assembles tells you it was just
 * computed from your own data, which a static image of a pie never does.
 */
export function Donut({
  segments,
  size = 168,
  stroke = 18,
  centerLabel,
  centerValue,
}: {
  segments: { value: number; color: string }[];
  size?: number;
  stroke?: number;
  centerLabel: string;
  centerValue: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const total = Math.max(1, segments.reduce((s, x) => s + x.value, 0));

  let offset = 0;
  const arcs = segments.map((s) => {
    const len = (s.value / total) * circ;
    const a = { ...s, len, offset };
    offset += len;
    return a;
  });

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} fill="none" />
        {arcs.map((a, i) => (
          <Arc key={i} r={r} size={size} stroke={stroke} color={a.color} len={Math.max(0, a.len - 3)} offset={a.offset} circ={circ} delay={i * 120} />
        ))}
      </Svg>
      <Text style={[text.label, { color: C.textMuted }]}>{centerLabel}</Text>
      <Text style={{ fontFamily: font.bold, fontSize: 22, color: C.text, letterSpacing: -0.6, marginTop: 2 }}>
        {centerValue}
      </Text>
    </View>
  );
}

function Arc({
  r,
  size,
  stroke,
  color,
  len,
  offset,
  circ,
  delay,
}: {
  r: number;
  size: number;
  stroke: number;
  color: string;
  len: number;
  offset: number;
  circ: number;
  delay: number;
}) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(
      delay,
      withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic), reduceMotion: ReduceMotion.System }),
    );
  }, [p, delay]);

  const props = useAnimatedProps(() => ({
    strokeDasharray: `${len * p.value} ${circ}`,
    strokeDashoffset: -offset,
  }));

  return (
    <AnimatedCircle
      cx={size / 2}
      cy={size / 2}
      r={r}
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      fill="none"
      animatedProps={props}
    />
  );
}

/** Monthly bars. The current month is lit; the rest step back. */
export function Bars({
  data,
  height = 120,
}: {
  data: { label: string; value: number; current?: boolean }[];
  height?: number;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", height: height + 22, gap: 10 }}>
      {data.map((d, i) => (
        <Bar key={d.label} ratio={d.value / max} height={height} label={d.label} current={d.current} delay={i * 60} />
      ))}
    </View>
  );
}

function Bar({
  ratio,
  height,
  label,
  current,
  delay,
}: {
  ratio: number;
  height: number;
  label: string;
  current?: boolean;
  delay: number;
}) {
  const h = useSharedValue(0);
  useEffect(() => {
    h.value = withDelay(delay, withTiming(Math.max(4, ratio * height), { duration: 650, easing: Easing.out(Easing.cubic), reduceMotion: ReduceMotion.System }));
  }, [h, ratio, height, delay]);
  const style = useAnimatedStyle(() => ({ height: h.value }));

  return (
    <View style={{ flex: 1, alignItems: "center", gap: 8 }}>
      <View style={{ height, justifyContent: "flex-end", width: "100%" }}>
        <Animated.View
          style={[
            {
              width: "100%",
              borderRadius: 8,
              backgroundColor: current ? C.gold : "rgba(255,255,255,0.1)",
            },
            style,
          ]}
        />
      </View>
      <Text style={[text.caption, { color: current ? C.text : C.textMuted }]}>{label}</Text>
    </View>
  );
}

/** A small line, for a trend beside a number. */
export function Sparkline({
  points,
  width = 72,
  height = 28,
  color = C.green,
}: {
  points: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = Math.max(1, max - min);
  const step = width / (points.length - 1);
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${(i * step).toFixed(1)} ${(height - ((p - min) / span) * (height - 4) - 2).toFixed(1)}`)
    .join(" ");
  return (
    <Svg width={width} height={height}>
      <Defs>
        <SvgLinear id="spark" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.35" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </SvgLinear>
      </Defs>
      <Path d={`${d} L ${width} ${height} L 0 ${height} Z`} fill="url(#spark)" />
      <Path d={d} stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
