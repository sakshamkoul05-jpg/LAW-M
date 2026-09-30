import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { Sora_600SemiBold, Sora_700Bold } from "@expo-google-fonts/sora";
import {
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from "@expo-google-fonts/manrope";
import {
  IBMPlexMono_500Medium,
  IBMPlexMono_600SemiBold,
} from "@expo-google-fonts/ibm-plex-mono";
import { color as C } from "@/theme";
import { PhoneFrame } from "@/components/PhoneFrame";
import { AppWidthProvider } from "@/components/AppWidth";
import { LockProvider } from "@/lib/lock";

/* Hold the native splash until the fonts are in. Without this the whole app
   renders one frame in the system face and then reflows, which is the single
   most obvious "this is a React Native app" tell there is. */
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Sora_600SemiBold,
    Sora_700Bold,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    IBMPlexMono_500Medium,
    IBMPlexMono_600SemiBold,
  });

  /* A font that fails to load must not hold the splash forever. The app in the
     system face is worse than the app in Sora; a permanently black screen is
     worse than both. */
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
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: C.void }}>
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: C.void }} onLayout={onLayout}>
          <StatusBar style="light" />
          {/* A passthrough on iOS and Android. On a wide browser it centres the
              app at phone width, because this is a phone app and a 1440px-wide
              column of list rows reads as broken rather than as a decision. */}
          <PhoneFrame>
          <AppWidthProvider>
          <LockProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: C.void },
              animation: "slide_from_right",
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="sign-in"
              options={{ animation: "fade_from_bottom", gestureEnabled: false }}
            />
            <Stack.Screen name="panda" options={{ animation: "slide_from_bottom" }} />
            <Stack.Screen name="pay" options={{ animation: "slide_from_bottom" }} />
            <Stack.Screen name="account" options={{ animation: "slide_from_left" }} />
          </Stack>
          </LockProvider>
          </AppWidthProvider>
          </PhoneFrame>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
