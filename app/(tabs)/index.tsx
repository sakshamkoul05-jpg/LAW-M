import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Icon } from "@/icons/Icon";
import { Body, Chip, Label, Surface, Touch } from "@/components/primitives";
import { FlyerCarousel } from "@/components/FlyerCarousel";
import { PandaFab } from "@/components/PandaFab";
import { Money } from "@/components/Money";
import { color as C, elevation, font, radius, space, text } from "@/theme";
import { categories, popular } from "@/data/catalogue";
import { SAMPLE_BALANCE_PAISE, sampleOrders, STATUS_COPY } from "@/data/sample";

/**
 * Home.
 *
 * THE ORDER OF THINGS, AND WHY
 *
 * Search, money, the thing in progress, the flyers, then the catalogue. That
 * sequence answers the four reasons somebody opens this app, in the order they
 * actually occur:
 *
 *   "I need a specific thing"        -> search, at the top, always
 *   "how much do I have"             -> the wallet strip
 *   "where has my filing got to"     -> the live order, with its rail
 *   "what should I be doing"         -> flyers, then the categories
 *
 * A home screen that leads with marketing answers the fourth question first
 * and makes the other three somebody else's problem.
 *
 * Every stagger below is 60ms apart. Slower and the screen assembles visibly,
 * which looks slow; faster and nothing registers as having moved.
 */
