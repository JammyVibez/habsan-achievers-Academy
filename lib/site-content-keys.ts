/** DB `SiteContentBlock.key` values */
export const SITE_CONTENT_KEYS = {
  hero: 'hero_carousel',
  principal: 'principal_message',
  about: 'about_us',
  contact: 'contact_info',
  coreValues: 'core_values',
  admissions: 'admissions_info',
  idCard: 'id_card_design',
} as const;

export type SiteContentKey = (typeof SITE_CONTENT_KEYS)[keyof typeof SITE_CONTENT_KEYS];
