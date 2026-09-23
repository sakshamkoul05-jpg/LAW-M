import React, { createContext, useContext, useState } from "react";
import { View, useWindowDimensions } from "react-native";

/**
 * How wide the app actually is.
 *
 * WHY NOT useWindowDimensions
 *
 * On a phone the window IS the app, so the two are the same number and the
 * distinction looks academic. They stop being the same the moment the app is
 * rendered inside anything — the web preview's phone frame, a tablet split
 * view, an iPad slide-over. A component that sizes itself off the window then
 * lays out at 1280px inside a 414px container, and the failure is spectacular:
 * a five-tab bar shows one tab, and a 16:10 carousel card becomes 774px tall
 * and swallows the screen. Both of those shipped in this app before the web
 * build made them visible.
 *
 * So the container measures itself once, on layout, and anything whose size is
 * a fraction of the app's width reads that instead. The window is the fallback
 * for the one frame before the measurement lands, and for any component used
 * outside the provider.
 */
const AppWidthContext = createContext<number | null>(null);

export function AppWidthProvider({ children }: { children: React.ReactNode }) {
  const [width, setWidth] = useState<number | null>(null);

  return (
    <View
      style={{ flex: 1 }}
      onLayout={(e) => {
        const next = Math.round(e.nativeEvent.layout.width);
        /* Only on a real change. A rotation or a browser resize should update
           it; a re-layout at the same width should not re-render the tree. */
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
