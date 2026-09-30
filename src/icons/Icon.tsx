import React from "react";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  BookOpen,
  BotMessageSquare,
  Briefcase,
  Building,
  Calendar,
  CalendarCheck,
  Camera,
  ChartNoAxesColumn,
  ChartPie,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CircleQuestionMark,
  Clock,
  Copy,
  Copyright,
  CreditCard,
  Crown,
  Download,
  Ellipsis,
  ExternalLink,
  Eye,
  EyeOff,
  FileCheck,
  FileClock,
  FileDown,
  FileText,
  Files,
  FingerprintPattern,
  Gift,
  Globe,
  Handshake,
  Headset,
  Heart,
  Hourglass,
  House,
  IdCard,
  Image,
  Inbox,
  IndianRupee,
  Info,
  KeyRound,
  Landmark,
  Layers,
  LayoutGrid,
  ListChecks,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Megaphone,
  MessageCircle,
  Minus,
  MonitorSmartphone,
  Paperclip,
  Pencil,
  Percent,
  Phone,
  Plus,
  Receipt,
  RefreshCw,
  RotateCcw,
  ScanFace,
  ScanLine,
  Scale,
  ScrollText,
  Search,
  Send,
  Settings,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Star,
  Store,
  Tag,
  Trash,
  TrendingUp,
  Upload,
  User,
  Users,
  Wallet,
  WalletCards,
  WifiOff,
  X,
  Zap,
  ZoomIn,
  ZoomOut,
  type LucideIcon,
} from "lucide-react-native";
import { color as C } from "@/theme";

/**
 * One icon family for the whole product: Lucide, drawn thin.
 *
 * Screens ask for an icon by what it MEANS ("filings", "vault", "verified"),
 * not by what Lucide calls the drawing. That indirection is the point: the day
 * the filings icon should be a different glyph, it changes here and nowhere
 * else, and no screen has to know.
 *
 * Gold is never the default. An icon is gold when it is active or when it
 * marks something important — a selected tab, a verified document — and that
 * decision belongs to the caller, which passes `active` or a `color`.
 */
const MAP = {
  /* navigation */
  home: House,
  filings: Layers,
  services: LayoutGrid,
  wallet: Wallet,
  passes: WalletCards,
  account: User,
  panda: Sparkles,
  bot: BotMessageSquare,
  vault: Files,
  document: FileText,
  bell: Bell,
  settings: Settings,

  /* the seven catalogue categories */
  identity: IdCard,
  business: Building,
  tax: Receipt,
  licence: BadgeCheck,
  ip: Copyright,
  payroll: Users,
  legal: ScrollText,

  /* the four document groups */
  certificate: FileCheck,
  agreement: Handshake,
  government: Landmark,

  /* money */
  rupee: IndianRupee,
  card: CreditCard,
  upi: Smartphone,
  bank: Landmark,
  receipt: Receipt,
  statement: FileDown,
  credit: ArrowDownLeft,
  debit: ArrowUpRight,
  gift: Gift,
  percent: Percent,
  tag: Tag,
  crown: Crown,
  chart: ChartNoAxesColumn,
  pie: ChartPie,
  trend: TrendingUp,

  /* status */
  check: Check,
  checkCircle: CircleCheck,
  verified: BadgeCheck,
  shield: ShieldCheck,
  alert: CircleAlert,
  info: Info,
  pending: FileClock,
  hourglass: Hourglass,
  clock: Clock,
  calendar: Calendar,
  calendarCheck: CalendarCheck,
  offline: WifiOff,

  /* security */
  lock: Lock,
  faceid: ScanFace,
  fingerprint: FingerprintPattern,
  key: KeyRound,
  devices: MonitorSmartphone,
  scale: Scale,

  /* actions */
  search: Search,
  plus: Plus,
  minus: Minus,
  close: X,
  back: ArrowLeft,
  forward: ArrowRight,
  chevron: ChevronRight,
  chevronLeft: ChevronLeft,
  chevronDown: ChevronDown,
  arrowUpRight: ArrowUpRight,
  external: ExternalLink,
  upload: Upload,
  download: Download,
  share: Share2,
  copy: Copy,
  edit: Pencil,
  trash: Trash,
  send: Send,
  attach: Paperclip,
  camera: Camera,
  image: Image,
  scan: ScanLine,
  eye: Eye,
  eyeOff: EyeOff,
  zoomIn: ZoomIn,
  zoomOut: ZoomOut,
  refresh: RefreshCw,
  reset: RotateCcw,
  more: Ellipsis,
  logout: LogOut,
  bolt: Zap,
  checklist: ListChecks,

  /* people and places */
  phone: Phone,
  mail: Mail,
  chat: MessageCircle,
  support: Headset,
  help: CircleQuestionMark,
  pin: MapPin,
  store: Store,
  shop: ShoppingBag,
  megaphone: Megaphone,
  globe: Globe,
  briefcase: Briefcase,
  book: BookOpen,
  heart: Heart,
  star: Star,
  inbox: Inbox,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof MAP;

export function Icon({
  name,
  size = 20,
  color,
  active,
  strokeWidth,
}: {
  name: IconName;
  size?: number;
  color?: string;
  /** Selected: gold, a touch heavier. */
  active?: boolean;
  strokeWidth?: number;
}) {
  const Glyph = MAP[name];
  return (
    <Glyph
      size={size}
      color={color ?? (active ? C.gold : C.textDim)}
      strokeWidth={strokeWidth ?? (active ? 1.9 : 1.6)}
      /* See the note in the old set: on web, an absolutely positioned gradient
         sibling paints over a non-positioned <svg>. */
      style={{ position: "relative" }}
    />
  );
}
