import React, { useMemo, useState } from "react";
import { rise } from "@/ui/enter";
import { Image, Share, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { documentTitle } from "@/lawfic/invoice";
import { useStore, vaultFor } from "@/lib/store";
import { useLayout } from "@/components/AppWidth";
import { askPanda } from "@/lib/panda";
import { dateLong } from "@/lib/format";
import { ReceiptPaper, receiptText, saveReceiptPdf } from "@/features/documents";
import { Badge, Button, Dots, EmptyState, IconButton, Screen, Sheet, Surface, T, useToast } from "@/ui";
import { color as C, motion, radius as R, space, themed } from "@/theme";

/**
 * The document viewer.
 *
 * The page arrives rising and settling like a sheet laid on a desk. Pinch or
 * use the buttons to zoom; drag to move around a zoomed page; the arrows walk
 * through the rest of the vault. Download is a real PDF, Share is the system
 * share sheet, and "Summarise" asks Panda AI — the website's assistant — to
 * explain the document in plain words.
 */
export default function DocumentViewer() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const layout = useLayout();
  const toast = useToast();
  const { state, removeUpload, mode } = useStore();
  const demo = mode === "demo";
  const vault = useMemo(() => vaultFor(state), [state]);
  const idx = vault.findIndex((d) => d.id === id);
  const item = vault[idx];
  const [summary, setSummary] = useState<{ open: boolean; text: string; busy: boolean; error?: string }>({ open: false, text: "", busy: false });
  const [confirm, setConfirm] = useState(false);

  const zoom = useSharedValue(1);
  const base = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const sx = useSharedValue(0);
  const sy = useSharedValue(0);

  const pinch = Gesture.Pinch()
    .onStart(() => (base.value = zoom.value))
    .onUpdate((e) => (zoom.value = Math.max(1, Math.min(3, base.value * e.scale))))
    .onEnd(() => {
      if (zoom.value < 1.05) {
        zoom.value = withSpring(1, motion.arrive);
        tx.value = withSpring(0);
        ty.value = withSpring(0);
      }
    });
  const pan = Gesture.Pan()
    .minPointers(1)
    .onStart(() => {
      sx.value = tx.value;
      sy.value = ty.value;
    })
    .onUpdate((e) => {
      if (zoom.value <= 1) return;
      tx.value = sx.value + e.translationX;
      ty.value = sy.value + e.translationY;
    });
  const double = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      const to = zoom.value > 1 ? 1 : 2;
      zoom.value = withSpring(to, motion.arrive);
      if (to === 1) {
        tx.value = withSpring(0);
        ty.value = withSpring(0);
      }
    });
  const page = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: zoom.value }] }));

  const setZoom = (z: number) => {
    zoom.value = withTiming(z, { duration: 220 });
    if (z === 1) {
      tx.value = withTiming(0);
      ty.value = withTiming(0);
    }
  };

  if (!item) {
    return (
      <Screen back title="Document">
        <EmptyState icon="document" title="This document is not here" body="It may have been removed." cta="Your documents" onCta={() => router.replace("/documents")} />
      </Screen>
    );
  }

  const receipt = item.kind === "receipt";
  const customer = state.profile.fullName;
  const title = receipt ? documentTitle(item.invoice) : item.title;
  const go = (d: number) => {
    const next = vault[idx + d];
    if (next) {
      setZoom(1);
      router.setParams({ id: next.id });
    }
  };

  const summarise = async () => {
    if (!receipt) return;
    setSummary({ open: true, text: "", busy: true });
    const r = await askPanda(
      [{ role: "user", content: `Explain this LAWFIC document to me in two or three plain sentences — what it is and whether I need to do anything with it:\n\n${receiptText({ item, customer })}` }],
      (d) => setSummary((s) => ({ ...s, text: s.text + d })),
    );
    setSummary((s) => ({ ...s, busy: false, error: r.ok ? undefined : r.error }));
  };

  return (
    <Screen
      back
      title={title}
      right={
        <>
          <IconButton icon="chevronLeft" label="Previous document" onPress={() => go(-1)} size={36} />
          <IconButton icon="chevron" label="Next document" onPress={() => go(1)} size={36} />
        </>
      }
    >
      <View style={layout === "compact" ? { gap: space.xl } : { flexDirection: "row", gap: space.xxxl, alignItems: "flex-start" }}>
        <View style={{ flex: 1.3 }}>
          <View style={styles.stage}>
            <GestureDetector gesture={Gesture.Simultaneous(pinch, pan, double)}>
              <Animated.View key={item.id} entering={rise()} style={[styles.pageShadow, page]}>
                {receipt ? (
                  <ReceiptPaper item={item} customer={customer} demo={demo} />
                ) : (
                  <View style={styles.photoPage}>
                    <Image source={{ uri: item.upload.uri }} style={{ width: "100%", aspectRatio: 0.75 }} resizeMode="contain" />
                  </View>
                )}
              </Animated.View>
            </GestureDetector>
          </View>
          <View style={styles.tools}>
            <IconButton icon="zoomOut" label="Zoom out" onPress={() => setZoom(1)} size={36} />
            <T v="caption" num>
              Page 1 of 1 · {idx + 1} of {vault.length} in vault
            </T>
            <IconButton icon="zoomIn" label="Zoom in" onPress={() => setZoom(2)} size={36} />
          </View>
        </View>

        <View style={{ flex: 1, gap: space.lg }}>
          <Surface>
            <T v="label">{receipt ? "Issued by LAWFIC" : "Added by you"}</T>
            <T v="title3" style={{ marginTop: 6 }}>
              {item.title}
            </T>
            <T v="caption" num style={{ marginTop: 4 }}>
              {dateLong(item.at)} · 1 page{receipt ? ` · ${item.invoice.number}` : ""}
            </T>
            <View style={{ marginTop: space.md, flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              {receipt ? <Badge label="Verified from your ledger" tone="gold" icon="verified" /> : <Badge label="Not checked yet" />}
              {item.order && <Badge label={item.order.reference} tone="neutral" icon="filings" />}
            </View>
            {!receipt && (
              <T v="caption" style={{ marginTop: space.md }}>
                Nobody at LAWFIC has looked at this yet. When it is attached to a filing, the team checks it before anything is submitted.
              </T>
            )}
          </Surface>

          <View style={{ gap: space.sm }}>
            {receipt && <Button label="Download PDF" icon="download" successLabel="Ready" onPress={() => saveReceiptPdf({ item, customer, demo })} />}
            <Button
              label="Share"
              icon="share"
              variant="secondary"
              onPress={async () => {
                try {
                  await Share.share(receipt ? { message: receiptText({ item, customer }), title } : { url: item.upload.uri, message: item.title });
                } catch {
                  toast({ title: "Sharing is not available here", tone: "bad" });
                }
              }}
            />
            {receipt && <Button label="Summarise with Panda AI" icon="panda" variant="secondary" onPress={summarise} />}
            {item.order && <Button label="Open the filing" variant="ghost" onPress={() => router.push(`/filing/${item.order!.id}`)} />}
            {!receipt && <Button label="Remove from vault" icon="trash" variant="danger" onPress={() => setConfirm(true)} />}
          </View>
        </View>
      </View>

      <Sheet open={summary.open} onClose={() => setSummary((s) => ({ ...s, open: false }))} title="In plain words" subtitle="From Panda AI · not legal advice">
        <View style={{ minHeight: 80 }}>
          {summary.text ? (
            <Animated.View entering={FadeIn}>
              <T v="body" tone="text">
                {summary.text}
              </T>
            </Animated.View>
          ) : summary.busy ? (
            <Dots color={C.gold} />
          ) : null}
          {summary.error && (
            <T v="callout" color={C.red} style={{ marginTop: space.md }}>
              Panda AI could not be reached{summary.error === "blocked" ? " from this browser preview yet — it works in the installed app" : ""}.
            </T>
          )}
        </View>
      </Sheet>

      <Sheet open={confirm} onClose={() => setConfirm(false)} title="Remove this document?" subtitle="It is deleted from this phone's vault. This cannot be undone.">
        <View style={{ gap: space.sm }}>
          <Button
            label="Remove"
            variant="danger"
            onPress={() => {
              setConfirm(false);
              removeUpload(item.id);
              router.back();
              toast({ title: "Removed" });
            }}
          />
          <Button label="Keep it" variant="ghost" onPress={() => setConfirm(false)} />
        </View>
      </Sheet>
    </Screen>
  );
}

const styles = themed(() => ({
  stage: { borderRadius: R.xxl, backgroundColor: C.bgDeep, padding: space.lg, overflow: "hidden", borderWidth: StyleSheet.hairlineWidth, borderColor: C.line },
  pageShadow: { shadowColor: "#000", shadowOpacity: 0.6, shadowRadius: 30, shadowOffset: { width: 0, height: 18 }, elevation: 12 },
  photoPage: { backgroundColor: "#111", borderRadius: 6, overflow: "hidden" },
  tools: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: space.md, paddingHorizontal: 4 },
}));
