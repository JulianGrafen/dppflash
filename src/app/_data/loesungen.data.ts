/**
 * Static data for /loesungen/[slug] pages (Bottom of Funnel — direct searches).
 * Each entry targets users explicitly searching for DPP software, tools, and solutions.
 */

import type { RelatedLink, SeoMeta } from './seo.types';

export interface LoesungenPage {
  slug: string;
  h1: string;
  focusKeyword: string;
  meta: SeoMeta;
  /** Lead paragraph below <h1> — solution-focused, conversion-oriented */
  intro: string;
  /** Key product benefits rendered as a feature list */
  benefits: string[];
  offer: {
    price: string;
    priceCurrency: string;
    description: string;
  };
  /** Links to /branchen/* pages for topical authority and link juice */
  relatedBranchen: RelatedLink[];
  publishedAt: string;
  updatedAt: string;
}

export const LOESUNGEN_PAGES: LoesungenPage[] = [
  {
    slug: 'digitaler-produktpass-software-kmu',
    h1: 'Digitaler Produktpass Software für KMU – ESPR-konform in 5 Min.',
    focusKeyword: 'Digitaler Produktpass Software KMU',
    meta: {
      title: 'DPP Software für KMU – ESPR-konform in 5 Min.',
      description:
        'Digitaler Produktpass Software für KMU: ESPR-konform, KI-gestützt, 15 Jahre Hosting. In 5 Minuten zum rechtssicheren QR-Code.',
      canonicalPath: '/loesungen/digitaler-produktpass-software-kmu',
    },
    intro:
      'DPP-Flash ist die DPP-Software für kleine und mittlere Unternehmen. Ohne IT-Abteilung, ohne Excel: Laden Sie Ihre PDFs hoch und erhalten Sie in 5 Minuten einen rechtssicheren, ESPR-konformen Digitalen Produktpass mit QR-Code.',
    benefits: [
      'ESPR-konform und rechtssicher',
      'KI-Datenextraktion aus PDFs in Minuten',
      'DSGVO-konformer Datenschutz',
      '15 Jahre revisionssichere Archivierung',
      'Kein IT-Fachwissen erforderlich',
      'QR-Code sofort einsatzbereit',
    ],
    offer: {
      price: '0',
      priceCurrency: 'EUR',
      description: 'Kostenlose Pilotphase für KMU',
    },
    relatedBranchen: [
      { label: 'ESPR für Textilhersteller', href: '/branchen/textilindustrie-espr-verordnung-2027' },
      { label: 'LkSG & ESPR Nachweise', href: '/branchen/lieferkettengesetz-produktdaten-nachweise-kmu' },
      { label: 'ESPR-Bußgelder verstehen', href: '/branchen/espr-bussgeld-nicht-konformes-produkt' },
    ],
    publishedAt: '2026-04-05',
    updatedAt: '2026-04-05',
  },
  {
    slug: 'dpp-ki-datenextraktion-pdf',
    h1: 'KI-Datenextraktion für den Digitalen Produktpass aus PDFs',
    focusKeyword: 'DPP KI Datenextraktion PDF',
    meta: {
      title: 'DPP per KI aus PDF erstellen – Automatisch',
      description:
        'KI extrahiert automatisch alle DPP-Daten aus Ihren PDFs: valide nach GS1/JSON-LD, fertig in 5 Minuten. Kein manuelles Eintippen.',
      canonicalPath: '/loesungen/dpp-ki-datenextraktion-pdf',
    },
    intro:
      'Hunderte Lieferanten-PDFs manuell auswerten? DPP-Flash übernimmt das. Unsere KI liest alle relevanten Produktdaten automatisch aus und validiert sie gegen maschinenlesbare Standards – Sie bestätigen nur noch im kurzen Review.',
    benefits: [
      'Automatische Extraktion aus PDFs und Lieferscheinen',
      'Validierung gegen GS1 und JSON-LD',
      'Review in unter 5 Minuten',
      'Keine manuellen Dateneingaben',
      'Hohe Erkennungsgenauigkeit durch trainierte KI',
      'Sofort DPP-konformer Output',
    ],
    offer: {
      price: '0',
      priceCurrency: 'EUR',
      description: 'Kostenlose Pilotphase für KMU',
    },
    relatedBranchen: [
      { label: 'Elektronik ESPR Nachweispflichten', href: '/branchen/elektronik-lieferkette-nachweispflicht-espr' },
      { label: 'Produktdatenblätter automatisieren', href: '/branchen/produktdatenblatt-automatisieren-mittelstand' },
      { label: 'LkSG & ESPR Nachweise', href: '/branchen/lieferkettengesetz-produktdaten-nachweise-kmu' },
    ],
    publishedAt: '2026-04-05',
    updatedAt: '2026-04-05',
  },
  {
    slug: 'espr-compliance-tool-mittelstand',
    h1: 'ESPR Compliance Tool für den Mittelstand – kein IT-Aufwand',
    focusKeyword: 'ESPR Compliance Tool',
    meta: {
      title: 'ESPR Compliance Tool – ESPR-konform ohne IT',
      description:
        'ESPR Compliance Tool für den Mittelstand: rechtssicher, kein IT-Aufwand, 15 Jahre Langzeitarchivierung. DPP-Flash macht ESPR einfach.',
      canonicalPath: '/loesungen/espr-compliance-tool-mittelstand',
    },
    intro:
      'DPP-Flash ist das ESPR Compliance Tool, das speziell für den deutschen Mittelstand gebaut wurde: kein eigenes IT-Team, keine neue Infrastruktur, kein Fachwissen nötig. Direkt aus Ihren bestehenden Dokumenten zur vollständigen ESPR-Konformität.',
    benefits: [
      'Vollständige ESPR-Konformität ab Tag 1',
      'Keine eigene IT-Infrastruktur notwendig',
      'Direkt aus bestehenden Systemen nutzbar',
      'Made in Germany – DSGVO-konform',
      '15 Jahre gesetzeskonforme Archivierung',
      'Auditfeste Nachweise für Behörden',
    ],
    offer: {
      price: '0',
      priceCurrency: 'EUR',
      description: 'Kostenlose Pilotphase für KMU',
    },
    relatedBranchen: [
      { label: 'ESPR für Textilhersteller', href: '/branchen/textilindustrie-espr-verordnung-2027' },
      { label: 'Elektronik ESPR Nachweispflichten', href: '/branchen/elektronik-lieferkette-nachweispflicht-espr' },
      { label: 'ESPR-Bußgelder verstehen', href: '/branchen/espr-bussgeld-nicht-konformes-produkt' },
    ],
    publishedAt: '2026-04-05',
    updatedAt: '2026-04-05',
  },
  {
    slug: 'digitaler-produktpass-qr-code-generator',
    h1: 'Digitaler Produktpass QR-Code Generator – rechtssicher & gehostet',
    focusKeyword: 'Digitaler Produktpass QR Code Generator',
    meta: {
      title: 'Digitaler Produktpass QR-Code Generator',
      description:
        'Rechtssicherer Produktpass QR-Code in 5 Minuten: KI-gestützt, ESPR-konform, 15 Jahre gehostet. Für KMU aller Branchen.',
      canonicalPath: '/loesungen/digitaler-produktpass-qr-code-generator',
    },
    intro:
      'Mit DPP-Flash generieren Sie Ihren rechtssicheren Produktpass QR-Code in wenigen Minuten. Der Code verweist auf einen dauerhaft gehosteten, ESPR-konformen Datensatz – 15 Jahre lang jederzeit abrufbar und revisionssicher archiviert.',
    benefits: [
      'QR-Code sofort nach Dateneingabe generiert',
      'Verlinkung auf dauerhaft gehosteten DPP-Datensatz',
      '15 Jahre Langzeitarchivierung inklusive',
      'ESPR-konformes Datenformat',
      'Auf Produkt, Verpackung oder Begleitdokument anbringbar',
      'Maschinenlesbar nach GS1-Standard',
    ],
    offer: {
      price: '0',
      priceCurrency: 'EUR',
      description: 'Kostenlose Pilotphase für KMU',
    },
    relatedBranchen: [
      { label: 'EU-Batterieverordnung QR-Code-Pflicht', href: '/branchen/batterieverordnung-qr-code-pflicht' },
      { label: 'ESPR-Bußgelder verstehen', href: '/branchen/espr-bussgeld-nicht-konformes-produkt' },
    ],
    publishedAt: '2026-04-05',
    updatedAt: '2026-04-05',
  },
  {
    slug: 'digitaler-produktpass-erstellen-anleitung',
    h1: 'Digitalen Produktpass erstellen: Schritt-für-Schritt für KMU',
    focusKeyword: 'Digitaler Produktpass erstellen',
    meta: {
      title: 'Digitalen Produktpass erstellen – Anleitung KMU',
      description:
        'Schritt-für-Schritt: Digitalen Produktpass KMU-gerecht erstellen. KI-gestützt, ESPR-konform, ohne IT-Kenntnisse. In 5 Minuten fertig.',
      canonicalPath: '/loesungen/digitaler-produktpass-erstellen-anleitung',
    },
    intro:
      'Sie wissen nicht, wo Sie mit dem Digitalen Produktpass anfangen sollen? DPP-Flash führt Sie in drei Schritten sicher durch den gesamten Prozess – von der PDF bis zum druckfertigen QR-Code, der den ESPR-Anforderungen entspricht.',
    benefits: [
      'Geführter 3-Schritt-Prozess',
      'KI liest Produktdaten automatisch aus',
      'Kurzes Review-Schritt in unter 5 Minuten',
      'QR-Code sofort verfügbar',
      'Keine Vorkenntnisse erforderlich',
      'Für alle ESPR-relevanten Produktgruppen geeignet',
    ],
    offer: {
      price: '0',
      priceCurrency: 'EUR',
      description: 'Kostenlose Pilotphase für KMU',
    },
    relatedBranchen: [
      { label: 'ESPR für Textilhersteller', href: '/branchen/textilindustrie-espr-verordnung-2027' },
      { label: 'Produktdatenblätter automatisieren', href: '/branchen/produktdatenblatt-automatisieren-mittelstand' },
    ],
    publishedAt: '2026-04-05',
    updatedAt: '2026-04-05',
  },
  {
    slug: 'dpp-saas-revisionssichere-archivierung',
    h1: 'DPP SaaS mit 15 Jahre revisionssicherer Archivierung',
    focusKeyword: 'DPP SaaS revisionssicher',
    meta: {
      title: 'DPP SaaS: 15 J. revisionssichere Archivierung',
      description:
        'DPP SaaS mit 15-jähriger revisionssicherer Archivierung: ESPR-konform, GS1/JSON-LD validiert. Sicher für Betriebsprüfungen und Behörden.',
      canonicalPath: '/loesungen/dpp-saas-revisionssichere-archivierung',
    },
    intro:
      'Die ESPR schreibt 15 Jahre Archivierungspflicht für Digitale Produktpässe vor. DPP-Flash als SaaS-Lösung übernimmt diese Verantwortung: revisionssicher, jederzeit abrufbar, GS1-konform – und ohne eigene IT-Infrastruktur.',
    benefits: [
      '15 Jahre gesetzliche Aufbewahrungsfrist erfüllt',
      'Revisionssicher nach ESPR-Anforderungen',
      'Jederzeit abrufbar für Behörden und Audits',
      'Keine eigenen Server oder Backup-Kosten',
      'SaaS – automatisch aktuell und sicher',
      'Made in Germany – DSGVO-konform',
    ],
    offer: {
      price: '0',
      priceCurrency: 'EUR',
      description: 'Kostenlose Pilotphase für KMU',
    },
    relatedBranchen: [
      { label: 'EU-Batterieverordnung QR-Code-Pflicht', href: '/branchen/batterieverordnung-qr-code-pflicht' },
      { label: 'Produktdatenblätter automatisieren', href: '/branchen/produktdatenblatt-automatisieren-mittelstand' },
    ],
    publishedAt: '2026-04-05',
    updatedAt: '2026-04-05',
  },
];

/** O(1) lookup used by generateMetadata and the page component */
export const LOESUNGEN_PAGE_MAP = new Map(
  LOESUNGEN_PAGES.map((page) => [page.slug, page]),
);
