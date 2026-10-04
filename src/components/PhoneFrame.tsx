import React from "react";
import { Image, Platform, StyleSheet, View, useWindowDimensions } from "react-native";
import { T } from "@/ui/Text";
import { color as C, font, space, themed } from "@/theme";

/**
 * The web preview's phone.
 *
 * LAWFIC is a phone app, for iPhone and Galaxy. On a computer the browser
 * shows it the way it will be used — inside a phone, at phone size — rather
 * than stretching a phone layout across a monitor. Narrow the browser below
 * 600px and the frame drops away, because the window is then the phone.
 *
 * On iOS and Android this is a passthrough; nothing here exists.
 */
const PHONE_W = 393; // iPhone 15/16 and Galaxy S-series are all within a few points of this
const RATIO = 852 / 393;
const FRAME_AT = 600;

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  const { width, height } = useWindowDimensions();
  if (Platform.OS !== "web" || width < FRAME_AT) return <>{children}</>;

  const phoneH = Math.min(PHONE_W * RATIO, height - space.xxl * 2);
  const phoneW = Math.min(PHONE_W, phoneH / RATIO);
  const showAside = width >= 980;

  return (
    <View style={styles.stage}>
      {showAside && (
        <View style={styles.aside}>
          <Image source={require("../../assets/brand/lawfic-logo.png")} style={{ width: 120, height: 109 }} resizeMode="contain" />
          <T v="title2" style={{ marginTop: space.md }}>
            Your legal wallet, on your phone.
          </T>
          <T v="callout" style={{ marginTop: space.sm }}>
            Built for iPhone and Samsung Galaxy. Filings, documents, payments and Panda AI — in one place.
          </T>
          <T v="caption" style={{ marginTop: space.lg }}>
            Shown here at phone size. Figures are demo data kept in this browser; no payment is taken.
          </T>
        </View>
      )}
      <View style={[styles.phone, { width: phoneW + 20, height: phoneH + 20 }]}>
        <View style={styles.button} />
        <View style={styles.screen}>{children}</View>
      </View>
    </View>
  );
}

/** Kept for callers from the old desktop/phone toggle; the app is phone-only now. */
export function useViewMode() {
  return { mode: "phone" as const, setMode: (_m: "phone" | "desktop") => {}, canFrame: false };
}

const styles = themed(() => ({
  stage: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 96, backgroundColor: "#030303", padding: space.xxl },
  aside: { width: 300 },
  phone: {
    borderRadius: 58,
    padding: 10,
    backgroundColor: "#0C0C0C",
    borderWidth: 1.5,
    borderColor: "#2B2B2B",
    shadowColor: "#000",
    shadowOpacity: 0.9,
    shadowRadius: 70,
    shadowOffset: { width: 0, height: 34 },
  },
  button: { position: "absolute", right: -3, top: 180, width: 3, height: 80, borderRadius: 2, backgroundColor: "#2B2B2B" },
  screen: { flex: 1, borderRadius: 48, overflow: "hidden", backgroundColor: C.bg },
}));
