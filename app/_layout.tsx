import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { Stack, usePathname, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { color as C } from "@/theme";
import { PhoneFrame } from "@/components/PhoneFrame";
import { AppWidthProvider, useLayout } from "@/components/AppWidth";
import { LockProvider } from "@/lib/lock";
import { StoreProvider, useStore } from "@/lib/store";
import { ToastProvider } from "@/ui";
import { Rail } from "@/nav/Rail";

/* Hold the splash until the fonts are in, or the first frame renders in the
   system face and then reflows — the most obvious "this is a web view" tell. */
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded, error] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  const [gaveUp, setGaveUp] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGaveUp(true), 4000);
    return () => clearTimeout(t);
  }, []);
  const ready = loaded || !!error || gaveUp;
  const onLayout = useCallback(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: C.bg }}>
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: C.bg }} onLayout={onLayout}>
          <StatusBar style="light" />
          <PhoneFrame>
            <AppWidthProvider>
              <StoreProvider>
                <LockProvider>
                  <ToastProvider>
                    <Shell />
                  </ToastProvider>
                </LockProvider>
              </StoreProvider>
            </AppWidthProvider>
          </PhoneFrame>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/**
 * The shell. On a phone it is just the stack; on a tablet or desktop the rail
 * sits beside it and stays put while screens change on the right.
 */
function Shell() {
  const layout = useLayout();
  const path = usePathname();
  const router = useRouter();
  const { status, state } = useStore();

  /* First run goes through the welcome screen. Only once the stored state has
     loaded — otherwise a returning customer would flash through it. */
  useEffect(() => {
    if (status === "ready" && !state.profile.onboarded && path !== "/welcome") router.replace("/welcome");
  }, [status, state.profile.onboarded, path, router]);

  const showRail = layout !== "compact" && path !== "/welcome";

  return (
    <View style={{ flex: 1, flexDirection: "row", backgroundColor: C.bg }}>
      {showRail && <Rail />}
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg }, animation: "ios_from_right" }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="welcome" options={{ animation: "fade", gestureEnabled: false }} />
          <Stack.Screen name="wallet/add" options={{ animation: "slide_from_bottom", presentation: layout === "compact" ? "fullScreenModal" : "card" }} />
          <Stack.Screen name="document/[id]" options={{ animation: "fade_from_bottom" }} />
          <Stack.Screen name="notifications" options={{ animation: layout === "compact" ? "slide_from_bottom" : "fade" }} />
        </Stack>
      </View>
    </View>
  );
}
