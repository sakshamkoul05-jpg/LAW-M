import { Platform, type TextStyle } from "react-native";

/**
 * Two families. Sora carries every number worth looking at — balances are set
 * in it large and tight, the way Revolut and Apple Card set theirs, rather than
 * in a monospace that reads like a terminal. Manrope carries everything else.
 * Plex Mono survives only for identifiers: order numbers, PANs, card digits.
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

export const tabular: TextStyle = Platform.select({
  ios: { fontVariant: ["tabular-nums"] },
  default: { fontVariant: ["tabular-nums"] },
}) as TextStyle;

export const text = {
  /** The one number on the screen. */
  money: { fontFamily: font.displayBold, fontSize: 46, letterSpacing: -1.8, lineHeight: 52 },
  hero: { fontFamily: font.displayBold, fontSize: 32, letterSpacing: -1, lineHeight: 38 },
  title: { fontFamily: font.displayBold, fontSize: 26, letterSpacing: -0.6, lineHeight: 32 },
  heading: { fontFamily: font.display, fontSize: 18, letterSpacing: -0.3, lineHeight: 24 },
  subhead: { fontFamily: font.bodyBold, fontSize: 15, letterSpacing: -0.1, lineHeight: 20 },
  body: { fontFamily: font.body, fontSize: 14.5, lineHeight: 21 },
  bodySemi: { fontFamily: font.bodySemi, fontSize: 14.5, lineHeight: 21 },
  small: { fontFamily: font.body, fontSize: 12.5, lineHeight: 17 },
  smallSemi: { fontFamily: font.bodySemi, fontSize: 12.5, lineHeight: 17 },
  tiny: { fontFamily: font.bodySemi, fontSize: 11, lineHeight: 14 },
  label: {
    fontFamily: font.bodyBold,
    fontSize: 10.5,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
} satisfies Record<string, TextStyle>;
