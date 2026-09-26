import { initPage, setLang, t, getLang } from './i18n-core.js';
import { SCAN_EN } from './scan-messages.js';

const EN = {
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
  ...SCAN_EN,
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
