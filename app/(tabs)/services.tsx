import React, { useMemo, useState } from "react";
import { LayoutAnimation, Platform, ScrollView, StyleSheet, Text, TextInput, UIManager, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Icon } from "@/icons/Icon";
import { Chip, Label, Rule, Surface, Touch } from "@/components/primitives";
import { PandaFab } from "@/components/PandaFab";
import { color as C, font, radius, space, text } from "@/theme";
import { allServices, categories, type Service } from "@/data/catalogue";

/* Android needs this switched on before LayoutAnimation does anything. */
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * The catalogue: 7 categories, 39 services.
 *
 * ACCORDION, NOT A DRILL-DOWN
 *
 * Tapping a category expands it in place rather than pushing a screen. Somebody
 * who does not know which category their problem lives in — which is most
 * people, because "do I need a Shop & Establishment or a Trade Licence" is the
 * actual question — can open two and compare without losing their place. A
 * push-and-back loop makes them hold both lists in their head.
 *
 * SOON MEANS SOON
 *
 * A service the website has not launched renders dim, with a chip, and does not
 * navigate. It would be one line to let every row through to a mocked detail
 * screen, and that line is how a demo starts promising services nobody can
 * deliver yet.
 */
export default function Services() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [openId, setOpenId] = useState<string | null>("business");
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return allServices.filter(
      (s) => s.name.toLowerCase().includes(q) || s.blurb.toLowerCase().includes(q),
    );
  }, [query]);

  const toggle = (id: string) => {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(220, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity),
    );
    setOpenId((cur) => (cur === id ? null : id));
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.void }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + space.sm, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.head}>
          <Label>What we do</Label>
          <Text style={[text.title, { color: C.text, marginTop: 3 }]}>Services</Text>
        </View>

        <View style={{ paddingHorizontal: space.lg }}>
          <View style={styles.search}>
            <Icon name="search" size={18} color={C.textFaint} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search 39 services"
              placeholderTextColor={C.textFaint}
              accessibilityLabel="Search services"
              style={styles.input}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>
        </View>

        {results ? (
          <Animated.View entering={FadeIn.duration(200)} style={styles.section}>
            <Label style={{ marginBottom: space.md }}>
              {results.length} {results.length === 1 ? "match" : "matches"}
            </Label>
            <Surface padded={false}>
              {results.map((s, i) => (
                <View key={s.slug}>
                  <Row service={s} onPress={() => router.push(`/service/${s.slug}`)} />
                  {i < results.length - 1 && <Rule style={{ marginLeft: space.lg }} />}
                </View>
              ))}
              {results.length === 0 && (
                <Text style={[text.small, { color: C.textDim, padding: space.lg }]}>
                  Nothing matches that. The Panda can usually work out which
                  service you need from a plain description.
                </Text>
              )}
            </Surface>
          </Animated.View>
        ) : (
          <View style={styles.section}>
            <Text style={[text.tiny, { color: C.textFaint, marginBottom: space.md }]}>
              7 categories {"·"} 39 services
            </Text>

            {categories.map((cat, idx) => {
              const isOpen = openId === cat.id;
              return (
                <Animated.View
                  key={cat.id}
                  entering={FadeInDown.delay(idx * 45).duration(340)}
                  style={{ marginBottom: space.md }}
                >
                  <Surface padded={false} style={isOpen ? { borderColor: C.goldDeep } : undefined}>
                    <Touch
                      onPress={() => toggle(cat.id)}
                      accessibilityRole="button"
                      accessibilityState={{ expanded: isOpen }}
                      accessibilityLabel={`${cat.name}, ${cat.services.length} services`}
                      style={styles.catHead}
                    >
                      <View style={[styles.catIcon, isOpen && { backgroundColor: C.goldWash }]}>
                        <Icon name={cat.icon} size={19} color={isOpen ? C.gold : C.textDim} active={isOpen} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[text.bodySemi, { color: C.text, fontFamily: font.display }]}>
                          {cat.name}
                        </Text>
                        {isOpen && (
                          <Text style={[text.tiny, { color: C.textDim, marginTop: 3, lineHeight: 16 }]}>
                            {cat.summary}
                          </Text>
                        )}
                      </View>
                      <Chip>{String(cat.services.length)}</Chip>
                      <View style={{ transform: [{ rotate: isOpen ? "90deg" : "0deg" }] }}>
                        <Icon name="chevron" size={15} color={C.textFaint} />
                      </View>
                    </Touch>

                    {isOpen && (
                      <View>
                        <Rule style={{ marginLeft: space.lg }} />
                        {cat.services.map((s, i) => (
                          <View key={s.slug}>
                            <Row service={s} onPress={() => router.push(`/service/${s.slug}`)} />
                            {i < cat.services.length - 1 && <Rule style={{ marginLeft: space.lg }} />}
                          </View>
                        ))}
                      </View>
                    )}
                  </Surface>
                </Animated.View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <PandaFab onPress={() => router.push("/panda")} />
    </View>
  );
}

function Row({ service, onPress }: { service: Service; onPress: () => void }) {
  const live = service.status === "live";

  /* A row that does nothing must not look like a row that does something. No
     press feedback, no chevron, dimmed text, and the chip says why. */
  const content = (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={[text.body, { color: live ? C.text : C.textFaint }]}>{service.name}</Text>
        <Text style={[text.tiny, { color: C.textFaint, marginTop: 2 }]} numberOfLines={1}>
          {service.blurb}
        </Text>
      </View>
      {live ? (
        <>
          <Text style={[text.small, { color: C.gold, fontFamily: font.mono }]}>
            {service.feePaise ? `₹${service.feePaise / 100}` : ""}
          </Text>
          <Icon name="chevron" size={14} color={C.textFaint} />
        </>
      ) : (
        <Chip>Soon</Chip>
      )}
    </View>
  );

  if (!live) {
    return (
      <View accessible accessibilityLabel={`${service.name}. Not available yet.`}>
        {content}
      </View>
    );
  }

  return (
    <Touch onPress={onPress} accessibilityLabel={service.name}>
      {content}
    </Touch>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: space.lg, paddingBottom: space.lg },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm + 2,
    minHeight: 50,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    backgroundColor: C.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.hairline,
  },
  input: {
    flex: 1,
    minHeight: 46,
    color: C.text,
    fontFamily: font.body,
    fontSize: 14.5,
    padding: 0,
  },
  section: { paddingHorizontal: space.lg, marginTop: space.xl },
  catHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.lg - 2,
  },
  catIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: C.surfaceHigh,
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md + 2,
    minHeight: 56,
  },
});
