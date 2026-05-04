import { prisma } from '@/lib/prisma';
import { SITE_CONTENT_KEYS } from '@/lib/site-content-keys';
import {
  type AdmissionFeeItem,
  getDefaultPublicSiteContent,
  type CoreValueItem,
  type HeroSlide,
  type PublicSiteContent,
} from '@/lib/site-content-defaults';

function isCoreValueItems(v: unknown): v is CoreValueItem[] {
  return (
    Array.isArray(v) &&
    v.length > 0 &&
    v.every(
      (x) =>
        x &&
        typeof x === 'object' &&
        typeof (x as CoreValueItem).title === 'string' &&
        typeof (x as CoreValueItem).description === 'string',
    )
  );
}

function isHeroSlides(v: unknown): v is HeroSlide[] {
  return (
    Array.isArray(v) &&
    v.length > 0 &&
    v.every(
      (s) =>
        s &&
        typeof s === 'object' &&
        typeof (s as HeroSlide).title === 'string' &&
        typeof (s as HeroSlide).subtitle === 'string' &&
        typeof (s as HeroSlide).image === 'string',
    )
  );
}

function isAdmissionFees(v: unknown): v is AdmissionFeeItem[] {
  return (
    Array.isArray(v) &&
    v.every(
      (f) =>
        f &&
        typeof f === 'object' &&
        typeof (f as AdmissionFeeItem).level === 'string' &&
        typeof (f as AdmissionFeeItem).amount === 'string',
    )
  );
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((s) => typeof s === 'string');
}

export async function fetchMergedPublicSiteContent(): Promise<PublicSiteContent> {
  const out = getDefaultPublicSiteContent();
  const keys = Object.values(SITE_CONTENT_KEYS) as string[];
  const rows = await prisma.siteContentBlock.findMany({
    where: { key: { in: keys } },
  });

  for (const row of rows) {
    const p = row.payload;
    if (!p || typeof p !== 'object' || Array.isArray(p)) continue;

    if (row.key === SITE_CONTENT_KEYS.hero) {
      const slides = (p as { slides?: unknown }).slides;
      if (isHeroSlides(slides)) {
        out[SITE_CONTENT_KEYS.hero] = { slides };
      }
    } else if (row.key === SITE_CONTENT_KEYS.principal) {
      out[SITE_CONTENT_KEYS.principal] = {
        ...out[SITE_CONTENT_KEYS.principal],
        ...(p as Record<string, unknown>),
      } as PublicSiteContent[typeof SITE_CONTENT_KEYS.principal];
    } else if (row.key === SITE_CONTENT_KEYS.about) {
      out[SITE_CONTENT_KEYS.about] = {
        ...out[SITE_CONTENT_KEYS.about],
        ...(p as Record<string, unknown>),
      } as PublicSiteContent[typeof SITE_CONTENT_KEYS.about];
    } else if (row.key === SITE_CONTENT_KEYS.contact) {
      out[SITE_CONTENT_KEYS.contact] = {
        ...out[SITE_CONTENT_KEYS.contact],
        ...(p as Record<string, unknown>),
      } as PublicSiteContent[typeof SITE_CONTENT_KEYS.contact];
    } else if (row.key === SITE_CONTENT_KEYS.coreValues) {
      const patch = p as { sectionTitle?: string; items?: unknown };
      const items = patch.items;
      if (isCoreValueItems(items)) {
        out[SITE_CONTENT_KEYS.coreValues] = {
          sectionTitle: typeof patch.sectionTitle === 'string' ? patch.sectionTitle : out[SITE_CONTENT_KEYS.coreValues].sectionTitle,
          items,
        };
      }
    } else if (row.key === SITE_CONTENT_KEYS.admissions) {
      const patch = p as {
        fees?: unknown;
        feesNote?: unknown;
        importantDates?: unknown;
        admissionsOffice?: unknown;
      };
      out[SITE_CONTENT_KEYS.admissions] = {
        fees: isAdmissionFees(patch.fees) ? patch.fees : out[SITE_CONTENT_KEYS.admissions].fees,
        feesNote: typeof patch.feesNote === 'string' ? patch.feesNote : out[SITE_CONTENT_KEYS.admissions].feesNote,
        importantDates: isStringArray(patch.importantDates)
          ? patch.importantDates
          : out[SITE_CONTENT_KEYS.admissions].importantDates,
        admissionsOffice: isStringArray(patch.admissionsOffice)
          ? patch.admissionsOffice
          : out[SITE_CONTENT_KEYS.admissions].admissionsOffice,
      };
    }
  }

  return out;
}
