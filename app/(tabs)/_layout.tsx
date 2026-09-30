import React from "react";
import { Tabs } from "expo-router";
import { TabBar } from "@/nav/TabBar";
import { color as C } from "@/theme";

/**
 * Four tabs and a "+": Home, Filings, (+), LAWFiC AI, Profile.
 *
 * Wallet, documents and services are one tap from Home (the passes and the
 * shortcuts) and one tap from the "+", which is where somebody who opened the
 * app to do a thing goes. On wide screens the rail lists all of them.
 */
export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(p) => <TabBar {...p} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: C.bg }, animation: "fade" }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="filings" />
      <Tabs.Screen name="ai" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
