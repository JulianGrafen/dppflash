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
  'about.why.p1':
    'The EU Ecodesign Regulation and Digital Product Passport force millions of manufacturers to provide material, supplier and sustainability data in machine-readable form. In practice, compliance teams spend hundreds of hours chasing suppliers via email and PDF forms.',
  'about.why.p2':
    'We founded DPP-Flash because manufacturers do not need another dashboard layer — they need an automated pipeline that uses existing documents and systematically closes missing information.',
  'about.why.p3':
    'We focus on the European market; the product also serves globally operating companies selling into the EU. Conversations with decision-makers in Germany shape the platform during our pilot phase.',

  'about.product.label': 'What we build',
  'about.product.title': 'From document to compliant product passport',
  'about.product.p1.title': 'Data from documents',
  'about.product.p1.text':
    'AI extraction from PDFs, certificates and supplier declarations — validated against regulatory schemas instead of manual retyping.',
  'about.product.p2.title': 'Close the supply chain',
  'about.product.p2.text':
    'Missing fields are detected; workflows for supplier and manufacturer data are in active development. Our MVP covers the core path documents → structured passport.',
  'about.product.p3.title': 'Publish the passport',
  'about.product.p3.text':
    'GS1-compliant links, JSON-LD and up to 15 years of hosting — audit-ready for ESPR requirements and the QR code on the product.',

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
  'about.team.julian.bio':
    'Master in business administration (Koblenz University of Applied Sciences), BSc Code & Context (TH Köln). Building product and architecture since April 2026. Social media & design at RTL VOX Automobil.',
  'about.team.nico.role': 'CEO & CMO · Go-to-market',
  'about.team.nico.loc': 'Bergheim, North Rhine-Westphalia',
  'about.team.nico.bio':
    'Responsible for strategy, marketing and EU compliance positioning. Finalist Gründerwettbewerb Nordhessen 2026, Entrepreneur Awards Automotive Technology category. Previously e-commerce and publishing projects focused on scale and B2B outreach.',
  'about.team.nick.role': 'CTO · Software engineering',
  'about.team.nick.loc': 'Idar-Oberstein, Rhineland-Palatinate',
  'about.team.nick.bio':
    'Leads engineering. Previously backend and CMS v2 at karriere tutor (TypeScript, Express, PostgreSQL), SAP, co-founder of Ribir (Flutter, 7 restaurant partners, 400+ ordering users). Focused on maintainable architecture and data-heavy products.',
  'about.team.linkedin': 'LinkedIn',
  'about.team.collab.title': 'How we work together',
  'about.team.collab.text':
    'Julian and Nico met via LinkedIn and have been building product and go-to-market in person since. Nick joined as CTO remotely via video and daily async channels. Only founders write code — Nick as lead developer, Julian supporting architecture and product.',

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
