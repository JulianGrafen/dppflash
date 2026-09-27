import { initPage, setLang, t, getLang } from './i18n-core.js';

const EN = {
  'investors.meta.title': 'For investors — DPP-Flash',
  'investors.meta.description':
    'Investment opportunity: DPP-Flash automates EU Digital Product Passports for SMBs — regulatory tailwind, B2B SaaS, founding team in Germany.',

  'nav.main': 'Main navigation',
  'nav.benefits': 'Benefits',
  'nav.demo': 'Demo',
  'nav.scan': 'Readiness check',
  'nav.platform': 'Platform',
  'nav.about': 'About us',
  'nav.investors': 'Investors',
  'nav.faq': 'FAQ',
  'nav.contact': 'Contact',
  'nav.pricing': 'Pricing',
  'nav.blog': 'Blog',
  'nav.cta': 'Start pilot',
  'nav.menuOpen': 'Open menu',
  'nav.menuClose': 'Close',
  'nav.lang': 'Language',

  'trust.registeredIn': 'Listed in:',

  'investors.hero.eyebrow': 'Investor relations',
  'investors.hero.title': 'Regulation creates a category — we automate compliance for millions of SMBs',
  'investors.hero.lead':
    'DPP-Flash is B2B SaaS for the EU Digital Product Passport: AI extracts data from PDFs, closes supply-chain gaps, and publishes GS1-ready passports with QR codes. We are in pilot with German manufacturers ahead of ESPR enforcement.',
  'investors.hero.badge1': 'Pre-seed / seed',
  'investors.hero.badge2': 'B2B SaaS · DACH',
  'investors.hero.badge3': 'ESPR & battery passport',

  'investors.market.label': 'Market',
  'investors.market.title': 'Mandatory compliance, fragmented data',
  'investors.market.b1':
    'From 2027, ESPR and sector rules (e.g. batteries, textiles) require machine-readable product data — not spreadsheets.',
  'investors.market.b2':
    'Millions of EU manufacturers and importers must comply; enterprise suites do not fit mid-market PDF workflows.',
  'investors.market.b3':
    'Recurring SaaS plus hosting (up to 15 years) aligns with long retention and audit requirements.',
  'investors.stat1.value': '2027',
  'investors.stat1.label': 'Key enforcement window',
  'investors.stat2.value': '2.2M',
  'investors.stat2.label': 'EU companies affected',
  'investors.stat3.value': 'SaaS',
  'investors.stat3.label': 'Published pricing from €79/mo',

  'investors.product.label': 'Product & traction',
  'investors.product.title': 'Live MVP, pilot customers, clear wedge',
  'investors.product.p1.title': 'Automation wedge',
  'investors.product.p1.b1': 'PDF-first ingestion and AI extraction — minutes, not implementation projects',
  'investors.product.p1.b2': 'Validation against regulatory schemas; JSON-LD and GS1-ready output',
  'investors.product.p2.title': 'Go-to-market',
  'investors.product.p2.b1': 'Self-serve tiers and 21-day pilot; content SEO on DPP and ESPR',
  'investors.product.p2.b2': 'Press and startup networks (NRW, Germany-wide)',
  'investors.product.p3.title': 'Roadmap',
  'investors.product.p3.b1': 'Supplier workflows and portfolio scale on the core pipeline',
  'investors.product.p3.b2': 'Product launch aligned with 2027 enforcement',

  'investors.team.label': 'Team',
  'investors.team.title': 'Founders with product, GTM, and engineering',
  'investors.team.lead':
    'Three founders from Cologne — technical CEO, GTM, and CTO. Background in B2B SaaS, startups, and shipping product.',
  'investors.team.link': 'Team & mission',

  'investors.ask.label': 'Investment',
  'investors.ask.title': 'We are talking to aligned angels and seed funds',
  'investors.ask.lead':
    'We share deck, metrics, and pilot learnings under NDA. Focus: EU compliance SaaS, capital-efficient GTM, and product depth in automation.',
  'investors.ask.highlight':
    'Typical use of funds: engineering (supplier workflows, scale), GTM in DACH manufacturing verticals, and compliance certifications.',

  'investors.cta.title': 'Request investor materials',
  'investors.cta.text': 'Email us for deck access or schedule a 30-minute call with the founding team.',
  'investors.cta.primary': 'Request investor materials',
  'investors.cta.secondary': 'View demo',
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
