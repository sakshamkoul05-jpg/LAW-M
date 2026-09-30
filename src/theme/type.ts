import type { TextStyle } from "react-native";

/**
 * Type: Inter, one family, five weights.
 *
 * Hierarchy comes from size and weight, never from a second decorative face.
 * Large headings are tight (negative tracking) because big type set at its
 * default spacing looks loose; small uppercase labels are open (positive
 * tracking) because small caps set tight turn into a smudge.
 *
 * Every figure that is money, a count or a date uses tabular numerals, so a
 * column of amounts lines up and a balance counting up does not jitter.
 */
export const font = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
} as const;

export const tabular: TextStyle = { fontVariant: ["tabular-nums"] };

export const text = {
  /** The balance on the wallet. */
  money: { fontFamily: font.semibold, fontSize: 44, letterSpacing: -1.6, lineHeight: 50 },
  display: { fontFamily: font.bold, fontSize: 34, letterSpacing: -1.1, lineHeight: 40 },
  title1: { fontFamily: font.bold, fontSize: 28, letterSpacing: -0.8, lineHeight: 34 },
  title2: { fontFamily: font.semibold, fontSize: 22, letterSpacing: -0.5, lineHeight: 28 },
  title3: { fontFamily: font.semibold, fontSize: 18, letterSpacing: -0.3, lineHeight: 24 },
  headline: { fontFamily: font.semibold, fontSize: 16, letterSpacing: -0.2, lineHeight: 22 },
  body: { fontFamily: font.regular, fontSize: 15, letterSpacing: -0.1, lineHeight: 22 },
  bodyMedium: { fontFamily: font.medium, fontSize: 15, letterSpacing: -0.1, lineHeight: 22 },
  callout: { fontFamily: font.regular, fontSize: 14, lineHeight: 20 },
  calloutMedium: { fontFamily: font.medium, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: font.regular, fontSize: 12.5, lineHeight: 17 },
  captionMedium: { fontFamily: font.medium, fontSize: 12.5, lineHeight: 17 },
  /** Small uppercase labels over a value, and section kickers. */
  label: { fontFamily: font.semibold, fontSize: 11, letterSpacing: 1.2, lineHeight: 14, textTransform: "uppercase" },
  micro: { fontFamily: font.medium, fontSize: 10.5, letterSpacing: 0.3, lineHeight: 13 },
} satisfies Record<string, TextStyle>;
