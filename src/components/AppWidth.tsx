import React, { createContext, useContext, useState } from "react";
import { View, useWindowDimensions } from "react-native";

/**
 * How big the phone actually is.
 *
 * WHY NOT useWindowDimensions
 *
 * On a phone the window IS the app. In the web preview's phone frame it is
 * not, and a component sizing itself off the window lays out at 1280px inside
 * a 400px screen. So the container measures itself, and anything sized as a
 * fraction of the app reads that instead.
 *
 * EVERY RATIO
 *
 * Built for iPhone and Galaxy phones: from a 320pt-wide SE, through 360dp
 * Galaxy A and S phones and 430pt Pro Max, to a Fold opened flat (~700dp,
 * nearly square). `useDevice` gives screens the two facts that matter —
 * whether the phone is SHORT (an SE, or a Flip's cover-heavy ratio) and how
 * wide a comfortable column is — so nothing is sized by guesswork.
 */
export type Layout = "compact" | "medium" | "expanded";

export const BREAKPOINTS = { medium: 700, expanded: 1080 } as const;

/**
 * The app is built for phones — iPhone and Galaxy, every ratio from an SE to
 * a Fold opened flat — so it always lays out as a phone. A wide screen (an
 * unfolded Fold, a tablet) gets the phone layout held to a comfortable
 * column, not a stretched one. `width` is kept in the signature so callers do
 * not change if a tablet layout is ever wanted.
 */
export function layoutFor(_width: number): Layout {
  return "compact";
}

/** Widest a phone column is allowed to get (an unfolded Fold is ~700). */
export const PHONE_COLUMN = 560;

const AppWidthContext = createContext<number | null>(null);

export function AppWidthProvider({ children }: { children: React.ReactNode }) {
  const [width, setWidth] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);

  return (
    <View
      style={{ flex: 1 }}
      onLayout={(e) => {
        const next = Math.round(e.nativeEvent.layout.width);
        const h = Math.round(e.nativeEvent.layout.height);
        setWidth((cur) => (cur === next ? cur : next));
        setHeight((cur) => (cur === h ? cur : h));
      }}
    >
      <AppWidthContext.Provider value={width}>
        <AppHeightContext.Provider value={height}>{children}</AppHeightContext.Provider>
      </AppWidthContext.Provider>
    </View>
  );
}

export function useAppWidth(): number {
  const measured = useContext(AppWidthContext);
  const { width } = useWindowDimensions();
  return measured ?? width;
}

export function useLayout(): Layout {
  return layoutFor(useAppWidth());
}

const AppHeightContext = createContext<number | null>(null);

export function useDevice() {
  const width = useAppWidth();
  const measuredH = useContext(AppHeightContext);
  const { height: winH } = useWindowDimensions();
  const height = measuredH ?? winH;
  return {
    width,
    height,
    /** Under ~700pt tall: iPhone SE/8, small Galaxy A. Tighten vertical rhythm. */
    short: height < 700,
    /** Under 360pt wide: iPhone SE 1st gen, compact Androids. */
    narrow: width < 360,
    /** Content column: full width on a phone, held in on an unfolded Fold. */
    column: Math.min(width, PHONE_COLUMN),
  };
}
