import React, { useState } from "react";
import { rise } from "@/ui/enter";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Icon, type IconName } from "@/icons/Icon";
import { useStore } from "@/lib/store";
import { pickDocument } from "@/features/upload";
import { rupees } from "@/lib/format";
import { orderTotalPaise } from "@/lawfic/orders";
import { serviceName } from "@/data/catalogue";
import { Press, Sheet, T, useToast } from "@/ui";
import { color as C, radius as R, space } from "@/theme";

/**
 * The "+" — everything you might have opened the app to do, one tap away.
 *
 * Each tile is a real destination. "Pay a quote" appears only when something
 * is actually waiting to be paid; a tile that opens an empty list is a tile
 * that wasted a tap.
 */
export function QuickActions({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const toast = useToast();
  const { state, addUpload } = useStore();
  const [picking, setPicking] = useState(false);
  const quoted = state.orders.find((o) => o.status === "quoted");

  const go = (href: string) => {
    onClose();
    setTimeout(() => router.push(href as never), 120);
  };

  const upload = async (source: "camera" | "library") => {
    setPicking(false);
    onClose();
    const r = await pickDocument(source);
    if (!r) return;
    if ("error" in r) return toast({ title: r.error, tone: "bad" });
    addUpload({ name: r.name, uri: r.uri, order_id: null });
    toast({ title: "Added to your vault", body: "Kept on this phone. Attach it to a filing from the filing itself.", icon: "vault" });
  };

  const actions: { icon: IconName; title: string; sub: string; onPress: () => void; gold?: boolean }[] = [
    { icon: "plus", title: "New filing", sub: "Start from 39 services", onPress: () => go("/services"), gold: true },
    { icon: "upload", title: "Add a document", sub: "Camera or photos", onPress: () => setPicking(true) },
    { icon: "wallet", title: "Add money", sub: "UPI, card, net banking", onPress: () => go("/wallet/add") },
    quoted
      ? { icon: "bolt", title: "Pay a quote", sub: `${serviceName(quoted.service_slug)} · ${rupees(orderTotalPaise(quoted))}`, onPress: () => go(`/filing/${quoted.id}`) }
      : { icon: "vault", title: "Your documents", sub: "Receipts and uploads", onPress: () => go("/documents") },
    { icon: "panda", title: "Ask Panda AI", sub: "Which filing do I need?", onPress: () => go("/ai") },
    { icon: "support", title: "Talk to the team", sub: "WhatsApp, call or email", onPress: () => go("/support") },
  ];

  return (
    <Sheet open={open} onClose={() => { setPicking(false); onClose(); }} title={picking ? "Add a document" : "What would you like to do?"} subtitle={picking ? "It stays on this phone, in your vault." : undefined}>
      {picking ? (
        <View style={{ gap: space.sm }}>
          <Tile icon="camera" title="Take a photo" sub="Scan a paper document" onPress={() => upload("camera")} i={0} />
          <Tile icon="image" title="Choose from photos" sub="A picture you already have" onPress={() => upload("library")} i={1} />
        </View>
      ) : (
        <View style={styles.grid}>
          {actions.map((a, i) => (
            <View key={a.title} style={styles.cell}>
              <Tile {...a} i={i} square />
            </View>
          ))}
        </View>
      )}
    </Sheet>
  );
}

function Tile({ icon, title, sub, onPress, gold, i, square }: { icon: IconName; title: string; sub: string; onPress: () => void; gold?: boolean; i: number; square?: boolean }) {
  return (
    <Animated.View entering={rise(60 + i * 45)}>
      <Press onPress={onPress} radius={R.lg} haptic="medium" accessibilityLabel={title} style={[styles.tile, square && styles.square, gold && styles.gold]}>
        <View style={[styles.icon, gold && { backgroundColor: C.gold, borderColor: C.gold }]}>
          <Icon name={icon} size={20} color={gold ? C.ink : C.gold} strokeWidth={1.8} />
        </View>
        <View style={square ? { marginTop: "auto" } : { flex: 1 }}>
          <T v="headline">{title}</T>
          <T v="caption" numberOfLines={1} style={{ marginTop: 2 }}>
            {sub}
          </T>
        </View>
        {!square && <Icon name="chevron" size={16} color={C.textMuted} />}
      </Press>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -space.xs },
  cell: { width: "50%", padding: space.xs },
  tile: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    padding: space.lg,
    borderRadius: R.lg,
    backgroundColor: C.surfaceHigh,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.line,
  },
  square: { flexDirection: "column", alignItems: "flex-start", height: 132 },
  gold: { borderColor: C.goldLine, backgroundColor: "#16130D" },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.goldWash,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.goldLine,
  },
});
