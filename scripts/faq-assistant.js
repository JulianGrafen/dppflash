import { composeSmartAnswer } from './faq-compose.mjs';

const KNOWLEDGE_URL = '/assets/faq-knowledge.json';
const META_API = 'dpp-faq-chat-api';

const UI_KEYS = {
  title: 'faq.chat.title',
  disclaimer: 'faq.chat.disclaimer',
  placeholder: 'faq.chat.placeholder',
  send: 'faq.chat.send',
  thinking: 'faq.chat.thinking',
  noAnswer: 'faq.chat.noAnswer',
  error: 'faq.chat.error',
  intro: 'faq.chat.intro',
  suggest1: 'faq.chat.suggest1',
  suggest2: 'faq.chat.suggest2',
  suggest3: 'faq.chat.suggest3',
  typewriter: 'faq.chat.typewriter',
};

function startTypewriterPlaceholder(input) {
  let timer = null;
  let charIndex = 0;
  let deleting = false;

  const TYPE_MS = 58;
  const DELETE_MS = 32;
  const PAUSE_DONE_MS = 2400;
  const PAUSE_EMPTY_MS = 500;

  function phrase() {
    return t(UI_KEYS.typewriter, getLang() === 'en' ? 'Ask something' : 'Fragen Sie etwas');
  }

  function shouldAnimate() {
    return document.activeElement !== input && !input.value.trim();
  }

  function setPlaceholder(text) {
    input.placeholder = text;
  }

  function stop() {
    if (timer) clearTimeout(timer);
    timer = null;
  }

  function step() {
    if (!shouldAnimate()) {
      timer = setTimeout(step, 400);
      return;
    }

    const full = phrase();
    if (!deleting) {
      if (charIndex < full.length) {
        charIndex += 1;
        setPlaceholder(full.slice(0, charIndex));
        timer = setTimeout(step, TYPE_MS);
        return;
      }
      timer = setTimeout(() => {
        deleting = true;
        step();
      }, PAUSE_DONE_MS);
      return;
    }

    if (charIndex > 0) {
      charIndex -= 1;
      setPlaceholder(full.slice(0, charIndex));
      timer = setTimeout(step, DELETE_MS);
      return;
    }

    deleting = false;
    timer = setTimeout(step, PAUSE_EMPTY_MS);
  }

  function start() {
    stop();
    charIndex = 0;
    deleting = false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPlaceholder(phrase());
      return;
    }
    setPlaceholder('');
    step();
  }

  input.addEventListener('focus', () => {
    stop();
    setPlaceholder('');
  });

  input.addEventListener('blur', () => {
    if (!input.value.trim()) start();
  });

  start();
  return { start, stop };
}

function t(key, fallback) {
  return window.DppI18n?.t(key) ?? fallback;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** `**fett**` → <strong> (LLM-Antworten ohne sichtbare Sternchen) */
function faqAnswerToHtml(text) {
  return escapeHtml(text).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

function setBubbleAnswer(bubble, text) {
  if (!text || !/\*\*[^*]+\*\*/.test(text)) {
    bubble.textContent = text ?? '';
    return;
  }
  bubble.innerHTML = faqAnswerToHtml(text);
}

function getLang() {
  return window.DppI18n?.getLang?.() ?? document.documentElement.lang?.slice(0, 2) ?? 'de';
}

function getApiEndpoint() {
  const fromGlobal =
    globalThis.DPP_FAQ_API_URL?.trim() || globalThis.DPP_FAQ_WORKER_URL?.trim();
  if (fromGlobal) return fromGlobal;

  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get('faqApi')?.trim();
  if (fromQuery) return fromQuery;

  try {
    const stored = sessionStorage.getItem('dpp_faq_api')?.trim();
    if (stored) return stored;
  } catch {
    /* ignore */
  }

  const meta = document.querySelector(`meta[name="${META_API}"]`);
  const fromMeta = meta?.getAttribute('content')?.trim();
  if (fromMeta) return fromMeta;
  return '';
}

function normalizeApiUrl(endpoint) {
  const base = endpoint.replace(/\/$/, '');
  if (base.endsWith('/api/faq-chat')) return base;
  return base;
}

function isWeakFaqApiAnswer(text, question) {
  if (!text) return true;
  const lower = text.toLowerCase();
  const q = question.toLowerCase();
  if (
    lower.includes('keine sichere antwort') ||
    lower.includes('keine eindeutige') ||
    lower.includes('bereitgestellten kontext') ||
    lower.includes('could not find a reliable') ||
    lower.includes('no reliable answer')
  ) {
    return true;
  }
  if (
    (q.includes('gründer') || q.includes('gruender') || q.includes('founder')) &&
    (lower.includes('rechtssicher') || lower.includes('espr verordnung')) &&
    !lower.includes('julian') &&
    !lower.includes('nico')
  ) {
    return true;
  }
  return false;
}

async function fetchApiAnswer(question, lang) {
  const endpoint = getApiEndpoint();
  if (!endpoint) return null;

  const res = await fetch(normalizeApiUrl(endpoint), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ question, lang }),
  });

  if (!res.ok) {
    if (res.status === 429) throw new Error('rate_limit');
    return null;
  }

  const data = await res.json();
  return data?.answer?.trim() || null;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function appendMessage(log, role, text, options = {}) {
  const row = el('div', `faq-item__ai-turn faq-item__ai-turn--${role}`);
  if (options.intro) row.classList.add('faq-item__ai-turn--intro');
  const bodyClass =
    role === 'user'
      ? 'faq-item__ai-q'
      : `faq-item__ai-a${options.intro ? ' faq-item__ai-a--intro' : ''}`;
  const body = el('p', bodyClass, text);
  row.appendChild(body);
  log.appendChild(row);
  log.scrollTop = log.scrollHeight;
  return row;
}

