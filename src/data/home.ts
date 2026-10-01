import type { IconName } from "@/icons/Icon";

/**
 * The home page's content, carried over from lawfic.pro's homepage word for
 * word: the running promises, the search headlines, the quick actions, the
 * coupon tickets, the five "for you" tabs, why LAWFIC, and the top 21.
 *
 * Keep it in step with the website (lib/announcements.ts, lib/home-offers.ts,
 * components/home/*, lib/blueprint.ts). Nothing here is written for the app
 * alone — a promise that exists only in the app is one nobody agreed to keep.
 */

const WEB = "https://lawfic.pro";

/** Where a home item goes: a screen in the app, or a page on lawfic.pro. */
export type Dest = { app: string } | { web: string };

/* ── the running strip ───────────────────────────────────────────────────── */

export const PROMISES: { icon: IconName; text: string }[] = [
  { icon: "globe", text: "Pan India Service" },
  { icon: "support", text: "24*7 Customer Service" },
  { icon: "rupee", text: "Easy, Fast & Reasonable Price" },
  { icon: "refresh", text: "Guaranteed Money Back" },
  { icon: "briefcase", text: "21000+ Professional Experts*" },
  { icon: "store", text: "1000+ Connecting Stores*" },
  { icon: "services", text: "51000+ Services*" },
  { icon: "shield", text: "100 % Safe & Secure Data" },
  { icon: "vault", text: "Your All Information In One Place" },
  { icon: "chart", text: "Attractive Dashboard" },
  { icon: "agreement", text: "Partner With Us & Fixed Earn" },
];

/* ── the search band ─────────────────────────────────────────────────────── */

export const TAGLINES = [
  "Search Anything You Need",
  "Every Legal Document, One Search",
  "All Admissions, One Search",
  "Your Complete Startup Resource, One Search",
  "Complete Branding Guidance, One Search",
  "Investment Ideas That Work, One Search",
  "Your Secured Future, One Step Away",
];

export const SEARCH_PROMPT = "Anything you think you want — search 51000+ services, 21000+ experts & more";

/* ── the quick-icon bar ──────────────────────────────────────────────────── */

export const QUICK: { icon: IconName; label: string; to: Dest }[] = [
  { icon: "agreement", label: "Partnership", to: { web: `${WEB}/partner` } },
  { icon: "crown", label: "Membership", to: { app: "/membership" } },
  { icon: "payroll", label: "My Network", to: { web: `${WEB}/social` } },
  { icon: "percent", label: "Best Offer", to: { app: "#offers" } },
  { icon: "gift", label: "Gift & Coupon", to: { web: `${WEB}/gift` } },
  { icon: "megaphone", label: "My Ad", to: { web: `${WEB}/your-ad` } },
  { icon: "heart", label: "Aakhri Umeed", to: { web: `${WEB}/aakhri-umeed` } },
  { icon: "card", label: "Pay Later", to: { app: "/wallet" } },
  { icon: "wallet", label: "Wallet", to: { app: "/wallet" } },
  { icon: "trend", label: "Investment", to: { web: `${WEB}/investment` } },
  { icon: "support", label: "Instant Help", to: { app: "/support" } },
  { icon: "verified", label: "Lawfic Expert", to: { app: "/ai" } },
  { icon: "chat", label: "Suggestion", to: { app: "/support" } },
  { icon: "store", label: "Lawfic Store", to: { web: `${WEB}/our-store` } },
  { icon: "heart", label: "Favourite", to: { app: "/wishlist" } },
  { icon: "shop", label: "Shopping Bag", to: { web: `${WEB}/cart` } },
];

/* ── coupon tickets ──────────────────────────────────────────────────────── */

/**
 * The client's coupons. SHOWN BUT NOT YET HONOURED: no checkout in the app or
 * on the website applies these codes or pays these cashbacks yet. The switch
 * is shared in meaning with OFFERS_LIVE in lawfic.pro's lib/home-offers.ts —
 * turn both off together, or wire the codes into checkout first.
 */
export const OFFERS_LIVE = true;

export type Ticket = { id: string; kicker: string; headline: string; line: string; code?: string; fine: string; tone: "gold" | "night" | "blue" | "plum" };

export const TICKETS: Ticket[] = [
  { id: "app100", kicker: "App exclusive", headline: "₹100 cashback", line: "Download the LAWFIC app and get ₹100 in your wallet.", fine: "For new users", tone: "gold" },
  { id: "wel500", kicker: "For new users", headline: "Flat ₹500 cashback", line: "Guaranteed, on your first purchase.", code: "LAWWEL500", fine: "First purchase only", tone: "night" },
  { id: "wal20", kicker: "Wallet recharge", headline: "Flat 20% off", line: "When you add money to your LAWFIC wallet.", code: "LAWWAL20", fine: "Instant wallet credit", tone: "blue" },
  { id: "ref50", kicker: "Refer a friend", headline: "Flat ₹5000 referral cashback", line: "When the people you refer file with LAWFIC.", code: "LAWREF50NEW", fine: "New users · first purchase", tone: "gold" },
  { id: "reg30", kicker: "Document registration", headline: "Flat 30% off", line: "Up to ₹500 off the registration of any document.", code: "LAREG30", fine: "Valid for all users", tone: "plum" },
];

