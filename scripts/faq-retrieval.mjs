/**
 * Shared FAQ knowledge retrieval (browser bundle + Worker import).
 */

const STOPWORDS_DE = new Set([
  'und',
  'der',
  'die',
  'das',
  'den',
  'dem',
  'des',
  'ein',
  'eine',
  'einer',
  'eines',
  'ist',
  'sind',
  'was',
  'wie',
  'wo',
  'wann',
  'warum',
  'kann',
  'ich',
  'wir',
  'sie',
  'bei',
  'mit',
  'für',
  'auf',
  'aus',
  'von',
  'zum',
  'zur',
  'the',
  'and',
  'for',
  'with',
  'what',
  'how',
  'when',
  'does',
  'can',
  'you',
  'your',
]);

const SYNONYM_TOPICS = {
  preis: 'pricing',
  preise: 'pricing',
  kosten: 'pricing',
  kostet: 'pricing',
  tarif: 'pricing',
  tarife: 'pricing',
  pricing: 'pricing',
  plan: 'pricing',
  micro: 'pricing',
  starter: 'pricing',
  growth: 'pricing',
  scale: 'pricing',
  enterprise: 'pricing',
  pilot: 'pricing',
  dpp: 'espr',
  produktpass: 'espr',
  produktpässe: 'espr',
  espr: 'espr',
  batterie: 'espr',
  batteriepass: 'espr',
  compliance: 'espr',
  pflicht: 'espr',
  ki: 'product',
  extraktion: 'product',
  pdf: 'product',
  qr: 'product',
  software: 'product',
  kontakt: 'company',
  team: 'company',
  gründer: 'company',
  gruender: 'company',
  founder: 'company',
  founders: 'company',
  partner: 'company',
  affiliate: 'company',
  feature: 'product',
  features: 'product',
  funktion: 'product',
  funktionen: 'product',
  enthalten: 'product',
  lieferantenportal: 'product',
};

const MIN_BEST_SCORE = 6;
const MAX_CHUNKS = 6;
const FAQ_PAIR_MIN_SCORE = 0.38;

const SHORT_TOKENS = new Set(['it', 'ki', 'qr', 'dpp', 'espr', 'pdf', 'kmu']);

export function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .filter((w) => (w.length > 2 || SHORT_TOKENS.has(w)) && !STOPWORDS_DE.has(w));
}

export function expandQueryTokens(words) {
  const expanded = new Set(words);
  for (const w of words) {
    const topic = SYNONYM_TOPICS[w];
    if (topic) expanded.add(topic);
  }
  return [...expanded];
}

function chunkLangMatch(chunk, lang) {
  return chunk.lang === lang || (lang === 'en' && chunk.lang === 'de');
}

export function scoreChunk(chunk, queryTokens, lang) {
  if (!chunkLangMatch(chunk, lang)) return 0;

  const text = chunk.text.toLowerCase();
  let score = 0;

  for (const word of queryTokens) {
    if (text.includes(word)) {
      score += word.length > 6 ? 4 : word.length > 4 ? 3 : 2;
    }
  }

  if (chunk.topic && queryTokens.includes(chunk.topic)) score += 6;
  if (chunk.key?.startsWith('faq.') || chunk.id?.startsWith('faq-pair:')) score += 8;
  if (chunk.id?.startsWith('seed:')) score += 3;
  if (
    chunk.id?.startsWith('seed:team:') &&
    queryTokens.some((w) =>
      ['gründer', 'gruender', 'founder', 'founders', 'team', 'mission', 'julian', 'nico', 'nick'].includes(
        w,
      ),
    )
  ) {
    score += 18;
  }
  if (
    chunk.id?.startsWith('seed:awards:') &&
    queryTokens.some((w) =>
      [
        'auszeichnung',
        'auszeichnungen',
        'ausgezeichnet',
        'award',
        'awards',
        'recognition',
        'entrepreneur',
        'anerkennung',
        'siegel',
      ].includes(w),
    )
  ) {
    score += 18;
  }

  return score;
}

function countMatchedQueryTokens(chunk, queryWords) {
  const text = chunk.text.toLowerCase();
  return queryWords.filter((w) => !SYNONYM_TOPICS[w] && text.includes(w)).length;
}

