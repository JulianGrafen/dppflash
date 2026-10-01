export type DppRole = 'public' | 'recycler' | 'auditor';

export type DppFieldTier = DppRole;

/** Inhaltliche Gliederung (angelehnt an EU-Pass-Profile, z. B. Passper seed) */
export type DppPassSectionId =
  | 'summary'
  | 'composition'
  | 'carbon'
  | 'repairability'
  | 'endOfLife'
  | 'documents';

export interface DppPassMaterialOrigin {
  name: string;
  origin: string;
}

export interface DppPassField {
  label: string;
  value: string;
  /** Wenn gesetzt, wird ein Ja/Nein statt `value` angezeigt */
  boolean?: boolean;
  /** Aufzählung mit Ursprungsland (statt `value`) */
  listItems?: DppPassMaterialOrigin[];
  tier?: DppFieldTier;
  href?: string;
  pill?: 'pink' | 'green' | 'orange';
  sectionId: DppPassSectionId;
  /** Felder mit gleicher `group` werden in einem Dropdown gebündelt */
  group?: string;
}

export interface DppPassFieldGroup {
  id: string;
  title: string;
  /** Wert für die geschlossene Zeile (z. B. Produktname) */
  summaryLabel?: string;
}

export interface DppPassContentSection {
  id: DppPassSectionId;
  title: string;
  description?: string;
}

export interface DppPassSection {
  title: string;
  pillDefault: 'pink' | 'orange';
  fields: DppPassField[];
  fieldGroups?: DppPassFieldGroup[];
}

export interface DppCompositionSegment {
  label: string;
  kg: number;
  percent: number;
  colorClass: string;
}

export interface DppCompositionMaterial {
  label: string;
  share: string;
  recycled?: string;
  tier?: DppFieldTier;
}

export interface DppComposition {
  totalKg: number;
  segments: DppCompositionSegment[];
  materials: DppCompositionMaterial[];
}

export interface SampleDppPass {
  slug: string;
  category: string;
  title: string;
  shortDescription: string;
  batteryId: string;
  /** Öffentliche Pass-UUID (Resolver / QR-Verweis) */
  passUuid: string;
  serialNumber: string;
  weight: string;
  capacity: string;
  /** State of health / Ladezustand für KPI-Balken (0–100) */
  batteryStatusPercent: number;
  batteryStatusNote?: string;
  cycleLife: string;
  carbonFootprint: string;
  carbonFootprintUnit?: string;
  carbonPerformanceClass?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  carbonPerformanceNote?: string;
  dataAsOf: string;
  manufacturer?: string;
  manufacturedDate?: string;
  warranty?: string;
  recyclability?: string;
  profileStatusHint?: string;
  verifiedFieldsCount?: number;
  imageUrl: string;
  imageAlt: string;
  contentSections: DppPassContentSection[];
  composition: DppComposition;
  publicSection: DppPassSection;
  accessSection: DppPassSection;
}