export const FIRST_PURCHASE = { headline: "FLAT ₹300 OFF", line: "On your 1st purchase via the LAWFIC app" };

/* ── welcome: five tabs × five cards, and the wallet tiers ───────────────── */

export type ForYouCard = { label: string; title: string; blurb: string; slug: string; live?: boolean; img: string };
export type ForYouTab = { id: string; label: string; icon: IconName; color: string; cards: ForYouCard[] };

const IMG = (n: string) => `${WEB}/banners/${n}.webp`;

export const FOR_YOU: ForYouTab[] = [
  {
    id: "curated",
    label: "Curated for You",
    icon: "panda",
    color: "#2E75B6",
    cards: [
      { label: "Tax & filings", title: "GST Registration", blurb: "A GSTIN in your name in 7–10 days.", slug: "gst", live: true, img: IMG("gst") },
      { label: "Business", title: "Udyam / MSME", blurb: "Collateral-free loans and tender access.", slug: "msme-udyam", live: true, img: IMG("udyam") },
      { label: "Identity", title: "PAN Services", blurb: "New cards, corrections and Aadhaar linking.", slug: "pan", live: true, img: IMG("identity") },
      { label: "Identity", title: "Aadhaar Services", blurb: "Corrections, updates and appointments.", slug: "aadhaar", live: true, img: IMG("passport") },
      { label: "Membership", title: "Save on every filing", blurb: "Plans from ₹99 a month.", slug: "@membership", img: IMG("membership") },
    ],
  },
  {
    id: "match",
    label: "Your Perfect Match",
    icon: "checklist",
    color: "#F37021",
    cards: [
      { label: "Tax & filings", title: "Income Tax Return", blurb: "Filed by someone who reads it.", slug: "itr-filing", img: IMG("income-tax") },
      { label: "Startup", title: "Private Limited Company", blurb: "Incorporation, DIN, MOA and AOA.", slug: "private-limited", img: IMG("incorporation") },
      { label: "Branding", title: "Trademark Registration", blurb: "Your name, protected in the right classes.", slug: "trademark", img: IMG("trademark") },
      { label: "Licences", title: "FSSAI Food Licence", blurb: "Basic, State and Central registration.", slug: "fssai", img: IMG("food") },
      { label: "Jobs", title: "Openings matched to you", blurb: "By your city and your trade.", slug: "@jobs", img: IMG("jobs") },
    ],
  },
  {
    id: "expert",
    label: "Trusted Picks",
    icon: "verified",
    color: "#0FA3B1",
    cards: [
      { label: "Legal", title: "Rent Agreement", blurb: "Drafted, stamped and registered.", slug: "rent-agreement", img: IMG("agreement") },
      { label: "Travel", title: "Passport Application", blurb: "Form, documents and appointment.", slug: "passport-application", img: IMG("passport") },
      { label: "Tax & filings", title: "GST Registration", blurb: "The address-proof query answered in time.", slug: "gst", live: true, img: IMG("gst") },
      { label: "Business", title: "Udyam Registration", blurb: "Classified correctly, filed the same day.", slug: "msme-udyam", live: true, img: IMG("udyam") },
      { label: "Legal", title: "Affidavit", blurb: "Name change, income and residence.", slug: "affidavit", img: IMG("agreement") },
    ],
  },
  {
    id: "secure",
    label: "Secure Life Offer",
    icon: "shield",
    color: "#2B4FB0",
    cards: [
      { label: "Legal", title: "Will Preparation", blurb: "A simple, valid will that says what you meant.", slug: "will", img: IMG("agreement") },
      { label: "Legal", title: "Power of Attorney", blurb: "General and special authority, notarised.", slug: "power-of-attorney", img: IMG("agreement") },
      { label: "Certificates", title: "Legal Heir Certificate", blurb: "Succession proof to transfer assets.", slug: "legal-heir", img: IMG("identity") },
      { label: "Certificates", title: "Birth Certificate", blurb: "Proof of identity, age and parentage.", slug: "birth-certificate", img: IMG("identity") },
      { label: "Certificates", title: "Marriage Certificate", blurb: "Court or registrar, for official use.", slug: "marriage-certificate", img: IMG("passport") },
    ],
  },
  {
    id: "must",
    label: "Must-Haves",
    icon: "bolt",
    color: "#4B9BE8",
    cards: [
      { label: "Identity", title: "PAN Card Application", blurb: "A new PAN, issued as an e-PAN.", slug: "pan", live: true, img: IMG("identity") },
      { label: "Identity", title: "Aadhaar Card Services", blurb: "Prepared so the visit works first time.", slug: "aadhaar", live: true, img: IMG("passport") },
      { label: "Certificates", title: "Income Certificate", blurb: "For scholarships and welfare schemes.", slug: "income-certificate", img: IMG("income-tax") },
      { label: "Certificates", title: "Domicile Certificate", blurb: "State domicile for education and quotas.", slug: "domicile-certificate", img: IMG("identity") },
      { label: "Legal", title: "Rent Agreement", blurb: "Registered where it needs to be.", slug: "rent-agreement", img: IMG("agreement") },
    ],
  },
];

