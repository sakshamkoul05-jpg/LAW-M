import React, { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { color as C, elevation, font, motion, radius } from "@/theme";
import { Leather, Stitching } from "./Leather";
import { breakIntoNotes, Note, type NoteStyleId } from "./Note";

/**
 * The wallet.
 *
 * This is the object the whole app is arranged around, so it gets the budget.
 * Five things are happening at once, and each one is doing a specific job:
 *
 *   1. TILT. A pan anywhere on the wallet rotates it in perspective, tracking
 *      the finger. This is the interaction that convinces: a flat image does
 *      not have sides, and the moment a thing shows you its sides it stops
 *      being a picture of a wallet. It springs back to square on release.
 *   2. THE POCKET OPENS. A tap leans the front cover forward on its bottom
 *      edge. Not a flip — a flip shows you the inside of the cover, which on a
 *      real bifold is a blank lining. A lean shows you the money.
 *   3. THE NOTES RISE, staggered. Each one is delayed a little more than the
 *      one before, and each lands at its own small angle. Simultaneous notes
 *      read as one printed graphic; staggered ones read as a handful of paper.
 *   4. THE SHEEN sweeps. A soft band of light travels across the leather when
 *      the wallet opens and whenever it is tilted hard. Leather is not matte —
 *      the highlight moving across it as it turns is most of why it looks like
 *      a material rather than a colour.
 *   5. HAPTICS. Medium on open, light on close. The phone answers at the
 *      moment the cover moves, not when the animation finishes.
 *
 * All five obey the system Reduce Motion setting through the shared spring
 * configs, so a customer who has asked their phone to stop animating gets a
 * wallet that simply is open or shut.
 */

const W = 300;
const H = 188;
/** How much of the body the front cover covers. The rest is the money. */
const COVER = 0.66;
const NOTE_W = 116;
const NOTE_H = 62;

export function Wallet({
  balancePaise,
  open,
  onToggle,
  engraving = "",
  noteStyle = "classic",
}: {
  balancePaise: number;
  open: boolean;
  onToggle: (next: boolean) => void;
  /** Stamped into the brass plate. Empty renders no plate rather than a blank one. */
  engraving?: string;
  noteStyle?: NoteStyleId;
}) {
  const openness = useSharedValue(open ? 1 : 0);
  const rx = useSharedValue(0);
  const ry = useSharedValue(0);
  const sheen = useSharedValue(0);

  const notes = breakIntoNotes(balancePaise / 100);

  const tap = useCallback(() => {
    const next = !open;
    onToggle(next);
    Haptics.impactAsync(
      next ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light,
    ).catch(() => {});
  }, [open, onToggle]);

  /* Drive the animation off the prop, not off internal state: the screen owns
     whether the wallet is open, so a navigation that resets it does not leave
     the leather half-way. */
  React.useEffect(() => {
    openness.value = withSpring(open ? 1 : 0, motion.heavy);
    sheen.value = 0;
    sheen.value = withDelay(80, withTiming(1, motion.sheen));
  }, [open, openness, sheen]);

  const pan = Gesture.Pan()
    .onChange((e) => {
      /* Clamped hard. A wallet that can be spun to 40 degrees stops looking
         like an object on a table and starts looking like a 3D model. */
      ry.value = Math.max(-16, Math.min(16, ry.value + e.changeX * 0.22));
      rx.value = Math.max(-12, Math.min(12, rx.value - e.changeY * 0.18));
    })
    .onEnd(() => {
      ry.value = withSpring(0, motion.arrive);
      rx.value = withSpring(0, motion.arrive);
    });

  const press = Gesture.Tap()
    .maxDuration(320)
    .onEnd((_e, success) => {
      if (success) runOnJS(tap)();
    });

  const gesture = Gesture.Simultaneous(pan, press);

  const body = useAnimatedStyle(() => ({
    transform: [
      { perspective: 900 },
      { rotateX: `${rx.value}deg` },
      { rotateY: `${ry.value}deg` },
      /* The whole wallet leans back a touch as it opens, the way something
         does when you tip its lid toward you. */
      { rotateX: `${interpolate(openness.value, [0, 1], [0, -7])}deg` },
    ],
  }));

  const cover = useAnimatedStyle(() => ({
    transform: [
      { perspective: 800 },
      { rotateX: `${interpolate(openness.value, [0, 1], [0, 34])}deg` },
      { translateY: interpolate(openness.value, [0, 1], [0, 6]) },
    ],
  }));

  const sheenStyle = useAnimatedStyle(() => {
    /* The band also responds to tilt, so turning the wallet in the hand moves
       the highlight even when nothing is animating. */
    const fromTilt = interpolate(ry.value, [-16, 16], [-0.5, 1.5], Extrapolation.CLAMP);
    const fromOpen = interpolate(sheen.value, [0, 1], [-0.6, 1.6]);
    const at = sheen.value > 0 && sheen.value < 1 ? fromOpen : fromTilt;
    return {
      transform: [{ translateX: at * W * 1.2 }, { rotateZ: "18deg" }],
      opacity: interpolate(Math.abs(ry.value), [0, 16], [0.5, 0.9], Extrapolation.CLAMP),
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        accessibilityRole="button"
        accessibilityLabel={open ? "Close the wallet" : "Open the wallet"}
        accessibilityHint="Drag to turn it"
        style={[{ width: W, height: H, alignSelf: "center" }, body, elevation.object]}
      >
        {/* ── THE BODY. Always there; the money sits in it. ── */}
        <Leather width={W} height={H} corner={radius.lg} seed={11}>
          {/* A darker well at the top, so the notes look like they are IN
              something rather than resting on a flat panel. */}
          <LinearGradient
            colors={["rgba(0,0,0,0.55)", "transparent"]}
            style={{ position: "absolute", left: 0, right: 0, top: 0, height: H * 0.34 }}
            pointerEvents="none"
          />
        </Leather>

        {/* ── THE MONEY ── */}
        <View
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {notes.map((value, i) => (
            <RisingNote
              key={`${value}-${i}`}
              index={i}
              total={notes.length}
              value={value}
              openness={openness}
              styleId={noteStyle}
            />
          ))}
        </View>

        {/* ── THE FRONT COVER ── */}
        <Animated.View
          style={[
            {
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: H * COVER,
              transformOrigin: "bottom",
            },
            cover,
          ]}
          pointerEvents="none"
        >
          <Leather width={W} height={H * COVER} corner={radius.lg} seed={29}>
            <Stitching width={W} height={H * COVER} corner={radius.lg} inset={9} />

            {/* The sheen. Clipped by the leather's own overflow. */}
            <Animated.View
              style={[
                {
                  position: "absolute",
                  top: -H,
                  bottom: -H,
                  width: 54,
                  left: -54,
                },
                sheenStyle,
              ]}
              pointerEvents="none"
            >
              <LinearGradient
                colors={["transparent", "rgba(255,255,255,0.20)", "transparent"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>

            {engraving ? <Plate text={engraving} /> : <Maker />}
          </Leather>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

/**
 * One note, rising out of the pocket.
 *
 * The stagger is the point. Note i waits 46ms longer than note i−1 and settles
 * on a spring loose enough to overshoot slightly, because paper does. The small
 * per-note rotation is derived from the index rather than randomised, so the
 * fan is the same fan every time the wallet opens — a fan that reshuffles reads
 * as a glitch.
 */
function RisingNote({
  index,
  total,
  value,
  openness,
  styleId,
}: {
  index: number;
  total: number;
  value: number;
  openness: SharedValue<number>;
  styleId: NoteStyleId;
}) {
  const spread = (index - (total - 1) / 2) * 7;
  const lift = 54 + index * 13;

  const style = useAnimatedStyle(() => {
    const t = interpolate(
      openness.value,
      [0, 0.18 + index * 0.07, 1],
      [0, 0, 1],
      Extrapolation.CLAMP,
    );
    return {
      transform: [
        { translateY: interpolate(t, [0, 1], [18, -lift]) },
        { translateX: interpolate(t, [0, 1], [0, spread * 1.6]) },
        { rotateZ: `${interpolate(t, [0, 1], [0, spread * 0.55])}deg` },
        { scale: interpolate(t, [0, 1], [0.94, 1]) },
      ],
      opacity: interpolate(t, [0, 0.25, 1], [0, 1, 1]),
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: 44,
          left: (W - NOTE_W) / 2,
          zIndex: total - index,
        },
        style,
        elevation.raised,
      ]}
    >
      <Note value={value} width={NOTE_W} height={NOTE_H} styleId={styleId} />
    </Animated.View>
  );
}

/** The engraved brass plate. Two offset copies of the text make the emboss. */
function Plate({ text }: { text: string }) {
  return (
    <View
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 22,
        alignItems: "center",
      }}
    >
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 7,
          borderRadius: 4,
          backgroundColor: C.brass,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: "rgba(255,255,255,0.35)",
          overflow: "hidden",
        }}
      >
        <LinearGradient
          colors={["rgba(255,255,255,0.45)", "rgba(255,255,255,0)", "rgba(0,0,0,0.25)"]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.9, y: 1 }}
        />
        <Text
          style={{
            fontFamily: font.bodyBold,
            fontSize: 10.5,
            letterSpacing: 2.4,
            color: "#3A2C0C",
          }}
        >
          {text.toUpperCase()}
        </Text>
      </View>
    </View>
  );
}

/** Blind-stamped maker's mark, for a wallet with no engraving yet. */
function Maker() {
  return (
    <View style={{ position: "absolute", left: 0, right: 0, bottom: 26, alignItems: "center" }}>
      <Text
        style={{
          fontFamily: font.bodyBold,
          fontSize: 11,
          letterSpacing: 5,
          color: "rgba(0,0,0,0.42)",
        }}
      >
        LAWFIC
      </Text>
      <Text
        style={{
          fontFamily: font.bodyBold,
          fontSize: 11,
          letterSpacing: 5,
          color: "rgba(255,255,255,0.07)",
          position: "absolute",
          top: -1,
        }}
      >
        LAWFIC
      </Text>
    </View>
  );
}

export const WALLET_SIZE = { W, H };
