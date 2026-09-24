import { initPage, setLang, t, getLang } from './i18n-core.js';

const EN = {
  'exp.meta.title': 'DPP-Flash Demo — Digital Product Passport in action',
  'exp.meta.description':
    'Interactive sandbox: from PDFs to a battery passport in minutes — no login, no risk.',

  'nav.main': 'Main navigation',
  'nav.benefits': 'Benefits',
  'nav.demo': 'Demo',
  'nav.platform': 'Platform',
  'nav.about': 'About us',
  'nav.faq': 'FAQ',
  'nav.contact': 'Contact',
  'nav.pricing': 'Pricing',
  'nav.blog': 'Blog',
  'nav.menuOpen': 'Open menu',
  'nav.menuClose': 'Close',
  'nav.lang': 'Language',

  'timer.title': 'Battery passport mandatory',
  'timer.date': '18 February 2027',
  'timer.days': 'Days',
  'timer.hours': 'Hours',
  'timer.min': 'Min.',
  'timer.expired': 'Mandatory now',

  'footer.mentionedBy': 'Also mentioned by',

  'exp.hero.eyebrow': 'Interactive sandbox',
  'exp.hero.title': 'Build a compliant Digital Product Passport in 10 minutes — you drive, we simulate.',
  'exp.hero.lead':
    'No login. No setup. In a few minutes you turn a folder of documents into a structured, scannable EU passport — and see what customers, recyclers and inspectors would see.',
  'exp.hero.badge1': 'Battery passport · e-bike example',
  'exp.hero.badge2': 'QR at the end (demo)',
  'exp.hero.badge3': 'Zero risk — sandbox',

  'exp.nav.prev': 'Back',
  'exp.nav.next': 'Next',

  'exp.s0.kicker': 'Step 1 · Context',
  'exp.s0.title': 'New passport — VoltStride Pack 720',
  'exp.s0.chip1': 'LMT battery',
  'exp.s0.chip2': 'EU 2023/1542',
  'exp.s0.chip3': '~108 data fields',
  'exp.s0.text':
    'A 720 Wh e-bike battery for the EU market — a mid-size maker with no compliance department. Every battery placed on the market will need a Digital Product Passport from 2027.',

  'exp.s1.kicker': 'Step 2 · Documents',
  'exp.s1.title': 'Product documents',
  'exp.s1.text':
    'Start from what you already have: spec sheets, CE certificates, supplier declarations. DPP-Flash reads PDFs — no retyping.',

  'exp.s2.kicker': 'Step 3 · AI',
  'exp.s2.title': 'AI extraction',
  'exp.s2.text':
    'AI maps fields to the battery passport schema. Each row shows confidence and source file — low-confidence values are flagged, nothing is invented.',

  'exp.s3.kicker': 'Step 4 · Draft',
  'exp.s3.title': 'VoltStride Pack 720 — draft',
  'exp.s3.text':
    'Completeness at a glance: grouped sections, required fields and evidence pills linked to your PDFs.',

  'exp.s4.kicker': 'Step 5 · Release',
  'exp.s4.title': 'Release & hosting',
  'exp.s4.text':
    'Four steps until your passport goes live: GS1 link, audit-proof archive, QR code and 15 years hosting — prepared for ESPR, without EU registry claims.',

  'exp.s5.kicker': 'Step 6 · Public',
  'exp.s5.title': 'This is what the world sees.',
  'exp.s5.text': 'One QR code — different views for public, recyclers and inspectors. Your product registry at a glance.',

  'exp.app.navPassports': 'Passports',
  'exp.app.navNew': 'New passport',
  'exp.app.navRegistry': 'Registry',
  'exp.app.navSettings': 'Settings',
  'exp.app.tenant': 'Rheinwerk Cycles · Pilot · 3 passports left',

  'exp.screen0.title': 'New passport — VoltStride Pack 720',
  'exp.screen0.hint': 'LMT battery · EU 2023/1542 · ~108 data fields',
  'exp.screen0.lead': 'Start from what you already have — we structure it for the EU battery passport.',

  'exp.screen1.title': 'Product documents',
  'exp.screen1.drop': 'Drop documents here',
  'exp.screen1.dropSub': 'Spec sheets · certificates · supplier declarations',
  'exp.screen1.typeSpec': 'Spec sheet',
  'exp.screen1.typeCert': 'Certificate',
  'exp.screen1.typeDecl': 'Declaration',
  'exp.screen1.attached': 'Attached',

  'exp.screen2.title': 'AI extraction',
  'exp.screen2.sourceLabel': 'Source',
  'exp.screen2.reading': '· reading…',
  'exp.screen2.r1': 'Chemistry Li-ion LFP',
  'exp.screen2.r2': 'Rated energy 720 Wh',
  'exp.screen2.r3': 'Voltage / capacity 48 V · 15 Ah',
  'exp.screen2.r4': 'Weight 4.1 kg',
  'exp.screen2.r5': 'Cycle life ≥ 1,000 cycles',
  'exp.screen2.r6': 'Recycled lithium 18%',
  'exp.screen2.r7': 'Carbon footprint 58 kg CO₂e',
  'exp.screen2.r8': 'CE / conformity',

  'exp.screen3.title': 'VoltStride Pack 720 — draft',
  'exp.screen3.complete': '✓ 108 of 108 required fields · linked to evidence',
  'exp.screen3.secProduct': 'Product & operator',
  'exp.screen3.secConform': 'Conformity',
  'exp.screen3.secChem': 'Composition',
  'exp.screen3.secLife': 'Lifetime & end of life',
  'exp.screen3.secCo2': 'CO₂ & sustainability',
  'exp.screen3.f1l': 'Product',
  'exp.screen3.f2l': 'GTIN',
  'exp.screen3.f3l': 'Category',
  'exp.screen3.f3v': 'LMT battery',
  'exp.screen3.f4l': 'Responsible operator',
  'exp.screen3.f5l': 'CE marking',
  'exp.screen3.f5v': 'Yes · 2025-03',
  'exp.screen3.f6l': 'EU declaration of conformity',
  'exp.screen3.f6v': 'On file',
  'exp.screen3.f7l': 'Chemistry',
  'exp.screen3.f8l': 'Recycled lithium',
  'exp.screen3.f9l': 'Cycle life',
  'exp.screen3.f10l': 'Weight',
  'exp.screen3.f11l': 'Repairability',
  'exp.screen3.f11v': 'Module · service partner',
  'exp.screen3.f12l': 'Carbon footprint',

  'exp.screen4.title': 'Release & hosting',
  'exp.screen4.lead':
    'Four steps until your passport is live — audit-proof hosting, no EU registry submit.',
  'exp.screen4.c1': 'Generate GS1 Digital Link',
  'exp.screen4.c2': 'Audit-proof archive (ESPR)',
  'exp.screen4.c3': 'Generate product passport QR code',
  'exp.screen4.c4': 'Activate 15 years hosting',

  'exp.screen5.title': 'This is what the world sees.',
  'exp.screen5.lead':
    'One QR code opens role-based views — public sees origin and recycling, recyclers disassembly, inspectors full evidence.',
  'exp.screen5.registryTitle': 'Product registry (demo)',
  'exp.screen5.thProduct': 'Product',
  'exp.screen5.thCategory': 'Category',
  'exp.screen5.thStatus': 'Status',
  'exp.screen5.thHosting': 'Hosting',
  'exp.screen5.catLmt': 'LMT',
  'exp.screen5.catStationary': 'Stationary',
  'exp.screen5.statusSealed': 'Sealed',
  'exp.screen5.hostingOk': '✓ ESPR archived',
  'exp.screen5.thRole': 'Role',
  'exp.screen5.thSees': 'Sees',
  'exp.screen5.r1': 'Public',
  'exp.screen5.r1d': 'Origin, materials, recycling',
  'exp.screen5.r2': 'Recycler',
  'exp.screen5.r2d': 'Composition, disassembly',
  'exp.screen5.r3': 'Inspector',
  'exp.screen5.r3d': 'Full compliance evidence',

  'exp.cta.title': 'Ready for your real product passport?',
  'exp.cta.text':
    'Start the free pilot — we guide you from first PDFs to your QR code.',
  'exp.cta.btn': 'Become a pilot customer',
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
