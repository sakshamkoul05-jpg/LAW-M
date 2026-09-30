import type { IconName } from "@/icons/Icon";
import { allServices, categories as siteCategories, searchServices, type Category as SiteCategory } from "@/lawfic/catalogue";
import { services as liveServices, getService, type Service as LiveService } from "@/lawfic/services";
import { documents, type DocGroup, type DocumentItem } from "@/lawfic/documents";
import { getIntake } from "@/lawfic/intake";

/**
 * The catalogue as the app reads it.
 *
 * Nothing here is a second copy of the website's content. The categories,
 * services, write-ups, fees, documents and intake questions all come from
 * src/lawfic/, which is the website's own lib/ mirrored verbatim. This file
 * only answers the questions a screen asks: what is this slug called, what does
 * it cost, which icon goes with it, can it be requested.
 */

export type Category = SiteCategory & { icon: IconName };
export const categories = siteCategories as Category[];

export { allServices, liveServices, getService, searchServices, documents };
export type { LiveService, DocGroup, DocumentItem };

export const DOC_GROUPS: { id: DocGroup; icon: IconName; blurb: string }[] = [
  { id: "Identity & PAN", icon: "identity", blurb: "PAN, Aadhaar and passports" },
  { id: "Government Certificates", icon: "government", blurb: "Birth, income, caste, domicile and more" },
  { id: "Legal & Agreements", icon: "agreement", blurb: "Affidavits, agreements, wills and POA" },
  { id: "Business & Tax", icon: "business", blurb: "GST, Udyam, FSSAI and trademarks" },
];

/** Every name a slug can have, across the service catalogue and the document list. */
export function serviceName(slug: string): string {
  return (
    getService(slug)?.name ??
    allServices.find((s) => s.slug === slug)?.name ??
    documents.find((d) => d.slug === slug)?.label ??
    slug
  );
}

export function categoryOf(slug: string): Category | undefined {
  const s = allServices.find((x) => x.slug === slug);
  return s ? categories.find((c) => c.id === s.categoryId) : undefined;
}

export function iconFor(slug: string): IconName {
  const c = categoryOf(slug);
  if (c) return c.icon;
  const d = documents.find((x) => x.slug === slug);
  return DOC_GROUPS.find((g) => g.id === d?.group)?.icon ?? "document";
}

/** "₹1,499" → 149900. Null when the website publishes no number. */
function parseRupees(s: string): number | null {
  const m = s.match(/₹\s?([\d,]+)/);
  return m ? Number(m[1]!.replace(/,/g, "")) * 100 : null;
}

/**
 * LAWFIC's own fee for a service, in paise — only where the website publishes
 * one. Four services do. Everything else is priced by quote, and the app says
 * "Quoted" rather than inventing a number somebody could hold LAWFIC to.
 */
export function feePaise(slug: string): number | null {
  const s = getService(slug);
  return s ? parseRupees(s.fee.professional) : null;
}

export function turnaround(slug: string): string | null {
  return getService(slug)?.turnaround ?? null;
}

export function isLive(slug: string): boolean {
  return !!getService(slug);
}

/** Slugs with a dedicated interactive application flow in the app. */
export const APPLY_FLOWS: Record<string, string> = {
  "msme-udyam": "/apply/udyam",
  aadhaar: "/apply/aadhaar",
};

/**
 * Anything in the catalogue or the document list can be REQUESTED — the quote
 * step is where LAWFIC decides what it can do (lib/catalogue.ts,
 * isRequestableSlug). A live page is not a precondition for asking.
 */
export function requestHref(slug: string): string {
  return APPLY_FLOWS[slug] ?? `/request/${slug}`;
}

export { getIntake };
