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
};

function t(key, fallback) {
  return window.DppI18n?.t(key) ?? fallback;
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

function appendMessage(log, role, text) {
  const row = el('div', `faq-chat-msg faq-chat-msg--${role}`);
  const bubble = el('div', 'faq-chat-msg__bubble', text);
  row.appendChild(bubble);
  log.appendChild(row);
  log.scrollTop = log.scrollHeight;
  return row;
}

function setLoading(row, on) {
  row?.classList.toggle('faq-chat-msg--loading', on);
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

  const assistant = el('div', 'faq-assistant');
  assistant.id = 'faqAssistant';

  const header = el('div', 'faq-assistant__header');
  header.appendChild(
    el('h3', 'faq-assistant__title', t(UI_KEYS.title, 'Frag den DPP-Flash Assistenten')),
  );
  header.appendChild(
    el(
      'p',
      'faq-assistant__disclaimer',
      t(
        UI_KEYS.disclaimer,
        'Antworten basieren auf öffentlichen Website-Inhalten (kein Ersatz für Rechtsberatung).',
      ),
    ),
  );
  assistant.appendChild(header);

  const log = el('div', 'faq-assistant__log');
  log.id = 'faqChatLog';
  log.setAttribute('role', 'log');
  log.setAttribute('aria-live', 'polite');
  log.setAttribute('aria-relevant', 'additions');
  assistant.appendChild(log);

  appendMessage(
    log,
    'bot',
    t(
      UI_KEYS.intro,
      lang === 'en'
        ? 'Ask about DPP-Flash, ESPR, pricing, or how the product works.'
        : 'Stelle Fragen zu DPP-Flash, ESPR, Preisen oder zum Produktablauf.',
    ),
  );

  const form = el('form', 'faq-assistant__form');
  form.id = 'faqChatForm';
  form.setAttribute('novalidate', '');

  const input = el('input', 'faq-assistant__input');
  input.type = 'text';
  input.id = 'faqChatInput';
  input.name = 'question';
  input.autocomplete = 'off';
  input.maxLength = 500;
  input.placeholder = t(UI_KEYS.placeholder, 'z. B. Was kostet der Einstieg?');
  input.setAttribute('aria-label', input.placeholder);

  const submit = el('button', 'faq-assistant__submit', t(UI_KEYS.send, 'Senden'));
  submit.type = 'submit';

  form.append(input, submit);
  assistant.appendChild(form);

  const suggestions = el('div', 'faq-assistant__suggestions');
  const s1 = el('button', 'faq-assistant__chip');
  s1.type = 'button';
  s1.setAttribute('data-faq-suggest', t(UI_KEYS.suggest1, 'Was kostet DPP-Flash?'));
  s1.textContent = t(UI_KEYS.suggest1, 'Was kostet DPP-Flash?');
  const s2 = el('button', 'faq-assistant__chip');
  s2.type = 'button';
  s2.setAttribute('data-faq-suggest', t(UI_KEYS.suggest2, 'Ab wann ist der DPP Pflicht?'));
  s2.textContent = t(UI_KEYS.suggest2, 'Ab wann ist der DPP Pflicht?');
  const s3 = el('button', 'faq-assistant__chip');
  s3.type = 'button';
  s3.setAttribute('data-faq-suggest', t(UI_KEYS.suggest3, 'Wie funktioniert die KI-Extraktion?'));
  s3.textContent = t(UI_KEYS.suggest3, 'Wie funktioniert die KI-Extraktion?');
  suggestions.append(s1, s2, s3);
  assistant.appendChild(suggestions);

  host.after(assistant);

  let knowledgePromise = loadKnowledge().catch(() => ({ chunks: [], faqPairs: [] }));

  async function answer(question) {
    const trimmed = question.trim();
    if (!trimmed) return;
    const activeLang = getLang();

    appendMessage(log, 'user', trimmed);
    const pending = appendMessage(log, 'bot', t(UI_KEYS.thinking, 'Einen Moment …'));
    setLoading(pending, true);
    input.disabled = true;
    submit.disabled = true;

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

      if (!text) {
        const knowledge = await knowledgePromise;
        text = composeSmartAnswer(trimmed, knowledge, activeLang);
      }

      pending.querySelector('.faq-chat-msg__bubble').textContent = text;
    } catch {
      pending.querySelector('.faq-chat-msg__bubble').textContent = t(
        UI_KEYS.error,
        'Technischer Fehler — bitte später erneut versuchen oder uns kontaktieren.',
      );
    } finally {
      setLoading(pending, false);
      input.disabled = false;
      submit.disabled = false;
      input.focus();
    }
  }

  form.addEventListener('submit', (e) => {
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
