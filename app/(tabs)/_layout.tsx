import React from "react";
import { Tabs } from "expo-router";
import { TabBar } from "@/components/TabBar";
import { color as C } from "@/theme";

/**
 * Four tabs and the raised centre button between them. Profile is the avatar
 * on Home, not a tab — see TabBar for why.
 */
export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: C.void } }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="services" options={{ title: "Services" }} />
      <Tabs.Screen name="orders" options={{ title: "Orders" }} />
      <Tabs.Screen name="wallet" options={{ title: "Wallet" }} />
    </Tabs>
  );
}
