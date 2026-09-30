import React from "react";
import { useRouter } from "expo-router";
import { useStore } from "@/lib/store";
import { iconFor, isLive, serviceName } from "@/data/catalogue";
import { Badge, EmptyState, Group, Reveal, Row, Screen } from "@/ui";

/** The wish list — services saved with the heart, as on lawfic.pro/wishlist. */
export default function Wishlist() {
  const router = useRouter();
  const { state } = useStore();
  return (
    <Screen back title="Wish list" kicker={`${state.wishlist.length} saved`}>
      {state.wishlist.length === 0 ? (
        <EmptyState icon="heart" title="Nothing saved yet" body="Tap the heart on any service to keep it here for later." cta="Browse services" onCta={() => router.push("/services")} />
      ) : (
        <Reveal>
          <Group>
            {state.wishlist.map((slug) => (
              <Row key={slug} icon={iconFor(slug)} gold={isLive(slug)} title={serviceName(slug)} trailingNode={isLive(slug) ? <Badge label="Available" tone="good" /> : undefined} onPress={() => router.push(`/service/${slug}`)} />
            ))}
          </Group>
        </Reveal>
      )}
    </Screen>
  );
}
