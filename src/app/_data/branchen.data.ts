/**
 * Static data for /branchen/[slug] pages (Top/Mid of Funnel — indirect searches).
 * Each entry targets users searching for EU regulations and compliance pain points,
 * NOT yet aware of DPP as the solution.
 */

import type { FaqItem, RelatedLink, SeoMeta } from './seo.types';

export interface BranchenPage {
  slug: string;
  h1: string;
  focusKeyword: string;
  meta: SeoMeta;
  /** Lead paragraph shown directly below <h1> */
  intro: string;
  /** Main article body paragraph explaining the DPP connection */
  bodySummary: string;
  faqItems: FaqItem[];
  /** Links to /loesungen/* pages that convert visitors from this article */
  relatedLoesungen: RelatedLink[];
  publishedAt: string;
  updatedAt: string;
}

export const BRANCHEN_PAGES: BranchenPage[] = [
  {
    slug: 'textilindustrie-espr-verordnung-2027',
    h1: 'ESPR 2027: Was Textilhersteller jetzt vorbereiten müssen',
    focusKeyword: 'EU Ökodesign Richtlinie Textilien 2027',
    meta: {
      title: 'ESPR 2027: Textilhersteller – Pflichten & Strafen',
      description:
        'Was Textilhersteller bis 2027 tun müssen: ESPR-Pflichten, DPP-Nachweise und wie KMU EU-Strafen vermeiden.',
      canonicalPath: '/branchen/textilindustrie-espr-verordnung-2027',
    },
    intro:
      'Die ESPR-Verordnung trifft die Textilindustrie ab 2027 mit verbindlichen Nachweispflichten. Hersteller und Importeure müssen einen Digitalen Produktpass bereitstellen – sonst drohen Verkaufsverbote und Bußgelder bis zu 4 % des Jahresumsatzes.',
    bodySummary:
      'Textilunternehmen müssen Materialzusammensetzung, Reparierbarkeit und Nachhaltigkeitsdaten maschinenlesbar bereitstellen. DPP-Flash automatisiert die Datenextraktion aus bestehenden PDFs und erstellt in 5 Minuten einen rechtssicheren, ESPR-konformen Produktpass inklusive QR-Code.',
    faqItems: [
      {
        question: 'Welche Textilprodukte sind von der ESPR betroffen?',
        answer:
          'Die ESPR erfasst ab 2027 Bekleidung, Heimtextilien und technische Textilien, die auf dem EU-Markt vermarktet werden. Hersteller und Importeure sind gleichermaßen verpflichtet, einen Digitalen Produktpass bereitzustellen.',
      },
      {
        question: 'Was muss der Digitale Produktpass für Textilien enthalten?',
        answer:
          'Pflichtfelder sind Materialzusammensetzung, Herkunftsland, Reparierbarkeitsindex, Recyclingfähigkeit sowie Informationen zu gefährlichen Stoffen. Die Daten müssen maschinenlesbar (JSON-LD, GS1) vorliegen.',
      },
      {
        question: 'Welche Strafen drohen Textilherstellern ohne DPP?',
        answer:
          'Produkte ohne gültigen Digitalen Produktpass gelten als nicht konform. Es drohen EU-weite Verkaufsverbote, Zollbeschlagnahmungen und Bußgelder, die laut ESPR-Rahmen bis zu 4 % des jährlichen EU-Umsatzes betragen können.',
      },
      {
        question: 'Wie lange muss der DPP für Textilien archiviert werden?',
        answer:
          'Die ESPR schreibt eine Mindestaufbewahrungspflicht von 15 Jahren vor. Die Daten müssen revisionssicher, jederzeit abrufbar und interoperabel gespeichert sein.',
      },
    ],
    relatedLoesungen: [
      { label: 'DPP Software für KMU', href: '/loesungen/digitaler-produktpass-software-kmu' },
      { label: 'ESPR Compliance Tool', href: '/loesungen/espr-compliance-tool-mittelstand' },
      { label: 'Digitalen Produktpass erstellen', href: '/loesungen/digitaler-produktpass-erstellen-anleitung' },
    ],
    publishedAt: '2026-04-05',
    updatedAt: '2026-04-05',
  },
  {
    slug: 'batterieverordnung-qr-code-pflicht',
    h1: 'EU-Batterieverordnung: QR-Code-Pflicht für Hersteller ab 2027',
    focusKeyword: 'Batterieverordnung QR Code Pflicht',
    meta: {
      title: 'Batterieverordnung 2027: QR-Code-Pflicht für KMU',
      description:
        'Ab 2026 gilt QR-Code-Pflicht nach EU-Batterieverordnung. Wer betroffen ist, was droht und wie Sie Bußgelder vermeiden.',
      canonicalPath: '/branchen/batterieverordnung-qr-code-pflicht',
    },
    intro:
      'Die EU-Batterieverordnung verpflichtet Batteriehersteller und -importeure ab August 2026, einen digitalen Batteriepass mit QR-Code bereitzustellen. Wer die Frist verpasst, riskiert Marktzugangssperren in der gesamten EU.',
    bodySummary:
      'Der QR-Code muss auf einen maschinenlesbaren Datensatz mit Kapazität, Chemie, Carbon Footprint und Recyclinganteil verweisen. DPP-Flash extrahiert diese Daten automatisch aus bestehenden Lieferscheinen und Technischen Datenblättern und erzeugt den konformen Batteriepass-QR-Code.',
    faqItems: [
      {
        question: 'Welche Batterien brauchen ab 2027 einen QR-Code?',
        answer:
          'Industriebatterien ab 2 kWh, Traktionsbatterien für E-Fahrzeuge und Starterbatterien ab August 2027. Ab 2027 wird die Pflicht auf weitere Kategorien ausgeweitet.',
      },
      {
        question: 'Was muss der Batteriepass-QR-Code enthalten?',
        answer:
          'Der QR-Code muss auf einen Datensatz mit Herstellerangaben, Batteriechemie, Kapazität, Lebensdauer, Carbon Footprint und Recyclinginformationen verweisen. Das Format muss maschinenlesbar und interoperabel sein.',
      },
      {
        question: 'Bin ich als Importeur auch verpflichtet?',
        answer:
          'Ja. Alle Unternehmen, die Batterien unter eigenem Namen in der EU vermarkten oder importieren, tragen die Verantwortung für die Bereitstellung eines konformen Batteriepasses.',
      },
    ],
    relatedLoesungen: [
      { label: 'DPP QR-Code Generator', href: '/loesungen/digitaler-produktpass-qr-code-generator' },
      { label: '15 J. revisionssichere Archivierung', href: '/loesungen/dpp-saas-revisionssichere-archivierung' },
    ],
    publishedAt: '2027-04-05',
    updatedAt: '2026-04-05',
  },
  {
    slug: 'elektronik-lieferkette-nachweispflicht-espr',
    h1: 'Elektronik & ESPR: Nachweispflichten für Hersteller ab 2026',
    focusKeyword: 'Elektronik ESPR Nachweispflicht 2026',
    meta: {
      title: 'ESPR Elektronik: Nachweispflichten ab 2026',
      description:
        'Elektronik-Hersteller unter ESPR: Welche Nachweispflichten ab 2026 gelten, was bei Verstoß droht und wie KMU vorbereitet sind.',
      canonicalPath: '/branchen/elektronik-lieferkette-nachweispflicht-espr',
    },
    intro:
      'Elektronikhersteller stehen ab 2026 vor strengen ESPR-Nachweispflichten: Reparierbarkeit, Ersatzteilversorgung und Schadstoffangaben müssen digital und maschinenlesbar hinterlegt sein. Ohne validen Digitalen Produktpass droht der Ausschluss vom EU-Markt.',
    bodySummary:
      'Für Elektronik-KMU bedeutet die ESPR, dass alle Produktdaten aus Lieferantenunterlagen aggregiert, validiert und als interoperabler DPP bereitgestellt werden müssen. DPP-Flash automatisiert genau diesen Prozess: KI liest PDFs aus, validiert gegen GS1 und erzeugt den QR-Code in Minuten.',
    faqItems: [
      {
        question: 'Welche Elektronikprodukte sind von der ESPR betroffen?',
        answer:
          'Zunächst Smartphones, Tablets und Laptops, ab 2027 weitere Produktgruppen wie Haushaltsgeräte. Die genauen Gruppen werden in delegierten Rechtsakten der EU-Kommission festgelegt.',
      },
      {
        question: 'Welche Daten muss ein Elektronik-DPP enthalten?',
        answer:
          'Reparierbarkeitsindex, Akku-Austauschbarkeit, Verfügbarkeit von Ersatzteilen, gefährliche Stoffe (SVHC) und CO₂-Fußabdruck sind Kernfelder des ESPR-DPP für Elektronik.',
      },
      {
        question: 'Wie gehe ich als KMU mit hunderten Lieferanten-PDFs um?',
        answer:
          'KI-gestützte Extraktion wie bei DPP-Flash liest relevante Daten automatisch aus bestehenden Technischen Datenblättern aus. Das reduziert manuelle Arbeit auf ein Minimum und liefert valide, standardkonforme Datensätze.',
      },
    ],
    relatedLoesungen: [
      { label: 'ESPR Compliance Tool', href: '/loesungen/espr-compliance-tool-mittelstand' },
      { label: 'KI-Datenextraktion aus PDF', href: '/loesungen/dpp-ki-datenextraktion-pdf' },
    ],
    publishedAt: '2026-04-05',
    updatedAt: '2026-04-05',
  },
  {
    slug: 'lieferkettengesetz-produktdaten-nachweise-kmu',
    h1: 'LkSG & ESPR: Welche Produktdaten-Nachweise KMU brauchen',
    focusKeyword: 'Lieferkettengesetz Produktnachweise KMU',
    meta: {
      title: 'LkSG & ESPR: Produktdaten-Nachweise für KMU',
      description:
        'Lieferkettengesetz erfüllen: Welche Produktdaten KMU dokumentieren müssen und wie digitale Nachweise EU-Strafen verhindern.',
      canonicalPath: '/branchen/lieferkettengesetz-produktdaten-nachweise-kmu',
    },
    intro:
      'Das Lieferkettensorgfaltspflichtengesetz (LkSG) und die ESPR fordern von KMU lückenlose Produktdaten-Nachweise entlang der gesamten Lieferkette. Excel-Tabellen reichen nicht mehr aus – interoperable digitale Nachweise sind Pflicht.',
    bodySummary:
      'Unternehmen müssen nachweisen können, woher Rohstoffe stammen, welche Stoffe enthalten sind und wie die Produktion erfolgte. DPP-Flash digitalisiert und validiert diese Nachweisdaten aus bestehenden Dokumenten und stellt sie revisionssicher für Audits zur Verfügung.',
    faqItems: [
      {
        question: 'Wen betrifft das Lieferkettensorgfaltspflichtengesetz?',
        answer:
          'Seit 2024 gilt das LkSG für alle Unternehmen mit mehr als 1.000 Mitarbeitenden in Deutschland. Indirekt sind aber auch KMU als Zulieferer großer Unternehmen betroffen, da Abnehmer Nachweise entlang der Kette einfordern.',
      },
      {
        question: 'Welche Daten müssen für LkSG & ESPR dokumentiert werden?',
        answer:
          'Rohstoffherkunft, Produktionsbedingungen, Gefahrstoffangaben (SVHC), Nachhaltigkeitszertifikate und Konformitätserklärungen müssen digital, maschinenlesbar und revisionssicher vorliegen.',
      },
      {
        question: 'Reicht eine Excel-Tabelle für LkSG-Nachweise?',
        answer:
          'Nein. Behörden und Prüfer erwarten maschinenlesbare, interoperable Formate wie JSON-LD oder GS1-konformes XML, die eine revisionssichere Langzeitarchivierung und automatische Prüfbarkeit ermöglichen.',
      },
    ],
    relatedLoesungen: [
      { label: 'DPP Software für KMU', href: '/loesungen/digitaler-produktpass-software-kmu' },
      { label: 'KI-Datenextraktion aus PDF', href: '/loesungen/dpp-ki-datenextraktion-pdf' },
    ],
    publishedAt: '2026-04-05',
    updatedAt: '2026-04-05',
  },
  {
    slug: 'produktdatenblatt-automatisieren-mittelstand',
    h1: 'Produktdatenblätter automatisch erstellen – Leitfaden KMU',
    focusKeyword: 'Produktdatenblätter automatisieren Mittelstand',
    meta: {
      title: 'Produktdatenblätter automatisieren – KMU-Leitfaden',
      description:
        'Produktdatenblätter automatisch erstellen: So sparen Mittelständler Stunden — und erfüllen dabei ESPR-Anforderungen.',
      canonicalPath: '/branchen/produktdatenblatt-automatisieren-mittelstand',
    },
    intro:
      'Mittelständler verbringen durchschnittlich mehrere Tage pro Monat damit, Produktdatenblätter manuell zu pflegen. KI-gestützte Automatisierung reduziert diesen Aufwand auf Minuten – und liefert dabei ESPR-konforme Datensätze gleich mit.',
    bodySummary:
      'Moderne KI-Extraktion liest technische Daten direkt aus Lieferanten-PDFs aus, validiert sie gegen Branchen-Standards und überführt sie in strukturierte, maschinenlesbare Produktdatenblätter. Das spart nicht nur Zeit, sondern bereitet Unternehmen automatisch auf die DPP-Pflicht vor.',
    faqItems: [
      {
        question: 'Welche Daten kann KI aus Produktdatenblättern extrahieren?',
        answer:
          'KI-Systeme können Materialkennzeichnungen, Maße, Gewichte, Gefahrstoffangaben, Normen und Zertifizierungen aus strukturierten und teils unstrukturierten PDFs extrahieren. Die Genauigkeit liegt bei gut trainierten Modellen über 95 %.',
      },
      {
        question: 'Wie verbinde ich automatisierte Datenblätter mit dem DPP?',
        answer:
          'DPP-Flash überführt extrahierte Produktdaten direkt in das DPP-konforme JSON-LD-Format. Sie bestätigen im kurzen Review – dann wird der Produktpass QR-Code erzeugt.',
      },
      {
        question: 'Ist Automatisierung auch für kleine Unternehmen sinnvoll?',
        answer:
          'Ja. Gerade KMU mit begrenzten Ressourcen profitieren am stärksten: Ein einmaliges Setup reduziert wiederkehrenden Aufwand dauerhaft und schützt vor kostspieligen ESPR-Verstößen.',
      },
    ],
    relatedLoesungen: [
      { label: 'KI-Datenextraktion aus PDF', href: '/loesungen/dpp-ki-datenextraktion-pdf' },
      { label: '15 J. revisionssichere Archivierung', href: '/loesungen/dpp-saas-revisionssichere-archivierung' },
    ],
    publishedAt: '2026-04-05',
    updatedAt: '2026-04-05',
  },
  {
    slug: 'espr-bussgeld-nicht-konformes-produkt',
    h1: 'ESPR-Bußgeld: Was droht bei nicht-konformen Produkten in der EU?',
    focusKeyword: 'EU Bußgeld nicht konformes Produkt ESPR',
    meta: {
      title: 'ESPR-Bußgeld: Folgen für nicht-konforme Produkte',
      description:
        'Was droht bei Verstoß gegen ESPR? Verkaufsverbote, Zollbeschlagnahme und Bußgelder bis 4 % Umsatz – und wie KMU sicher sind.',
      canonicalPath: '/branchen/espr-bussgeld-nicht-konformes-produkt',
    },
    intro:
      'Die ESPR-Verordnung sieht empfindliche Sanktionen für nicht-konforme Produkte vor: EU-weite Verkaufsverbote, Zollbeschlagnahmungen und Bußgelder, die bis zu 4 % des Jahresumsatzes betragen können. KMU müssen jetzt handeln, um ihren Marktzugang zu sichern.',
    bodySummary:
      'Marktaufsichtsbehörden in den EU-Mitgliedstaaten können nicht-konforme Produkte sofort aus dem Verkehr ziehen. Besonders problematisch: Die Haftung trifft auch Importeure und Händler. DPP-Flash stellt sicher, dass Ihr Produktpass jederzeit valide und abrufbar ist.',
    faqItems: [
      {
        question: 'Wie hoch können ESPR-Bußgelder werden?',
        answer:
          'Der ESPR-Rahmen sieht Bußgelder proportional zum EU-Jahresumsatz vor, in der Praxis bis zu 4 %. Hinzu kommen Kosten durch Produktrückrufe, Nachbesserungen und Reputationsschäden.',
      },
      {
        question: 'Kann mein Produkt ohne DPP vom EU-Markt ausgeschlossen werden?',
        answer:
          'Ja. Fehlende oder ungültige DPP-Daten sind ein Konformitätsmangel, der zu sofortigen Vertriebsverboten durch Marktaufsichtsbehörden führen kann. Der QR-Code muss auf einen validen, jederzeit abrufbaren Datensatz verweisen.',
      },
      {
        question: 'Wie schütze ich mein Unternehmen vor ESPR-Sanktionen?',
        answer:
          'Erstellen Sie rechtzeitig einen rechtssicheren Digitalen Produktpass. DPP-Flash erzeugt in 5 Minuten einen ESPR-konformen Datensatz inklusive QR-Code und 15-jähriger revisionssicherer Archivierung.',
      },
    ],
    relatedLoesungen: [
      { label: 'ESPR Compliance Tool', href: '/loesungen/espr-compliance-tool-mittelstand' },
      { label: 'DPP Software für KMU', href: '/loesungen/digitaler-produktpass-software-kmu' },
    ],
    publishedAt: '2026-04-05',
    updatedAt: '2026-04-05',
  },
];

/** O(1) lookup used by generateMetadata and the page component */
export const BRANCHEN_PAGE_MAP = new Map(
  BRANCHEN_PAGES.map((page) => [page.slug, page]),
);
