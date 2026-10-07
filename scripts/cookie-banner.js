const STORAGE_KEY = 'dpp_cookie_notice_v1';

const FALLBACK = {
  de: {
    title: 'Wir verwenden erforderliche Cookies 🍪',
    body:
      'Wir verwenden ausschließlich technisch erforderliche Cookies, die für den sicheren und zuverlässigen Betrieb von DPP-Flash notwendig sind. Diese Cookies können nicht deaktiviert werden.',
    privacyLead: 'Weitere Informationen finden Sie in unserer',
    privacyLink: 'Datenschutzerklärung',
    accept: 'Verstanden',
  },
  en: {
    title: 'We use essential cookies 🍪',
    body:
      'We only use technically essential cookies required for the secure and reliable operation of DPP-Flash. These cookies cannot be disabled.',
    privacyLead: 'For more information, see our',
    privacyLink: 'Privacy policy',
    accept: 'Got it',
  },
};

function getLang() {
  const fromI18n = window.DppI18n?.getLang?.();
  if (fromI18n === 'en' || fromI18n === 'de') return fromI18n;
  const html = document.documentElement.lang?.slice(0, 2)?.toLowerCase();
  return html === 'en' ? 'en' : 'de';
}

function t(key, lang) {
  const i18nKey = `cookie.${key}`;
  const fromI18n = window.DppI18n?.t?.(i18nKey);
  if (fromI18n && fromI18n !== i18nKey) return fromI18n;
  return FALLBACK[lang]?.[key] ?? FALLBACK.de[key];
}

function privacyHref() {
  const path = window.location.pathname || '/';
  if (path.includes('/blog/') && !path.startsWith('/blog/')) {
    return '/datenschutz.html';
  }
  return '/datenschutz.html';
}

function initCookieBanner() {
  try {
    if (localStorage.getItem(STORAGE_KEY) === '1') return;
  } catch {
    /* private mode */
  }

  const lang = getLang();

  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.id = 'cookieBanner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-modal', 'false');
  banner.setAttribute('aria-labelledby', 'cookieBannerTitle');
  banner.setAttribute('aria-describedby', 'cookieBannerDesc');

  const inner = document.createElement('div');
  inner.className = 'cookie-banner__inner';

  const copy = document.createElement('div');
  copy.className = 'cookie-banner__copy';

  const title = document.createElement('p');
  title.className = 'cookie-banner__title';
  title.id = 'cookieBannerTitle';
  title.textContent = t('title', lang);

  const desc = document.createElement('p');
  desc.className = 'cookie-banner__text';
  desc.id = 'cookieBannerDesc';
  desc.textContent = t('body', lang);

  const privacy = document.createElement('p');
  privacy.className = 'cookie-banner__text cookie-banner__privacy';
  const link = document.createElement('a');
  link.href = privacyHref();
  link.className = 'cookie-banner__link';
  link.textContent = t('privacyLink', lang);
  privacy.append(`${t('privacyLead', lang)} `, link, '.');

  copy.append(title, desc, privacy);

  const accept = document.createElement('button');
  accept.type = 'button';
  accept.className = 'cookie-banner__accept btn-faq-primary';
  accept.textContent = t('accept', lang);

  inner.append(copy, accept);
  banner.appendChild(inner);
  document.body.appendChild(banner);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
    banner.classList.remove('is-visible');
    banner.classList.add('is-hidden');
    window.setTimeout(() => banner.remove(), 320);
  }

  accept.addEventListener('click', dismiss);

  requestAnimationFrame(() => {
    banner.classList.add('is-visible');
  });
}

function boot() {
  initCookieBanner();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
