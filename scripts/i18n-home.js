import { initPage, setLang, t, getLang } from './i18n-core.js';

const EN = {
  'meta.title': 'DPP Solution for SMBs | Digital Product Passport in 5 Min.',
  'meta.description':
    'Digital Product Passport for SMBs: ESPR-compliant, AI-powered, 5 min setup. Upload PDFs → generate QR code. 15 years hosting.',

  'nav.main': 'Main navigation',
  'nav.benefits': 'Benefits',
  'nav.demo': 'Demo',
  'nav.scan': 'Readiness check',
  'nav.platform': 'Platform',
  'nav.about': 'About us',
  'nav.faq': 'FAQ',
  'nav.contact': 'Contact',
  'nav.pricing': 'Pricing',
  'nav.blog': 'Blog',
  'nav.menuOpen': 'Open menu',
  'nav.menuClose': 'Close',
  'nav.lang': 'Language',

  'hero.title':
    'EU-Compliant <span class="hero-title-accent">DPP Compliance</span><br>Solution in 5 Minutes',
  'hero.subtitle':
    'Create a legally compliant Digital Product Passport: product passport QR code with link hosting in 5 minutes. <br>15 years secure hosting | ESPR-compliant | AI-powered | No IT infrastructure',
  'hero.cardTitle': 'Start your free pilot phase',
  'hero.cardText':
    'Try DPP-Flash with no obligation — ESPR-compliant, in 5 minutes, no IT expertise required.',
  'hero.cta': 'Become a pilot customer',
  'hero.pressLabel': 'Featured in',
  'footer.mentionedBy': 'Also mentioned by',

  'timer.title': 'Battery passport mandatory',
  'timer.date': '18 February 2027',
  'timer.days': 'Days',
  'timer.hours': 'Hours',
  'timer.min': 'Min.',
  'timer.expired': 'Mandatory now',

  'about.label': 'WHY DPP-FLASH',
  'about.heading': 'Digital Product Passport made simple — no IT expertise.',
  'about.intro':
    'Legally sound, ESPR-compliant, and ready in 5 minutes — no IT skills, no spreadsheets. DPP-Flash automates the entire process for SMBs.',
  'about.step1.title': 'AI data extraction',
  'about.step1.text':
    'Upload PDFs or connect your existing database to DPP-Flash. Our AI reads all relevant product data and validates it against machine-readable standards.',
  'about.step2.title': 'Quick confirmation',
  'about.step2.text':
    'Confirm extracted data in minutes. No manual entry, fewer errors — review and go.',
  'about.step3.title': 'Product passport QR code',
  'about.step3.text':
    'Get a compliant product passport QR code with 15 years of hosting immediately. Archived in line with the ESPR regulation.',

  'compliance.panel0.badge': 'Critical',
  'compliance.panel0.title': 'Compliance risk without a DPP',
  'compliance.panel0.text':
    'Products without a valid Digital Product Passport are considered non-compliant. That can mean immediate sales bans across the EU, customs seizures, and contract risks.',
  'compliance.panel0.li1': 'Sales bans in the EU',
  'compliance.panel0.li2': 'Customs seizures',
  'compliance.panel0.li3': 'Fines up to 4% of annual turnover',

  'compliance.panel1.badge': 'Problem',
  'compliance.panel1.title': 'Excel & manual checks are not enough',
  'compliance.panel1.text':
    'A spreadsheet does not meet regulatory requirements. What matters is end-to-end data, audit-proof archiving, and machine-readable formats.',
  'compliance.panel1.li1': 'JSON-LD and GS1 standards required',
  'compliance.panel1.li2': '15 years of audit-proof archiving',
  'compliance.panel1.li3': 'Hundreds of supplier PDFs — unrealistic for SMBs',

  'compliance.panel2.badge': 'Solution',
  'compliance.panel2.title': 'The DPP-Flash solution',
  'compliance.panel2.text':
    'AI automatically extracts data from PDFs or your database, validates machine-readable standards, and creates a compliant product passport QR code in minutes.',
  'compliance.panel2.li1': 'No additional IT infrastructure',
  'compliance.panel2.li2': 'ESPR-compliant & audit-proof',
  'compliance.panel2.li3': '15 years of secure hosting included',

  'compliance.label': 'Regulation',
  'compliance.heading':
    'Digital Product Passport requirement: <em class="compliance-heading-accent">why you need to act now</em>',
  'compliance.intro':
    'Binding requirements apply from 2027. The <strong>ESPR regulation</strong> and the new <strong>Battery Regulation</strong> take effect.',

  'compliance.step0.title': 'Compliance risk without a DPP',
  'compliance.step0.desc': 'Sales bans, customs seizures, fines up to 4% of annual turnover.',
  'compliance.step1.title': 'Excel & manual checks',
  'compliance.step1.desc': 'JSON-LD, GS1, and hundreds of supplier PDFs — unrealistic for SMBs.',
  'compliance.step2.title': 'The DPP-Flash solution',
  'compliance.step2.desc': 'AI extracts, validates, and creates a compliant QR code in minutes.',
  'compliance.stepsLabel': 'DPP compliance steps',

  'complianceFall.static': 'Without a digital product passport… ',
  'complianceFall.falling': 'your compliance collapses from 2027.',
  'complianceFall.highlight': 'compliance,2027',

  'how.title': 'How DPP-Flash creates your Digital Product Passport',
  'how.subtitle': 'Your compliant QR code in 3 simple steps',
  'how.stepsAria': 'How DPP-Flash creates your Digital Product Passport',

  'how.step1.mock.db': 'ERP database',
  'how.step1.mock.connected': 'Connected',
  'how.step1.mock.data': 'Product data',
  'how.step1.mock.sync': 'In sync',
  'how.step1.mock.espr': 'ESPR validation',
  'how.step1.mock.active': 'Active',
  'how.step1.title': 'Connect your database',
  'how.step1.text':
    'DPP-Flash automatically pulls data from your existing database and validates it against machine-readable standards.',

  'how.step2.mock.pdf': 'PDF / delivery note',
  'how.step2.mock.json': 'JSON-LD dataset',
  'how.step2.mock.sku': 'Article number',
  'how.step2.mock.gs1': 'GS1-compliant',
  'how.step2.mock.supplier': 'Supplier data',
  'how.step2.mock.validated': 'Validated',
  'how.step2.title': 'AI extracts & validates data',
  'how.step2.text':
    'Intelligent extraction from PDFs and specs — automatic checks against JSON-LD and GS1.',

  'how.step3.mock.ready': 'Product passport ready',
  'how.step3.mock.live': 'Live',
  'how.step3.mock.qr': 'QR code',
  'how.step3.mock.generated': 'Generated',
  'how.step3.mock.archive': 'Archiving',
  'how.step3.mock.espr': 'ESPR-compliant',
  'how.step3.mock.hosting': 'Hosting',
  'how.step3.mock.years': '15 years',
  'how.step3.title': 'QR code & 15 years hosting',
  'how.step3.text':
    'Get your compliant product passport QR code immediately with audit-proof archiving for 15 years.',
  'how.step3.cta': 'Get started',

  'benefits.title': 'Why DPP-Flash?',
  'benefits.intro': 'Four good reasons DPP-Flash is the best choice for your Digital Product Passport.',
  'benefits.badge.germany': 'Made in Germany',
  'benefits.badge.gdpr': 'GDPR compliant',

  'benefits.card1.title': 'Legally sound',
  'benefits.card1.desc': 'ESPR-compliant and audit-proof for 15 years. Full compliance evidence.',
  'benefits.card2.title': 'Fast & simple',
  'benefits.card2.desc': 'Create a Digital Product Passport in 5 minutes. No IT skills required.',
  'benefits.card3.title': 'AI-powered',
  'benefits.card3.desc': 'Automatic extraction from PDFs. Accurate, low-error, with confirmation.',
  'benefits.card4.title': 'Long-term hosting',
  'benefits.card4.desc': '15 years of secure storage. Audit-proof archive, always accessible.',

  'contact.title': 'Free pilot phase: Digital Product Passport for SMBs',
  'contact.intro':
    'Interested in DPP-Flash? Send us a short message — we will get back to you soon for a no-obligation call.',
  'contact.name': 'Name *',
  'contact.namePlaceholder': 'Your name',
  'contact.email': 'Email *',
  'contact.emailPlaceholder': 'name@company.com',
  'contact.company': 'Company',
  'contact.companyPlaceholder': 'Company (optional)',
  'contact.message': 'Message *',
  'contact.messagePlaceholder': 'What is it about? e.g. industry, number of products, timeline',
  'contact.submit': 'Send request',
  'contact.note': 'Alternatively:',
  'contact.sent':
    'Thank you! Your request has been sent. We will get back to you shortly.',

  'faq.title': 'FAQ: Digital Product Passport & DPP-Flash',
  'faq.intro':
    'Short answers on the ESPR regulation, DPP software, and practical steps for SMBs.',
  'faq.ctaPrimary': 'Start for free',
  'faq.ctaGhost': 'Contact us',
  'faq.q1': 'Is the Digital Product Passport ESPR-compliant?',
  'faq.a1':
    'Yes. DPP-Flash helps SMBs meet ESPR requirements and provides audit-proof storage for 15 years as evidence.',
  'faq.q2': 'How does AI data extraction work?',
  'faq.a2':
    'Upload PDFs and delivery notes; our AI extracts relevant product data. You confirm results in review — usually done in 5 minutes.',
  'faq.q3': 'Do I need my own IT department?',
  'faq.a3':
    'No. DPP-Flash is easy-to-use Digital Product Passport software and requires no IT expertise.',
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
