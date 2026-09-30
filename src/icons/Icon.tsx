import React from "react";
import Svg, { Circle, G, Path, Rect } from "react-native-svg";
import { color as C } from "@/theme";

/**
 * LAWFIC's own icon set.
 *
 * WHY THESE ARE DRAWN AND NOT INSTALLED
 *
 * Feather, Lucide, Material and SF all look like themselves, and an app wearing
 * one of them announces which library it used before it announces whose app it
 * is. These are drawn on a 24 grid to one grammar so they read as a family:
 *
 *   - 1.7 stroke, round caps, round joins. Heavy enough to survive at 18px.
 *   - Geometry built from circles and straight runs, never freehand curves, so
 *     every icon shares the same corner radius and optical weight.
 *   - One "tell" per icon: the detail that makes it that thing and not a
 *     generic rectangle. The seal on the certificate, the snap on the wallet,
 *     the torn edge on the receipt, the offset cell in the grid.
 *   - The subject fills the 24 box edge to edge. Icons drawn small inside their
 *     own viewbox go grey and vanish next to ones that do not.
 *
 * ACTIVE STATE
 *
 * `active` paints a soft fill behind the stroke in the same hue. That reads as
 * "selected" at a glance without changing the silhouette, which is what makes
 * the tab bar legible in peripheral vision — the shape stays put, the weight
 * changes.
 */

export type IconName =
  /* navigation */
  | "home"
  | "services"
  | "orders"
  | "wallet"
  | "account"
  /* the seven catalogue categories */
  | "identity"
  | "business"
  | "tax"
  | "licence"
  | "ip"
  | "payroll"
  | "legal"
  /* utility */
  | "search"
  | "bell"
  | "chevron"
  | "back"
  | "plus"
  | "upload"
  | "check"
  | "shield"
  | "phone"
  | "spark"
  | "trend"
  | "close"
  | "clock"
  | "filter"
  /* added for the redesign */
  | "scan"
  | "chart"
  | "gift"
  | "lock"
  | "faceid"
  | "fingerprint"
  | "arrowUp"
  | "arrowDown"
  | "calendar"
  | "bolt"
  | "eye"
  | "eyeOff"
  | "star"
  | "camera"
  | "image"
  | "settings"
  | "logout"
  | "statement"
  | "crown"
  | "more"
  | "pin"
  | "mail";

type Glyph = (p: { c: string; fill: string; active: boolean }) => React.ReactNode;

const S = 1.7;

