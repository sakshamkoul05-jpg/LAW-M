import React, { createContext, useContext, useState } from "react";
import { View, useWindowDimensions } from "react-native";

/**
 * How wide the app actually is, and which layout that width calls for.
 *
 * WHY NOT useWindowDimensions
 *
 * On a phone the window IS the app. They stop being the same the moment the
 * app is rendered inside anything — the web preview's phone frame, an iPad
 * split view. A component sizing itself off the window then lays out at
 * 1280px inside a 414px container. So the container measures itself, and
 * anything sized as a fraction of the app reads that instead.
 *
 * THREE LAYOUTS, NOT A SHRUNK DESKTOP
 *
 *   compact   < 700   a phone. Bottom navigation, one column, sheets.
 *   medium    < 1080  a tablet or small laptop. Side rail, two columns.
 *   expanded  ≥ 1080  a desktop. Side rail with labels, wider columns, and
 *                     content held to a maximum width so it never stretches.
 *
 * Screens ask for the layout by name. They do not write media queries.
 */
export type Layout = "compact" | "medium" | "expanded";

export const BREAKPOINTS = { medium: 700, expanded: 1080 } as const;

export function layoutFor(width: number): Layout {
  if (width >= BREAKPOINTS.expanded) return "expanded";
  if (width >= BREAKPOINTS.medium) return "medium";
  return "compact";
}

const AppWidthContext = createContext<number | null>(null);

export function AppWidthProvider({ children }: { children: React.ReactNode }) {
  const [width, setWidth] = useState<number | null>(null);

  return (
    <View
      style={{ flex: 1 }}
      onLayout={(e) => {
        const next = Math.round(e.nativeEvent.layout.width);
        setWidth((cur) => (cur === next ? cur : next));
      }}
    >
      <AppWidthContext.Provider value={width}>{children}</AppWidthContext.Provider>
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
