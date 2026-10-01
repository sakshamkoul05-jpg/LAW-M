import type { IconName } from "@/icons/Icon";

/**
 * The promotional flyers, carried over from lawfic.pro.
 *
 * Same headlines, same calls to action, same photographs — the artwork is
 * served from the live site rather than bundled, so a flyer the marketing team
 * swaps on the website changes in the app without a release. That is the right
 * trade for promotional art: it goes stale faster than the app ships.
 *
 * Every claim here already appears on the website. Nothing has been written for
 * the app, because a promise that exists only in the app is a promise nobody on
 * the team has agreed to keep.
 */

export type Flyer = {
  id: string;
  /** Small uppercase line above the headline. */
  kicker: string;
  title: string;
  cta: string;
  /** Where it goes inside the app. Null where the app has no such screen yet. */
  slug: string | null;
  photo: string;
  alt: string;
  icon: IconName;
  /** Two colours pulled from the photograph, for the gradient scrim. */
  tint: [string, string];
  /** A screen to open instead of the service page (membership, jobs). */
  href?: string;
};

const CDN = "https://lawfic.pro";

export const flyers: Flyer[] = [
  {
    id: "udyam",
    kicker: "Start a business",
    title: "Udyam registration, done properly",
    cta: "Register your MSME",
    slug: "msme-udyam",
    photo: `${CDN}/banners/udyam.webp`,
    alt: "A small-business owner standing in her workshop, arms folded",
    icon: "business",
    tint: ["#3A2A18", "#0B0D12"],
  },
  {
    id: "gst",
    kicker: "Tax and filings",
    title: "A GSTIN in your name in 7–10 days",
    cta: "Start GST registration",
    slug: "gst",
    photo: `${CDN}/banners/gst.webp`,
    alt: "An accountant reviewing printed invoices at a desk",
    icon: "tax",
    tint: ["#1E2A33", "#0B0D12"],
  },
  {
    id: "identity",
    kicker: "Identity",
    title: "PAN, TAN and DSC without the guesswork",
    cta: "See identity services",
    slug: "pan",
    photo: `${CDN}/banners/identity.webp`,
    alt: "Identity documents laid out on a desk",
    icon: "identity",
    tint: ["#2B2433", "#0B0D12"],
  },
  {
    id: "trademark",
    kicker: "Your brand",
    title: "Your name, protected in the right classes",
    cta: "Protect your brand",
    slug: "trademark",
    photo: `${CDN}/banners/trademark.webp`,
    alt: "A designer reviewing brand marks on a studio wall",
    icon: "ip",
    tint: ["#33241F", "#0B0D12"],
  },
  {
    id: "food",
    kicker: "Licences",
    title: "The FSSAI licence your kitchen needs",
    cta: "Get an FSSAI licence",
    slug: "fssai",
    photo: `${CDN}/banners/food.webp`,
    alt: "A commercial kitchen mid-service",
    icon: "licence",
    tint: ["#33281A", "#0B0D12"],
  },
  {
    id: "income-tax",
    kicker: "Tax and filings",
    title: "Your return, filed by someone who reads it",
    cta: "File your return",
    slug: "itr-filing",
    photo: `${CDN}/banners/income-tax.webp`,
    alt: "Papers and a laptop at the end of a filing day",
    icon: "tax",
    tint: ["#232B35", "#0B0D12"],
  },
  {
    id: "incorporation",
    kicker: "Start a business",
    title: "A private limited company, filed properly",
    cta: "Register a company",
    slug: "private-limited",
    photo: `${CDN}/banners/incorporation.webp`,
    alt: "Two founders at a table with incorporation paperwork",
    icon: "business",
    tint: ["#262B35", "#0B0D12"],
  },
  {
    id: "membership",
    kicker: "Membership",
    title: "Ten percent off every filing",
    cta: "See what it costs",
    slug: null,
    href: "/membership",
    photo: `${CDN}/banners/membership.webp`,
    alt: "A shopkeeper handing a wrapped package to a customer across a counter",
    icon: "crown",
    tint: ["#33281A", "#0B0D12"],
  },
  {
    id: "jobs",
    kicker: "Jobs",
    title: "Openings matched to your city and trade",
    cta: "Browse jobs",
    slug: null,
    href: "https://lawfic.pro/jobs",
    photo: `${CDN}/banners/jobs.webp`,
    alt: "A job candidate shaking hands with an interviewer across a desk",
    icon: "briefcase",
    tint: ["#1E2A33", "#0B0D12"],
  },
  {
    id: "agreement",
    kicker: "Agreements",
    title: "A rent agreement that would hold up",
    cta: "Draft an agreement",
    slug: "rent-agreement",
    photo: `${CDN}/banners/agreement.webp`,
    alt: "A signed agreement beside a stamp",
    icon: "agreement",
    tint: ["#1E2D33", "#0B0D12"],
  },
  {
    id: "passport",
    kicker: "Travel",
    title: "Passport, without the second appointment",
    cta: "Start a passport application",
    slug: "passport-application",
    photo: `${CDN}/banners/passport.webp`,
    alt: "A family walking through an airport departure hall with luggage",
    icon: "globe",
    tint: ["#331E1B", "#0B0D12"],
  },
];
