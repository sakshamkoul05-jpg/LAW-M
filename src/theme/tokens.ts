import { StyleSheet } from "react-native";

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

const DARK = {
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

  /* Quiet fills that used to be written inline as white-on-black alphas. */
  /** A selected option: gold edge on a warm, barely-lit fill. */
  goldSelect: "#15120C",
  /** The empty part of a progress bar or ring. */
  track: "rgba(255,255,255,0.07)",
  /** The flash under a finger. */
  press: "rgba(255,255,255,0.035)",
  /** A sheet's drag handle. */
  handle: "rgba(255,255,255,0.18)",
  /** The sweep across a loading skeleton. */
  shimmer: "rgba(255,255,255,0.045)",
  /** Frosted bars (tab bar, sheets): the tint over a blur, and the solid fallback where blur is not drawn. */
  glass: "rgba(16,16,16,0.72)",
  glassSolid: "rgba(16,16,16,0.94)",
  /** The screen header once content scrolls under it. */
  bar: "rgba(5,5,5,0.7)",
  barSolid: "rgba(5,5,5,0.97)",
};


/**
 * The light theme — "Ivory & Champagne". The same restraint as the dark one:
 * a warm ivory ground, white surfaces, near-black warm ink, and a gold one
 * step deeper so it still reads as gold — and still passes contrast — on a
 * light page. Gold fills keep the bright champagne gradient with dark ink.
 */
const LIGHT: Palette = {
  bg: "#F6F4EF",
  bgDeep: "#EFECE5",
  surface: "#FFFFFF",
  surfaceHigh: "#FFFFFF",
  surfaceTop: "#F3F0E9",
  surfaceHover: "#ECE8DF",

  line: "rgba(23,21,15,0.08)",
  lineStrong: "rgba(23,21,15,0.14)",
  edge: "rgba(255,255,255,0.9)",

  text: "#17150F",
  textDim: "#5C5950",
  textMuted: "#8A867C",
  ink: "#17120A",

  gold: "#9C7530",
  goldLight: "#B58C42",
  goldDeep: "#7A5A22",
  goldWash: "rgba(156,117,48,0.10)",
  goldLine: "rgba(156,117,48,0.34)",
  goldGlow: "rgba(156,117,48,0.12)",

  green: "#1E8A55",
  greenWash: "rgba(30,138,85,0.10)",
  amber: "#B07418",
  amberWash: "rgba(176,116,24,0.10)",
  red: "#C0443A",
  redWash: "rgba(192,68,58,0.10)",
  blue: "#2F6AD0",
  blueWash: "rgba(47,106,208,0.10)",

  scrim: "rgba(10,9,6,0.45)",

  goldSelect: "#F7EFDD",
  track: "rgba(23,21,15,0.08)",
  press: "rgba(23,21,15,0.045)",
  handle: "rgba(23,21,15,0.18)",
  shimmer: "rgba(255,255,255,0.65)",
  glass: "rgba(255,255,255,0.74)",
  glassSolid: "rgba(255,255,255,0.97)",
  bar: "rgba(246,244,239,0.76)",
  barSolid: "rgba(246,244,239,0.98)",
};

const DARK_GRADIENT = {
  /** The gold fill of a primary button: lit from the top-left. */
  gold: ["#E0C783", "#C6A15B", "#A9843F"] as const,
  /** The wallet pass. Obsidian with a warm core. */
  pass: ["#1E1C19", "#0E0E0D", "#070707"] as const,
  /** A raised surface catching light at its top. */
  surface: ["#171717", "#101010"] as const,
  /** Fade to the ground, for content scrolling under a bar. */
  fadeDown: ["rgba(5,5,5,0)", "rgba(5,5,5,0.92)", "#050505"] as const,
  fadeUp: ["#050505", "rgba(5,5,5,0.85)", "rgba(5,5,5,0)"] as const,
  /** A warm dark panel: a profile header, a category hero. */
  hero: ["#1E1A13", "#0E0D0B", "#080808"] as const,
};

