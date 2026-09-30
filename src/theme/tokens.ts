/**
 * LAWFIC design tokens — "Obsidian & Champagne".
 *
 * The product is a legal wallet, and the palette says so by what it leaves
 * out. It is almost entirely black and warm white. Gold appears only where it
 * means something: the primary action on a screen, a selected tab, a verified
 * document, progress, the wallet pass itself. A screen that is mostly gold has
 * no way left to say "this one matters".
 *
 * Every colour a component uses comes from here. A hex literal anywhere else
 * is a bug waiting for the next palette change.
 */

export const color = {
  /* Ground, from deepest to highest. Each step is a surface a thing can sit
     on; depth comes from these steps and from shadow, not from borders. */
  bg: "#050505",
  bgDeep: "#080808",
  surface: "#101010",
  surfaceHigh: "#151515",
  surfaceTop: "#1B1B1B",
  /** The pressed or hovered state of a surface. */
  surfaceHover: "#202020",

  /* Hairlines. Barely there on purpose — rows separate by spacing first. */
  line: "rgba(255,255,255,0.06)",
  lineStrong: "rgba(255,255,255,0.10)",
  /** The lit top edge of a raised surface: light falls from above. */
  edge: "rgba(255,255,255,0.08)",

  /* Text. Warm white, never pure — #FFF on #050505 vibrates. */
  text: "#F5F3EE",
  textDim: "#A8A6A0",
  textMuted: "#6F6D68",
  /** Ink on a gold fill. */
  ink: "#17120A",

  /* The accent, used sparingly. */
  gold: "#C6A15B",
  goldLight: "#E0C783",
  goldDeep: "#8F6E32",
  goldWash: "rgba(198,161,91,0.10)",
  goldLine: "rgba(198,161,91,0.28)",
  goldGlow: "rgba(198,161,91,0.12)",

  /* Status. Desaturated so they sit inside a black-and-gold product instead of
     on top of it. */
  green: "#6FCF97",
  greenWash: "rgba(111,207,151,0.10)",
  amber: "#E5B45A",
  amberWash: "rgba(229,180,90,0.10)",
  red: "#EB7A6F",
  redWash: "rgba(235,122,111,0.10)",
  blue: "#8AB4F8",
  blueWash: "rgba(138,180,248,0.10)",

  scrim: "rgba(0,0,0,0.62)",
} as const;

export const gradient = {
  /** The gold fill of a primary button: lit from the top-left. */
  gold: ["#E0C783", "#C6A15B", "#A9843F"] as const,
  /** The wallet pass. Obsidian with a warm core. */
  pass: ["#1E1C19", "#0E0E0D", "#070707"] as const,
  /** A raised surface catching light at its top. */
  surface: ["#171717", "#101010"] as const,
  /** Fade to the ground, for content scrolling under a bar. */
  fadeDown: ["rgba(5,5,5,0)", "rgba(5,5,5,0.92)", "#050505"] as const,
  fadeUp: ["#050505", "rgba(5,5,5,0.85)", "rgba(5,5,5,0)"] as const,
};

/** A 4-point grid. */
export const space = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  section: 40,
  hero: 56,
} as const;

/** One radius system. Nothing in the app uses a radius outside this list. */
export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 28,
  pill: 999,
} as const;

/**
 * Shadows. Soft, black, large-radius: a raised thing on a black ground reads
 * as raised because of what is darker around it, not because of a glow.
 */
export const elevation = {
  none: {},
  low: {
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  mid: {
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  card: {
    shadowColor: "#000",
    shadowOpacity: 0.65,
    shadowRadius: 34,
    shadowOffset: { width: 0, height: 22 },
    elevation: 14,
  },
  /** The only glow in the product, and a faint one. */
  gold: {
    shadowColor: "#C6A15B",
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
} as const;

/** Minimum comfortable touch target. */
export const HIT = 44;

/** Content never stretches past this on a wide screen. */
export const MAX_CONTENT = 1180;
