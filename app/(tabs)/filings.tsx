import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { isActive, useStore } from "@/lib/store";
import { useLayout } from "@/components/AppWidth";
import { FilingCard } from "@/features/filings";
import { rupees } from "@/lib/format";
import { orderTotalPaise } from "@/lawfic/orders";
import { Button, EmptyState, IconButton, Reveal, Screen, Segmented, SkeletonCard, T, Surface } from "@/ui";
import { Icon } from "@/icons/Icon";
import { color as C, space } from "@/theme";

type Tab = "active" | "done" | "all";

/**
 * Filings — every request, quote and registration, in one place.
 * The website calls these orders; the customer thinks of them as the things
 * LAWFIC is doing for them, so that is what the screen is called.
 */
export default function Filings() {
  const router = useRouter();
  const layout = useLayout();
  const { state, status } = useStore();
  const [tab, setTab] = useState<Tab>("active");

  const active = state.orders.filter(isActive);
  const done = state.orders.filter((o) => !isActive(o));
  const shown = tab === "active" ? active : tab === "done" ? done : state.orders;
  const owed = state.orders.filter((o) => o.status === "quoted");
  const cols = layout === "expanded" ? 3 : layout === "medium" ? 2 : 1;

  return (
    <Screen
      tabbed
      title="Filings"
      kicker="Your legal matters"
      subtitle="Every registration, correction and certificate LAWFiC is handling for you — where it is, and what happens next."
      right={<IconButton icon="plus" label="New filing" tone="gold" onPress={() => router.push("/services")} />}
    >
      <View style={{ gap: space.xl }}>
        {owed.length > 0 && (
          <Reveal>
            <Surface tone="gold" style={styles.owed}>
              <Icon name="bolt" size={18} color={C.gold} />
              <View style={{ flex: 1 }}>
                <T v="calloutMedium">
                  {owed.length === 1 ? "One quote is" : `${owed.length} quotes are`} waiting on you
                </T>
                <T v="caption" tone="dim">
                  {rupees(owed.reduce((s, o) => s + orderTotalPaise(o), 0))} in total · work starts when you pay
                </T>
              </View>
              <Button label="Review" size="sm" full={false} onPress={() => router.push(`/filing/${owed[0]!.id}`)} />
            </Surface>
          </Reveal>
        )}

        <Segmented<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { id: "active", label: "Active" },
            { id: "done", label: "Done" },
            { id: "all", label: "All" },
          ]}
          counts={{ active: active.length, done: done.length }}
        />

        {status === "loading" ? (
          <View style={{ gap: space.md }}>
            <SkeletonCard height={190} />
            <SkeletonCard height={190} />
          </View>
        ) : shown.length === 0 ? (
          tab === "done" ? (
            <EmptyState icon="checkCircle" title="Nothing finished yet" body="Completed filings, and their certificates, will collect here." />
          ) : (
            <EmptyState
              icon="filings"
              title="No active legal matters yet"
              body="Pick a service and tell us what you need. You owe nothing until we quote."
              cta="Start a filing"
              onCta={() => router.push("/services")}
            />
          )
        ) : (
          <View key={tab} style={[styles.grid, { gap: space.md }]}>
            {shown.map((o, i) => (
              <Reveal key={o.id} i={i} style={{ width: cols === 1 ? "100%" : cols === 2 ? "48.9%" : "32.4%" }}>
                <FilingCard order={o} featured={o.status === "quoted"} onPress={() => router.push(`/filing/${o.id}`)} />
              </Reveal>
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  owed: { flexDirection: "row", alignItems: "center", gap: space.md },
  grid: { flexDirection: "row", flexWrap: "wrap" },
});