const LIGHT_GRADIENT: GradientSet = {
  gold: ["#E0C783", "#C6A15B", "#A9843F"],
  /** A champagne pass on an ivory page. */
  pass: ["#F2E7CE", "#E6D3A8", "#D6BC85"],
  surface: ["#FFFFFF", "#FAF8F3"],
  fadeDown: ["rgba(246,244,239,0)", "rgba(246,244,239,0.92)", "#F6F4EF"],
  fadeUp: ["#F6F4EF", "rgba(246,244,239,0.85)", "rgba(246,244,239,0)"],
  hero: ["#FBF6EA", "#F4ECD9", "#EEE4CE"],
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
const DARK_ELEVATION = {
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
};


/** Shadows on ivory are lighter: the same lift, a third of the darkness. */
const LIGHT_ELEVATION: typeof DARK_ELEVATION = {
  none: {},
  low: { ...DARK_ELEVATION.low, shadowOpacity: 0.08 },
  mid: { ...DARK_ELEVATION.mid, shadowOpacity: 0.12 },
  card: { ...DARK_ELEVATION.card, shadowOpacity: 0.16 },
  gold: { ...DARK_ELEVATION.gold, shadowOpacity: 0.28 },
};

/* ── the active theme ────────────────────────────────────────────────────

   Every component reads `color`, `gradient` and `elevation` exactly as
   before. They are live views of whichever palette is active, so a value read
   while a screen renders is always the current theme's. Styles made with
   themed() are cached per theme for the same reason. Switching theme is
   setThemeMode() plus a remount of the screens (see ThemeProvider). */

export type ThemeMode = "dark" | "light";
export type Palette = { [K in keyof typeof DARK]: string };
type GradientSet = { [K in keyof typeof DARK_GRADIENT]: readonly [string, string, ...string[]] };

let active: ThemeMode = "dark";
const PALETTES: Record<ThemeMode, Palette> = { dark: DARK, light: LIGHT };
const GRADIENTS: Record<ThemeMode, GradientSet> = { dark: DARK_GRADIENT as GradientSet, light: LIGHT_GRADIENT };
const ELEVATIONS: Record<ThemeMode, typeof DARK_ELEVATION> = { dark: DARK_ELEVATION, light: LIGHT_ELEVATION };

export function themeMode(): ThemeMode {
  return active;
}
export function setThemeMode(mode: ThemeMode) {
  active = mode;
}

function live<T extends object>(pick: () => T): T {
  return new Proxy({} as T, {
    get: (_, key) => (pick() as Record<string | symbol, unknown>)[key],
    ownKeys: () => Reflect.ownKeys(pick()),
    getOwnPropertyDescriptor: (_, key) => ({ ...Object.getOwnPropertyDescriptor(pick(), key), configurable: true }),
  });
}

export const color: Palette = live(() => PALETTES[active]);
export const gradient: GradientSet = live(() => GRADIENTS[active]);
export const elevation: typeof DARK_ELEVATION = live(() => ELEVATIONS[active]);

/** Any value built from the palette at import time, rebuilt once per theme. */
export function perTheme<T extends object>(factory: () => T): T {
  const cache: Partial<Record<ThemeMode, T>> = {};
  return live(() => (cache[active] ??= factory()));
}

/** The dark palette itself, for things that stay dark in both themes (the wallet pass). */
export const darkColor: Palette = DARK;

/**
 * StyleSheet.create, once per theme. Write `themed(() => ({ ... }))` where a
 * file used `StyleSheet.create({ ... })`, and use `styles.box` as before.
 */
export function themed<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(factory: () => T & StyleSheet.NamedStyles<any>): T {
  const cache: Partial<Record<ThemeMode, T>> = {};
  return live(() => (cache[active] ??= StyleSheet.create(factory()) as T));
}

/** Minimum comfortable touch target. */
export const HIT = 44;

/** Content never stretches past this on a wide screen. */
export const MAX_CONTENT = 1180;
