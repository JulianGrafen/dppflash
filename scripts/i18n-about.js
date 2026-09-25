import { initPage, setLang, t, getLang } from './i18n-core.js';

const EN = {
  'about.meta.title': 'About us — DPP-Flash team & mission',
  'about.meta.description':
    'Meet the DPP-Flash team: mission, founders, and technology for automated Digital Product Passports in Europe.',

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

  'trust.knownFrom': 'Known from:',
  'trust.registeredIn': 'Listed in:',
  'footer.mentionedBy': 'Also mentioned by',

  'about.hero.eyebrow': 'Company',
  'about.hero.title': 'We automate the Digital Product Passport for European manufacturers',
  'about.hero.lead':
    'DPP-Flash is an AI-powered platform that extracts compliance data from documents, surfaces gaps in the supply chain, and produces scannable, updatable product passports — from PDF to QR code, with connections to your existing systems.',
  'about.hero.badge1': 'Kall, DE',
  'about.hero.badge2': 'B2B SaaS',
  'about.hero.badge3': 'ESPR & battery passport',

  'about.why.label': 'Why we exist',
  'about.why.title': 'Regulation meets fragmented data',
  'about.why.b1':
    'The EU Ecodesign Regulation and Digital Product Passport require machine-readable material, supplier and sustainability data from millions of manufacturers.',
  'about.why.b2':
    'In practice, compliance teams spend hundreds of hours chasing suppliers via email and PDF forms.',
  'about.why.b3':
    'DPP-Flash is an automated pipeline — not another dashboard — that uses existing documents and systematically closes missing information.',
  'about.why.b4':
    'Focus on Europe; also for globally operating companies selling into the EU. The pilot phase is refined with decision-makers in Germany.',

  'about.product.label': 'What we build',
  'about.product.title': 'From document to compliant product passport',
  'about.product.p1.title': 'Data from documents',
  'about.product.p1.b1': 'AI extraction from PDFs, certificates and supplier declarations',
  'about.product.p1.b2': 'Validation against regulatory schemas instead of manual retyping',
  'about.product.p2.title': 'Close the supply chain',
  'about.product.p2.b1': 'Missing fields are detected',
  'about.product.p2.b2': 'Workflows for supplier and manufacturer data in active development',
  'about.product.p2.b3': 'MVP: core path documents → structured passport',
  'about.product.p3.title': 'Publish the passport',
  'about.product.p3.b1': 'GS1-compliant links and JSON-LD',
  'about.product.p3.b2': 'Up to 15 years of hosting, audit-ready',
  'about.product.p3.b3': 'Prepared for ESPR requirements and the QR code on the product',

  'about.diff.label': 'Our approach',
  'about.diff.title': 'Automation instead of implementation projects',
  'about.diff.lead':
    'The Digital Product Passport market includes established providers such as Circularise, Spherity and iPoint. We add a different emphasis:',
  'about.diff.l1':
    'Full automation for SMBs: PDF-first, little IT expertise, fast onboarding.',
  'about.diff.l2':
    'AI identifies missing data and prepares structured passports — not just a data layer.',
  'about.diff.l3':
    'Millions of companies in the EU are affected; manual audits do not scale across thousands of SKUs.',

  'about.team.label': 'Founding team',
  'about.team.title': 'Three founders, one product vision',
  'about.team.julian.role': 'CEO · Technical founder',
  'about.team.julian.loc': 'Kall, North Rhine-Westphalia',
  'about.team.julian.b1':
    'In the startup scene since 2020: B2B and B2C SaaS, e-commerce as a self-employed founder',
  'about.team.julian.b2': 'Member of Entrepreneurs Club Cologne',
  'about.team.julian.b3':
    'MSc in business administration (Koblenz University of Applied Sciences), BSc Code & Context (TH Köln)',
  'about.team.julian.b4': 'Product and architecture at DPP-Flash since April 2026',
  'about.team.nico.role': 'CEO & CMO · Go-to-market',
  'about.team.nico.loc': 'Bergheim, North Rhine-Westphalia',
  'about.team.nico.b1': 'Strategy, marketing and EU compliance positioning',
  'about.team.nico.b2':
    'Finalist Gründerwettbewerb Nordhessen 2026, Entrepreneur Awards Automotive Technology category',
  'about.team.nico.b3':
    'Previously e-commerce and publishing projects focused on scale and B2B outreach',
  'about.team.nick.role': 'CTO · Software engineering',
  'about.team.nick.loc': 'Idar-Oberstein, Rhineland-Palatinate',
  'about.team.nick.b1': 'Leads engineering',
  'about.team.nick.b2':
    'Previously backend and CMS v2 at karriere tutor (TypeScript, Express, PostgreSQL), SAP',
  'about.team.nick.b3':
    'Co-founder of Ribir (Flutter, 7 restaurant partners, 400+ ordering users)',
  'about.team.nick.b4': 'Focus: maintainable architecture and data-heavy products',
  'about.team.linkedin': 'LinkedIn',
  'about.team.collab.title': 'How we work together',
  'about.team.collab.b1':
    'Julian and Nico met via LinkedIn — building product and go-to-market in person since',
  'about.team.collab.b2': 'Nick as CTO via video and daily async channels',
  'about.team.collab.b3':
    'Code only by founders: Nick as lead developer, Julian on architecture and product',

  'about.tech.label': 'Technology',
  'about.tech.title': 'Stack & AI',
  'about.tech.l1': 'Backend in Python and TypeScript',
  'about.tech.l2': 'Hosting: Vercel, application logic on Render, Supabase database',
  'about.tech.l3':
    'AI extraction via Azure OpenAI; agentic workflows for data collection and validation',

  'about.milestones.label': 'Milestones',
  'about.milestones.title': 'Where we are',
  'about.milestones.m1.when': '2026',
  'about.milestones.m1.what':
    'Working MVP; expanding supplier workflows and pilot conversations with companies in Germany.',
  'about.milestones.m2.when': 'Early 2027',
  'about.milestones.m2.what': 'Planned product launch aligned with regulatory enforcement.',
  'about.milestones.m3.when': 'Recognition',
  'about.milestones.m3.what':
    'Gründerwettbewerb Nordhessen (finalist), Entrepreneur Awards Automotive Technology; Ribir launch with measurable user base (Nick).',

  'about.cta.title': 'Get to know us',
  'about.cta.text': 'Try the interactive demo or start a conversation about the pilot phase.',
  'about.cta.demo': 'View demo',
  'about.cta.contact': 'Contact us',
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
