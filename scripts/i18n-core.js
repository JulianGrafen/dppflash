const STORAGE_KEY = 'dppflash-lang';

const defaultContent = new Map();
let enMessages = {};
let currentLang = 'de';

function t(key) {
  if (currentLang === 'de') {
    const entry = defaultContent.get(key);
    return entry?.value ?? key;
  }
  return enMessages[key] ?? defaultContent.get(key)?.value ?? key;
}

function applyToElement(el, value, useHtml) {
  if (useHtml) el.innerHTML = value;
  else el.textContent = value;
}

function cacheDefaults() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (!key || defaultContent.has(key)) return;
    const useHtml = el.hasAttribute('data-i18n-html');
    defaultContent.set(key, {
      value: useHtml ? el.innerHTML : el.textContent.trim(),
      html: useHtml,
    });
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (!key || defaultContent.has(key)) return;
    defaultContent.set(key, { value: el.getAttribute('placeholder') || '', html: false, attr: 'placeholder' });
  });

  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria');
    if (!key || defaultContent.has(key)) return;
    defaultContent.set(key, { value: el.getAttribute('aria-label') || '', html: false, attr: 'aria-label' });
  });

  document.querySelectorAll('[data-i18n-content]').forEach((el) => {
    const key = el.getAttribute('data-i18n-content');
    if (!key || defaultContent.has(key)) return;
    defaultContent.set(key, { value: el.getAttribute('content') || '', html: false, attr: 'content' });
  });

  const titleEl = document.querySelector('title[data-i18n-title]');
  if (titleEl) {
    const key = titleEl.getAttribute('data-i18n-title');
    if (key && !defaultContent.has(key)) {
      defaultContent.set(key, { value: titleEl.textContent.trim(), html: false, target: 'title' });
    }
  }
}

function applyFallingText() {
  const container = document.querySelector('[data-falling-text]:not(.is-active)');
  if (!container) return;

  const textKey = container.getAttribute('data-i18n-falling');
  const highlightKey = container.getAttribute('data-i18n-falling-highlight');
  if (textKey) container.dataset.text = t(textKey);
  if (highlightKey) container.dataset.highlight = t(highlightKey);
}

function applyPage() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const entry = defaultContent.get(key);
    if (!entry) return;
    const value = currentLang === 'de' ? entry.value : enMessages[key] ?? entry.value;
    applyToElement(el, value, entry.html);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    const entry = defaultContent.get(key);
    const value =
      currentLang === 'de' ? entry?.value ?? '' : enMessages[key] ?? entry?.value ?? '';
    el.setAttribute('placeholder', value);
  });

  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria');
    const entry = defaultContent.get(key);
    const value =
      currentLang === 'de' ? entry?.value ?? '' : enMessages[key] ?? entry?.value ?? '';
    el.setAttribute('aria-label', value);
  });

  document.querySelectorAll('[data-i18n-content]').forEach((el) => {
    const key = el.getAttribute('data-i18n-content');
    const entry = defaultContent.get(key);
    const value =
      currentLang === 'de' ? entry?.value ?? '' : enMessages[key] ?? entry?.value ?? '';
    el.setAttribute('content', value);
  });

  const titleEl = document.querySelector('title[data-i18n-title]');
  if (titleEl) {
    const key = titleEl.getAttribute('data-i18n-title');
    document.title = t(key);
  }

  document.querySelectorAll('[data-specular-button][data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const entry = defaultContent.get(key);
    if (!entry) return;
    const value =
      currentLang === 'de' ? entry.value : enMessages[key] ?? entry.value;
    const label = el.querySelector('.specular-button__label');
    if (label) label.textContent = value;
  });

  document.documentElement.lang = currentLang === 'en' ? 'en' : 'de';
  applyFallingText();
  updateLangSwitch();
  window.dispatchEvent(new CustomEvent('dppflash:langchange', { detail: { lang: currentLang } }));
}

function updateLangSwitch() {
  document.querySelectorAll('[data-lang]').forEach((btn) => {
    const active = btn.getAttribute('data-lang') === currentLang;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
}

function detectInitialLang() {
  const param = new URLSearchParams(window.location.search).get('lang');
  if (param === 'en' || param === 'de') return param;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'en' || stored === 'de') return stored;
  return 'de';
}

function setLang(lang) {
  if (lang !== 'de' && lang !== 'en') return;
  currentLang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
  applyPage();
}

function bindLangSwitch() {
  document.querySelectorAll('[data-lang]').forEach((btn) => {
    btn.addEventListener('click', () => setLang(btn.getAttribute('data-lang')));
  });
}

function initPage(messagesEn) {
  enMessages = messagesEn || {};
  cacheDefaults();
  bindLangSwitch();
  currentLang = detectInitialLang();
  if (currentLang === 'en') applyPage();
  else updateLangSwitch();
}

function getLang() {
  return currentLang;
}

export { initPage, setLang, t, getLang };
