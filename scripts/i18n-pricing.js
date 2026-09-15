import { initPage, setLang, t, getLang } from './i18n-core.js';

const EN = {
  'pricing.nav.home': 'Home',
  'pricing.nav.pricing': 'Pricing',
  'pricing.nav.contact': 'Contact',
  'nav.lang': 'Language',

  'pricing.title': 'Transparent pricing for every business',
  'pricing.subtitle':
    'Choose the plan that fits your needs. All plans include the legally required 15-year QR code data persistence with link hosting (ESPR-compliant). Transparent scaling: each additional product passport (SKU) from €0.20.',

  'pricing.starter.desc': 'For small manufacturers & startups',
  'pricing.starter.f1': 'Ideal for small manufacturers & startups.',
  'pricing.starter.f2': 'Up to 50 active product passports (SKUs)',
  'pricing.starter.f3': 'AI-powered PDF data extraction',
  'pricing.starter.f4': '15 years of compliant hosting',
  'pricing.starter.f5': 'Email support',
  'pricing.starter.cta': 'Secure pilot access',

  'pricing.scale.desc': 'For growing mid-market companies',
  'pricing.scale.f1': 'Up to 500 active product passports (SKUs)',
  'pricing.scale.f2': 'Bulk upload & auto-fill',
  'pricing.scale.f3': 'White-label view with your logo on the passport',
  'pricing.scale.f4': 'Priority support & accelerated onboarding',
  'pricing.scale.f5': 'ESPR-compliant validation & audit logs',
  'pricing.scale.cta': 'Reserve waitlist spot',

  'pricing.enterprise.desc': 'For large suppliers with high volume',
  'pricing.enterprise.f1': 'Unlimited product passports & 99.9% uptime SLA',
  'pricing.enterprise.f2': 'Direct ERP/API integration',
  'pricing.enterprise.f3': 'Dedicated compliance advisor',
  'pricing.enterprise.cta': 'Contact sales',

  'pricing.period': '/month',
  'pricing.modal.title': 'Welcome!',
  'pricing.modal.text': 'We are looking for companies for the DPP-Flash pilot phase:',
  'pricing.modal.cta': 'Get in touch at: kontakt@dppflash.de',
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
