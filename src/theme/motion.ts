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
 * colour crossfade, an opacity, a sheen travelling across leather.
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

/** The wallet opening. The heaviest thing in the app, and it should feel it. */
export const heavy: WithSpringConfig = {
  mass: 1.6,
  stiffness: 120,
  damping: 18,
  reduceMotion: ReduceMotion.System,
};

/** A note leaving the wallet: loose, with real overshoot, so it reads as paper. */
export const paper: WithSpringConfig = {
  mass: 0.7,
  stiffness: 150,
  damping: 13,
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

/** How far a pressable sinks. 0.97 reads as a press; 0.9 reads as a collapse. */
export const PRESS_SCALE = 0.972;
