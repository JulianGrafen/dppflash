/**
 * Offline smart answers: intent, FAQ match, playbooks, natural phrasing.
 */
import playbooks from '../data/faq-playbooks.json' with { type: 'json' };
import {
  tokenize,
  retrieveFromKnowledge,
  matchFaqPair,
  LOW_CONFIDENCE_REPLY,
} from './faq-retrieval.mjs';

const INTENT_KEYWORDS = {
  pricing: [
    'preis',
    'preise',
    'kosten',
    'kostet',
    'tarif',
    'tarife',
    'pricing',
    'plan',
    'micro',
    'starter',
    'growth',
    'scale',
    'enterprise',
    'euro',
    'eur',
    'monthly',
    'monat',
  ],
  espr_deadline: [
    'pflicht',
    'deadline',
    'frist',
    'wann',
    'ab',
    '2027',
    'espr',
    'batterie',
    'batteriepass',
    'verordnung',
    'mandatory',
    'compliance',
  ],
  features: [
    'feature',
    'features',
    'funktion',
    'funktionen',
    'funktionsumfang',
    'enthalten',
    'inklusive',
    'leistung',
    'leistungen',
    'module',
    'lieferantenportal',
    'lieferanten',
    'resolver',
    'vault',
    'import',
    'bulk',
    'versionierung',
    'audit',
    'registry',
  ],
  product_how: [
    'funktioniert',
    'ablauf',
    'how',
    'works',
    'produkt',
    'plattform',
    'software',
    'extraktion',
    'extraction',
    'ki',
    'ai',
    'pdf',
    'qr',
    'hosting',
    'speicher',
  ],
  it_skills: [
    'it',
    'it-abteilung',
    'fachwissen',
    'technisch',
    'developer',
    'entwickler',
    'department',
  ],
  pilot: ['pilot', 'testen', 'trial', 'kostenlos', 'free', 'pilotphase', 'probieren'],
  partner: [
    'partner',
    'partnerprogramm',
    'affiliate',
    'provision',
    'vermittlung',
    'referral',
    'commission',
  ],
  contact: [
    'kontakt',
    'email',
    'mail',
    'telefon',
    'phone',
    'erreichen',
    'erreiche',
    'euch',
    'contact',
    'support',
    'anrufen',
  ],
  about_team: [
    'gründer',
    'gruender',
    'founder',
    'founders',
    'gründerteam',
    'founding',
    'team',
    'mission',
    'unternehmen',
    'company',
    'hinter',
    'about',
    'julian',
    'nico',
    'nick',
    'ceo',
    'cto',
  ],
};

function findSeed(knowledge, id) {
  return (knowledge.chunks ?? []).find((c) => c.id === id)?.text ?? '';
}

function detectIntent(question, lang) {
  const words = tokenize(question);
  const scores = {};
  for (const [intent, keys] of Object.entries(INTENT_KEYWORDS)) {
    let s = 0;
    for (const k of keys) {
      if (words.includes(k)) s += k.length > 4 ? 3 : 2;
    }
    if (s) scores[intent] = s;
  }

  if (words.some((w) => INTENT_KEYWORDS.features.includes(w))) {
    scores.features = (scores.features ?? 0) + 4;
  }
  if (words.includes('ki') && (words.includes('extraktion') || words.includes('funktioniert'))) {
    scores.product_how = (scores.product_how ?? 0) + 5;
  }
  if (
    (words.includes('was') || words.includes('welche')) &&
    (words.includes('enthalten') || words.includes('features') || words.includes('funktionen'))
  ) {
    scores.features = (scores.features ?? 0) + 6;
  }
  if (
    (words.includes('wer') || words.includes('who')) &&
    (words.includes('gründer') ||
      words.includes('gruender') ||
      words.includes('founder') ||
      words.includes('founders') ||
      words.includes('team'))
  ) {
    scores.about_team = (scores.about_team ?? 0) + 8;
  }
  if (words.some((w) => INTENT_KEYWORDS.pricing.includes(w)) && words.includes('pilot')) {
    scores.pilot = (scores.pilot ?? 0) + 4;
  }

  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (!ranked.length) return 'general';
  const top = ranked[0][0];
  if (top === 'product_how' && words.includes('it')) return 'it_skills';
  return top;
}

function wantsExplicitPricing(question) {
  return tokenize(question).some((w) =>
    ['preis', 'preise', 'kosten', 'kostet', 'tarif', 'pricing', 'plan'].includes(w),
  );
}

function fillSlots(template, slots) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => slots[key] ?? '');
}

