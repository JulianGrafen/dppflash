import { mountPillNav } from './pill-nav.js';

const NAV_ITEMS = [
  { href: '/', label: 'Start', i18n: 'nav.home' },
  { href: '/#vorteile', label: 'Vorteile', i18n: 'nav.benefits' },
  { href: '/plattform/ingestion/', label: 'Plattform', i18n: 'nav.platform' },
  { href: '/experience.html', label: 'Demo', i18n: 'nav.demo' },
  { href: '/scan.html', label: 'Readiness-Check', i18n: 'nav.scan' },
  { href: '/ueber-uns/', label: 'Über uns', i18n: 'nav.about' },
  { href: '/#faq', label: 'Häufige Fragen', i18n: 'nav.faq' },
  { href: '/#kontakt', label: 'Kontakt', i18n: 'nav.contact' },
  { href: '/pricing/', label: 'Preise', i18n: 'nav.pricing' },
  { href: '/blog/', label: 'Blog', i18n: 'nav.blog' },
];

function normalizeHref(href) {
  try {
    const url = new URL(href, window.location.origin);
    let path = url.pathname;
    if (path.endsWith('/index.html')) {
      path = path.slice(0, -'/index.html'.length) || '/';
    }
    if (path !== '/' && !path.endsWith('/')) path += '/';
    return path + url.hash;
  } catch {
    return href;
  }
}

function resolveActiveHref() {
  const current = normalizeHref(window.location.pathname + window.location.hash);
  const exact = NAV_ITEMS.find((item) => normalizeHref(item.href) === current);
  if (exact) return exact.href;

  const path = window.location.pathname;
  if (path.startsWith('/blog')) return '/blog/';
  if (path.startsWith('/plattform')) return '/plattform/ingestion/';
  if (path.startsWith('/ueber-uns')) return '/ueber-uns/';
  if (path.startsWith('/pricing')) return '/pricing/';
  if (path.endsWith('experience.html')) return '/experience.html';
  if (path.endsWith('scan.html')) return '/scan.html';
  if (path === '/' || path === '/index.html') return '/';
  return current;
}

function langSwitchMarkup() {
  return `
    <div class="site-header-lang" role="group" data-i18n-aria="nav.lang" aria-label="Sprache">
      <div class="lang-switch">
        <button type="button" class="lang-switch-btn is-active" data-lang="de" aria-pressed="true">DE</button>
        <button type="button" class="lang-switch-btn" data-lang="en" aria-pressed="false">EN</button>
      </div>
    </div>
  `;
}

export function mountSiteNav() {
  const header = document.getElementById('siteHeader');
  if (!header || header.dataset.navMounted === 'true') return;

  const withLang = header.hasAttribute('data-lang-switch');
  const mount = document.createElement('div');
  mount.className = 'site-header-pill';
  if (withLang) mount.innerHTML = langSwitchMarkup();
  const pillRoot = document.createElement('div');
  pillRoot.className = 'site-header-pill__nav';
  pillRoot.id = 'pillNavMount';
  mount.append(pillRoot);
  header.append(mount);
  header.dataset.navMounted = 'true';

  mountPillNav(pillRoot, {
    logo: '/assets/logo-dpp-flash-nav.png',
    logoAlt: 'DPP-Flash',
    logoWordmark: true,
    items: NAV_ITEMS,
    activeHref: resolveActiveHref(),
    className: 'pill-nav--dpp',
    ease: 'power2.easeOut',
    baseColor: '#0a1628',
    pillColor: '#eef3fb',
    hoveredPillTextColor: '#eef3fb',
    pillTextColor: '#0a1628',
    initialLoadAnimation: false,
    skipFirstInDesktopList: true,
    ariaLabel: 'Hauptnavigation',
  });
}

function boot() {
  mountSiteNav();
  window.dispatchEvent(new CustomEvent('dppflash:navready'));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
