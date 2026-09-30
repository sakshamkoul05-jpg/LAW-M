import React, { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, TextInput, View, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { STATUS_META, orderTotalPaise } from "@/lawfic/orders";
import { savingOn } from "@/lawfic/subscription";
import { Icon } from "@/icons/Icon";
import { useStore, useMembership, vaultFor } from "@/lib/store";
import { useLock } from "@/lib/lock";
import { useLayout } from "@/components/AppWidth";
import { getService, iconFor, serviceName } from "@/data/catalogue";
import { FilingTimeline, nextStep, progressOf, statusBadge } from "@/features/filings";
import { DocumentCard } from "@/features/documents";
import { TransactionItem, TransactionSheet } from "@/features/money";
import { pickDocument } from "@/features/upload";
import { dateLong, rupees, time } from "@/lib/format";
import { Button, Divider, EmptyState, IconTile, Logo, Press, ProgressRing, Reveal, Screen, Segmented, Sheet, Surface, T, useToast } from "@/ui";
import { color as C, font, radius as R, space, text } from "@/theme";
import type { WalletEntry } from "@/lawfic/wallet-entries";

type Tab = "overview" | "timeline" | "documents" | "messages" | "payments";

export default function FilingWorkspace() {
  const { id, tab: initial } = useLocalSearchParams<{ id: string; tab?: Tab }>();
  const router = useRouter();
  const layout = useLayout();
  const toast = useToast();
  const lock = useLock();
  const store = useStore();
  const { state, balance } = store;
  const { entitled, sub, plan } = useMembership();
  const [tab, setTab] = useState<Tab>(initial ?? "overview");
  const [entry, setEntry] = useState<WalletEntry | null>(null);
  const [attach, setAttach] = useState(false);

  const order = state.orders.find((o) => o.id === id);
  /* Opening the thread marks the team's replies read — on lawfic.pro too. */
  useEffect(() => {
    if (tab === "messages" && id) store.markThreadRead(id);
  }, [tab, id]); // eslint-disable-line react-hooks/exhaustive-deps
  const messages = useMemo(() => state.messages.filter((m) => m.order_id === id), [state.messages, id]);
  const docs = useMemo(() => vaultFor(state).filter((d) => d.order?.id === id), [state, id]);
  const payments = state.entries.filter((e) => e.order_id === id);

  if (!order) {
    return (
      <Screen back title="Filing">
        <EmptyState icon="filings" title="This filing is not here" body="It may have been removed when the demo data was reset." cta="Your filings" onCta={() => router.replace("/filings")} />
      </Screen>
    );
  }

  const meta = STATUS_META[order.status];
  const next = nextStep(order);
  const svc = getService(order.service_slug);
  const pro = order.professional_fee_paise ?? 0;
  const gov = order.government_fee_paise ?? 0;
  const discount = order.status === "quoted" && entitled && sub ? savingOn(pro, sub.planId).discountPaise : 0;
  const total = orderTotalPaise(order) - discount;
  const short = total > balance;

  const pay = async () => {
    if (lock.enabled && !lock.unlocked) {
      const ok = await lock.unlock();
      if (!ok) return false;
    }
    const r = await store.payOrder(order.id);
    if (!r.ok) {
      toast({ title: "Not paid", body: r.error, tone: "bad" });
      return false;
    }
    toast({ title: `Paid ${rupees(total)}`, body: "Your file is queued to be prepared.", tone: "good" });
    return true;
  };

  const attachFrom = async (source: "camera" | "library") => {
    setAttach(false);
    const r = await pickDocument(source);
    if (!r) return;
    if ("error" in r) return toast({ title: r.error, tone: "bad" });
    store.addUpload({ name: r.name, uri: r.uri, order_id: order.id });
    toast({ title: "Attached to this filing", icon: "attach" });
  };

  const unreadStaff = messages.filter((m) => m.from_staff && !m.read_at).length;

  return (
    <Screen
      back
      large={false}
      title={serviceName(order.service_slug)}
      footer={
        order.status === "quoted" && tab === "overview" ? (
          <View style={{ gap: 6 }}>
            {short ? (
              <Button label={`Add ${rupees(total - balance)} to pay`} icon="plus" onPress={() => router.push(`/wallet/add?amount=${Math.ceil((total - balance) / 100)}`)} />
            ) : (
              <Button label={`Pay ${rupees(total)} from wallet`} icon={lock.enabled ? "faceid" : "wallet"} onPress={pay} successLabel="Paid" />
            )}
            <T v="caption" center>
              Wallet balance {rupees(balance)}
            </T>
          </View>
        ) : undefined
      }
    >
      <Reveal fade>
        <Surface raised tone={order.status === "quoted" ? "gold" : "default"} style={{ padding: space.xl }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: space.lg }}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <T v="label" tone="gold">
                {svc?.category ?? "Filing"} · {order.reference}
              </T>
              <T v={layout === "compact" ? "title2" : "title1"} style={{ marginTop: 6 }}>
                {serviceName(order.service_slug).toUpperCase()}
              </T>
              <View style={{ marginTop: space.md }}>{statusBadge(order)}</View>
            </View>
            <ProgressRing value={progressOf(order)} size={76} stroke={5} tone={order.status === "completed" ? C.green : order.status === "rejected" ? C.red : C.gold} />
          </View>
          <Divider style={{ marginVertical: space.lg }} />
          <View style={{ flexDirection: "row", gap: space.xl, flexWrap: "wrap" }}>
            <Fact k="Opened" v={dateLong(order.created_at)} />
            <Fact k="Next" v={next.text} gold={next.yours} />
            {svc && <Fact k="Usual time" v={svc.turnaround} />}
          </View>
        </Surface>
      </Reveal>

      <View style={{ marginTop: space.xl, marginBottom: space.lg }}>
        <Segmented<Tab>
          scroll
          value={tab}
          onChange={setTab}
          options={[
            { id: "overview", label: "Overview" },
            { id: "timeline", label: "Timeline" },
            { id: "documents", label: "Documents" },
            { id: "messages", label: "Messages" },
            { id: "payments", label: "Payments" },
          ]}
          counts={{ documents: docs.length, messages: unreadStaff }}
        />
      </View>

      <View key={tab}>
        {tab === "overview" && (
          <View style={{ gap: space.lg }}>
            <Reveal i={0}>
              <Surface>
                <T v="label">Where it stands</T>
                <T v="headline" style={{ marginTop: 6 }}>
                  {meta.label}
                </T>
                <T v="callout" style={{ marginTop: 4 }}>
                  {meta.blurb}
                </T>
              </Surface>
            </Reveal>

            <Reveal i={1}>
              <Surface padded={false}>
                <View style={{ padding: space.lg, paddingBottom: space.sm }}>
                  <T v="label">Fees</T>
                </View>
                {order.status === "submitted" ? (
                  <View style={{ padding: space.lg, paddingTop: 0 }}>
                    <T v="callout">Being priced. You will see the government fee and LAWFIC's fee on separate lines, and nothing is charged until you accept.</T>
                  </View>
                ) : (
                  <>
                    <FeeLine k="Government fee" v={gov ? rupees(gov) : "None"} note="Passed through at cost" />
                    <FeeLine k="LAWFIC fee" v={rupees(pro)} />
                    {discount > 0 && <FeeLine k={`${plan?.name} member saving`} v={`− ${rupees(discount)}`} gold />}
                    <Divider />
                    <FeeLine k={order.status === "quoted" ? "To pay" : "Paid"} v={rupees(total)} strong />
                  </>
                )}
              </Surface>
            </Reveal>

            {order.details && (
              <Reveal i={2}>
                <Surface>
                  <T v="label">What you told us</T>
                  <T v="body" tone="text" style={{ marginTop: 6 }}>
                    {order.details}
                  </T>
                </Surface>
              </Reveal>
            )}

            {svc && (
              <Reveal i={3}>
                <Press onPress={() => router.push(`/service/${svc.slug}`)} radius={R.xl} accessibilityLabel={`About ${svc.name}`} style={styles.link}>
                  <IconTile icon={iconFor(svc.slug)} />
                  <View style={{ flex: 1 }}>
                    <T v="calloutMedium">About {svc.name}</T>
                    <T v="caption">Documents, steps and common questions</T>
                  </View>
                  <Icon name="chevron" size={16} color={C.textMuted} />
                </Press>
              </Reveal>
            )}
          </View>
        )}

        {tab === "timeline" && (
          <Surface style={{ padding: space.xl }}>
            <FilingTimeline order={order} />
          </Surface>
        )}

        {tab === "documents" && (
          <View style={{ gap: space.lg }}>
            {docs.length === 0 ? (
              <EmptyState compact icon="vault" title="No documents on this filing yet" body="Receipts appear here when you pay. Add a photo of anything the team asks for." />
            ) : (
              <View style={styles.docGrid}>
                {docs.map((d, i) => (
                  <Reveal key={d.id} i={i} style={{ width: layout === "compact" ? "48%" : "31.5%" }}>
                    <DocumentCard item={d} onPress={() => router.push(`/document/${d.id}`)} />
                  </Reveal>
                ))}
              </View>
            )}
            <Button label="Attach a document" icon="attach" variant="secondary" onPress={() => setAttach(true)} />
            <T v="caption" center>
              Identity documents are only collected once an order is accepted, into private storage — never on a public form.
            </T>
          </View>
        )}

        {tab === "messages" && <Thread orderId={order.id} />}

        {tab === "payments" &&
          (payments.length === 0 ? (
            <EmptyState compact icon="rupee" title="Nothing paid yet" body={order.status === "quoted" ? "Pay the quote from your wallet to start the work." : "Payments on this filing will show here."} />
          ) : (
            <View style={styles.group}>
              {payments.map((e, i) => (
                <View key={e.id}>
                  {i > 0 && <Divider inset={64} />}
                  <TransactionItem entry={e} onPress={() => setEntry(e)} />
                </View>
              ))}
            </View>
          ))}
      </View>

      <TransactionSheet entry={entry} onClose={() => setEntry(null)} />
      <Sheet open={attach} onClose={() => setAttach(false)} title="Attach a document" subtitle="It stays on this phone and is linked to this filing.">
        <View style={{ gap: space.sm }}>
          <Button label="Take a photo" icon="camera" variant="secondary" onPress={() => attachFrom("camera")} />
          <Button label="Choose from photos" icon="image" variant="secondary" onPress={() => attachFrom("library")} />
        </View>
      </Sheet>
    </Screen>
  );
}

