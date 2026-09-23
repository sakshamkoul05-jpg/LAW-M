/**
 * The design system, in one file.
 *
 * WHAT "CRED-LEVEL" ACTUALLY MEANS HERE, SINCE IT IS OTHERWISE A MOOD
 *
 * It is not "dark and shiny". Four rules produce the feeling, and every screen
 * in this app obeys them:
 *
 *   1. ONE loud element per screen. On the wallet it is the balance. Everything
 *      else — labels, dates, hints, captions — is small, quiet and letterspaced.
 *      A screen with three things shouting has nothing to look at.
 *   2. The object gets a stage. The thing the screen is about sits alone, at
 *      full width, on a pool of light, with air around it.
 *   3. Surfaces are slabs, not boxes. Large radius, a hairline that is barely
 *      there, and a lit top edge — light falls from above, so the top edge of
 *      every raised thing catches it and the bottom does not. That single
 *      detail is most of why a flat rectangle starts reading as an object.
 *   4. Money is monospaced and tabular. A column of amounts must align on the
 *      decimal, or it reads as a list of strings rather than a ledger.
 *
 * Borrowed language, not borrowed artwork: no CRED mark, colour, illustration
 * or line of copy appears anywhere in this app. The palette is LAWFIC's own —
 * the gold is the gold from lawfic.pro, the purple is the Panda's.
 */

export const color = {
  /* GROUND. Not #000: pure black kills the lit edges that make slabs read as
     objects, and on OLED it turns every scroll edge into a hard cliff. */
  void: "#08090C",
  ground: "#0B0D12",

  /* SLABS, in rising order of elevation. */
  surface: "#101219",
  surfaceRaised: "#161922",
  surfaceHigh: "#1D212C",

  /* Hairlines and the lit top edge. Both are deliberately almost invisible —
     if you can clearly see the border, it is too strong. */
  hairline: "#232733",
  hairlineSoft: "#1A1D26",
  litEdge: "rgba(255,255,255,0.075)",

  /* TEXT. Three levels and no more: a fourth always turns into guesswork. */
  text: "#F3F2ED",
  textDim: "#9BA1AF",
  textFaint: "#666C7B",

  /* LAWFIC's gold, from the website. The single accent for money and action. */
  gold: "#E6C36B",
  goldDeep: "#A8842E",
  goldWash: "rgba(230,195,107,0.10)",

  /* The Panda's. Used for the assistant and nothing else, so its appearance on
     a screen always means the same thing. */
  panda: "#C74BF0",
  pandaDeep: "#3A0D6B",
  pandaHot: "#FF8AF0",

  /* STATUS. Each carries a wash for its own chip. */
  green: "#5DCB9C",
  greenWash: "rgba(93,203,156,0.12)",
  amber: "#E5A63F",
  amberWash: "rgba(229,166,63,0.12)",
  red: "#E5645D",
  redWash: "rgba(229,100,93,0.12)",

  /* Leather, for the wallet. Kept here rather than inside the wallet so a
     future finish picker has one place to read from. */
  leather: "#4A2E1C",
  leatherLit: "#6B4529",
  leatherDeep: "#2A1810",
  brass: "#C9A961",
  thread: "#D8CDB6",
} as const;

/**
 * An 8pt rhythm, with a 4 for the places where 8 is too loose — a chip's inner
 * padding, the gap between a label and the thing it labels.
 */
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
  section: 56,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

/**
 * Elevation as a pair: the shadow below AND the lit edge above. They are
 * published together because using one without the other is what makes a card
 * look like a sticker instead of a slab.
 */
export const elevation = {
  flat: {
    shadowColor: "#000",
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  raised: {
    shadowColor: "#000",
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  floating: {
    shadowColor: "#000",
    shadowOpacity: 0.6,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 16 },
    elevation: 14,
  },
  /* For the wallet on its stage. A shadow this large is wrong for a card and
     right for a physical object resting on a surface. */
  object: {
    shadowColor: "#000",
    shadowOpacity: 0.7,
    shadowRadius: 48,
    shadowOffset: { width: 0, height: 28 },
    elevation: 22,
  },
} as const;

/** The one place that decides whether a touch target is big enough. */
export const HIT = 44;
