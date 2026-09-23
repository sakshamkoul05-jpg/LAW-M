import React, { useCallback, useRef, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";
import { Icon } from "@/icons/Icon";
import { color as C, elevation, font, radius, space, text } from "@/theme";
import { flyers, type Flyer } from "@/data/flyers";
import { Touch } from "./primitives";
import { useAppWidth } from "./AppWidth";

/**
 * The promotional flyers, as a paging carousel.
 *
 * THE PARALLAX IS THE POINT
 *
 * The photograph inside each card moves at roughly 40% of the scroll speed of
 * the card itself. That is the whole trick: the image appears to sit BEHIND a
 * window rather than being printed on a card sliding past. It costs one
 * interpolation per frame and it is the single highest-return animation in a
 * carousel — without it, paging photos look like a slideshow.
 *
 * The card also scales down slightly and dims as it leaves centre, so at any
 * moment exactly one flyer is the bright one. Two equally-lit cards on screen
 * means the eye has to choose, and it chooses not to look at either.
 */
export function FlyerCarousel({ onOpen }: { onOpen: (flyer: Flyer) => void }) {
  /* As in TabBar: the card is a fraction of the APP, and the card's height
     is a fraction of the card. Measuring the window here made a 774px-tall
     flyer inside a 414px phone. */
  const width = useAppWidth();
  const CARD = width - space.lg * 2;
  const GAP = space.md;
  const STRIDE = CARD + GAP;

  const scrollX = useSharedValue(0);
  const [page, setPage] = useState(0);
  const lastPage = useRef(0);

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  /* The dots are React state, so they update once per page rather than once per
     frame. Driving them from the shared value would re-render the row 60 times
     a second to change one opacity. */
  const onMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = Math.round(e.nativeEvent.contentOffset.x / STRIDE);
      if (next !== lastPage.current) {
        lastPage.current = next;
        setPage(next);
      }
    },
    [STRIDE],
  );

  return (
    <View>
      <Animated.ScrollView
        horizontal
        pagingEnabled={false}
        snapToInterval={STRIDE}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        onMomentumScrollEnd={onMomentumEnd}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingHorizontal: space.lg, gap: GAP }}
      >
        {flyers.map((flyer, i) => (
          <FlyerCard
            key={flyer.id}
            flyer={flyer}
            index={i}
            width={CARD}
            stride={STRIDE}
            scrollX={scrollX}
            onPress={() => onOpen(flyer)}
          />
        ))}
      </Animated.ScrollView>

      <View style={styles.dots}>
        {flyers.map((f, i) => (
          <View
            key={f.id}
            style={[
              styles.dot,
              i === page && { width: 16, backgroundColor: C.gold },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

function FlyerCard({
  flyer,
  index,
  width,
  stride,
  scrollX,
  onPress,
}: {
  flyer: Flyer;
  index: number;
  width: number;
  stride: number;
  scrollX: SharedValue<number>;
  onPress: () => void;
}) {
  const HEIGHT = Math.round(width * 0.62);
  const [failed, setFailed] = useState(false);

  const range = [(index - 1) * stride, index * stride, (index + 1) * stride];

  const card = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(scrollX.value, range, [0.945, 1, 0.945], Extrapolation.CLAMP) },
    ],
    opacity: interpolate(scrollX.value, range, [0.6, 1, 0.6], Extrapolation.CLAMP),
  }));

  /* The image is wider than its window, and slides the other way. */
  const photo = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          scrollX.value,
          range,
          [width * 0.18, 0, -width * 0.18],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  return (
    <Animated.View style={card}>
      <Touch onPress={onPress} accessibilityLabel={`${flyer.title}. ${flyer.cta}`}>
        <View style={[{ width, height: HEIGHT, borderRadius: radius.xl, overflow: "hidden" }, elevation.floating]}>
          {/* The tint sits underneath, so a photo that is slow or absent leaves
              a designed card rather than a grey hole. */}
          <LinearGradient colors={flyer.tint} style={StyleSheet.absoluteFill} />

          {!failed && (
            <Animated.View style={[StyleSheet.absoluteFill, photo]}>
              <Image
                source={{ uri: flyer.photo }}
                /* Deliberately not the alt text: the button already announces
                   the headline, and a screen reader that reads both says the
                   same card twice. */
                accessible={false}
                onError={() => setFailed(true)}
                style={{ width: width * 1.36, height: HEIGHT, marginLeft: -width * 0.18 }}
                resizeMode="cover"
              />
            </Animated.View>
          )}

          {/* The scrim. Neutral, not tinted: a coloured scrim over a photograph
              of a person turns their skin a colour it is not. */}
          <LinearGradient
            colors={["rgba(6,8,12,0.10)", "rgba(6,8,12,0.72)", "rgba(6,8,12,0.94)"]}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.body}>
            <View style={styles.kicker}>
              <Icon name={flyer.icon} size={13} color={C.gold} />
              <Text style={[text.label, { color: C.gold }]}>{flyer.kicker}</Text>
            </View>

            <Text style={styles.title} numberOfLines={2}>
              {flyer.title}
            </Text>

            <View style={styles.cta}>
              <Text style={[text.small, { color: C.text, fontFamily: font.bodySemi }]}>
                {flyer.cta}
              </Text>
              <Icon name="chevron" size={14} color={C.gold} />
            </View>
          </View>
        </View>
      </Touch>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  body: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    padding: space.xl,
    gap: space.sm,
  },
  kicker: { flexDirection: "row", alignItems: "center", gap: 6 },
  title: {
    fontFamily: font.display,
    fontSize: 21,
    lineHeight: 26,
    letterSpacing: -0.4,
    color: C.text,
  },
  cta: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
    marginTop: space.md,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: C.hairline,
  },
});
