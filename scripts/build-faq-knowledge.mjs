/**
 * Builds curated assets/faq-knowledge.json for FAQ assistant retrieval.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const MAIN_HTML_SOURCES = [
  'pricing/index.html',
  'ueber-uns/index.html',
  'partner/index.html',
  'plattform/ingestion/index.html',
  'experience.html',
  'scan.html',
  'investoren/index.html',
  'blog/ratgeber/was-ist-der-digitale-produktpass-espr/index.html',
  'blog/ratgeber/dpp-pflicht-2027-unternehmen-checkliste/index.html',
  'blog/zwei-auszeichnungen-dpp-flash-2026/index.html',
];

const I18N_FILES = [
  { path: 'scripts/i18n-home.js', topicPrefix: true },
  { path: 'scripts/i18n-pricing.js', topicPrefix: true },
  { path: 'scripts/i18n-about.js', topicPrefix: true },
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

function extractDeFromIndex() {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const main = extractMainText(html) || stripHtml(html);
  const chunks = [];
  const re = /data-i18n="([^"]+)"[^>]*>([\s\S]*?)<\/(?:p|h\d|summary|span|a|button|li|div)>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const key = m[1];
    if (I18N_SKIP.test(key)) continue;
    const plain = stripHtml(m[2]);
    const minLen = key.startsWith('faq.q') ? 12 : 40;
    if (plain.length < minLen || plain.length > 600) continue;
    chunks.push({
      id: `de:${key}`,
      lang: 'de',
      topic: topicFromKey(key),
      source: key.split('.')[0],
      text: plain,
      key,
    });
  }
  for (const [i, text] of chunkText(main).entries()) {
    chunks.push({
      id: `de:main:index:${i}`,
      lang: 'de',
      topic: 'product',
      source: 'index',
      text,
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

const chunks = [];
const faqPairs = [];
const seen = new Set();

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

const deDom = extractDeFromIndex();
const deMessages = {};
for (const c of deDom) {
  if (c.key) deMessages[c.key] = c.text;
}
const deHome = buildHomeFaqPairs(deMessages, 'de');
faqPairs.push(...deHome.records);
for (const c of deHome.chunks) addChunk(c);
for (const c of deDom) {
  if (!c.key?.startsWith('faq.q') && !c.key?.startsWith('faq.a')) addChunk(c);
}

const dePricingMessages = extractI18nMessagesFromHtml('pricing/index.html');
const dePricing = buildPricingFaqPairs(dePricingMessages, 'de');
faqPairs.push(...dePricing.records);
for (const c of dePricing.chunks) addChunk(c);

for (const rel of MAIN_HTML_SOURCES) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) continue;
  const html = fs.readFileSync(full, 'utf8');
  const text = extractMainText(html);
  const slug = rel.replace(/\.html$/, '').replace(/\/index$/, '');
  const topic = slug.includes('pricing')
    ? 'pricing'
    : slug.includes('blog')
      ? 'espr'
      : slug.includes('partner')
        ? 'company'
        : 'product';
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

const out = {
  version: 3,
  generatedAt: new Date().toISOString(),
  chunkCount: chunks.length,
  faqPairCount: faqPairs.length,
  faqPairs,
  chunks,
};

const outPath = path.join(root, 'assets', 'faq-knowledge.json');
fs.writeFileSync(outPath, JSON.stringify(out), 'utf8');
console.log(`faq-knowledge: ${chunks.length} curated chunks → ${path.relative(root, outPath)}`);
