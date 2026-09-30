import React from "react";
import { Image, Platform, StyleSheet, View } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import Svg, { Path } from "react-native-svg";
import { amountRows, documentTitle, issuedOn, supplierParty, taxDisclaimer } from "@/lawfic/invoice";
import { company } from "@/lawfic/company";
import { Icon } from "@/icons/Icon";
import type { VaultItem, State } from "@/lib/store";
import { dateLong } from "@/lib/format";
import { serviceName } from "@/data/catalogue";
import { Badge, Press, T } from "@/ui";
import { color as C, font, radius as R, space } from "@/theme";

/**
 * Documents as files, not rows.
 *
 * Every card has the shape of a sheet of paper — a folded corner, a type, a
 * date, a page count and who vouches for it. "Issued by LAWFIC" is only ever
 * said of a paper LAWFIC generated from its own ledger. Something the customer
 * uploaded says plainly that nobody has checked it yet.
 */
export function DocumentCard({ item, onPress, compact }: { item: VaultItem; onPress: () => void; compact?: boolean }) {
  const receipt = item.kind === "receipt";
  const title = receipt ? documentTitle(item.invoice) : "Your upload";
  return (
    <Press onPress={onPress} radius={R.lg} accessibilityLabel={`${item.title}, ${title}`} style={[styles.card, compact && { width: 168 }]}>
      <View style={styles.sheet}>
        {receipt ? (
          <View style={styles.sheetLines}>
            <View style={[styles.l, { width: "46%", backgroundColor: C.gold, opacity: 0.7 }]} />
            <View style={[styles.l, { width: "80%" }]} />
            <View style={[styles.l, { width: "64%" }]} />
            <View style={{ flex: 1 }} />
            <View style={[styles.l, { width: "36%", alignSelf: "flex-end" }]} />
          </View>
        ) : (
          <Image source={{ uri: item.upload.uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        )}
        <Fold />
      </View>
      <View style={{ padding: space.md, gap: 4 }}>
        <T v="label" style={{ fontSize: 9.5 }} numberOfLines={1}>
          {title}
        </T>
        <T v="calloutMedium" numberOfLines={1}>
          {item.title}
        </T>
        <T v="caption" num numberOfLines={1}>
          {dateLong(item.at)} · 1 page
        </T>
        <View style={{ marginTop: 4 }}>
          {receipt ? <Badge label="Issued by LAWFIC" tone="gold" icon="verified" /> : <Badge label="Not checked yet" tone="neutral" />}
        </View>
      </View>
    </Press>
  );
}

/** The folded top-right corner that makes a rectangle a sheet of paper. */
function Fold() {
  return (
    <View style={styles.fold} pointerEvents="none">
      <Svg width={22} height={22} viewBox="0 0 22 22">
        <Path d="M0 0 H22 V22 Z" fill={C.bg} />
        <Path d="M0 0 L22 22 H4 A4 4 0 0 1 0 18 Z" fill="#2A2824" />
      </Svg>
    </View>
  );
}

type ReceiptProps = {
  item: Extract<VaultItem, { kind: "receipt" }>;
  customer: string;
};

/**
 * The receipt, drawn as the paper it is. Warm white with dark ink, because a
 * document you might print or forward should look like one — the dark theme
 * is the app, not the paperwork.
 */
export function ReceiptPaper({ item, customer }: ReceiptProps) {
  const inv = item.invoice;
  const sup = supplierParty();
  const note = taxDisclaimer(inv);
  const rows = amountRows(inv);
  return (
    <View style={paper.page} accessible accessibilityLabel={`${documentTitle(inv)} ${inv.number}`}>
      <View style={paper.head}>
        <View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Image source={require("../../assets/brand/lawfic-mark.png")} style={{ width: 13, height: 20 }} resizeMode="contain" />
            <T style={{ fontFamily: font.semibold, fontSize: 15, letterSpacing: 3, color: INK }}>LAWFIC</T>
          </View>
          <T style={{ fontFamily: font.regular, fontSize: 10.5, color: INK_DIM, marginTop: 4 }}>{sup.name}</T>
          {sup.lines.map((l) => (
            <T key={l} style={{ fontFamily: font.regular, fontSize: 10.5, color: INK_DIM }}>
              {l}
            </T>
          ))}
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <T style={{ fontFamily: font.semibold, fontSize: 16, color: INK }}>{documentTitle(inv)}</T>
          <T num style={{ fontFamily: font.medium, fontSize: 11, color: INK_DIM, marginTop: 4 }}>
            {inv.number}
          </T>
          <T style={{ fontFamily: font.regular, fontSize: 11, color: INK_DIM }}>{issuedOn(inv.issued_at)}</T>
        </View>
      </View>

      <View style={paper.rule} />

      <View style={{ flexDirection: "row", gap: space.xl }}>
        <View style={{ flex: 1 }}>
          <T style={paper.k}>BILLED TO</T>
          <T style={paper.v}>{customer || "LAWFIC customer"}</T>
        </View>
        <View style={{ flex: 1 }}>
          <T style={paper.k}>{item.order ? "FILING" : "FOR"}</T>
          <T style={paper.v}>{item.order ? `${serviceName(item.order.service_slug)} · ${item.order.reference}` : "Money added to your LAWFIC wallet"}</T>
        </View>
      </View>

      <View style={paper.table}>
        <View style={paper.tr}>
          <T style={[paper.k, { flex: 1 }]}>DESCRIPTION</T>
          <T style={paper.k}>AMOUNT</T>
        </View>
        <View style={[paper.tr, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: RULE }]}>
          <T style={[paper.v, { flex: 1 }]}>{inv.narration}</T>
        </View>
        {rows.map((r, i) => (
          <View key={r.label} style={[paper.tr, i === rows.length - 1 && { borderTopWidth: 1, borderTopColor: INK }]}>
            <T style={[paper.v, { flex: 1, fontFamily: i === rows.length - 1 ? font.semibold : font.regular }]}>{r.label}</T>
            <T num style={[paper.v, { fontFamily: font.semibold }]}>
              {r.value}
            </T>
          </View>
        ))}
      </View>

      {note && <T style={{ fontFamily: font.regular, fontSize: 10.5, lineHeight: 15, color: INK_DIM, marginTop: space.lg }}>{note}</T>}
      <T style={{ fontFamily: font.medium, fontSize: 10, color: "#9C7A3C", marginTop: space.md }}>
        Demo document — generated from sample data. Not a record of a real payment.
      </T>
    </View>
  );
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** The same receipt as HTML, for printing or saving as a PDF. */
export function receiptHtml({ item, customer }: ReceiptProps): string {
  const inv = item.invoice;
  const sup = supplierParty();
  const note = taxDisclaimer(inv);
  const rows = amountRows(inv);
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(documentTitle(inv))} ${esc(inv.number)}</title>
<style>
body{font-family:-apple-system,Inter,Segoe UI,Helvetica,Arial,sans-serif;color:#17120A;margin:48px;font-size:13px}
.h{display:flex;justify-content:space-between}.b{font-weight:600;letter-spacing:4px;font-size:18px}.d{color:#6b645a}
hr{border:0;border-top:1px solid #e3ddd1;margin:24px 0}.k{font-size:10px;letter-spacing:1.4px;color:#8a8275;font-weight:600}
table{width:100%;border-collapse:collapse;margin-top:24px}td{padding:10px 0;border-top:1px solid #e3ddd1}td:last-child{text-align:right;font-weight:600}
tr.t td{border-top:1.5px solid #17120A;font-weight:600}.n{margin-top:20px;color:#6b645a;font-size:11px;line-height:1.5}.p{color:#9C7A3C;font-size:11px;margin-top:10px}
</style></head><body>
<div class="h"><div><div class="b">LAWFIC</div><div class="d">${esc(sup.name)}</div>${sup.lines.map((l) => `<div class="d">${esc(l)}</div>`).join("")}</div>
<div style="text-align:right"><div style="font-size:18px;font-weight:600">${esc(documentTitle(inv))}</div><div class="d">${esc(inv.number)}</div><div class="d">${esc(issuedOn(inv.issued_at))}</div></div></div>
<hr><div class="h"><div><div class="k">BILLED TO</div><div>${esc(customer || "LAWFIC customer")}</div></div>
<div style="text-align:right"><div class="k">${item.order ? "FILING" : "FOR"}</div><div>${esc(item.order ? `${serviceName(item.order.service_slug)} · ${item.order.reference}` : "Money added to your LAWFIC wallet")}</div></div></div>
<table><tr><td class="k">DESCRIPTION</td><td class="k">AMOUNT</td></tr><tr><td>${esc(inv.narration)}</td><td></td></tr>
${rows.map((r, i) => `<tr class="${i === rows.length - 1 ? "t" : ""}"><td>${esc(r.label)}</td><td>${esc(r.value)}</td></tr>`).join("")}</table>
${note ? `<div class="n">${esc(note)}</div>` : ""}<div class="p">Demo document — generated from sample data. Not a record of a real payment.</div>
${company.supportEmail ? `<div class="n">Questions: ${esc(company.supportEmail)}</div>` : ""}
</body></html>`;
}

/**
 * Save as PDF. On a phone: render to a PDF file and open the share sheet, so
 * it can go to Files, Drive, WhatsApp or mail. On the web: open the document
 * on its own and bring up the browser's print dialog, where "Save as PDF" is
 * one of the destinations.
 */
export async function saveReceiptPdf(p: ReceiptProps): Promise<boolean> {
  const html = receiptHtml(p);
  if (Platform.OS === "web") {
    const w = window.open("", "_blank");
    if (!w) return false;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 250);
    return true;
  }
  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: "application/pdf", UTI: "com.adobe.pdf", dialogTitle: p.item.invoice.number });
  }
  return true;
}

/** Plain-text summary, for Share and for asking Panda AI about it. */
export function receiptText({ item, customer }: ReceiptProps): string {
  const inv = item.invoice;
  const rows = amountRows(inv).map((r) => `${r.label}: ${r.value}`).join("\n");
  return `${documentTitle(inv)} ${inv.number}\nIssued ${issuedOn(inv.issued_at)}\nBilled to ${customer || "LAWFIC customer"}\n${inv.narration}\n${rows}`;
}

export function vaultCounts(s: Pick<State, "invoices" | "uploads">) {
  return { total: s.invoices.length + s.uploads.length, issued: s.invoices.length };
}

const INK = "#17120A";
const INK_DIM = "#6B645A";
const RULE = "#E3DDD1";

const styles = StyleSheet.create({
  card: { borderRadius: R.lg, backgroundColor: C.surfaceHigh, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line, overflow: "hidden" },
  sheet: { height: 92, margin: space.sm, marginBottom: 0, borderRadius: 12, backgroundColor: "#1E1D1A", overflow: "hidden", borderWidth: StyleSheet.hairlineWidth, borderColor: C.lineStrong },
  sheetLines: { flex: 1, padding: 12, gap: 6 },
  l: { height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.14)" },
  fold: { position: "absolute", right: 0, top: 0 },
});

const paper = StyleSheet.create({
  page: { backgroundColor: "#F4F1EA", borderRadius: 6, padding: 28, minHeight: 460 },
  head: { flexDirection: "row", justifyContent: "space-between", gap: space.lg },
  rule: { height: 1, backgroundColor: RULE, marginVertical: space.xl },
  k: { fontFamily: font.semibold, fontSize: 9, letterSpacing: 1.3, color: "#8A8275" },
  v: { fontFamily: font.regular, fontSize: 12, color: INK, marginTop: 3, lineHeight: 17 },
  table: { marginTop: space.xl },
  tr: { flexDirection: "row", paddingVertical: 10, gap: space.md },
});
