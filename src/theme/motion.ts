import {
  Easing,
  ReduceMotion,
  type WithSpringConfig,
  type WithTimingConfig,
} from "react-native-reanimated";

/**
 * Every animation in the app picks from this list.
 *
 * WHY SPRINGS AND NOT DURATIONS
 *
 * A duration says "take 300ms". A spring says "you have mass". When a card is
 * pressed and released, a duration makes it return at the same speed however
 * far it travelled; a spring makes a small press settle fast and a large one
 * settle slow, which is what a physical thing does. That difference is most of
 * what people mean when they call an interface premium — they are describing
 * physics they recognise, not smoothness.
 *
 * The few timings below are for the things that genuinely have no mass: a
 * colour crossfade, an opacity, a sheen travelling across the pass.
 *
 * Every entry carries ReduceMotion.System. A customer who has asked their phone
 * to stop animating things has asked this app too, and a wallet that flings
 * itself open anyway is not characterful, it is rude.
 */

/** A press. Fast, barely any overshoot — a button is small and stiff. */
export const press: WithSpringConfig = {
  mass: 0.4,
  stiffness: 420,
  damping: 26,
  reduceMotion: ReduceMotion.System,
};

/** A panel or sheet arriving. Heavier, with one visible settle. */
export const arrive: WithSpringConfig = {
  mass: 0.9,
  stiffness: 180,
  damping: 20,
  reduceMotion: ReduceMotion.System,
};

/** The wallet pass lifting or expanding. The heaviest thing in the app. */
export const heavy: WithSpringConfig = {
  mass: 1.6,
  stiffness: 120,
  damping: 18,
  reduceMotion: ReduceMotion.System,
};

/** A value counting up. Decelerating, never bouncing — money must not overshoot. */
export const count: WithTimingConfig = {
  duration: 900,
  easing: Easing.bezier(0.16, 1, 0.3, 1),
  reduceMotion: ReduceMotion.System,
};

export const fade: WithTimingConfig = {
  duration: 220,
  easing: Easing.out(Easing.quad),
  reduceMotion: ReduceMotion.System,
};

export const sheen: WithTimingConfig = {
  duration: 1400,
  easing: Easing.inOut(Easing.cubic),
  reduceMotion: ReduceMotion.System,
};

/** A tab indicator or segmented control sliding between options. */
export const slide: WithSpringConfig = {
  mass: 0.6,
  stiffness: 260,
  damping: 26,
  reduceMotion: ReduceMotion.System,
};

/** Entrance of content: a short rise and fade. */
export const enter: WithTimingConfig = {
  duration: 420,
  easing: Easing.bezier(0.2, 0.8, 0.2, 1),
  reduceMotion: ReduceMotion.System,
};

/** Durations, for the few things that are timed rather than sprung. */
export const duration = { instant: 120, fast: 180, base: 260, slow: 420, count: 900 } as const;

/** The standard ease-out: quick start, long gentle landing. */
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

/** How far a pressable sinks. 0.97 reads as a press; 0.9 reads as a collapse. */
export const PRESS_SCALE = 0.972;

/** Delay between items in a staggered list. More than ~50ms feels slow. */
export const STAGGER = 45;