export const SAMPLE_DPP_PASSES: Record<string, SampleDppPass> = {
  'voltstride-720': {
    slug: 'voltstride-720',
    category: 'LMT-Batterie',
    title: 'VoltStride 720',
    shortDescription:
      'Li-ion-LFP-Akku für E-Bikes (LMT), 720 Wh Nennenergie — modular reparierbar, konform für den EU-Markt.',
    batteryId: '0x4a7f…2821',
    passUuid: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    serialNumber: 'VS-720-DE-00421',
    weight: '4,1 kg',
    capacity: '720 Wh',
    batteryStatusPercent: 82,
    batteryStatusNote: 'Live · updated by authorised repairer',
    cycleLife: '≥ 1.000 Zyklen',
    carbonFootprint: '58 kg',
    carbonFootprintUnit: 'CO₂e (Cradle-to-Gate)',
    carbonPerformanceClass: 'B',
    carbonPerformanceNote:
      'Klasse B: ca. 15 % unter dem Median vergleichbarer Li-ion-LFP-Akkus (Demo).',
    dataAsOf: 'März 2025',
    manufacturer: 'Rheinwerk Cycles GmbH',
    manufacturedDate: '15.03.2025',
    warranty: '5 Jahre / ≥ 1.000 Zyklen',
    recyclability: '70 % der Masse',
    profileStatusHint: 'Demo-Profil · Batteriepass LMT',
    verifiedFieldsCount: 3,
    imageUrl: '/images/voltstride-720-hero.png',
    imageAlt: 'VoltStride E-Bike-Akku, 48 V Lithium-Ion',
    contentSections: [
      { id: 'summary', title: 'Zusammenfassung' },
      { id: 'composition', title: 'Zusammensetzung' },
      { id: 'carbon', title: 'CO₂-Fußabdruck' },
      { id: 'repairability', title: 'Reparierbarkeit' },
      { id: 'endOfLife', title: 'Lebensende' },
      { id: 'documents', title: 'Nachweise & Dokumente' },
    ],
    composition: {
      totalKg: 4.1,
      segments: [
        {
          label: 'Zellblock Li-ion LFP',
          kg: 2.35,
          percent: 57,
          colorClass: 'bg-violet-500',
        },
        {
          label: 'Gehäuse & Schutz',
          kg: 1.0,
          percent: 24,
          colorClass: 'bg-slate-400',
        },
        {
          label: 'BMS & Anschlüsse',
          kg: 0.75,
          percent: 19,
          colorClass: 'bg-amber-500',
        },
      ],
      materials: [
        { label: 'Lithium', share: '12 %', recycled: '18 %' },
        { label: 'Kupfer', share: '8 %', recycled: '22 %' },
        { label: 'Aluminium', share: '6 %' },
        { label: 'Eisen / Phosphat (LFP)', share: '18 %' },
        { label: 'Graphit', share: '11 %' },
        {
          label: 'Elektrolyt (Li-Salz)',
          share: '4 %',
          tier: 'recycler',
        },
      ],
    },
    publicSection: {
      title: 'Öffentliche Daten gemäß EU-Batterierichtlinie',
      pillDefault: 'pink',
      fieldGroups: [
        { id: 'summary-detail', title: 'Detailansicht' },
        { id: 'carbon-detail', title: 'Detailansicht' },
      ],
      fields: [
        {
          label: 'Produkt',
          value: 'VoltStride Pack 720 · Li-ion LFP · LMT',
          sectionId: 'summary',
        },
        {
          label: 'Wiederaufladbarkeit',
          value: '',
          boolean: true,
          sectionId: 'summary',
        },
        {
          label: 'Hersteller',
          value: 'Rheinwerk Cycles GmbH',
          sectionId: 'summary',
        },
        {
          label: 'Garantie',
          value: '5 Jahre / ≥ 1.000 Zyklen',
          sectionId: 'summary',
        },
        {
          label: 'Produktfamilie',
          value:
            'Li-ion-LFP-Akku für E-Bikes (LMT), modular reparierbar, konform für den EU-Markt.',
          sectionId: 'summary',
          group: 'summary-detail',
        },
        {
          label: 'Spannung',
          value: '400 V',
          sectionId: 'summary',
          group: 'summary-detail',
        },
        {
          label: 'Herstellungsort',
          value: 'Köln, Deutschland',
          sectionId: 'summary',
          group: 'summary-detail',
        },
        {
          label: 'Hergestellt',
          value: '15.03.2025',
          sectionId: 'summary',
          group: 'summary-detail',
        },
        {
          label: 'Seriennummer',
          value: 'VS-720-DE-00421',
          sectionId: 'summary',
          group: 'summary-detail',
        },
        {
          label: 'Erwartete Lebensdauer',
          value: '10 Jahre (bei vorgesehener Nutzung)',
          sectionId: 'summary',
          group: 'summary-detail',
        },
        {
          label: 'Zellchemie',
          value: 'Li-ion LFP (NMC-frei)',
          sectionId: 'composition',
        },
        {
          label: 'Kritische Rohstoffe',
          value: '',
          sectionId: 'composition',
          listItems: [
            { name: 'Lithium', origin: 'Chile' },
            { name: 'Kupfer', origin: 'Peru' },
            { name: 'Graphit', origin: 'China' },
          ],
        },
        {
          label: 'Gefahrstoffe',
          value: 'Cd <0,002 % · Pb <0,01 %',
          sectionId: 'composition',
          pill: 'green',
        },
        {
          label: 'CO₂-Fußabdruck',
          value: '58 kg CO₂e',
          sectionId: 'carbon',
        },
        {
          label: 'Systemgrenze',
          value: 'Cradle-to-Gate',
          sectionId: 'carbon',
          group: 'carbon-detail',
        },
        {
          label: 'Methodik',
          value: 'ISO 14067 (Demo)',
          sectionId: 'carbon',
          group: 'carbon-detail',
        },
        {
          label: 'Reparaturkonzept',
          value: 'Modulare Zellpakete · Service-Partner EU',
          sectionId: 'repairability',
        },
        {
          label: 'Demontage',
          value: '6 Schrauben · 2×7 Zellen',
          sectionId: 'repairability',
        },
        {
          label: 'Ersatzteilverfügbarkeit',
          value: '10 Jahre (Herstellerzusage)',
          sectionId: 'repairability',
        },
        {
          label: 'Recyclingfähigkeit',
          value: '70 % der Masse im EU-Strom',
          sectionId: 'endOfLife',
        },
        {
          label: 'Rücknahmesystem',
          value: 'EU-Batterie-Rücknahme (Händler/Recycler)',
          sectionId: 'endOfLife',
        },
        {
          label: 'Recycelter Anteil (Material)',
          value: 'Li 18 % · Cu 22 %',
          sectionId: 'endOfLife',
        },
        {
          label: 'Lieferketten-Due-Diligence',
          value: 'Ansehen',
          href: '#',
          sectionId: 'documents',
        },
        {
          label: 'Konformitätserklärung',
          value: 'Download',
          href: '#',
          sectionId: 'documents',
        },
        {
          label: 'Zertifizierungen',
          value: 'Download',
          href: '#',
          sectionId: 'documents',
        },
        {
          label: 'CE-Kennzeichnung',
          value: 'Ja · ab 03/2025',
          sectionId: 'documents',
          tier: 'auditor',
        },
      ],
    },
    accessSection: {
      title: 'Zugang über rollenbasierte Abfrage',
      pillDefault: 'orange',
      fields: [
        {
          label: 'Demontage-Sheet',
          value: 'Download',
          href: '#',
          sectionId: 'documents',
          tier: 'recycler',
        },
        {
          label: 'Belegpaket (ESPR)',
          value: 'Export',
          href: '#',
          sectionId: 'documents',
          tier: 'auditor',
        },
      ],
    },
  },
};

