import React from "react";
import { Text, type TextProps, type TextStyle } from "react-native";
import { color as C, tabular, text } from "@/theme";

export type Variant = keyof typeof text;
export type Tone = "text" | "dim" | "muted" | "gold" | "ink" | "green" | "red" | "amber";

const TONES: Record<Tone, string> = {
  text: C.text,
  dim: C.textDim,
  muted: C.textMuted,
  gold: C.gold,
  ink: C.ink,
  green: C.green,
  red: C.red,
  amber: C.amber,
};

/** Default tone per variant: headings in full white, supporting text dimmer. */
const DEFAULT_TONE: Partial<Record<Variant, Tone>> = {
  body: "dim",
  callout: "dim",
  caption: "muted",
  captionMedium: "dim",
  label: "muted",
  micro: "muted",
};

/**
 * The only Text in the app.
 *
 *   <T v="title1">Your filings</T>
 *   <T v="caption" tone="gold" num>₹499</T>
 *
 * `num` turns on tabular figures — anything that is money, a count or a date.
 */
export function T({
  v = "body",
  tone,
  color,
  num,
  center,
  style,
  ...rest
}: TextProps & { v?: Variant; tone?: Tone; color?: string; num?: boolean; center?: boolean; style?: TextStyle | TextStyle[] | (TextStyle | false | undefined | null)[] }) {
  const c = color ?? TONES[tone ?? DEFAULT_TONE[v] ?? "text"];
  return <Text {...rest} style={[text[v], { color: c }, num && tabular, center && { textAlign: "center" }, style as TextStyle]} />;
}
