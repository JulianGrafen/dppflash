/**
 * Builds assets/faq-knowledge.json — primitive site-wide knowledge base for FAQ chat.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const SKIP_DIRS = new Set([
  'node_modules',
  '.next',
  'out',
  'partials',
  'workers',
  'pass',
  'p',
  '.git',
  '.cursor',
  '.agents',
  'supabase',
  '_next',
]);

const SKIP_HTML = new Set(['404.html']);

const I18N_FILES = [
  { path: 'scripts/i18n-home.js', topicPrefix: true },
  { path: 'scripts/i18n-pricing.js', topicPrefix: true },
  { path: 'scripts/i18n-about.js', topicPrefix: true },
  { path: 'scripts/i18n-investoren.js', topicPrefix: true },
];

const I18N_SKIP = /^(nav\.|meta\.title|footer\.|trust\.|storyNews\.)/;

function topicFromKey(key) {
  if (key.startsWith('pricing.')) return 'pricing';
  if (key.startsWith('faq.')) return 'faq';
  if (key.startsWith('about.') || key.startsWith('investors.')) return 'company';
  if (
    key.startsWith('problem.') ||
    key.startsWith('compliance.') ||
    key.startsWith('timer.') ||
    key.startsWith('benefits.')
  ) {
    return 'espr';
  }
  if (key.startsWith('contact.')) return 'company';
  return 'product';
}

function topicFromSlug(slug) {
  if (slug === 'index' || slug === '') return 'product';
  if (slug.includes('pricing')) return 'pricing';
  if (slug.includes('ueber-uns') || slug.includes('partner') || slug.includes('investoren')) {
    return 'company';
  }
  if (slug.includes('blog')) return 'espr';
  if (slug.includes('datenschutz') || slug.includes('impressum') || slug.includes('agb')) {
    return 'company';
  }
  if (slug.includes('scan') || slug.includes('experience') || slug.includes('plattform')) {
    return 'product';
  }
  return 'product';
}

function discoverSiteHtmlPages() {
  const pages = [];
  function walk(absDir, relDir = '') {
    for (const ent of fs.readdirSync(absDir, { withFileTypes: true })) {
      if (ent.name.startsWith('.') && ent.name !== '.well-known') continue;
      const rel = relDir ? `${relDir}/${ent.name}` : ent.name;
      if (ent.isDirectory()) {
        if (SKIP_DIRS.has(ent.name)) continue;
        walk(path.join(absDir, ent.name), rel);
        continue;
      }
      if (!ent.name.endsWith('.html') || SKIP_HTML.has(ent.name)) continue;
      pages.push(rel);
    }
  }
  walk(root);
  return pages.sort();
}

function parseEnMessages(filePath) {
  const raw = fs.readFileSync(path.join(root, filePath), 'utf8');
  const start = raw.indexOf('const EN = ');
  const boot = raw.indexOf('function boot()', start);
  if (start < 0 || boot < 0) return {};
  const block = raw.slice(start + 'const EN = '.length, boot).trim();
  const objectLiteral = block.replace(/;\s*$/, '');
  try {
    return Function(`"use strict"; return (${objectLiteral});`)();
  } catch (err) {
    console.warn(`Could not parse EN from ${filePath}:`, err.message);
    return {};
  }
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractMainText(html) {
  const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  const article = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  const block = main?.[1] ?? article?.[1];
  if (!block) return '';
  return stripHtml(block);
}

function chunkText(text, maxLen = 380) {
  if (!text || text.length < 50) return [];
  const sentences = text.split(/(?<=[.!?…])\s+/).filter((s) => s.length > 25);
  const chunks = [];
  let buf = '';
  for (const sentence of sentences) {
    const next = buf ? `${buf} ${sentence}` : sentence;
    if (next.length > maxLen && buf) {
      chunks.push(buf.trim());
      buf = sentence;
    } else {
      buf = next;
    }
  }
  if (buf.trim().length >= 45) chunks.push(buf.trim());
  return chunks;
}

function minLenForKey(key) {
  if (key.startsWith('faq.q')) return 12;
  if (key.startsWith('about.team') || key.startsWith('about.milestones')) return 12;
  if (key.startsWith('trust.')) return 10;
  return 28;
}

function extractI18nChunksFromHtml(relPath, lang = 'de') {
  const full = path.join(root, relPath);
  const html = fs.readFileSync(full, 'utf8');
  const slug = relPath.replace(/\.html$/, '').replace(/\/index$/, '') || 'index';
  const topic = topicFromSlug(slug);
  const chunks = [];
  const re = /data-i18n="([^"]+)"[^>]*>([\s\S]*?)<\/(?:p|h\d|summary|span|a|button|li|div|td|th)>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const key = m[1];
    if (I18N_SKIP.test(key)) continue;
    const plain = stripHtml(m[2]);
    const minLen = minLenForKey(key);
    if (plain.length < minLen || plain.length > 800) continue;
    chunks.push({
      id: `${lang}:i18n:${slug}:${key}`,
      lang,
      topic: topicFromKey(key) === 'product' ? topic : topicFromKey(key),
      source: slug,
      text: plain,
      key,
    });
  }
  return chunks;
}

function extractI18nMessagesFromHtml(relPath) {
  const full = path.join(root, relPath);
  if (!fs.existsSync(full)) return {};
  const html = fs.readFileSync(full, 'utf8');
  const messages = {};
  const re = /data-i18n="([^"]+)"[^>]*>([\s\S]*?)<\/(?:p|h\d|summary|span|a|button|li|div)>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const key = m[1];
    const plain = stripHtml(m[2]);
    if (plain.length < 3) continue;
    messages[key] = plain;
  }
  return messages;
}

function collectFaqPairRecords(messages, lang, keyPrefix, topic, source) {
  const records = [];
  const chunks = [];
  for (let n = 1; n <= 8; n++) {
    const q = messages[`${keyPrefix}.q${n}`] ?? messages[`${keyPrefix}q${n}`];
    const a = messages[`${keyPrefix}.a${n}`] ?? messages[`${keyPrefix}a${n}`];
    if (!q || !a) continue;
    const plainQ = stripHtml(q);
    const plainA = stripHtml(a);
    const id = `${source}-pair:${lang}:${n}`;
    records.push({
      id,
      lang,
      topic,
      question: plainQ,
      answer: plainA,
      key: `${keyPrefix}.q${n}`,
    });
    chunks.push({
      id: `faq-pair:${lang}:${source}:${n}`,
      lang,
      topic,
      source,
      text: `${plainQ} ${plainA}`,
      key: `${keyPrefix}.q${n}`,
    });
  }
  return { records, chunks };
}

function buildHomeFaqPairs(messages, lang) {
  return collectFaqPairRecords(messages, lang, 'faq', 'faq', 'home');
}

function buildPricingFaqPairs(messages, lang) {
  return collectFaqPairRecords(messages, lang, 'pricing.faq', 'pricing', 'pricing');
}

function addCuratedCompanyPairs(faqPairs, chunks) {
  const teamDe = chunks.find((c) => c.id === 'seed:team:de')?.text;
  const teamEn = chunks.find((c) => c.id === 'seed:team:en')?.text;
  const awardsDe = chunks.find((c) => c.id === 'seed:awards:de')?.text;
  const awardsEn = chunks.find((c) => c.id === 'seed:awards:en')?.text;

  const curated = [
    {
      lang: 'de',
      pairs: [
        ['Wer sind die Gründer von DPP-Flash?', teamDe],
        ['Wer sind die Gründer?', teamDe],
        ['Wer steht hinter DPP-Flash?', teamDe],
        ['Womit wurde DPP-Flash ausgezeichnet?', awardsDe],
      ],
    },
    {
      lang: 'en',
      pairs: [
        ['Who are the founders of DPP-Flash?', teamEn],
        ['Who are the founders?', teamEn],
        ['What awards has DPP-Flash received?', awardsEn],
      ],
    },
  ];

  for (const { lang, pairs } of curated) {
    let n = 0;
    for (const [question, answer] of pairs) {
      if (!answer) continue;
      n += 1;
      faqPairs.push({
        id: `curated-pair:${lang}:${n}`,
        lang,
        topic: 'company',
        question,
        answer,
        key: `curated.${n}`,
      });
    }
  }
}

const chunks = [];
const faqPairs = [];
const seen = new Set();
const sitePages = [];

function addChunk(chunk) {
  const sig = `${chunk.lang}:${chunk.topic}:${chunk.text.slice(0, 100)}`;
  if (seen.has(sig)) return;
  seen.add(sig);
  chunks.push(chunk);
}

const seedsPath = path.join(root, 'data', 'faq-corpus-seeds.json');
if (fs.existsSync(seedsPath)) {
  const seeds = JSON.parse(fs.readFileSync(seedsPath, 'utf8'));
  for (const c of seeds.chunks ?? []) addChunk(c);
}

const htmlPages = discoverSiteHtmlPages();
for (const rel of htmlPages) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) continue;
  const slug = rel.replace(/\.html$/, '').replace(/\/index$/, '') || 'index';
  sitePages.push(slug);

  for (const c of extractI18nChunksFromHtml(rel, 'de')) addChunk(c);

  const html = fs.readFileSync(full, 'utf8');
  const text = extractMainText(html);
  const topic = topicFromSlug(slug);
  for (const [i, textChunk] of chunkText(text).entries()) {
    addChunk({
      id: `html:${slug}:${i}`,
      lang: 'de',
      topic,
      source: slug,
      text: textChunk,
    });
  }
}

const deMessages = extractI18nMessagesFromHtml('index.html');
const deHome = buildHomeFaqPairs(deMessages, 'de');
faqPairs.push(...deHome.records);
for (const c of deHome.chunks) addChunk(c);

const dePricingMessages = extractI18nMessagesFromHtml('pricing/index.html');
const dePricing = buildPricingFaqPairs(dePricingMessages, 'de');
faqPairs.push(...dePricing.records);
for (const c of dePricing.chunks) addChunk(c);

for (const { path: i18nPath } of I18N_FILES) {
  const en = parseEnMessages(i18nPath);
  if (i18nPath.includes('i18n-home')) {
    const enHome = buildHomeFaqPairs(en, 'en');
    faqPairs.push(...enHome.records);
    for (const c of enHome.chunks) addChunk(c);
  }
  if (i18nPath.includes('i18n-pricing')) {
    const enPricing = buildPricingFaqPairs(en, 'en');
    faqPairs.push(...enPricing.records);
    for (const c of enPricing.chunks) addChunk(c);
  }
  for (const [key, value] of Object.entries(en)) {
    if (typeof value !== 'string' || I18N_SKIP.test(key)) continue;
    const plain = stripHtml(value);
    if (plain.length < 40 || plain.length > 650) continue;
    addChunk({
      id: `en:${key}`,
      lang: 'en',
      topic: topicFromKey(key),
      source: key.split('.')[0],
      text: plain,
      key,
    });
  }
}

addCuratedCompanyPairs(faqPairs, chunks);

const out = {
  version: 4,
  generatedAt: new Date().toISOString(),
  sitePageCount: sitePages.length,
  chunkCount: chunks.length,
  faqPairCount: faqPairs.length,
  faqPairs,
  chunks,
};

const outPath = path.join(root, 'assets', 'faq-knowledge.json');
fs.writeFileSync(outPath, JSON.stringify(out), 'utf8');
console.log(
  `faq-knowledge v4: ${chunks.length} chunks, ${faqPairs.length} FAQ pairs, ${sitePages.length} HTML pages → ${path.relative(root, outPath)}`,
);