function joinSentences(parts) {
  return parts
    .map((p) => p.trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatPricingAnswer(seedText, lang) {
  const lines = seedText.match(/Micro[^.]+|Starter[^.]+|Growth[^.]+|Scale[^.]+|Enterprise[^.]+/gi);
  if (!lines || lines.length < 3) return seedText;
  const intro =
    lang === 'en'
      ? 'DPP-Flash is billed monthly in EUR:'
      : 'DPP-Flash wird monatlich in EUR abgerechnet:';
  return [intro, ...lines.slice(0, 4)].join('\n');
}

function bestChunkSnippet(chunks, question) {
  if (!chunks.length) return '';
  const qWords = tokenize(question);
  const best = chunks[0];
  let sentences = best.text.split(/(?<=[.!?])\s+/).filter((s) => s.length > 20);
  sentences = sentences.filter((s) => !(s.trim().endsWith('?') && s.length < 90));
  if (sentences.length <= 1) {
    return best.text.length > 380 ? `${best.text.slice(0, 377)}…` : best.text;
  }
  let pick = sentences[0];
  let hits = 0;
  for (const s of sentences) {
    const lower = s.toLowerCase();
    const h = qWords.filter((w) => lower.includes(w)).length;
    if (h > hits) {
      hits = h;
      pick = s;
    }
  }
  return pick;
}

function buildSlots(knowledge, lang, intent, question, faqAnswer) {
  const L = lang === 'en' ? 'en' : 'de';
  const slotCopy = playbooks.slots ?? {};
  return {
    pricingSeed: findSeed(knowledge, `seed:pricing:${L}`),
    productSeed: findSeed(knowledge, `seed:product:${L}`),
    esprSeed: findSeed(knowledge, `seed:espr:${L}`),
    pilotSeed: findSeed(knowledge, `seed:pilot:${L}`),
    partnerSeed: findSeed(knowledge, `seed:partner:${L}`),
    contactSeed: findSeed(knowledge, `seed:contact:${L}`),
    teamSeed: findSeed(knowledge, `seed:team:${L}`),
    featuresSeed: findSeed(knowledge, `seed:features:${L}`),
    pilotHint: slotCopy.pilotHint?.[L] ?? '',
    hostingHint: slotCopy.hostingHint?.[L] ?? '',
    kiHint: slotCopy.kiHint?.[L] ?? '',
    faqAnswer: faqAnswer ?? '',
    chunkSnippet: '',
  };
}

function applyPlaybook(intent, lang, slots, explicitPricing) {
  const L = lang === 'en' ? 'en' : 'de';
  const pb = playbooks.intents?.[intent]?.[L] ?? playbooks.intents?.general?.[L];
  if (!pb) return slots.chunkSnippet || slots.faqAnswer;

  let body = fillSlots(pb.body ?? '', slots);
  if (intent === 'pricing' && explicitPricing && pb.explicitPricing) {
    body = formatPricingAnswer(slots.pricingSeed, L);
  }

  const parts = [pb.lead, body, fillSlots(pb.tail ?? '', slots)];
  return joinSentences(parts);
}

/**
 * @param {string} question
 * @param {{ chunks?: unknown[], faqPairs?: { question: string, answer: string, lang: string }[] }} knowledge
 * @param {string} lang
 */
export function composeSmartAnswer(question, knowledge, lang = 'de') {
  const L = lang === 'en' ? 'en' : 'de';
  const trimmed = question.trim();
  if (!trimmed) {
    return LOW_CONFIDENCE_REPLY[L] ?? LOW_CONFIDENCE_REPLY.de;
  }

  const intent = detectIntent(trimmed, L);
  const faqHit = matchFaqPair(trimmed, knowledge, L);
  const retrieval = retrieveFromKnowledge(knowledge, trimmed, L);
  const { chunks, confidence } = retrieval;

  if (intent === 'general' && confidence === 'low' && !faqHit) {
    return LOW_CONFIDENCE_REPLY[L] ?? LOW_CONFIDENCE_REPLY.de;
  }

  const playbookFirstIntents = ['partner', 'contact', 'pilot', 'features', 'about_team'];
  if (playbookFirstIntents.includes(intent)) {
    const slots = buildSlots(knowledge, L, intent, trimmed, faqHit?.pair?.answer);
    slots.chunkSnippet = bestChunkSnippet(chunks, trimmed);
    const playbookAnswer = applyPlaybook(intent, L, slots, wantsExplicitPricing(trimmed));
    if (playbookAnswer && playbookAnswer.length > 25) {
      return playbookAnswer;
    }
  }

  if (faqHit && faqHit.score >= 0.42 && intent !== 'features') {
    if (intent === 'it_skills' || faqHit.pair.topic === 'faq') {
      const lead = L === 'en' ? 'In short:' : 'Kurz gesagt:';
      return joinSentences([lead, faqHit.pair.answer]);
    }
    if (intent !== 'pricing' || !wantsExplicitPricing(trimmed)) {
      const lead = L === 'en' ? 'Good question —' : 'Gute Frage —';
      return joinSentences([lead, faqHit.pair.answer]);
    }
  }

  const slots = buildSlots(knowledge, L, intent, trimmed, faqHit?.pair?.answer);
  slots.chunkSnippet = bestChunkSnippet(chunks, trimmed);

  const explicitPricing = wantsExplicitPricing(trimmed);
  const composed = applyPlaybook(intent, L, slots, explicitPricing);

  if (composed && composed.length > 30) {
    return composed;
  }

  if (faqHit?.pair?.answer) {
    return faqHit.pair.answer;
  }

  if (intent === 'features' && slots.featuresSeed) {
    return applyPlaybook('features', L, slots, explicitPricing);
  }

  if (slots.chunkSnippet && intent !== 'features') {
    const lead = L === 'en' ? 'Based on our site:' : 'Laut unserer Website:';
    return joinSentences([lead, slots.chunkSnippet]);
  }

  return LOW_CONFIDENCE_REPLY[L] ?? LOW_CONFIDENCE_REPLY.de;
}

export function localFallbackAnswer(knowledge, question, lang = 'de') {
  return composeSmartAnswer(question, knowledge, lang);
}
