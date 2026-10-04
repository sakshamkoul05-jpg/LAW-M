import React from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import type { WalletEntry } from "@/lawfic/wallet-entries";
import { Icon, type IconName } from "@/icons/Icon";
import { useStore } from "@/lib/store";
import { dateLong, dayHeading, rupees, signed, time } from "@/lib/format";
import { Badge, Button, Divider, Press, Reveal, Sheet, T } from "@/ui";
import { color as C, font, radius as R, space, themed } from "@/theme";

/** What kind of movement an entry is, for its icon. */
function kindOf(e: WalletEntry): { icon: IconName; label: string } {
  if (e.direction === "credit") return e.order_id ? { icon: "reset", label: "Refund" } : { icon: "credit", label: "Top-up" };
  if (e.reason.includes("membership")) return { icon: "crown", label: "Membership" };
  return { icon: "debit", label: "Filing" };
}

/** Splits "GST Registration · PREVIEW-2042" into a title and a reference. */
function splitReason(reason: string): { title: string; meta: string | null } {
  const [title, ...rest] = reason.split(" · ");
  return { title: title!, meta: rest.length ? rest.join(" · ") : null };
}

export function TransactionItem({ entry, onPress, hidden }: { entry: WalletEntry; onPress: () => void; hidden?: boolean }) {
  const k = kindOf(entry);
  const credit = entry.direction === "credit";
  const { title, meta } = splitReason(entry.reason);
  return (
    <Press onPress={onPress} radius={R.md} scaleTo={0.985} accessibilityLabel={`${title}, ${signed(entry.direction, entry.amount_paise)}`} style={styles.row}>
      <View style={[styles.tile, credit && { backgroundColor: C.greenWash, borderColor: "rgba(111,207,151,0.2)" }]}>
        <Icon name={k.icon} size={18} color={credit ? C.green : C.textDim} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <T v="bodyMedium" numberOfLines={1}>
          {title}
        </T>
        <T v="caption" numberOfLines={1} num>
          {meta ?? k.label} · {time(entry.created_at)}
        </T>
      </View>
      <T num style={{ fontFamily: font.semibold, fontSize: 15, color: credit ? C.green : C.text, letterSpacing: -0.2 }}>
        {hidden ? "₹ •••" : signed(entry.direction, entry.amount_paise)}
      </T>
    </Press>
  );
}

/** Entries grouped by day, each day with its net movement on the right. */
export function TransactionList({ entries, onOpen, hidden, limit }: { entries: WalletEntry[]; onOpen: (e: WalletEntry) => void; hidden?: boolean; limit?: number }) {
  const shown = limit ? entries.slice(0, limit) : entries;
  const days: { head: string; items: WalletEntry[] }[] = [];
  for (const e of shown) {
    const head = dayHeading(e.created_at);
    const d = days[days.length - 1];
    if (d && d.head === head) d.items.push(e);
    else days.push({ head, items: [e] });
  }
  let n = 0;
  return (
    <View style={{ gap: space.lg }}>
      {days.map((d) => {
        const net = d.items.reduce((s, e) => s + (e.direction === "credit" ? e.amount_paise : -e.amount_paise), 0);
        return (
          <View key={d.head}>
            <View style={styles.dayHead}>
              <T v="label">{d.head}</T>
              {!hidden && (
                <T v="caption" num color={net >= 0 ? C.green : C.textMuted}>
                  {net >= 0 ? "+" : "−"} {rupees(Math.abs(net))}
                </T>
              )}
            </View>
            <View style={styles.group}>
              {d.items.map((e, i) => (
                <Reveal key={e.id} i={n++}>
                  {i > 0 && <Divider inset={64} />}
                  <TransactionItem entry={e} hidden={hidden} onPress={() => onOpen(e)} />
                </Reveal>
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
}

/** One movement, in full, with the receipt it produced. */
export function TransactionSheet({ entry, onClose }: { entry: WalletEntry | null; onClose: () => void }) {
  const router = useRouter();
  const { state } = useStore();
  const inv = entry ? state.invoices.find((i) => i.entry_id === entry.id) : null;
  const order = entry?.order_id ? state.orders.find((o) => o.id === entry.order_id) : null;
  const credit = entry?.direction === "credit";
  const parts = entry ? splitReason(entry.reason) : null;

  return (
    <Sheet open={!!entry} onClose={onClose} title={parts?.title} subtitle={entry ? `${dateLong(entry.created_at)} · ${time(entry.created_at)}` : undefined}>
      {entry && (
        <View style={{ gap: space.xl }}>
          <View style={{ alignItems: "center", paddingVertical: space.md }}>
            <T num style={{ fontFamily: font.semibold, fontSize: 40, letterSpacing: -1.4, color: credit ? C.green : C.text }}>
              {signed(entry.direction, entry.amount_paise)}
            </T>
            <View style={{ marginTop: space.sm }}>
              <Badge label={credit ? "Credited" : "Paid from wallet"} tone={credit ? "good" : "neutral"} icon="check" />
            </View>
          </View>
          <View style={styles.group}>
            <Line k="Type" v={kindOf(entry).label} />
            {parts?.meta && <Line k="Detail" v={parts.meta} />}
            {order && <Line k="Filing" v={order.reference} />}
            <Line k="Method" v={entry.gateway_payment_id ? "Payment gateway" : "LAWFIC wallet"} />
            {inv && <Line k="Document" v={inv.number} />}
          </View>
          <View style={{ gap: space.sm }}>
            {inv && (
              <Button
                label="View receipt"
                icon="receipt"
                variant="secondary"
                onPress={() => {
                  onClose();
                  router.push(`/document/${inv.id}`);
                }}
              />
            )}
            {order && (
              <Button
                label="Open the filing"
                variant="ghost"
                onPress={() => {
                  onClose();
                  router.push(`/filing/${order.id}`);
                }}
              />
            )}
          </View>
        </View>
      )}
    </Sheet>
  );
}

function Line({ k, v }: { k: string; v: string }) {
  return (
    <View style={styles.line}>
      <T v="callout" tone="muted">
        {k}
      </T>
      <T v="calloutMedium" num numberOfLines={1} style={{ flexShrink: 1, textAlign: "right" }}>
        {v}
      </T>
    </View>
  );
}

const styles = themed(() => ({
  row: { flexDirection: "row", alignItems: "center", gap: space.md, paddingHorizontal: space.lg, paddingVertical: 12 },
  tile: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surfaceTop,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.line,
  },
  dayHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: space.sm, paddingHorizontal: 4 },
  group: { borderRadius: R.xl, backgroundColor: C.surfaceHigh, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line, overflow: "hidden" },
  line: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: space.lg, paddingHorizontal: space.lg, paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.line },
}));
