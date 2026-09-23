import type { IconName } from "@/icons/Icon";

/**
 * The service catalogue: 7 categories, 39 services.
 *
 * Copied from lib/catalogue.ts on lawfic.pro so the app and the website offer
 * the same things under the same names. It is a copy and not a fetch because
 * this is the front end only — when the API lands this file becomes the
 * fallback the app ships with, not the source of truth.
 *
 * TWO RULES THIS FILE KEEPS
 *
 *   1. `status` is real. A "soon" service has no page on the website and must
 *      not become a working flow here just because a mock is easy to draw. It
 *      renders as a label with a chip and does not navigate.
 *   2. `feePaise` is present only where LAWFIC actually publishes a fee. Four
 *      services do. The rest are null and the UI says "Price on request",
 *      rather than showing a plausible number somebody might hold us to.
 */

export type ServiceStatus = "live" | "soon";

export type Service = {
  slug: string;
  name: string;
  blurb: string;
  status: ServiceStatus;
  /** Whole paise. Null where no fee is published. */
  feePaise: number | null;
  turnaround: string | null;
  categoryId: string;
};

export type Category = {
  id: string;
  name: string;
  summary: string;
  icon: IconName;
  services: Service[];
};

export const categories: Category[] = [
  {
    id: "identity",
    name: "Identity & KYC",
    summary:
      "The documents everything else is built on. Get these right and the rest of the paperwork stops bouncing.",
    icon: "identity",
    services: [
      {
        slug: "aadhaar",
        name: "Aadhaar Services",
        blurb: "Corrections, updates and appointments",
        status: "live",
        feePaise: 19900,
        turnaround: "2-5 working days",
        categoryId: "identity",
      },
      {
        slug: "pan",
        name: "PAN Services",
        blurb: "New cards, corrections and Aadhaar linking",
        status: "live",
        feePaise: 29900,
        turnaround: "3-7 working days",
        categoryId: "identity",
      },
      {
        slug: "tan",
        name: "TAN Registration",
        blurb: "For anyone required to deduct TDS",
        status: "soon",
        feePaise: null,
        turnaround: null,
        categoryId: "identity",
      },
      {
        slug: "digital-signature",
        name: "Digital Signature (DSC)",
        blurb: "Class 3 tokens for tenders and filings",
        status: "soon",
        feePaise: null,
        turnaround: null,
        categoryId: "identity",
      },
      {
        slug: "voter-id",
        name: "Voter ID Assistance",
        blurb: "New enrolment, corrections and transfers",
        status: "soon",
        feePaise: null,
        turnaround: null,
        categoryId: "identity",
      },
      {
        slug: "passport",
        name: "Passport Assistance",
        blurb: "Form filling, appointments and police verification",
        status: "soon",
        feePaise: null,
        turnaround: null,
        categoryId: "identity",
      },
    ],
  },
  {
    id: "business",
    name: "Business Registration",
    summary:
      "Choosing the wrong structure costs more to unwind than it does to set up. We start with which one you actually need.",
    icon: "business",
    services: [
      {
        slug: "msme-udyam",
        name: "MSME Udyam Registration",
        blurb: "Collateral-free loans and tender access",
        status: "live",
        feePaise: 49900,
        turnaround: "Same day",
        categoryId: "business",
      },
      {
        slug: "private-limited",
        name: "Private Limited Company",
        blurb: "Incorporation, DIN, MOA and AOA",
        status: "soon",
        feePaise: null,
        turnaround: null,
        categoryId: "business",
      },
      {
        slug: "llp",
        name: "LLP Registration",
        blurb: "Limited liability without company compliance",
        status: "soon",
        feePaise: null,
        turnaround: null,
        categoryId: "business",
      },
      {
        slug: "opc",
        name: "One Person Company",
        blurb: "A company structure for a single founder",
        status: "soon",
        feePaise: null,
        turnaround: null,
        categoryId: "business",
      },
      {
        slug: "partnership",
        name: "Partnership Firm",
        blurb: "Deed drafting and registration",
        status: "soon",
        feePaise: null,
        turnaround: null,
        categoryId: "business",
      },
      {
        slug: "proprietorship",
        name: "Sole Proprietorship",
        blurb: "The lightest way to start trading",
        status: "soon",
        feePaise: null,
        turnaround: null,
        categoryId: "business",
      },
      {
        slug: "roc-filings",
        name: "ROC Annual Filings",
        blurb: "AOC-4, MGT-7 and director KYC",
        status: "soon",
        feePaise: null,
        turnaround: null,
        categoryId: "business",
      },
    ],
  },
  {
    id: "tax",
    name: "Tax & Filings",
    summary:
      "Registration is the easy half. Staying compliant month after month is where most businesses come unstuck.",
    icon: "tax",
    services: [
      {
        slug: "gst",
        name: "GST Registration",
        blurb: "A GSTIN in your name, start to finish",
        status: "live",
        feePaise: 149900,
        turnaround: "7-12 working days",
        categoryId: "tax",
      },
      {
        slug: "gst-returns",
        name: "GST Returns",
        blurb: "GSTR-1 and 3B, filed monthly",
        status: "soon",
        feePaise: null,
        turnaround: null,
        categoryId: "tax",
      },
      {
        slug: "itr-filing",
        name: "Income Tax Returns",
        blurb: "Salaried, business and presumptive",
        status: "soon",
        feePaise: null,
        turnaround: null,
        categoryId: "tax",
      },
      {
        slug: "tds-returns",
        name: "TDS Returns",
        blurb: "Quarterly filing and Form 16",
        status: "soon",
        feePaise: null,
        turnaround: null,
        categoryId: "tax",
      },
      {
        slug: "professional-tax",
        name: "Professional Tax",
        blurb: "State registration and returns",
        status: "soon",
        feePaise: null,
        turnaround: null,
        categoryId: "tax",
      },
      {
        slug: "gst-cancellation",
        name: "GST Cancellation",
        blurb: "Closing a registration cleanly",
        status: "soon",
        feePaise: null,
        turnaround: null,
        categoryId: "tax",
      },
    ],
  },
  {
    id: "licence",
    name: "Licences & Permits",
    summary:
      "Trading without the right licence is the kind of problem that arrives with an inspector rather than a letter.",
    icon: "licence",
    services: [
      {
        slug: "fssai",
        name: "FSSAI Food Licence",
        blurb: "Basic, State and Central registration",
        status: "soon",
        feePaise: null,
        turnaround: null,
        categoryId: "licence",
      },
      {
        slug: "trade-licence",
        name: "Trade Licence",
        blurb: "Municipal permission to operate",
        status: "soon",
        feePaise: null,
        turnaround: null,
        categoryId: "licence",
      },
      {
        slug: "shop-establishment",
        name: "Shop & Establishment",
        blurb: "The registration most landlords ask for",
        status: "soon",
        feePaise: null,
        turnaround: null,
        categoryId: "licence",
      },
      {
        slug: "iec",
        name: "Import Export Code",
        blurb: "Required before your first shipment",
        status: "soon",
        feePaise: null,
        turnaround: null,
        categoryId: "licence",
      },
      {
        slug: "drug-licence",
        name: "Drug Licence",
        blurb: "Retail and wholesale pharmacy",
        status: "soon",
        feePaise: null,
        turnaround: null,
        categoryId: "licence",
      },
      {
        slug: "iso-certification",
        name: "ISO Certification",
        blurb: "9001, 14001 and 22000",
        status: "soon",
        feePaise: null,
        turnaround: null,
        categoryId: "licence",
      },
    ],
  },
  {
    id: "ip",
    name: "Intellectual Property",
    summary:
      "A name you have not registered is a name someone else can register. Searching first costs a fraction of fighting later.",
    icon: "ip",
    services: [
      {
        slug: "trademark",
        name: "Trademark Registration",
        blurb: "Search, filing and class selection",
        status: "soon",
        feePaise: null,
        turnaround: null,
        categoryId: "ip",
      },
      {
        slug: "trademark-objection",
        name: "Trademark Objection Reply",
        blurb: "Responding to an examination report",
        status: "soon",
        feePaise: null,
        turnaround: null,
        categoryId: "ip",
      },
      {
        slug: "copyright",
        name: "Copyright Registration",
        blurb: "Software, artistic and literary work",
        status: "soon",
        feePaise: null,
        turnaround: null,
        categoryId: "ip",
      },
      {
        slug: "design-registration",
        name: "Design Registration",
        blurb: "Protecting how a product looks",
        status: "soon",
        feePaise: null,
        turnaround: null,
        categoryId: "ip",
      },
      {
        slug: "patent-search",
        name: "Patent Search",
        blurb: "Prior-art search before you file",
        status: "soon",
        feePaise: null,
        turnaround: null,
        categoryId: "ip",
      },
    ],
  },
  {
    id: "payroll",
    name: "Labour & Payroll",
    summary:
      "The thresholds creep up on you. Most businesses cross into PF and ESI without noticing until a notice arrives.",
    icon: "payroll",
    services: [
      {
        slug: "pf-registration",
        name: "PF Registration",
        blurb: "EPFO registration and monthly ECR",
        status: "soon",
        feePaise: null,
        turnaround: null,
        categoryId: "payroll",
      },
      {
        slug: "esi-registration",
        name: "ESI Registration",
        blurb: "ESIC registration and contributions",
        status: "soon",
        feePaise: null,
        turnaround: null,
        categoryId: "payroll",
      },
      {
        slug: "labour-licence",
        name: "Labour Licence",
        blurb: "Contract labour and migrant workers",
        status: "soon",
        feePaise: null,
        turnaround: null,
        categoryId: "payroll",
      },
      {
        slug: "payroll-management",
        name: "Payroll Management",
        blurb: "Salary processing, payslips and compliance",
        status: "soon",
        feePaise: null,
        turnaround: null,
        categoryId: "payroll",
      },
    ],
  },
  {
    id: "legal",
    name: "Legal Documents",
    summary:
      "Drafted properly, on the right stamp paper, and registered where registration is what makes it enforceable.",
    icon: "legal",
    services: [
      {
        slug: "rent-agreement",
        name: "Rent Agreement",
        blurb: "Drafted, stamped and registered",
        status: "soon",
        feePaise: null,
        turnaround: null,
        categoryId: "legal",
      },
      {
        slug: "affidavit",
        name: "Affidavit Drafting",
        blurb: "Name change, income, residence and more",
        status: "soon",
        feePaise: null,
        turnaround: null,
        categoryId: "legal",
      },
      {
        slug: "legal-notice",
        name: "Legal Notice",
        blurb: "Recovery, breach and cease-and-desist",
        status: "soon",
        feePaise: null,
        turnaround: null,
        categoryId: "legal",
      },
      {
        slug: "noc",
        name: "NOC Drafting",
        blurb: "Landlord, society and employer consents",
        status: "soon",
        feePaise: null,
        turnaround: null,
        categoryId: "legal",
      },
      {
        slug: "will-drafting",
        name: "Will Drafting",
        blurb: "Simple wills and registration",
        status: "soon",
        feePaise: null,
        turnaround: null,
        categoryId: "legal",
      },
    ],
  },
];

/** Every service, flat. Built once at module load — the list does not change. */
export const allServices: Service[] = categories.flatMap((c) => c.services);

export const liveServices = allServices.filter((s) => s.status === "live");

export function getService(slug: string): Service | undefined {
  return allServices.find((s) => s.slug === slug);
}

export function getCategory(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

/**
 * What Home shows as popular.
 *
 * Hand-picked, and labelled as such in the UI. There is no analytics feed
 * behind this app yet, and a "Trending" list backed by nothing is a fabricated
 * statistic with a chart next to it. When real numbers exist this becomes a
 * query; until then the screen says "Popular right now" and means "chosen".
 */
export const popularSlugs = [
  "msme-udyam",
  "gst",
  "pan",
  "fssai",
  "trademark",
  "itr-filing",
] as const;

export const popular = popularSlugs
  .map((s) => getService(s))
  .filter((s): s is Service => Boolean(s));
