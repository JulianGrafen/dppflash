import { initPage, setLang, t, getLang } from './i18n-core.js';

const EN = {
  'exp.meta.title': 'DPP-Flash Demo — Digital Product Passport in action',
  'exp.meta.description':
    'Interactive sandbox: from PDFs to a battery passport in minutes — no login, no risk.',

  'nav.main': 'Main navigation',
  'nav.benefits': 'Benefits',
  'nav.demo': 'Demo',
  'nav.faq': 'FAQ',
  'nav.contact': 'Contact',
  'nav.pricing': 'Pricing',
  'nav.blog': 'Blog',
  'nav.menuOpen': 'Open menu',
  'nav.menuClose': 'Close',
  'nav.lang': 'Language',

  'exp.hero.eyebrow': 'Interactive sandbox',
  'exp.hero.title': 'Build a compliant Digital Product Passport — you drive, we simulate.',
  'exp.hero.lead':
    'No login. No setup. In a few minutes you turn a folder of documents into a structured, scannable EU passport — and see what customers, recyclers and inspectors would see.',
  'exp.hero.badge1': 'Battery passport · e-bike example',
  'exp.hero.badge2': 'QR at the end (demo)',
  'exp.hero.badge3': 'Zero risk — sandbox',

  'exp.nav.prev': 'Back',
  'exp.nav.next': 'Next',

  'exp.s0.title': 'Meridian PowerCell 500',
  'exp.s0.text':
    'A 500 Wh e-bike battery for the EU market — a mid-size maker with no compliance department. Every battery placed on the market will need a Digital Product Passport from 2027.',
  'exp.s1.title': 'Upload documents',
  'exp.s1.text':
    'Start from what you already have. DPP-Flash reads PDFs and certificates — no retyping.',
  'exp.s2.title': 'AI extraction',
  'exp.s2.text':
    'AI maps fields to the battery passport schema. Low-confidence values are flagged — nothing is invented.',
  'exp.s3.title': 'Review draft passport',
  'exp.s3.text': 'Completeness at a glance — every claim linked to its evidence.',
  'exp.s4.title': 'Publish & host',
  'exp.s4.text':
    'GS1-compliant link, audit-proof archive and 15 years hosting — prepared for ESPR requirements.',
  'exp.s5.title': 'What the world sees',
  'exp.s5.text': 'One QR code — different views for consumers, recyclers and inspectors.',

  'exp.app.navPassports': 'Passports',
  'exp.app.navNew': 'New passport',
  'exp.app.navSettings': 'Settings',
  'exp.app.tenant': 'Meridian Mobility · Pilot · 3 passports left',

  'exp.screen0.title': 'New passport — PowerCell 500',
  'exp.screen0.hint': 'LMT battery · EU 2023/1542 · ~112 data fields',

  'exp.screen1.title': 'Product documents',
  'exp.screen1.drop': 'Drop documents here — PDF, images, spreadsheets',
  'exp.screen1.attached': 'Attached',

  'exp.screen2.title': 'AI extraction',
  'exp.screen2.sub': '0% → 100% · reading…',
  'exp.screen2.r1': 'Chemistry Li-ion NMC',
  'exp.screen2.r2': 'Rated energy 500 Wh',
  'exp.screen2.r3': 'Voltage / capacity 36 V · 13.9 Ah',
  'exp.screen2.r4': 'Carbon footprint 71 kg CO₂e',
  'exp.screen2.r5': 'Recycled cobalt 12%',
  'exp.screen2.r6': 'CE / conformity',

  'exp.screen3.title': 'PowerCell 500 — draft',
  'exp.screen3.complete': '✓ 112 of 112 required fields · linked to evidence',
  'exp.screen3.f1l': 'Product',
  'exp.screen3.f2l': 'GTIN',
  'exp.screen3.f3l': 'Category',
  'exp.screen3.f3v': 'LMT battery',
  'exp.screen3.f4l': 'Responsible operator',
  'exp.screen3.f5l': 'Carbon footprint',

  'exp.screen4.title': 'Release & hosting',
  'exp.screen4.c1': 'Generate GS1 Digital Link',
  'exp.screen4.c2': 'Audit-proof archive (ESPR)',
  'exp.screen4.c3': 'Generate product passport QR code',
  'exp.screen4.c4': 'Activate 15 years hosting',

  'exp.screen5.title': 'This is what the world sees.',
  'exp.screen5.thRole': 'Role',
  'exp.screen5.thSees': 'Sees',
  'exp.screen5.r1': 'Buyer',
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