function messageBody(row) {
  return row?.querySelector('.faq-item__ai-q, .faq-item__ai-a');
}

function setLoading(row, on) {
  row?.classList.toggle('faq-item__ai-turn--loading', on);
}

async function loadKnowledge() {
  const res = await fetch(KNOWLEDGE_URL, { credentials: 'same-origin' });
  if (!res.ok) throw new Error('knowledge');
  return res.json();
}

function bindSuggestions(root, onAsk) {
  root.querySelectorAll('[data-faq-suggest]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const q = btn.getAttribute('data-faq-suggest') || btn.textContent.trim();
      onAsk(q);
    });
  });
}

function initFaqAssistant() {
  const section = document.getElementById('faq');
  if (!section) return;

  const host = section.querySelector('.faq-list');
  if (!host || document.getElementById('faqAssistant')) return;

  const lang = getLang();

  const assistant = el('details', 'faq-item faq-item--ai');
  assistant.id = 'faqAssistant';

  const summary = el('summary');
  const input = el('input', 'faq-item__ai-input');
  input.type = 'text';
  input.id = 'faqChatInput';
  input.name = 'question';
  input.autocomplete = 'off';
  input.maxLength = 500;
  input.placeholder = '';
  input.setAttribute(
    'aria-label',
    t(UI_KEYS.title, 'Frag den DPP-Flash Assistenten'),
  );
  summary.appendChild(input);
  assistant.appendChild(summary);

  const panel = el('div', 'faq-item__ai-panel');
  panel.id = 'faqAssistantPanel';

  const log = el('div', 'faq-assistant__log');
  log.id = 'faqChatLog';
  log.setAttribute('role', 'log');
  log.setAttribute('aria-live', 'polite');
  log.setAttribute('aria-relevant', 'additions');
  panel.appendChild(log);

  const suggestions = el('div', 'faq-cta faq-item__ai-suggestions');
  const s1 = el('button', 'btn-faq-ghost');
  s1.type = 'button';
  s1.setAttribute('data-faq-suggest', t(UI_KEYS.suggest1, 'Was kostet DPP-Flash?'));
  s1.textContent = t(UI_KEYS.suggest1, 'Was kostet DPP-Flash?');
  const s2 = el('button', 'btn-faq-ghost');
  s2.type = 'button';
  s2.setAttribute('data-faq-suggest', t(UI_KEYS.suggest2, 'Ab wann ist der DPP Pflicht?'));
  s2.textContent = t(UI_KEYS.suggest2, 'Ab wann ist der DPP Pflicht?');
  const s3 = el('button', 'btn-faq-ghost');
  s3.type = 'button';
  s3.setAttribute('data-faq-suggest', t(UI_KEYS.suggest3, 'Wie funktioniert die KI-Extraktion?'));
  s3.textContent = t(UI_KEYS.suggest3, 'Wie funktioniert die KI-Extraktion?');
  suggestions.append(s1, s2, s3);
  panel.appendChild(suggestions);

  panel.appendChild(
    el(
      'p',
      'faq-item__ai-note small-note',
      t(
        UI_KEYS.disclaimer,
        'Antworten basieren auf öffentlichen Website-Inhalten (kein Ersatz für Rechtsberatung).',
      ),
    ),
  );

  assistant.appendChild(panel);
  host.appendChild(assistant);

  for (const evt of ['pointerdown', 'click']) {
    input.addEventListener(evt, (e) => e.stopPropagation());
  }

  startTypewriterPlaceholder(input);

  let introShown = false;
  function ensureIntro() {
    if (introShown) return;
    introShown = true;
    appendMessage(
      log,
      'bot',
      t(
        UI_KEYS.intro,
        lang === 'en'
          ? 'Ask about DPP-Flash, ESPR, pricing, or how the product works.'
          : 'Stelle Fragen zu DPP-Flash, ESPR, Preisen oder zum Produktablauf.',
      ),
      { intro: true },
    );
  }

  let knowledgePromise = loadKnowledge().catch(() => ({ chunks: [], faqPairs: [] }));

  async function answer(question) {
    const trimmed = question.trim();
    if (!trimmed) return;
    const activeLang = getLang();

    assistant.open = true;
    ensureIntro();
    appendMessage(log, 'user', trimmed);
    const pending = appendMessage(log, 'bot', t(UI_KEYS.thinking, 'Einen Moment …'));
    setLoading(pending, true);
    input.disabled = true;

    try {
      let text = null;
      try {
        text = await fetchApiAnswer(trimmed, activeLang);
      } catch (err) {
        if (err.message === 'rate_limit') {
          text =
            activeLang === 'en'
              ? 'Too many requests — please try again in a few minutes or email kontakt@dppflash.de.'
              : 'Zu viele Anfragen — bitte in ein paar Minuten erneut versuchen oder kontakt@dppflash.de schreiben.';
        }
      }

      if (!text || isWeakFaqApiAnswer(text, trimmed)) {
        const knowledge = await knowledgePromise;
        text = composeSmartAnswer(trimmed, knowledge, activeLang);
      }

      setBubbleAnswer(messageBody(pending), text);
    } catch {
      messageBody(pending).textContent = t(
        UI_KEYS.error,
        'Technischer Fehler — bitte später erneut versuchen oder uns kontaktieren.',
      );
    } finally {
      setLoading(pending, false);
      input.disabled = false;
      input.focus();
    }
  }

  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const q = input.value;
    input.value = '';
    answer(q);
  });

  bindSuggestions(assistant, (q) => {
    input.value = q;
    answer(q);
  });
}

function boot() {
  initFaqAssistant();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