function Fact({ k, v, gold }: { k: string; v: string; gold?: boolean }) {
  return (
    <View style={{ minWidth: 120, flexShrink: 1 }}>
      <T v="label">{k}</T>
      <T v="calloutMedium" color={gold ? C.goldLight : C.text} style={{ marginTop: 3 }}>
        {v}
      </T>
    </View>
  );
}

function FeeLine({ k, v, note, strong, gold }: { k: string; v: string; note?: string; strong?: boolean; gold?: boolean }) {
  return (
    <View style={styles.fee}>
      <View style={{ flex: 1 }}>
        <T v={strong ? "headline" : "callout"} tone={strong ? "text" : "dim"}>
          {k}
        </T>
        {note && <T v="caption">{note}</T>}
      </View>
      <T num style={{ fontFamily: strong ? font.bold : font.semibold, fontSize: strong ? 18 : 15, color: gold ? C.gold : C.text }}>
        {v}
      </T>
    </View>
  );
}

/** The message thread — the same record the back office reads (lib/messages.ts). */
function Thread({ orderId }: { orderId: string }) {
  const { state, sendMessage } = useStore();
  const toast = useToast();
  const [draft, setDraft] = useState("");
  const input = useRef<TextInput>(null);
  const messages = state.messages.filter((m) => m.order_id === orderId).sort((a, b) => a.created_at.localeCompare(b.created_at));

  const send = async () => {
    const r = await sendMessage(orderId, draft);
    if (!r.ok) return toast({ title: r.error, tone: "bad" });
    setDraft("");
  };

  return (
    <View style={{ gap: space.md }}>
      {messages.length === 0 && <EmptyState compact icon="chat" title="No messages yet" body="Questions about this filing go to the person handling it. Replies come here." />}
      {messages.map((m, i) => (
        <Animated.View key={m.id} entering={(m.from_staff ? FadeInDown : FadeInUp).delay(Math.min(i, 6) * 40).duration(300)} style={[styles.msgRow, !m.from_staff && { justifyContent: "flex-end" }]}>
          {m.from_staff && (
            <View style={styles.staff}>
              <Logo size={24} />
            </View>
          )}
          <View style={[styles.bubble, m.from_staff ? styles.bubbleStaff : styles.bubbleMe]}>
            {m.from_staff && (
              <T v="label" tone="gold" style={{ fontSize: 9.5, marginBottom: 4 }}>
                LAWFIC team
              </T>
            )}
            <T v="callout" tone="text">
              {m.body}
            </T>
            <T v="micro" num style={{ marginTop: 6, alignSelf: "flex-end" }}>
              {dateLong(m.created_at)} · {time(m.created_at)}
            </T>
          </View>
        </Animated.View>
      ))}
      <View style={styles.composer}>
        <TextInput
          ref={input}
          value={draft}
          onChangeText={setDraft}
          placeholder="Write to the team handling this"
          placeholderTextColor={C.textMuted}
          selectionColor={C.gold}
          multiline
          maxLength={4000}
          accessibilityLabel="Message"
          style={[styles.composerInput, Platform.OS === "web" && ({ outlineStyle: "none" } as object)]}
        />
        <Press onPress={send} disabled={!draft.trim()} radius={20} haptic="medium" accessibilityLabel="Send" style={[styles.send, !draft.trim() && { backgroundColor: C.surfaceTop }]}>
          <Icon name="send" size={17} color={draft.trim() ? C.ink : C.textMuted} strokeWidth={2} />
        </Press>
      </View>
      <T v="caption" center>
        Messages are kept on this phone until your LAWFIC account is connected.
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  link: { flexDirection: "row", alignItems: "center", gap: space.md, padding: space.lg, borderRadius: R.xl, backgroundColor: C.surfaceHigh, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line },
  fee: { flexDirection: "row", alignItems: "center", gap: space.lg, paddingHorizontal: space.lg, paddingVertical: 12 },
  docGrid: { flexDirection: "row", flexWrap: "wrap", gap: space.md },
  group: { borderRadius: R.xl, backgroundColor: C.surfaceHigh, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line, overflow: "hidden" },
  msgRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  staff: { width: 30, height: 30, borderRadius: 15, backgroundColor: C.surfaceTop, alignItems: "center", justifyContent: "center", borderWidth: StyleSheet.hairlineWidth, borderColor: C.goldLine },
  bubble: { maxWidth: "82%", paddingHorizontal: 14, paddingVertical: 11, borderRadius: 18 },
  bubbleStaff: { backgroundColor: C.surfaceHigh, borderBottomLeftRadius: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line },
  bubbleMe: { backgroundColor: "#1C1811", borderBottomRightRadius: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: C.goldLine },
  composer: { flexDirection: "row", alignItems: "flex-end", gap: 8, padding: 6, paddingLeft: space.lg, borderRadius: 26, backgroundColor: C.surface, borderWidth: 1, borderColor: C.lineStrong, marginTop: space.sm },
  composerInput: { flex: 1, ...text.callout, color: C.text, maxHeight: 120, paddingVertical: 10 },
  send: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.gold, alignItems: "center", justifyContent: "center" },
});

