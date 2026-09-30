import { Platform } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import type { WalletEntry } from "@/lawfic/wallet-entries";
import { statementCsv, statementFilename } from "@/lawfic/statement";
import { dateLong, rupees, signed, time } from "@/lib/format";

/**
 * The wallet statement, exported for real.
 *
 * The CSV is the website's own (lib/statement.ts — same columns, oldest first,
 * so a running total can sit beside it). In a browser it downloads as a file;
 * on a phone, where "a CSV in Downloads" means nothing to most people, it is
 * rendered as a PDF and handed to the share sheet.
 */
export async function exportStatement(entries: WalletEntry[], holder: string): Promise<boolean> {
  if (Platform.OS === "web") {
    const blob = new Blob([statementCsv(entries)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = statementFilename();
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  }
  const rows = [...entries]
    .reverse()
    .map(
      (e) =>
        `<tr><td>${dateLong(e.created_at)}<br><span class="d">${time(e.created_at)}</span></td><td>${esc(e.reason)}</td><td class="${e.direction}">${signed(e.direction, e.amount_paise)}</td></tr>`,
    )
    .join("");
  const bal = entries.reduce((s, e) => s + (e.direction === "credit" ? e.amount_paise : -e.amount_paise), 0);
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
body{font-family:-apple-system,Helvetica,Arial,sans-serif;color:#17120A;margin:40px;font-size:12px}
h1{font-size:20px;margin:0}.d{color:#6b645a}table{width:100%;border-collapse:collapse;margin-top:24px}
td{padding:9px 0;border-top:1px solid #e3ddd1;vertical-align:top}td:last-child{text-align:right;font-weight:600}.credit{color:#23794a}
.b{margin-top:18px;font-size:14px;font-weight:600}.p{color:#9C7A3C;font-size:10px;margin-top:16px}
</style></head><body><div style="letter-spacing:4px;font-weight:600">LAWFIC</div><h1>Wallet statement</h1>
<div class="d">${esc(holder || "LAWFIC customer")} · generated ${dateLong(new Date().toISOString())}</div>
<table>${rows}</table><div class="b">Closing balance ${rupees(bal)}</div>
<div class="p">Demo statement — generated from sample data. Not a record of real payments.</div></body></html>`;
  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: "application/pdf", UTI: "com.adobe.pdf" });
  return true;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
