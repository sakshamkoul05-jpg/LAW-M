import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform, StyleSheet, View, useWindowDimensions } from "react-native";
import { Button, T, Wordmark } from "@/ui";
import { color as C, space } from "@/theme";

/**
 * The browser preview's two ways of looking at the app.
 *
 *   desktop (default)  the app lays itself out for the window — side rail,
 *                      wide columns, hover states. This is how LAWFiC looks on
 *                      a laptop.
 *   phone              the app at phone width inside a device frame, for
 *                      showing somebody what the mobile app looks like without
 *                      handing them a phone.
 *
 * On iOS and Android none of this exists; the component is a passthrough.
 */
type Mode = "desktop" | "phone";
const Ctx = createContext<{ mode: Mode; setMode: (m: Mode) => void; canFrame: boolean }>({ mode: "desktop", setMode: () => {}, canFrame: false });

const KEY = "lawfic:view-mode";
const PHONE_W = 400;
const FRAME_AT = 760;

export function useViewMode() {
  return useContext(Ctx);
}

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  const { width, height } = useWindowDimensions();
  const [mode, setModeState] = useState<Mode>("desktop");
  const canFrame = Platform.OS === "web" && width >= FRAME_AT;

  useEffect(() => {
    if (Platform.OS !== "web") return;
    try {
      const saved = window.localStorage.getItem(KEY);
      if (saved === "phone") setModeState("phone");
    } catch {
      /* storage blocked: stay on desktop */
    }
  }, []);

  const setMode = (m: Mode) => {
    setModeState(m);
    try {
      window.localStorage.setItem(KEY, m);
    } catch {
      /* ignore */
    }
  };

  const ctx = { mode, setMode, canFrame };

  if (!canFrame || mode === "desktop") return <Ctx.Provider value={ctx}>{children}</Ctx.Provider>;

  const phoneH = Math.min(PHONE_W * 2.16, height - space.xxl * 2);
  const phoneW = Math.min(PHONE_W, phoneH / 2.16);

  return (
    <Ctx.Provider value={ctx}>
      <View style={styles.stage}>
        <View style={styles.aside}>
          <Wordmark size={18} />
          <T v="title3" style={{ marginTop: space.lg }}>
            The mobile app, at phone size.
          </T>
          <T v="callout">Everything here works — the passes, the filings, the wallet, LAWFiC AI. Haptics and the native blur need a real phone.</T>
          <T v="caption">Preview mode: balances, filings and dates are sample data stored in this browser. No payment is taken.</T>
          <Button label="Back to desktop view" icon="devices" variant="secondary" size="md" full={false} onPress={() => setMode("desktop")} style={{ marginTop: space.lg }} />
        </View>
        <View style={[styles.phone, { width: phoneW, height: phoneH }]}>
          <View style={styles.screen}>{children}</View>
        </View>
      </View>
    </Ctx.Provider>
  );
}

const styles = StyleSheet.create({
  stage: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: space.hero, backgroundColor: "#030303", padding: space.xxl },
  aside: { maxWidth: 320, flexShrink: 1, gap: space.sm },
  phone: {
    borderRadius: 48,
    padding: 10,
    backgroundColor: "#121212",
    borderWidth: 1,
    borderColor: "#262626",
    shadowColor: "#000",
    shadowOpacity: 0.8,
    shadowRadius: 60,
    shadowOffset: { width: 0, height: 30 },
  },
  screen: { flex: 1, borderRadius: 38, overflow: "hidden", backgroundColor: C.bg },
});