export function getSampleDppPass(slug: string): SampleDppPass | undefined {
  return SAMPLE_DPP_PASSES[slug];
}

export function getAllPassFields(pass: SampleDppPass): DppPassField[] {
  return [
    ...(pass.publicSection?.fields ?? []),
    ...(pass.accessSection?.fields ?? []),
  ];
}

const DEFAULT_CONTENT_SECTIONS: DppPassContentSection[] = [
  { id: 'summary', title: 'Zusammenfassung' },
  { id: 'composition', title: 'Zusammensetzung' },
  { id: 'carbon', title: 'CO₂-Fußabdruck' },
  { id: 'repairability', title: 'Reparierbarkeit' },
  { id: 'endOfLife', title: 'Lebensende' },
  { id: 'documents', title: 'Nachweise & Dokumente' },
];

/** Stellt fehlende Metadaten sicher (z. B. nach Hot-Reload / älterem Cache). */
export function normalizePass(pass: SampleDppPass): SampleDppPass {
  return {
    ...pass,
    carbonFootprintUnit: pass.carbonFootprintUnit ?? 'CO₂e',
    carbonPerformanceClass: pass.carbonPerformanceClass ?? 'C',
    carbonPerformanceNote: pass.carbonPerformanceNote,
    batteryStatusPercent: pass.batteryStatusPercent ?? 0,
    profileStatusHint: pass.profileStatusHint ?? 'Demo-Profil',
    verifiedFieldsCount: pass.verifiedFieldsCount ?? 0,
    recyclability: pass.recyclability ?? '—',
    contentSections:
      pass.contentSections?.length ? pass.contentSections : DEFAULT_CONTENT_SECTIONS,
  };
}
