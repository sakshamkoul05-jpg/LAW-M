import React from "react";
import { Tabs } from "expo-router";
import { TabBar } from "@/components/TabBar";
import { color as C } from "@/theme";

/**
 * Five tabs, and the assistant floating over two of them.
 *
 * The route names are the icon names, which is why TabBar can fall back to the
 * route name when an option does not carry one. Rename a route and its icon
 * follows, or the fallback fails loudly at the one place it is used rather
 * than quietly rendering a blank square.
 */
export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: C.void },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="services" options={{ title: "Services" }} />
      <Tabs.Screen name="orders" options={{ title: "Orders" }} />
      <Tabs.Screen name="wallet" options={{ title: "Wallet" }} />
      <Tabs.Screen name="account" options={{ title: "Account" }} />
    </Tabs>
  );
}
