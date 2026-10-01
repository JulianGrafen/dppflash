/** Shared SEO types used across branchen and loesungen data layers. */

export interface SeoMeta {
  /** Page title — max 60 characters for Google SERP */
  title: string;
  /** Meta description — max 155 characters for Google SERP */
  description: string;
  /** Absolute path for the canonical tag, e.g. "/branchen/textilindustrie-espr-verordnung-2027" */
  canonicalPath: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface RelatedLink {
  label: string;
  href: string;
}
