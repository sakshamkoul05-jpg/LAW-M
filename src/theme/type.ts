import { Platform, TextStyle } from "react-native";

/**
 * Three families, each with one job.
 *
 *   Sora      — display. Geometric, slightly narrow, distinctive at large
 *               sizes. Headings, and nothing else.
 *   Manrope   — body. Warm, open, legible at 12px on a phone in daylight.
 *   Plex Mono — money, and only money. Tabular figures so a column of amounts
 *               aligns; a statement in a proportional face is a list of strings
 *               pretending to be a ledger.
 *
 * Deliberately not Inter, Roboto or SF. Every fintech app uses one of the
 * three, and an app that looks like every other app cannot be the one the
 * client shows people.
 */

export const font = {
  display: "Sora_600SemiBold",
  displayBold: "Sora_700Bold",
  body: "Manrope_500Medium",
  bodySemi: "Manrope_600SemiBold",
  bodyBold: "Manrope_700Bold",
  mono: "IBMPlexMono_500Medium",
  monoSemi: "IBMPlexMono_600SemiBold",
} as const;

/**
 * The micro-label: 10.5px, uppercase, widely letterspaced, dim. It sits above
 * almost every section in the app. It is what lets a heading be quiet and still
 * be found — the eye reads the tracking as "this is a label" before it reads
 * the word.
 */
export const label: TextStyle = {
  fontFamily: font.bodySemi,
  fontSize: 10.5,
  letterSpacing: 1.6,
  textTransform: "uppercase",
};

export const text = {
  hero: { fontFamily: font.displayBold, fontSize: 34, letterSpacing: -0.8, lineHeight: 40 },
  title: { fontFamily: font.display, fontSize: 24, letterSpacing: -0.4, lineHeight: 30 },
  heading: { fontFamily: font.display, fontSize: 18, letterSpacing: -0.2, lineHeight: 24 },
  body: { fontFamily: font.body, fontSize: 14.5, lineHeight: 21 },
  bodySemi: { fontFamily: font.bodySemi, fontSize: 14.5, lineHeight: 21 },
  small: { fontFamily: font.body, fontSize: 12.5, lineHeight: 18 },
  tiny: { fontFamily: font.body, fontSize: 11, lineHeight: 15 },
  label,
} satisfies Record<string, TextStyle>;

/**
 * Tabular figures. Plex Mono is monospaced already, but iOS still needs the
 * font-variant switch for the comma and the decimal to sit on the same track;
 * without it "₹1,499" and "₹499" do not line up in a column.
 */
export const tabular: TextStyle = Platform.select({
  ios: { fontVariant: ["tabular-nums"] },
  default: {},
}) as TextStyle;