const GLYPHS: Record<IconName, Glyph> = {
  /* ── navigation ─────────────────────────────────────────────────────── */

  /* A roof over a doorway. The doorway is what stops it reading as a triangle
     on a box, which is every generic home icon. */
  home: ({ c, fill, active }) => (
    <G>
      {active && <Path d="M3.4 10.6 12 3.6l8.6 7v8.1a1.3 1.3 0 0 1-1.3 1.3H4.7a1.3 1.3 0 0 1-1.3-1.3z" fill={fill} />}
      <Path d="M3.4 10.6 12 3.6l8.6 7v8.1a1.3 1.3 0 0 1-1.3 1.3H4.7a1.3 1.3 0 0 1-1.3-1.3z" stroke={c} strokeWidth={S} strokeLinejoin="round" />
      <Path d="M9.6 20V13.4h4.8V20" stroke={c} strokeWidth={S} strokeLinejoin="round" />
    </G>
  ),

  /* Four cells, one lifted clear of the grid. The offset is the tell: it says
     "a set you pick from" rather than "a dashboard". */
  services: ({ c, fill, active }) => (
    <G>
      {active && <Rect x={3.2} y={3.2} width={7.6} height={7.6} rx={2.2} fill={fill} />}
      <Rect x={3.2} y={3.2} width={7.6} height={7.6} rx={2.2} stroke={c} strokeWidth={S} />
      <Rect x={13.2} y={3.2} width={7.6} height={7.6} rx={2.2} stroke={c} strokeWidth={S} />
      <Rect x={3.2} y={13.2} width={7.6} height={7.6} rx={2.2} stroke={c} strokeWidth={S} />
      <Circle cx={17} cy={17} r={3.9} stroke={c} strokeWidth={S} />
    </G>
  ),

  /* A receipt with a torn bottom edge. The tear is the tell. */
  orders: ({ c, fill, active }) => (
    <G>
      {active && <Path d="M5 3.4h14v17.2l-2.3-1.5-2.3 1.5-2.4-1.5-2.3 1.5-2.4-1.5L5 20.6z" fill={fill} />}
      <Path d="M5 3.4h14v17.2l-2.3-1.5-2.3 1.5-2.4-1.5-2.3 1.5-2.4-1.5L5 20.6z" stroke={c} strokeWidth={S} strokeLinejoin="round" />
      <Path d="M8.6 8.2h6.8M8.6 12.2h4.4" stroke={c} strokeWidth={S} strokeLinecap="round" />
    </G>
  ),

  /* A bifold seen closed, with the flap line and the snap. Not a credit card
     with a stripe, which is what most wallet icons actually draw. */
  wallet: ({ c, fill, active }) => (
    <G>
      {active && <Rect x={2.8} y={5.6} width={18.4} height={13} rx={3.2} fill={fill} />}
      <Rect x={2.8} y={5.6} width={18.4} height={13} rx={3.2} stroke={c} strokeWidth={S} />
      <Path d="M2.8 10.4h18.4" stroke={c} strokeWidth={S} />
      <Circle cx={17.1} cy={14.6} r={1.5} stroke={c} strokeWidth={S} />
    </G>
  ),

  account: ({ c, fill, active }) => (
    <G>
      {active && <Circle cx={12} cy={8.2} r={3.8} fill={fill} />}
      <Circle cx={12} cy={8.2} r={3.8} stroke={c} strokeWidth={S} />
      <Path d="M4.4 20.4c1.4-4.2 4.3-6.3 7.6-6.3s6.2 2.1 7.6 6.3" stroke={c} strokeWidth={S} strokeLinecap="round" />
    </G>
  ),

  /* ── the seven categories ───────────────────────────────────────────── */

  /* An ID card: portrait window on the left, two data lines on the right. */
  identity: ({ c, fill, active }) => (
    <G>
      {active && <Rect x={2.6} y={5} width={18.8} height={14} rx={3} fill={fill} />}
      <Rect x={2.6} y={5} width={18.8} height={14} rx={3} stroke={c} strokeWidth={S} />
      <Circle cx={8.3} cy={10.6} r={2.1} stroke={c} strokeWidth={S} />
      <Path d="M5.4 15.9c.6-1.6 1.7-2.4 2.9-2.4s2.3.8 2.9 2.4" stroke={c} strokeWidth={S} strokeLinecap="round" />
      <Path d="M14.4 9.8h4.2M14.4 13.4h4.2" stroke={c} strokeWidth={S} strokeLinecap="round" />
    </G>
  ),

  /* A shopfront: the awning is the tell that separates it from an office block. */
  business: ({ c, fill, active }) => (
    <G>
      {active && <Path d="M4 9.6h16v9.9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" fill={fill} />}
      <Path d="M3.2 9.6h17.6L19 4.4H5z" stroke={c} strokeWidth={S} strokeLinejoin="round" />
      <Path d="M4.6 9.6v9.9a1 1 0 0 0 1 1h12.8a1 1 0 0 0 1-1V9.6" stroke={c} strokeWidth={S} strokeLinejoin="round" />
      <Path d="M9.6 20.5v-5.4h4.8v5.4" stroke={c} strokeWidth={S} strokeLinejoin="round" />
    </G>
  ),

  /* A slip with a percent struck through it. */
  tax: ({ c, fill, active }) => (
    <G>
      {active && <Path d="M5.4 3.4h13.2v17.2l-2.2-1.4-2.2 1.4-2.2-1.4-2.2 1.4-2.2-1.4-2.2 1.4z" fill={fill} />}
      <Path d="M5.4 3.4h13.2v17.2l-2.2-1.4-2.2 1.4-2.2-1.4-2.2 1.4-2.2-1.4-2.2 1.4z" stroke={c} strokeWidth={S} strokeLinejoin="round" />
      <Circle cx={10} cy={9.2} r={1.5} stroke={c} strokeWidth={1.4} />
      <Circle cx={14.4} cy={14} r={1.5} stroke={c} strokeWidth={1.4} />
      <Path d="M15.3 8.3 9.1 14.9" stroke={c} strokeWidth={S} strokeLinecap="round" />
    </G>
  ),

  /* A certificate with a rosette seal and its two ribbon tails. */
  licence: ({ c, fill, active }) => (
    <G>
      {active && <Rect x={3} y={3.6} width={18} height={12.4} rx={2.6} fill={fill} />}
      <Rect x={3} y={3.6} width={18} height={12.4} rx={2.6} stroke={c} strokeWidth={S} />
      <Path d="M6.6 7.8h7M6.6 11.4h4.4" stroke={c} strokeWidth={S} strokeLinecap="round" />
      <Circle cx={16.3} cy={16.6} r={3.2} stroke={c} strokeWidth={S} />
      <Path d="M14.3 19.2 13.6 22l2.7-1.3 2.7 1.3-.7-2.8" stroke={c} strokeWidth={S} strokeLinejoin="round" />
    </G>
  ),

  /* A cut gem: a brand is a facet-cut asset, not a lightbulb. */
  ip: ({ c, fill, active }) => (
    <G>
      {active && <Path d="M7.4 3.6h9.2l4 5.2L12 20.6 3.4 8.8z" fill={fill} />}
      <Path d="M7.4 3.6h9.2l4 5.2L12 20.6 3.4 8.8z" stroke={c} strokeWidth={S} strokeLinejoin="round" />
      <Path d="M3.4 8.8h17.2M9.4 8.8 12 20.6l2.6-11.8M7.4 3.6 9.4 8.8M16.6 3.6l-2 5.2" stroke={c} strokeWidth={1.35} strokeLinejoin="round" />
    </G>
  ),

  /* A person beside a stack of coins seen edge-on. */
  payroll: ({ c, fill, active }) => (
    <G>
      {active && <Circle cx={8} cy={7.8} r={3.3} fill={fill} />}
      <Circle cx={8} cy={7.8} r={3.3} stroke={c} strokeWidth={S} />
      <Path d="M2.8 19.4c.9-3.3 2.8-5 5.2-5s4.3 1.7 5.2 5" stroke={c} strokeWidth={S} strokeLinecap="round" />
      <Rect x={15.2} y={9} width={6} height={3.1} rx={1.55} stroke={c} strokeWidth={1.45} />
      <Rect x={15.2} y={13.4} width={6} height={3.1} rx={1.55} stroke={c} strokeWidth={1.45} />
      <Rect x={15.2} y={17.8} width={6} height={3.1} rx={1.55} stroke={c} strokeWidth={1.45} />
    </G>
  ),

  /* A page with a folded corner and a stamp pressed into it. */
  legal: ({ c, fill, active }) => (
    <G>
      {active && <Path d="M5.6 2.8h8.2l5 5v13.4H5.6z" fill={fill} />}
      <Path d="M5.6 2.8h8.2l5 5v13.4H5.6z" stroke={c} strokeWidth={S} strokeLinejoin="round" />
      <Path d="M13.8 2.8v5h5" stroke={c} strokeWidth={S} strokeLinejoin="round" />
      <Circle cx={12.2} cy={15.2} r={3} stroke={c} strokeWidth={1.45} />
      <Path d="M10.4 13.4l3.6 3.6" stroke={c} strokeWidth={1.45} strokeLinecap="round" />
    </G>
  ),

  /* ── utility ────────────────────────────────────────────────────────── */

  search: ({ c }) => (
    <G>
      <Circle cx={10.8} cy={10.8} r={6.6} stroke={c} strokeWidth={S} />
      <Path d="M20.2 20.2 16 16" stroke={c} strokeWidth={S} strokeLinecap="round" />
    </G>
  ),

  bell: ({ c }) => (
    <G>
      <Path d="M6.2 9.6a5.8 5.8 0 0 1 11.6 0c0 4.6 2 5.9 2 5.9H4.2s2-1.3 2-5.9z" stroke={c} strokeWidth={S} strokeLinejoin="round" />
      <Path d="M10 18.6a2 2 0 0 0 4 0" stroke={c} strokeWidth={S} strokeLinecap="round" />
    </G>
  ),

  chevron: ({ c }) => <Path d="m9.4 5.2 6.8 6.8-6.8 6.8" stroke={c} strokeWidth={S} strokeLinecap="round" strokeLinejoin="round" />,
  back: ({ c }) => <Path d="m14.6 5.2-6.8 6.8 6.8 6.8" stroke={c} strokeWidth={S} strokeLinecap="round" strokeLinejoin="round" />,
  plus: ({ c }) => <Path d="M12 5v14M5 12h14" stroke={c} strokeWidth={S} strokeLinecap="round" />,
  close: ({ c }) => <Path d="m6.2 6.2 11.6 11.6M17.8 6.2 6.2 17.8" stroke={c} strokeWidth={S} strokeLinecap="round" />,
  check: ({ c }) => <Path d="m4.4 12.4 5.2 5.2L19.6 7.2" stroke={c} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" />,

  upload: ({ c }) => (
    <G>
      <Path d="M12 16.4V4.6M7.4 9.2 12 4.6l4.6 4.6" stroke={c} strokeWidth={S} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M4.4 19.4h15.2" stroke={c} strokeWidth={S} strokeLinecap="round" />
    </G>
  ),

  shield: ({ c, fill, active }) => (
    <G>
      {active && <Path d="M12 2.8 20 5.8v6.1c0 5.1-3.5 8.2-8 9.3-4.5-1.1-8-4.2-8-9.3V5.8z" fill={fill} />}
      <Path d="M12 2.8 20 5.8v6.1c0 5.1-3.5 8.2-8 9.3-4.5-1.1-8-4.2-8-9.3V5.8z" stroke={c} strokeWidth={S} strokeLinejoin="round" />
    </G>
  ),

  phone: ({ c }) => (
    <Path d="M4.6 3.6h4.2l2.1 5.2-2.6 1.6a11.4 11.4 0 0 0 5.3 5.3l1.6-2.6 5.2 2.1v4.2a1 1 0 0 1-1.1 1A16.6 16.6 0 0 1 3.6 4.7a1 1 0 0 1 1-1.1z" stroke={c} strokeWidth={S} strokeLinejoin="round" />
  ),

  /* A four-point star with a small companion. The assistant's mark. */
  spark: ({ c, fill, active }) => (
    <G>
      {active && <Path d="M10.2 2.6 12 8.2l5.6 1.8-5.6 1.8-1.8 5.6-1.8-5.6L2.8 10l5.6-1.8z" fill={fill} />}
      <Path d="M10.2 2.6 12 8.2l5.6 1.8-5.6 1.8-1.8 5.6-1.8-5.6L2.8 10l5.6-1.8z" stroke={c} strokeWidth={1.55} strokeLinejoin="round" />
      <Path d="M17.6 14.6l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9z" stroke={c} strokeWidth={1.35} strokeLinejoin="round" />
    </G>
  ),

  trend: ({ c }) => (
    <G>
      <Path d="M3.6 16.4 9 11l3.6 3.6 7.2-7.2" stroke={c} strokeWidth={S} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M14.8 7.4h5v5" stroke={c} strokeWidth={S} strokeLinecap="round" strokeLinejoin="round" />
    </G>
  ),

  clock: ({ c }) => (
    <G>
      <Circle cx={12} cy={12} r={8.6} stroke={c} strokeWidth={S} />
      <Path d="M12 7.2V12l3.2 2" stroke={c} strokeWidth={S} strokeLinecap="round" strokeLinejoin="round" />
    </G>
  ),

  filter: ({ c }) => (
    <G>
      <Path d="M3.6 6.4h16.8M6.6 12h10.8M9.8 17.6h4.4" stroke={c} strokeWidth={S} strokeLinecap="round" />
    </G>
  ),
  /* ── added for the redesign ─────────────────────────────────────────── */

  /* Four corner brackets and a line: the scan frame everybody recognises. */
  scan: ({ c }) => (
    <G>
      <Path d="M3.6 8.2V5.4a1.8 1.8 0 0 1 1.8-1.8h2.8M15.8 3.6h2.8a1.8 1.8 0 0 1 1.8 1.8v2.8M20.4 15.8v2.8a1.8 1.8 0 0 1-1.8 1.8h-2.8M8.2 20.4H5.4a1.8 1.8 0 0 1-1.8-1.8v-2.8" stroke={c} strokeWidth={S} strokeLinecap="round" />
      <Path d="M6.8 12h10.4" stroke={c} strokeWidth={S} strokeLinecap="round" />
    </G>
  ),
  chart: ({ c, fill, active }) => (
    <G>
      {active && <Path d="M4 20h16" stroke={fill} strokeWidth={6} />}
      <Path d="M4 20h16M7 16v-4M11.5 16V7M16 16v-6.5" stroke={c} strokeWidth={S} strokeLinecap="round" />
    </G>
  ),
  gift: ({ c, fill, active }) => (
    <G>
      {active && <Rect x={4} y={10} width={16} height={10} rx={2} fill={fill} />}
      <Rect x={3.4} y={7.4} width={17.2} height={4} rx={1.4} stroke={c} strokeWidth={S} />
      <Path d="M5 11.4v7.2a1.4 1.4 0 0 0 1.4 1.4h11.2a1.4 1.4 0 0 0 1.4-1.4v-7.2M12 7.4V20" stroke={c} strokeWidth={S} strokeLinejoin="round" />
      <Path d="M12 7.4S10.6 3.6 8.4 3.9c-1.6.2-1.8 2.2-.4 3 1 .5 4 .5 4 .5zm0 0s1.4-3.8 3.6-3.5c1.6.2 1.8 2.2.4 3-1 .5-4 .5-4 .5z" stroke={c} strokeWidth={1.4} strokeLinejoin="round" />
    </G>
  ),
  lock: ({ c, fill, active }) => (
    <G>
      {active && <Rect x={5} y={10.6} width={14} height={9.8} rx={2.6} fill={fill} />}
      <Rect x={5} y={10.6} width={14} height={9.8} rx={2.6} stroke={c} strokeWidth={S} />
      <Path d="M8.2 10.6V7.8a3.8 3.8 0 0 1 7.6 0v2.8" stroke={c} strokeWidth={S} strokeLinecap="round" />
      <Circle cx={12} cy={15.4} r={1.3} fill={c} />
    </G>
  ),
  /* The face-scan glyph: brackets, two eyes, a nose, a smile. */
  faceid: ({ c }) => (
    <G>
      <Path d="M3.6 8V5.6a2 2 0 0 1 2-2H8M16 3.6h2.4a2 2 0 0 1 2 2V8M20.4 16v2.4a2 2 0 0 1-2 2H16M8 20.4H5.6a2 2 0 0 1-2-2V16" stroke={c} strokeWidth={S} strokeLinecap="round" />
      <Path d="M9 9v1.4M15 9v1.4M12 9v3.6l-1 .6M9.4 15.6a4 4 0 0 0 5.2 0" stroke={c} strokeWidth={S} strokeLinecap="round" strokeLinejoin="round" />
    </G>
  ),
  fingerprint: ({ c }) => (
    <G>
      <Path d="M6.4 8.2A6.6 6.6 0 0 1 18 11.6v1.2M5.2 12.4v-.8a6.8 6.8 0 0 1 .5-2.6M12 11.6v3.2c0 2.4-.7 4.3-1.8 5.6M8.6 11.8a3.4 3.4 0 0 1 6.8-.2v2.8c0 1.8-.3 3.4-.9 4.8M17.8 15.6c-.2 1.2-.5 2.3-1 3.3M5.6 15.4c.2 1.4.2 2.4 0 3.4" stroke={c} strokeWidth={1.55} strokeLinecap="round" />
    </G>
  ),
  arrowUp: ({ c }) => <Path d="M7 17 17 7M9 7h8v8" stroke={c} strokeWidth={S} strokeLinecap="round" strokeLinejoin="round" />,
  arrowDown: ({ c }) => <Path d="M17 7 7 17M15 17H7V9" stroke={c} strokeWidth={S} strokeLinecap="round" strokeLinejoin="round" />,
  calendar: ({ c }) => (
    <G>
      <Rect x={3.6} y={5} width={16.8} height={15.4} rx={2.6} stroke={c} strokeWidth={S} />
      <Path d="M3.6 9.8h16.8M8 3.4v3.2M16 3.4v3.2" stroke={c} strokeWidth={S} strokeLinecap="round" />
    </G>
  ),
  bolt: ({ c, fill, active }) => (
    <G>
      {active && <Path d="M13.4 2.8 5 13.6h6.2l-1 7.6 8.4-10.8h-6.2z" fill={fill} />}
      <Path d="M13.4 2.8 5 13.6h6.2l-1 7.6 8.4-10.8h-6.2z" stroke={c} strokeWidth={S} strokeLinejoin="round" />
    </G>
  ),
  eye: ({ c }) => (
    <G>
      <Path d="M2.8 12S6 5.6 12 5.6 21.2 12 21.2 12 18 18.4 12 18.4 2.8 12 2.8 12z" stroke={c} strokeWidth={S} strokeLinejoin="round" />
      <Circle cx={12} cy={12} r={2.8} stroke={c} strokeWidth={S} />
    </G>
  ),
  eyeOff: ({ c }) => (
    <G>
      <Path d="M9.8 5.9A8.6 8.6 0 0 1 12 5.6c6 0 9.2 6.4 9.2 6.4a15.6 15.6 0 0 1-2.4 3.2M6.2 7.6A15.2 15.2 0 0 0 2.8 12S6 18.4 12 18.4a8.8 8.8 0 0 0 4.4-1.2" stroke={c} strokeWidth={S} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M3.8 3.8l16.4 16.4" stroke={c} strokeWidth={S} strokeLinecap="round" />
    </G>
  ),
  star: ({ c, fill, active }) => (
    <G>
      {active && <Path d="M12 3.4l2.6 5.5 6 .8-4.4 4.1 1.1 5.9L12 16.8l-5.3 2.9 1.1-5.9-4.4-4.1 6-.8z" fill={fill} />}
      <Path d="M12 3.4l2.6 5.5 6 .8-4.4 4.1 1.1 5.9L12 16.8l-5.3 2.9 1.1-5.9-4.4-4.1 6-.8z" stroke={c} strokeWidth={S} strokeLinejoin="round" />
    </G>
  ),
  camera: ({ c }) => (
    <G>
      <Path d="M3.4 8.6a1.8 1.8 0 0 1 1.8-1.8h2.4l1.6-2.4h5.6l1.6 2.4h2.4a1.8 1.8 0 0 1 1.8 1.8v9.2a1.8 1.8 0 0 1-1.8 1.8H5.2a1.8 1.8 0 0 1-1.8-1.8z" stroke={c} strokeWidth={S} strokeLinejoin="round" />
      <Circle cx={12} cy={13} r={3.4} stroke={c} strokeWidth={S} />
    </G>
  ),
  image: ({ c }) => (
    <G>
      <Rect x={3.4} y={4.4} width={17.2} height={15.2} rx={2.6} stroke={c} strokeWidth={S} />
      <Circle cx={8.6} cy={9.4} r={1.6} stroke={c} strokeWidth={S} />
      <Path d="m4 17.6 5-4.8 3.6 3.2 2.8-2.4 4.8 4" stroke={c} strokeWidth={S} strokeLinejoin="round" />
    </G>
  ),
  settings: ({ c }) => (
    <G>
      <Circle cx={12} cy={12} r={3} stroke={c} strokeWidth={S} />
      <Path d="M12 2.8v2.6M12 18.6v2.6M4 7.4l2.2 1.3M17.8 15.3l2.2 1.3M4 16.6l2.2-1.3M17.8 8.7 20 7.4" stroke={c} strokeWidth={S} strokeLinecap="round" />
    </G>
  ),
  logout: ({ c }) => (
    <G>
      <Path d="M14.4 4.4H6.6a1.8 1.8 0 0 0-1.8 1.8v11.6a1.8 1.8 0 0 0 1.8 1.8h7.8" stroke={c} strokeWidth={S} strokeLinecap="round" />
      <Path d="M10.4 12h9.8M16.8 8.4 20.4 12l-3.6 3.6" stroke={c} strokeWidth={S} strokeLinecap="round" strokeLinejoin="round" />
    </G>
  ),
  statement: ({ c }) => (
    <G>
      <Path d="M6 3.4h8.6l3.4 3.4v13.8H6z" stroke={c} strokeWidth={S} strokeLinejoin="round" />
      <Path d="M9 11h6M9 14.4h6M9 17.8h3.4" stroke={c} strokeWidth={S} strokeLinecap="round" />
    </G>
  ),
  crown: ({ c, fill, active }) => (
    <G>
      {active && <Path d="M3.6 8.2 8 11.6 12 5l4 6.6 4.4-3.4-1.8 10.4H5.4z" fill={fill} />}
      <Path d="M3.6 8.2 8 11.6 12 5l4 6.6 4.4-3.4-1.8 10.4H5.4z" stroke={c} strokeWidth={S} strokeLinejoin="round" />
    </G>
  ),
  more: ({ c }) => (
    <G>
      <Circle cx={5.6} cy={12} r={1.6} fill={c} />
      <Circle cx={12} cy={12} r={1.6} fill={c} />
      <Circle cx={18.4} cy={12} r={1.6} fill={c} />
    </G>
  ),
  pin: ({ c }) => (
    <G>
      <Path d="M12 21s7-6.2 7-11.4a7 7 0 1 0-14 0C5 14.8 12 21 12 21z" stroke={c} strokeWidth={S} strokeLinejoin="round" />
      <Circle cx={12} cy={9.8} r={2.6} stroke={c} strokeWidth={S} />
    </G>
  ),
  mail: ({ c }) => (
    <G>
      <Rect x={3.4} y={5.4} width={17.2} height={13.2} rx={2.4} stroke={c} strokeWidth={S} />
      <Path d="m4 7 8 6 8-6" stroke={c} strokeWidth={S} strokeLinecap="round" strokeLinejoin="round" />
    </G>
  ),
};

export function Icon({
  name,
  size = 22,
  color = C.text,
  active = false,
  fill,
}: {
  name: IconName;
  size?: number;
  color?: string;
  /** Paints the soft companion fill. The silhouette does not change. */
  active?: boolean;
  /** Override the fill colour; defaults to the stroke at low opacity. */
  fill?: string;
}) {
  const glyph = GLYPHS[name];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ position: "relative" }}>
      {glyph({ c: color, fill: fill ?? withAlpha(color, 0.18), active })}
    </Svg>
  );
}

/**
 * A hex colour at a given alpha.
 *
 * Written out rather than pulled from a colour library because it runs on every
 * icon render and the whole job is eight characters of string work. Anything it
 * does not understand (an rgba() already, a named colour) is returned as given,
 * so a caller passing something exotic gets their colour rather than a crash.
 */
function withAlpha(hex: string, alpha: number): string {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return hex;
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