export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const live = sampleOrders.find((o) => o.status === "in-progress");

  return (
    <View style={{ flex: 1, backgroundColor: C.void }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + space.sm,
          paddingBottom: 140,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── greeting ── */}
        <Animated.View entering={FadeInDown.duration(380)} style={styles.head}>
          <View style={{ flex: 1 }}>
            <Label>Good morning</Label>
            <Text style={styles.name}>[First name]</Text>
          </View>
          <Touch
            accessibilityLabel="Notifications"
            style={styles.iconBtn}
            onPress={() => {}}
          >
            <Icon name="bell" size={19} color={C.text} />
            <View style={styles.badge} />
          </Touch>
        </Animated.View>

        {/* ── search ── */}
        <Animated.View entering={FadeInDown.delay(60).duration(380)} style={{ paddingHorizontal: space.lg }}>
          <Touch
            onPress={() => router.push("/services")}
            accessibilityLabel="Search 39 services"
            style={styles.search}
          >
            <Icon name="search" size={18} color={C.textFaint} />
            <Text style={[text.body, { color: C.textFaint, flex: 1 }]}>Search 39 services</Text>
          </Touch>
        </Animated.View>

        {/* ── wallet ── */}
        <Animated.View entering={FadeInDown.delay(120).duration(380)} style={styles.section}>
          <Touch onPress={() => router.push("/wallet")} accessibilityLabel="Open your wallet">
            <Surface level="high" style={styles.walletStrip}>
              <View style={{ flex: 1 }}>
                <Label tone={C.gold}>Wallet</Label>
                <View style={{ marginTop: 4 }}>
                  <Money paise={SAMPLE_BALANCE_PAISE} size={26} />
                </View>
                <Text style={[text.tiny, { color: C.textFaint, marginTop: 3 }]}>
                  Sample balance
                </Text>
              </View>
              <View style={styles.addBtn}>
                <Icon name="plus" size={15} color={C.gold} />
                <Text style={[text.small, { color: C.text, fontFamily: font.bodySemi }]}>
                  Add money
                </Text>
              </View>
            </Surface>
          </Touch>
        </Animated.View>

        {/* ── the live order ── */}
        {live && (
          <Animated.View entering={FadeInDown.delay(180).duration(380)} style={styles.section}>
            <View style={styles.sectionHead}>
              <Label>In progress</Label>
              <Touch onPress={() => router.push("/orders")} accessibilityLabel="See all orders">
                <Text style={[text.small, { color: C.gold, fontFamily: font.bodySemi }]}>
                  All orders
                </Text>
              </Touch>
            </View>

            <Touch
              onPress={() => router.push(`/order/${live.id}`)}
              accessibilityLabel={`${live.name}, ${STATUS_COPY[live.status].label}`}
            >
              <Surface>
                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: space.md }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[text.bodySemi, { color: C.text }]}>{live.name}</Text>
                    <Text style={[text.small, { color: C.textDim, marginTop: 2 }]}>
                      {live.step}
                    </Text>
                  </View>
                  <Chip tone={STATUS_COPY[live.status].tone}>{STATUS_COPY[live.status].label}</Chip>
                </View>

                {/* The rail. A bar and a caption, because a bar alone tells you
                    a fraction and not what the fraction is of. */}
                <View style={styles.rail}>
                  <View style={[styles.railFill, { width: `${live.progress * 100}%` }]} />
                </View>
                <Text style={[text.tiny, { color: C.textFaint, marginTop: 7 }]}>
                  Step 3 of 5 {"·"} expected {live.expectedOn}
                </Text>
              </Surface>
            </Touch>
          </Animated.View>
        )}

        {/* ── flyers ── */}
        <Animated.View entering={FadeInDown.delay(240).duration(380)} style={{ marginTop: space.xxl }}>
          <View style={[styles.sectionHead, { paddingHorizontal: space.lg }]}>
            <Label>Offers</Label>
          </View>
          <FlyerCarousel
            onOpen={(f) => {
              if (f.slug) router.push(`/service/${f.slug}`);
            }}
          />
        </Animated.View>

        {/* ── popular ── */}
        <Animated.View entering={FadeInDown.delay(300).duration(380)} style={styles.section}>
          <View style={styles.sectionHead}>
            <Label>Popular right now</Label>
            <Icon name="trend" size={15} color={C.textFaint} />
          </View>

          <View style={styles.grid}>
            {popular.map((s) => (
              <Touch
                key={s.slug}
                onPress={() => router.push(`/service/${s.slug}`)}
                accessibilityLabel={s.name}
                style={{ width: "48%" }}
              >
                <Surface style={{ minHeight: 104 }}>
                  <Icon name={categories.find((c) => c.id === s.categoryId)!.icon} size={19} color={C.gold} />
                  <Text style={[text.small, { color: C.text, fontFamily: font.bodySemi, marginTop: space.sm }]}>
                    {s.name}
                  </Text>
                  <Text style={[text.tiny, { color: C.textFaint, marginTop: 3 }]}>
                    {s.feePaise ? `₹${s.feePaise / 100}` : "Price on request"}
                  </Text>
                </Surface>
              </Touch>
            ))}
          </View>
        </Animated.View>

        {/* ── categories ── */}
        <Animated.View entering={FadeInDown.delay(360).duration(380)} style={styles.section}>
          <View style={styles.sectionHead}>
            <Label>Everything else</Label>
          </View>
          <Surface padded={false}>
            {categories.map((cat, i) => (
              <Touch
                key={cat.id}
                onPress={() => router.push("/services")}
                accessibilityLabel={`${cat.name}, ${cat.services.length} services`}
                style={[
                  styles.catRow,
                  i < categories.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: C.hairlineSoft,
                  },
                ]}
              >
                <View style={styles.catIcon}>
                  <Icon name={cat.icon} size={18} color={C.gold} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[text.bodySemi, { color: C.text }]}>{cat.name}</Text>
                  <Text style={[text.tiny, { color: C.textFaint, marginTop: 1 }]}>
                    {cat.services.length} services
                  </Text>
                </View>
                <Icon name="chevron" size={15} color={C.textFaint} />
              </Touch>
            ))}
          </Surface>
        </Animated.View>

        <Text style={styles.footnote}>
          A front-end preview. Balances, orders and dates on these screens are
          samples, not your account.
        </Text>
      </ScrollView>

      <PandaFab onPress={() => router.push("/panda")} />
    </View>
  );
}

const styles = StyleSheet.create({
  head: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: space.lg,
    paddingBottom: space.lg,
  },
  name: {
    ...text.title,
    color: C.text,
    marginTop: 3,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: C.surfaceRaised,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.hairline,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 10,
    right: 11,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.red,
    borderWidth: 1.5,
    borderColor: C.surfaceRaised,
  },
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
  section: { paddingHorizontal: space.lg, marginTop: space.xxl },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: space.md,
  },
  walletStrip: { flexDirection: "row", alignItems: "center", gap: space.md },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 44,
    paddingHorizontal: space.lg,
    borderRadius: radius.sm,
    backgroundColor: C.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.hairline,
  },
  rail: {
    height: 5,
    borderRadius: 3,
    backgroundColor: C.surfaceHigh,
    marginTop: space.md,
    overflow: "hidden",
  },
  railFill: { height: "100%", backgroundColor: C.gold, borderRadius: 3 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: space.md,
  },
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md + 1,
  },
  catIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: C.goldWash,
    alignItems: "center",
    justifyContent: "center",
  },
  footnote: {
    ...text.tiny,
    color: C.textFaint,
    textAlign: "center",
    paddingHorizontal: space.xxl,
    marginTop: space.xxxl,
    lineHeight: 16,
  },
});
