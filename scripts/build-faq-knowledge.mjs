/**
 * Builds assets/faq-knowledge.json from site HTML + i18n message catalogs.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const HTML_SOURCES = [
  'index.html',
  'pricing/index.html',
  'ueber-uns/index.html',
  'partner/index.html',
  'plattform/ingestion/index.html',
  'experience.html',
  'scan.html',
  'investoren/index.html',
  'blog/index.html',
  'blog/ratgeber/was-ist-der-digitale-produktpass-espr/index.html',
  'blog/ratgeber/dpp-pflicht-2027-unternehmen-checkliste/index.html',
  'blog/ratgeber/digitaler-produktpass-2027-unternehmen-vorbereiten/index.html',
];

const I18N_FILES = ['scripts/i18n-home.js', 'scripts/i18n-pricing.js', 'scripts/i18n-about.js'];

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

function chunkText(text, maxLen = 420) {
  if (!text || text.length < 50) return [];
  const sentences = text.split(/(?<=[.!?…])\s+/).filter((s) => s.length > 20);
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
  if (buf.trim().length >= 40) chunks.push(buf.trim());
  return chunks;
}

function extractHtmlChunks(relPath) {
  const full = path.join(root, relPath);
  if (!fs.existsSync(full)) return [];
  const html = fs.readFileSync(full, 'utf8');
  const text = stripHtml(html);
  const slug = relPath.replace(/\.html$/, '').replace(/\/index$/, '');
  return chunkText(text).map((textChunk, i) => ({
    id: `html:${slug}:${i}`,
    lang: 'de',
    source: `/${slug === 'index' ? '' : slug.replace(/^\//, '')}`,
    text: textChunk,
  }));
}

function extractI18nChunks(lang, messages, prefix = '') {
  const chunks = [];
  for (const [key, value] of Object.entries(messages)) {
    if (typeof value !== 'string') continue;
    const plain = stripHtml(value);
    if (plain.length < 35) continue;
    if (/^(nav\.|meta\.title|footer\.|trust\.)/.test(key) && !key.startsWith('faq.')) continue;
    chunks.push({
      id: `i18n:${lang}:${key}`,
      lang,
      source: prefix || key.split('.')[0],
      text: plain,
      key,
    });
  }
  return chunks;
}

function extractDeFromIndex() {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const chunks = [];
  const re = /data-i18n="([^"]+)"[^>]*>([\s\S]*?)<\/(?:p|h\d|summary|span|a|button|li)>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const key = m[1];
    const plain = stripHtml(m[2]);
    if (plain.length < 35) continue;
    chunks.push({
      id: `de-dom:${key}`,
      lang: 'de',
      source: key.split('.')[0],
      text: plain,
      key,
    });
  }
  return chunks;
}

const chunks = [];
const seen = new Set();

function addChunk(chunk) {
  const sig = `${chunk.lang}:${chunk.text.slice(0, 120)}`;
  if (seen.has(sig)) return;
  seen.add(sig);
  chunks.push(chunk);
}

for (const rel of HTML_SOURCES) {
  for (const c of extractHtmlChunks(rel)) addChunk(c);
}

for (const file of I18N_FILES) {
  const en = parseEnMessages(file);
  for (const c of extractI18nChunks('en', en, path.basename(file, '.js'))) addChunk(c);
}

for (const c of extractDeFromIndex()) addChunk(c);

const out = {
  version: 1,
  generatedAt: new Date().toISOString(),
  chunkCount: chunks.length,
  chunks,
};

const outPath = path.join(root, 'assets', 'faq-knowledge.json');
fs.writeFileSync(outPath, JSON.stringify(out), 'utf8');
console.log(`faq-knowledge: ${chunks.length} chunks → ${path.relative(root, outPath)}`);