/** Shown, like the coupons, behind OFFERS_LIVE: the bonus is not yet credited. */
export const WALLET_TIERS: { pay: number; get: number; best?: boolean }[] = [
  { pay: 1000, get: 1100 },
  { pay: 2000, get: 2500 },
  { pay: 5000, get: 6500 },
  { pay: 10000, get: 12500, best: true },
];

/* ── why LAWFIC ──────────────────────────────────────────────────────────── */

export const WHY: { icon: IconName; title: string; body: string; blue?: boolean }[] = [
  { icon: "globe", title: "Pan India Quality Service With Love", body: "A wide range of document services delivered by highly qualified experts — committed to quality, trust and transparency in everything we do." },
  { icon: "agreement", title: "Support When You Need It", body: "Every document is prepared with precision — no missing clauses, no formatting errors, no guesswork. We stand behind our work." },
  { icon: "lock", title: "Fully Secure, Protected & Confidential", body: "Your documents and personal information are protected with high-standard encryption. Your privacy is a priority, not a formality." },
  { icon: "rupee", title: "Honest, Transparent Pricing", body: "No hidden fees, no surprise charges. What you see is what you pay." },
  { icon: "bolt", title: "Fast Turnaround & Delivered Documents", body: "Your documents ready on time, not given a longer date — you are never stuck waiting." },
  { icon: "refresh", title: "Always Current & Compliant", body: "Laws and formats change — our templates and processes are reviewed regularly, so you never use an outdated form." },
  { icon: "clock", title: "Accurate, Every Time By Expert", body: "Prepared with precision by skilful experts — no missing clauses, no formatting errors, all the time.", blue: true },
];

/* ── top twenty-one ──────────────────────────────────────────────────────── */

/** The website's TRENDING list, mapped to the app's slugs. */
export const TRENDING: { rank: number; label: string; section: string; slug: string; live?: boolean }[] = [
  { rank: 1, label: "GST Registration", section: "Tax & filings", slug: "gst", live: true },
  { rank: 2, label: "Aadhaar Card Services", section: "Identity", slug: "aadhaar", live: true },
  { rank: 3, label: "PAN Card Application", section: "Identity", slug: "pan", live: true },
  { rank: 4, label: "Udyam / MSME Registration", section: "Business", slug: "msme-udyam", live: true },
  { rank: 5, label: "Income Tax Return", section: "Tax & filings", slug: "itr-filing" },
  { rank: 6, label: "Trademark Registration", section: "Branding", slug: "trademark" },
  { rank: 7, label: "Indian Passport", section: "Travel", slug: "passport-application" },
  { rank: 8, label: "Rent Agreement", section: "Legal", slug: "rent-agreement" },
  { rank: 9, label: "FSSAI Registration", section: "Business", slug: "fssai" },
  { rank: 10, label: "Birth Certificate", section: "Certificates", slug: "birth-certificate" },
  { rank: 11, label: "Private Limited Company", section: "Startup", slug: "private-limited" },
  { rank: 12, label: "Affidavit Preparation", section: "Legal", slug: "affidavit" },
  { rank: 13, label: "Income Certificate", section: "Certificates", slug: "income-certificate" },
  { rank: 14, label: "Domicile Certificate", section: "Certificates", slug: "domicile-certificate" },
  { rank: 15, label: "Marriage Certificate", section: "Certificates", slug: "marriage-certificate" },
  { rank: 16, label: "Caste Certificate", section: "Certificates", slug: "caste-certificate" },
  { rank: 17, label: "Will Preparation", section: "Legal", slug: "will" },
  { rank: 18, label: "Power of Attorney", section: "Legal", slug: "power-of-attorney" },
  { rank: 19, label: "Name Change Affidavit", section: "Legal", slug: "name-change-affidavit" },
  { rank: 20, label: "Legal Heir Certificate", section: "Certificates", slug: "legal-heir" },
  { rank: 21, label: "EWS Certificate", section: "Certificates", slug: "ews-certificate" },
];

/** A slug's screen: the full page for a live service, the request form otherwise. */
export function destFor(slug: string, live?: boolean): Dest {
  if (slug === "@membership") return { app: "/membership" };
  if (slug === "@jobs") return { web: `${WEB}/jobs` };
  return { app: live ? `/service/${slug}` : `/request/${slug}` };
}