function normalizeForMatch(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function overlapScore(a, b) {
  const ta = new Set(tokenize(a));
  const tb = new Set(tokenize(b));
  if (!ta.size || !tb.size) return 0;
  let inter = 0;
  for (const w of ta) {
    if (tb.has(w)) inter += 1;
  }
  return inter / Math.max(ta.size, tb.size, 1);
}

/**
 * Match user question to curated FAQ pairs (v3 knowledge).
 */
export function matchFaqPair(question, knowledge, lang = 'de') {
  const pairs = knowledge.faqPairs ?? [];
  if (!pairs.length) return null;

  let best = null;
  let bestScore = 0;

  for (const pair of pairs) {
    if (pair.lang !== lang && !(lang === 'en' && pair.lang === 'de')) continue;
    const score = overlapScore(question, pair.question);
    const pNorm = normalizeForMatch(pair.question);
    const qNorm = normalizeForMatch(question);
    const bonus = qNorm.length > 8 && pNorm.includes(qNorm.slice(0, 12)) ? 0.15 : 0;
    const total = score + bonus;
    if (total > bestScore) {
      bestScore = total;
      best = pair;
    }
  }

  if (!best || bestScore < FAQ_PAIR_MIN_SCORE) return null;
  return { pair: best, score: bestScore };
}

const MANDATORY_SEED_RULES = [
  {
    words: ['gründer', 'gruender', 'founder', 'founders', 'gründerteam'],
    seedId: (lang) => `seed:team:${lang}`,
  },
  {
    words: [
      'auszeichnung',
      'auszeichnungen',
      'ausgezeichnet',
      'award',
      'awards',
      'recognition',
      'entrepreneur',
      'anerkennung',
    ],
    seedId: (lang) => `seed:awards:${lang}`,
  },
];

export function injectMandatoryChunks(knowledge, question, lang, chunks) {
  const words = tokenize(question);
  const out = [...chunks];
  for (const rule of MANDATORY_SEED_RULES) {
    if (!words.some((w) => rule.words.includes(w))) continue;
    const id = rule.seedId(lang === 'en' ? 'en' : 'de');
    const chunk = (knowledge.chunks ?? []).find((c) => c.id === id);
    if (chunk && !out.some((c) => c.id === chunk.id)) {
      out.unshift(chunk);
    }
  }
  return out.slice(0, MAX_CHUNKS);
}

export function retrieveFromKnowledge(knowledge, question, lang = 'de', limit = MAX_CHUNKS) {
  const rawWords = tokenize(question);
  const words = expandQueryTokens(rawWords);
  if (!rawWords.length) {
    return { chunks: [], confidence: 'low', bestScore: 0 };
  }

  const ranked = (knowledge.chunks ?? [])
    .map((chunk) => ({ chunk, score: scoreChunk(chunk, words, lang) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score);

  const deduped = [];
  const seen = new Set();
  for (const row of ranked) {
    const sig = row.chunk.text.slice(0, 80);
    if (seen.has(sig)) continue;
    seen.add(sig);
    deduped.push(row);
    if (deduped.length >= limit) break;
  }

  const bestScore = deduped[0]?.score ?? 0;
  const matchedRaw = deduped[0] ? countMatchedQueryTokens(deduped[0].chunk, rawWords) : 0;
  const isFaqHit =
    deduped[0]?.chunk?.id?.startsWith('faq-pair:') || deduped[0]?.chunk?.key?.startsWith('faq.');
  const highByOverlap = bestScore >= MIN_BEST_SCORE && matchedRaw >= 2;
  const highByStrong = bestScore >= 12 && matchedRaw >= 1;
  const highByFaq = isFaqHit && bestScore >= 6 && matchedRaw >= 1;
  const itIntent = rawWords.includes('it') || rawWords.includes('it-abteilung');
  const highByItFaq =
    itIntent &&
    deduped.some(
      (r) =>
        r.chunk.id === 'faq-pair:de:home:3' ||
        r.chunk.id === 'faq-pair:de:3' ||
        r.chunk.text.toLowerCase().includes('it-fachwissen'),
    );
  const faqPairHit = matchFaqPair(question, knowledge, lang);
  const intentClear = faqPairHit != null || highByItFaq;
  const confidence =
    highByOverlap || highByStrong || highByFaq || highByItFaq || intentClear ? 'high' : 'low';

  const baseChunks = deduped.map((r) => r.chunk);
  const chunks = injectMandatoryChunks(knowledge, question, lang, baseChunks);

  return {
    chunks,
    confidence,
    bestScore,
  };
}

export function buildContextBlock(chunks) {
  return chunks.map((c) => c.text).join('\n\n');
}

const PRICING_HINTS = new Set([
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
  'pilot',
]);

function wantsPricing(question) {
  return tokenize(question).some((w) => PRICING_HINTS.has(w));
}

function extractFaqAnswer(text) {
  const qEnd = text.indexOf('?');
  if (qEnd > 20 && qEnd < text.length - 15) {
    return text.slice(qEnd + 1).trim();
  }
  return text.trim();
}

export function synthesizeLocalAnswer(question, chunks, lang) {
  if (!chunks.length) return null;

  if (wantsPricing(question)) {
    const seed =
      chunks.find((c) => c.id === `seed:pricing:${lang}`) ||
      chunks.find((c) => c.id?.startsWith('seed:pricing:'));
    if (seed) return seed.text;
  }

  const faqChunk =
    chunks.find((c) => c.id?.startsWith('faq-pair:') && c.lang === lang) ||
    chunks.find((c) => c.id?.startsWith('faq-pair:'));
  if (faqChunk) {
    return extractFaqAnswer(faqChunk.text);
  }

  const best = chunks[0];
  const sentences = best.text.split(/(?<=[.!?])\s+/).filter((s) => s.length > 25);
  const qWords = tokenize(question);
  if (sentences.length > 1 && qWords.length) {
    let bestSent = sentences[0];
    let bestHits = 0;
    for (const s of sentences) {
      const lower = s.toLowerCase();
      const hits = qWords.filter((w) => lower.includes(w)).length;
      if (hits > bestHits) {
        bestHits = hits;
        bestSent = s;
      }
    }
    if (bestHits >= 1) return bestSent;
  }

  return best.text.length > 420 ? `${best.text.slice(0, 417)}…` : best.text;
}

/** @deprecated use synthesizeLocalAnswer */
export function composeLocalFallback(chunks, lang) {
  return synthesizeLocalAnswer('', chunks, lang);
}

export const LOW_CONFIDENCE_REPLY = {
  de:
    'Dazu habe ich auf unserer Website keine sichere Antwort gefunden. Schreib uns gern an kontakt@dppflash.de oder nutze das Kontaktformular.',
  en:
    'I could not find a reliable answer on our website. Please email kontakt@dppflash.de or use the contact form.',
};
