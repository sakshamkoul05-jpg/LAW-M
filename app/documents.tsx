import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Icon } from "@/icons/Icon";
import { useLayout } from "@/components/AppWidth";
import { useStore, vaultFor } from "@/lib/store";
import { DOC_GROUPS, documents } from "@/data/catalogue";
import { DocumentCard } from "@/features/documents";
import { pickDocument } from "@/features/upload";
import { Badge, Button, EmptyState, IconButton, IconTile, Press, Reveal, Screen, SectionHeader, Segmented, Sheet, SkeletonCard, T, useToast } from "@/ui";
import { color as C, radius as R, space } from "@/theme";

type Filter = "all" | "receipts" | "uploads";

/**
 * Documents: what you hold, and what LAWFIC can prepare.
 *
 * The vault is every paper LAWFIC issued you (from the ledger) and every page
 * you added. The catalogue below is the website's Document tab, verbatim, in its
 * four groups — each one requestable, because the quote step is
 * where LAWFIC decides what it can do.
 */
export default function Documents() {
  const router = useRouter();
  const layout = useLayout();
  const toast = useToast();
  const { state, status, addUpload } = useStore();
  const [filter, setFilter] = useState<Filter>("all");
  const [adding, setAdding] = useState(false);
  const vault = vaultFor(state).filter((d) => (filter === "all" ? true : filter === "receipts" ? d.kind === "receipt" : d.kind === "upload"));
  const cols = layout === "expanded" ? 5 : layout === "medium" ? 3 : 2;

  const add = async (source: "camera" | "library") => {
    setAdding(false);
    const r = await pickDocument(source);
    if (!r) return;
    if ("error" in r) return toast({ title: r.error, tone: "bad" });
    addUpload({ name: r.name, uri: r.uri, order_id: null });
    toast({ title: "Added to your vault", icon: "vault" });
  };

  return (
    <Screen back title="Documents" subtitle="Receipts LAWFIC issued you and papers you added, kept in one place." right={<IconButton icon="upload" label="Add a document" tone="gold" onPress={() => setAdding(true)} />}>
      <View style={{ gap: space.lg }}>
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { id: "all", label: "All" },
            { id: "receipts", label: "From LAWFIC" },
            { id: "uploads", label: "Yours" },
          ]}
          counts={{ all: vaultFor(state).length }}
        />
        {status === "loading" ? (
          <View style={{ flexDirection: "row", gap: space.md }}>
            <SkeletonCard height={210} />
            <SkeletonCard height={210} />
          </View>
        ) : vault.length === 0 ? (
          <EmptyState icon="vault" title="Your legal documents will appear here." body={filter === "uploads" ? "Photograph a document and it is kept here, on this phone." : "Receipts arrive the moment you add money or pay for a filing."} cta="Upload document" onCta={() => setAdding(true)} />
        ) : (
          <View key={filter} style={styles.grid}>
            {vault.map((d, i) => (
              <Reveal key={d.id} i={i} style={{ width: `${100 / cols - 2}%` as `${number}%`, flexGrow: 1, maxWidth: `${100 / cols - 1}%` as `${number}%` }}>
                <DocumentCard item={d} onPress={() => router.push(`/document/${d.id}`)} />
              </Reveal>
            ))}
          </View>
        )}
      </View>

      <View style={{ marginTop: space.section }}>
        <SectionHeader kicker={`${documents.length} documents`} title="What LAWFIC prepares" />
        <View style={{ gap: space.xl }}>
          {DOC_GROUPS.map((g, gi) => {
            const items = documents.filter((d) => d.group === g.id);
            return (
              <Reveal key={g.id} i={gi}>
                <View style={styles.groupHead}>
                  <IconTile icon={g.icon} size={32} gold />
                  <View style={{ flex: 1 }}>
                    <T v="headline">{g.id}</T>
                    <T v="caption">{g.blurb}</T>
                  </View>
                </View>
                <View style={styles.list}>
                  {items.map((d, i) => {
                    const slug = d.live && d.href.startsWith("/services/") ? d.href.slice("/services/".length) : d.slug;
                    return (
                      <Press key={d.slug} onPress={() => router.push(`/service/${slug}`)} radius={0} scaleTo={0.99} accessibilityLabel={d.label} style={[styles.docRow, i > 0 && styles.rule]}>
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <T v="bodyMedium" numberOfLines={1}>
                            {d.label}
                          </T>
                          <T v="caption" numberOfLines={1}>
                            {d.blurb}
                          </T>
                        </View>
                        {d.live ? <Badge label="Available" tone="good" /> : <Badge label="On request" tone="neutral" />}
                        <Icon name="chevron" size={15} color={C.textMuted} />
                      </Press>
                    );
                  })}
                </View>
              </Reveal>
            );
          })}
        </View>
      </View>

      <Sheet open={adding} onClose={() => setAdding(false)} title="Add a document" subtitle="It stays on this phone, in your vault.">
        <View style={{ gap: space.sm }}>
          <Button label="Take a photo" icon="camera" variant="secondary" onPress={() => add("camera")} />
          <Button label="Choose from photos" icon="image" variant="secondary" onPress={() => add("library")} />
        </View>
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: space.md },
  groupHead: { flexDirection: "row", alignItems: "center", gap: space.md, marginBottom: space.md },
  list: { borderRadius: R.xl, backgroundColor: C.surfaceHigh, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line, overflow: "hidden" },
  docRow: { flexDirection: "row", alignItems: "center", gap: space.md, paddingHorizontal: space.lg, paddingVertical: 13 },
  rule: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.line },
});
