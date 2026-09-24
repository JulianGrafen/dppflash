import { initPage, setLang, t, getLang } from './i18n-core.js';

const EN = {
  'pi.meta.title': 'AI ingestion — documents to passport data | DPP-Flash',
  'pi.meta.description':
    'AI document ingestion for Digital Product Passports: extract PDFs and certificates with confidence and evidence — review before publish.',

  'nav.main': 'Main navigation',
  'nav.benefits': 'Benefits',
  'nav.platform': 'Platform',
  'nav.demo': 'Demo',
  'nav.scan': 'Readiness check',
  'nav.about': 'About us',
  'nav.faq': 'FAQ',
  'nav.contact': 'Contact',
  'nav.pricing': 'Pricing',
  'nav.blog': 'Blog',
  'nav.menuOpen': 'Open menu',
  'nav.menuClose': 'Close',
  'nav.lang': 'Language',

  'trust.knownFrom': 'Known from:',
  'trust.registeredIn': 'Listed in:',
  'footer.mentionedBy': 'Also mentioned by',

  'pi.hero.kickerNum': '01 · AI ingestion',
  'pi.hero.kickerCtx': 'Platform',
  'pi.hero.title': 'From supplier documents to structured passport data in seconds',
  'pi.hero.lead':
    'Upload PDFs, BOMs, test reports or certificates. Our AI reads tables and scanned pages, extracts passport fields with confidence and source references — and queues everything for review before anything is published.',
  'pi.hero.badge1': 'PDF · XLSX · Images',
  'pi.hero.badge2': 'Evidence required',
  'pi.hero.badge3': 'Sandbox demo',

  'pi.copy.title': 'Messy docs in. Structured passport data out.',
  'pi.copy.p1':
    'The pipeline handles native PDFs — including tables, charts and OCR on scanned documents. High confidence is staged; borderline values go to the review queue. You never accept AI output blindly: every value is traceable, every source one click away.',
  'pi.copy.p2':
    'Supplier workflows to automatically chase missing data are in active development — the MVP covers the core path document → structured passport.',
  'pi.copy.f1': 'Native PDF, spreadsheets, CSV/XLSX and image OCR',
  'pi.copy.f2': 'Every extraction with provenance and confidence',
  'pi.copy.f3': 'Mapping to passport schema (battery, ecodesign)',
  'pi.copy.f4': 'Review gate before release and QR publication',

  'pi.mock.aria': 'Product preview',
  'pi.mock.tenant': 'Rheinwerk Cycles · VoltStride Pack 720 · Ingestion',
  'pi.mock.fileMeta': '2.2 MB · 14 pages',
  'pi.mock.fileStatus': 'Processed',
  'pi.mock.parsed': 'Extracted',
  'pi.mock.source': 'Evidence',
  'pi.mock.summary': '14 fields · 11 staged · 3 for review',
  'pi.mock.review': 'Open review →',

  'pi.workflow.title': 'How ingestion works',
  'pi.workflow.s1.title': 'Upload',
  'pi.workflow.s1.text':
    'PDFs, spreadsheets and certificates into a secure upload — or from your existing document workflow.',
  'pi.workflow.s2.title': 'AI read',
  'pi.workflow.s2.text': 'Extraction with confidence and field mapping to battery or ecodesign schema.',
  'pi.workflow.s3.title': 'Review',
  'pi.workflow.s3.text': 'Review queue for uncertain values; evidence stays linked to every field.',
  'pi.workflow.s4.title': 'Apply to passport',
  'pi.workflow.s4.text': 'Approved data flows into the draft — ready for GS1 link and QR.',

  'pi.cta.title': 'Try ingestion in the sandbox',
  'pi.cta.text':
    'The interactive demo shows upload, AI extraction and passport review using the VoltStride Pack 720 example.',
  'pi.cta.demo': 'View demo',
  'pi.cta.contact': 'Contact us',
};

function boot() {
  initPage(EN);
  window.DppI18n = { t, setLang, getLang };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
