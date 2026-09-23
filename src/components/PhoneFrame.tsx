import React from "react";
import { Platform, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { color as C, font, radius, space } from "@/theme";

/** Roughly a large phone. Wider than this and the layouts stop being layouts. */
const PHONE_W = 414;
/** Below this the browser window is already phone-shaped; no frame needed. */
const FRAME_AT = 760;

/**
 * The web preview's phone frame.
 *
 * WHY THIS EXISTS AT ALL
 *
 * This is a phone app. On a laptop it renders into whatever width the browser
 * gives it, and a 1440px-wide column of 44pt list rows does not look like a
 * design decision — it looks broken, which is exactly what somebody opening the
 * preview link will report. Constraining it to phone width and centring it on a
 * dark ground is the difference between "the app" and "a broken website".
 *
 * NATIVE IS UNTOUCHED
 *
 * On iOS and Android this returns its children and nothing else. There is no
 * frame, no measurement, no extra view in the tree. The whole component
 * compiles away to a passthrough on the platforms that matter.
 *
 * It also reacts to the window: drag a browser narrow and the frame drops away
 * at 760px, because at that point the window IS the phone.
 */
export function PhoneFrame({ children }: { children: React.ReactNode }) {
  const { width, height } = useWindowDimensions();

  if (Platform.OS !== "web" || width < FRAME_AT) {
    return <>{children}</>;
  }

  /* The phone must fit the window. A fixed 880 looks right on a large monitor
     and, on a laptop or a short browser pane, silently hangs the bottom of the
     app below the fold — which looks like the screen rendered blank rather than
     like a frame that is too tall. */
  const phoneH = Math.min(PHONE_W * 2.16, height - space.xxl * 2);
  const phoneW = Math.min(PHONE_W, phoneH / 2.16);

  return (
    <View style={styles.stage}>
      <View style={styles.aside}>
        <Text style={styles.title}>LAWFIC</Text>
        <Text style={styles.sub}>
          A front-end preview of the mobile app, running in a browser.
        </Text>
        <Text style={styles.note}>
          Built for a phone, so it is shown at phone width. Haptics and the
          native blur do not exist in a browser — the springs, the wallet and
          the layouts all do.
        </Text>
        <Text style={styles.note}>
          Every balance, order and date on these screens is a sample.
        </Text>
      </View>

      <View style={[styles.phone, { width: phoneW, height: phoneH }]}>
        <View style={styles.screen}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.section,
    backgroundColor: "#050609",
    padding: space.xxl,
  },
  aside: {
    maxWidth: 340,
    /* Shrinks away before the phone does: the phone is the deliverable, the
       explanation beside it is not. */
    flexShrink: 1,
    gap: space.md,
  },
  title: {
    fontFamily: font.displayBold,
    fontSize: 34,
    letterSpacing: -0.8,
    color: C.gold,
  },
  sub: {
    fontFamily: font.body,
    fontSize: 15,
    lineHeight: 23,
    color: C.text,
  },
  note: {
    fontFamily: font.body,
    fontSize: 12.5,
    lineHeight: 19,
    color: C.textFaint,
  },
  phone: {
    /* Width and height are computed per window; see PhoneFrame. */
    borderRadius: 46,
    padding: 9,
    backgroundColor: "#16181F",
    borderWidth: 1,
    borderColor: "#2A2E39",
    shadowColor: "#000",
    shadowOpacity: 0.7,
    shadowRadius: 60,
    shadowOffset: { width: 0, height: 30 },
  },
  screen: {
    flex: 1,
    borderRadius: 38,
    overflow: "hidden",
    backgroundColor: C.void,
  },
});
