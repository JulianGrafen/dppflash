import { initPage, setLang, t, getLang } from './i18n-core.js';

const EN = {
  'pricing.nav.home': 'Home',
  'pricing.nav.demo': 'Demo',
  'pricing.nav.platform': 'Platform',
  'pricing.nav.about': 'About us',
  'pricing.nav.pricing': 'Pricing',
  'pricing.nav.contact': 'Contact',
  'nav.lang': 'Language',

  'pricing.hero.eyebrow': 'SaaS · Platform',
  'pricing.hero.title': 'Pricing, published in full.',
  'pricing.hero.lead':
    'Five self-serve tiers from €79/month, each including its full passport allowance. Free 21-day pilot, no setup fees, no per-passport charges inside your plan.',

  'pricing.pilot.text':
    '<strong>Free 21-day pilot</strong> — publish up to 3 real passports. Full Growth features on your own data. No credit card, no setup fee.',
  'pricing.pilot.cta': 'Start free',

  'pricing.billing.label': 'Billing',
  'pricing.billing.monthly': 'Monthly',
  'pricing.billing.annual': 'Annual',
  'pricing.billing.save': '−20%',

  'pricing.perMonth': '/month',
  'pricing.ctaFree': 'Start free',
  'pricing.popular': 'Most popular',
  'pricing.plusMicro': 'Everything in Micro, plus',
  'pricing.plusStarter': 'Everything in Starter, plus',
  'pricing.plusGrowth': 'Everything in Growth, plus',

  'pricing.micro.included': '10 passports included',
  'pricing.micro.tagline': 'First products, single lines, light compliance.',
  'pricing.micro.f1': 'Full passport authoring',
  'pricing.micro.f2': 'QR · GS1 Digital Link',
  'pricing.micro.f3': 'Public resolver · access tiers',
  'pricing.micro.f4': 'Supplier portal included',
  'pricing.micro.f5': 'Evidence vault · EU hosting',
  'pricing.micro.f6': 'Email support',

  'pricing.starter.included': '50 passports included',
  'pricing.starter.tagline': 'Small importers and brands getting the catalogue compliant.',
  'pricing.starter.f1': 'AI document extraction',
  'pricing.starter.f2': 'CSV / XLSX bulk import',
  'pricing.starter.f3': 'Auto-chase supplier sequences',
  'pricing.starter.f4': 'Versioning & audit trail',
  'pricing.starter.f5': 'Basic Compliance Shield',
  'pricing.starter.f6': 'EU Registry submission',

  'pricing.growth.included': '250 passports included',
  'pricing.growth.tagline': 'Growing importers, multi-product brands, battery & textile.',
  'pricing.growth.f1': 'All sector profiles',
  'pricing.growth.f2': 'REST API + webhooks',
  'pricing.growth.f3': 'Reviewer + approver workflow',
  'pricing.growth.f4': 'Full Compliance Shield',
  'pricing.growth.f5': 'Team roles',
  'pricing.growth.f6': 'Priority email + chat',

  'pricing.scale.included': '1,000 passports included',
  'pricing.scale.tagline': 'Serious importers, distributors, battery & electronics.',
  'pricing.scale.f1': 'Advanced supplier risk scoring',
  'pricing.scale.f2': 'Verified supplier profiles',
  'pricing.scale.f3': 'Bulk export CSV + JSON-LD + AAS',
  'pricing.scale.f4': 'SSO (Google, Azure, OIDC)',
  'pricing.scale.f5': 'Priority support & onboarding',

  'pricing.enterprise.desc':
    'Unlimited passports · custom SLA · multi-entity & multi-region · white-label · backup custody · custom integrations.',
  'pricing.enterprise.cta': 'Talk to sales',

  'pricing.footnote':
    'Prices in EUR · Excluding VAT · Free 21-day pilot · No setup fees · Annual billing saves 20%',

  'pricing.flat.kicker': 'Flat pricing',
  'pricing.flat.title': 'Your plan includes its passports.',
  'pricing.flat.lead':
    'No per-passport fees. No setup fees. No minimums. The monthly price is the whole price — every tier includes its full allowance.',

  'pricing.slider.label': 'Passports you need',
  'pricing.table.plan': 'Plan',
  'pricing.table.included': 'Included',
  'pricing.table.monthly': 'Monthly',

  'pricing.paas.kicker': 'PaaS · Managed service',
  'pricing.paas.title': 'Or hand the whole thing to a pod.',
  'pricing.paas.lead':
    'Full platform plus your named compliance pod running the DPP programme. One-time onboarding covers SKU mapping, document intake and the first published batch.',
  'pricing.paas.talk': 'Talk to a pod',
  'pricing.paas.book': 'Book scoping call',

  'pricing.paas.s.title': 'PaaS · Starter',
  'pricing.paas.s.pod': 'Pod · S',
  'pricing.paas.s.onboard': '+ €7,500 onboarding',
  'pricing.paas.s.l1': 'Up to 50 passports · 1 sector',
  'pricing.paas.s.l2': 'Named pod: lead, analyst, supplier liaison',
  'pricing.paas.s.l3': 'Monthly compliance report',
  'pricing.paas.s.l4': 'Platform · Growth tier',

  'pricing.paas.m.title': 'PaaS · Growth',
  'pricing.paas.m.pod': 'Pod · M',
  'pricing.paas.m.onboard': '+ €15,000 onboarding',
  'pricing.paas.m.l1': 'Up to 250 passports · all sectors',
  'pricing.paas.m.l2': 'Weekly stand-ups · on-demand reports',
  'pricing.paas.m.l3': 'Authorised-rep service available',
  'pricing.paas.m.l4': 'Platform · Scale tier',

  'pricing.paas.l.title': 'PaaS · Scale',
  'pricing.paas.l.pod': 'Pod · L',
  'pricing.paas.l.onboard': '+ €30,000 onboarding',
  'pricing.paas.l.l1': 'Up to 750 passports · multi-supplier',
  'pricing.paas.l.l2': 'Senior lead · multi-analyst',
  'pricing.paas.l.l3': 'Custom integrations',
  'pricing.paas.l.l4': '24/5 coverage available',

  'pricing.paas.xl.title': 'PaaS · Enterprise',
  'pricing.paas.xl.pod': 'Pod · XL',
  'pricing.paas.xl.price': '€30k+<small>/month</small>',
  'pricing.paas.xl.onboard': 'from €50,000 onboarding',
  'pricing.paas.xl.l1': '750+ passports · multi-entity',
  'pricing.paas.xl.l2': 'Embedded senior team',
  'pricing.paas.xl.l3': 'Custom MSA · audit access',

  'pricing.addons.kicker': 'Add-ons',
  'pricing.addons.title': 'Useful extras, priced individually.',
  'pricing.addon.gap.title': 'Automated Gap Report',
  'pricing.addon.gap.price': '€99 one-off',
  'pricing.addon.gap.desc':
    'Upload what you have. We map it against mandatory fields — AI-only, no human review.',
  'pricing.addon.desk.title': 'Compliance Desk',
  'pricing.addon.desk.price': '€750 – €15k/month',
  'pricing.addon.desk.desc': 'Document review, supplier chasing, evidence validation, monthly risk report.',
  'pricing.addon.ar.title': 'Authorised representative',
  'pricing.addon.ar.price': '€350/month per entity',
  'pricing.addon.ar.desc': 'For non-EU manufacturers under ESPR and EU 2023/1542.',
  'pricing.addon.seal.title': 'eIDAS qualified seals',
  'pricing.addon.seal.price': '€0.15/seal',
  'pricing.addon.seal.desc': 'Optional EU-qualified e-seal on audit bundles.',

  'pricing.compare.title': 'Full comparison',
  'pricing.compare.feature': 'Feature',
  'pricing.compare.secPass': 'Passports',
  'pricing.compare.passIncluded': 'Passports included (flat)',
  'pricing.compare.unlimited': 'Unlimited',
  'pricing.compare.sectors': 'Sector profiles',
  'pricing.compare.all': 'All',
  'pricing.compare.allCustom': 'All + custom',
  'pricing.compare.gs1': 'GS1 Digital Link QR',
  'pricing.compare.secAi': 'AI & automation',
  'pricing.compare.aiExtract': 'AI document extraction',
  'pricing.compare.api': 'REST API + webhooks',
  'pricing.compare.secSupplier': 'Supplier collaboration',
  'pricing.compare.portal': 'Supplier portal',
  'pricing.compare.chase': 'Auto-chase sequences',
  'pricing.compare.secSupport': 'Support & SLA',
  'pricing.compare.support': 'Support',
  'pricing.compare.email': 'Email',
  'pricing.compare.emailChat': 'Email + chat',
  'pricing.compare.priority': 'Priority',
  'pricing.compare.csm': 'Dedicated CSM',
  'pricing.compare.uptime': 'Uptime SLA',
  'pricing.compare.sso': 'SSO',

  'pricing.faq.title': 'Pricing FAQ',
  'pricing.faq.q1': 'How does DPP-Flash compare to other platforms?',
  'pricing.faq.a1':
    'We benchmark published competitor tiers and price each plan roughly 20% below the closest equivalent, with more included — supplier portal on every plan and AI extraction from Starter.',
  'pricing.faq.q2': 'Is there a free pilot?',
  'pricing.faq.a2': 'Yes — 21 days, up to 3 real passports, full Growth features, no credit card.',
  'pricing.faq.q3': 'Are there per-passport or setup fees?',
  'pricing.faq.a3': 'No. The monthly price covers your plan allowance. No platform setup fee.',
  'pricing.faq.q4': 'Can I move between tiers?',
  'pricing.faq.a4': 'Yes — upgrade or downgrade at the next billing cycle; data and versions stay intact.',
  'pricing.faq.q5': 'Platform or PaaS — which fits?',
  'pricing.faq.a5': 'Self-serve if you have internal capacity. PaaS when a named pod runs mapping, chasing and releases.',

  'pricing.cta.title': 'Start your free 21-day pilot.',
  'pricing.cta.lead': 'No credit card. No setup fee. Growth-tier features — up to 3 real passports on your data.',
  'pricing.cta.demo': 'Interactive demo',

  'pricing.modal.title': 'Start free',
  'pricing.modal.text': 'We welcome pilot and sales enquiries:',
  'pricing.modal.cta': 'kontakt@dppflash.de',
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
