/**
 * Obsidian & Aurora — the LAWFIC app's design system.
 *
 * The brief was "Revolut, Apple Wallet, Phantom, CRED, HDFC". What those share
 * is not a colour; it is three habits, and every screen here keeps them:
 *
 *   1. LIGHT BEHIND THINGS, NOT ON THEM. The background is never a flat fill —
 *      a slow aurora of violet, indigo and gold drifts behind every hero. The
 *      surfaces on top stay quiet so the light has somewhere to show.
 *   2. GLASS, NOT BOXES. Surfaces are translucent over that light, with a
 *      hairline and a bright top edge. A flat grey card on a flat black page is
 *      what made the last version read as basic.
 *   3. ONE OBJECT GETS TO BE BEAUTIFUL. On the wallet it is the card. On home
 *      it is the balance. Everything around it steps back.
 *
 * Gold stays LAWFIC's — it is the colour of money and action. Violet is the
 * second voice: the assistant, insights, anything the app works out for you.
 */

export const color = {
  /* Ground — faintly violet, so the aurora blends instead of sitting on it. */
  void: "#060609",
  ground: "#0A0A10",
  sunken: "#040406",

  /* Glass. Translucent whites over the aurora; never opaque greys. */
  glass: "rgba(255,255,255,0.055)",
  glassHigh: "rgba(255,255,255,0.085)",
  glassPress: "rgba(255,255,255,0.12)",
  hairline: "rgba(255,255,255,0.09)",
  hairlineStrong: "rgba(255,255,255,0.16)",
  litEdge: "rgba(255,255,255,0.14)",

  /* Solid surfaces, for the few places glass would be illegible. */
  surface: "#111118",
  surfaceHigh: "#191922",

  text: "#F5F4F9",
  textDim: "#A6A4B8",
  textFaint: "#6B6980",

  /* Money and action. */
  gold: "#F2C66D",
  goldHot: "#FFD98A",
  goldDeep: "#B8862F",
  goldInk: "#1A1204",

  /* The second voice. */
  violet: "#8B6CFF",
  violetHot: "#B39DFF",
  violetDeep: "#4B2FC9",
  indigo: "#3B4BFF",

  /* Status. */
  green: "#34D399",
  greenWash: "rgba(52,211,153,0.14)",
  amber: "#FBBF24",
  amberWash: "rgba(251,191,36,0.14)",
  red: "#F87171",
  redWash: "rgba(248,113,113,0.14)",
  blue: "#60A5FA",
  blueWash: "rgba(96,165,250,0.14)",
} as const;

/** Gradients, as [from, ..., to]. Named for what they are used on. */
export const gradient = {
  gold: ["#FFE3A3", "#F2C66D", "#C9923A"] as const,
  violet: ["#B39DFF", "#8B6CFF", "#4B2FC9"] as const,
  aurora: ["#8B6CFF", "#3B4BFF", "#0A0A10"] as const,
  obsidian: ["#1C1C24", "#0B0B10", "#050507"] as const,
  champagne: ["#FBE7C0", "#E9C98B", "#B8914E"] as const,
  midnight: ["#1B2550", "#101634", "#070A1C"] as const,
  /* The top of every hero, fading the aurora into the ground. */
  fadeDown: ["rgba(6,6,9,0)", "rgba(6,6,9,0.7)", "#060609"] as const,
};

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
  section: 48,
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  card: 24,
  pill: 999,
} as const;

/**
 * Elevation. Two shadows, because one reads as a smudge: a tight dark one that
 * seats the object, and a wide soft one that lifts it.
 */
export const elevation = {
  low: {
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  mid: {
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10,
  },
  card: {
    shadowColor: "#000",
    shadowOpacity: 0.65,
    shadowRadius: 36,
    shadowOffset: { width: 0, height: 22 },
    elevation: 18,
  },
  glowGold: {
    shadowColor: "#F2C66D",
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  glowViolet: {
    shadowColor: "#8B6CFF",
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
} as const;

export const HIT = 44;
