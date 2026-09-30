import React, { useEffect } from "react";
import { View } from "react-native";
import * as Haptics from "expo-haptics";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from "react-native-reanimated";
import { elevation, motion } from "@/theme";
import { WalletCard, type Pass } from "./WalletCard";

/**
 * The Apple Wallet stack.
 *
 * AT REST the passes overlap, each showing its top strip — enough to read its
 * name and colour, which is all you need to pick one. TAP one and it rises to
 * the top at full size while the others slide down and tuck into a pile. TAP
 * it again, or tap the pile, and the stack reassembles.
 *
 * That motion is the whole feature. Apple Wallet is not memorable for its
 * cards, which are just images; it is memorable because choosing one feels like
 * lifting it out of a deck. Every card here springs to its new position on its
 * own spring, a few milliseconds apart, so the deck moves like paper rather
 * than like a list re-rendering.
 *
 * DRAGGING THE SELECTED PASS tilts it, and the tilt drives the sheen and the
 * foil on its face. It springs flat on release.
 */

const PEEK = 58;
const PILE_GAP = 10;
/** How much of the last tucked pass shows below the pile. */
const PILE_STRIP = 30;
/** Room kept around the stack so the clip does not eat the cards' shadows. */
const SHADOW = 18;

export function CardStack({
  passes,
  width,
  selected,
  onSelect,
  hideAmount,
}: {
  passes: Pass[];
  width: number;
  selected: string | null;
  onSelect: (id: string | null) => void;
  hideAmount?: boolean;
}) {
  const H = Math.round(width / 1.586);
  const selIndex = selected ? passes.findIndex((p) => p.id === selected) : -1;

  /* The stack's own height changes with the state, and the page below it has
     to move with it or the transactions list jumps.

     WITH A PASS SELECTED THE PILE IS CLIPPED, not merely positioned. Each
     tucked pass is a full-size card, and without a clip its whole body hangs
     down over whatever is under the stack — which is what the first build did,
     drawing the membership pass across the action buttons. Apple Wallet shows
     only a strip of each tucked card; the clip is how. */
  const selected_ = selIndex !== -1;
  const stackH = selected_ ? H + 28 + PILE_GAP * (passes.length - 1) + PILE_STRIP : H + PEEK * (passes.length - 1);

  return (
    <View
      style={{
        width: width + SHADOW * 2,
        height: stackH + SHADOW,
        marginHorizontal: -SHADOW,
        paddingHorizontal: SHADOW,
        /* Room above for the tilt and the shadow, which a clip would cut. */
        marginTop: -SHADOW / 2,
        paddingTop: SHADOW / 2,
        overflow: selected_ ? "hidden" : "visible",
      }}
    >
      {passes.map((p, i) => (
        <StackCard
          key={p.id}
          pass={p}
          index={i}
          count={passes.length}
          selIndex={selIndex}
          width={width}
          height={H}
          hideAmount={hideAmount}
          onPress={() => onSelect(selIndex === i ? null : p.id)}
        />
      ))}
    </View>
  );
}

function StackCard({
  pass,
  index,
  count,
  selIndex,
  width,
  height,
  hideAmount,
  onPress,
}: {
  pass: Pass;
  index: number;
  count: number;
  selIndex: number;
  width: number;
  height: number;
  hideAmount?: boolean;
  onPress: () => void;
}) {
  const y = useSharedValue(index * PEEK);
  const scale = useSharedValue(1);
  const tilt = useSharedValue(0);
  const rx = useSharedValue(0);

  const isSel = selIndex === index;

  useEffect(() => {
    let targetY: number;
    let targetScale = 1;

    if (selIndex === -1) {
      targetY = index * PEEK;
    } else if (isSel) {
      targetY = 0;
    } else {
      /* The pile: everything that is not selected, in order, tucked under. */
      const pileIndex = index < selIndex ? index : index - 1;
      targetY = height + 28 + pileIndex * PILE_GAP;
      targetScale = 0.94 - pileIndex * 0.02;
    }

    /* Staggered: each card's spring starts a touch after the one above it, so
       the deck ripples instead of teleporting. */
    const delay = Math.abs(index - Math.max(selIndex, 0)) * 28;
    const t = setTimeout(() => {
      y.value = withSpring(targetY, motion.arrive);
      scale.value = withSpring(targetScale, motion.arrive);
    }, delay);
    return () => clearTimeout(t);
  }, [selIndex, index, isSel, height, y, scale]);

  const buzz = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

  const tap = Gesture.Tap()
    .maxDuration(280)
    .onEnd((_e, ok) => {
      if (ok) {
        runOnJS(buzz)();
        runOnJS(onPress)();
      }
    });

  const pan = Gesture.Pan()
    .enabled(isSel)
    .activeOffsetX([-8, 8])
    .onChange((e) => {
      tilt.value = Math.max(-1, Math.min(1, tilt.value + e.changeX / 140));
      rx.value = Math.max(-1, Math.min(1, rx.value - e.changeY / 180));
    })
    .onEnd(() => {
      tilt.value = withSpring(0, motion.arrive);
      rx.value = withSpring(0, motion.arrive);
    });

  /* PERSPECTIVE FIRST. Always. With translateY ahead of it, the perspective
     was applied in already-translated space: for a pass pushed 250px down into
     the pile, every point near its bottom edge came out with a negative w and
     the browser culled it. The selected pass, sitting at y=0, was unaffected —
     which is why the stack looked fine until something was tucked. */
  const style = useAnimatedStyle(() => ({
    transform: [
      { perspective: 900 },
      { translateY: y.value },
      { rotateY: `${tilt.value * 12}deg` },
      { rotateX: `${rx.value * 9}deg` },
      { scale: scale.value },
    ],
    zIndex: isSel ? 100 : index,
  }));

  return (
    <GestureDetector gesture={Gesture.Simultaneous(tap, pan)}>
      <Animated.View
        accessibilityRole="button"
        accessibilityLabel={`${pass.title} pass. ${isSel ? "Tap to put back" : "Tap to open"}`}
        style={[{ position: "absolute", left: SHADOW, top: SHADOW / 2, width }, elevation.card, style]}
      >
        <WalletCard pass={pass} width={width} tilt={tilt as SharedValue<number>} hideAmount={hideAmount} />
      </Animated.View>
    </GestureDetector>
  );
}

export const STACK_PEEK = PEEK;
