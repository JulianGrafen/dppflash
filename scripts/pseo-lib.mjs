import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.join(__dirname, '..');

export const BANNED_PHRASES = [
  'In der heutigen schnelllebigen Welt',
  'Nachhaltigkeit wird immer wichtiger',
  'Zusammenfassend lässt sich sagen',
  'Ein entscheidender Meilenstein',
  'Tauchen wir tief ein',
];

export const REQUIRED_FIELDS = [
  'url_slug',
  'meta_title',
  'meta_description',
  'h1_title',
  'reading_time_minutes',
  'category',
  'content_markdown',
  'faq_schema',
];

const INTERNAL_BLOG_RE =
  /(?:https?:\/\/(?:www\.)?dppflash\.de)?\/blog\/([a-z0-9-]+(?:\/[a-z0-9-]+)*)\/?/gi;

export function listArticleJsonPaths() {
  const dir = path.join(ROOT, 'content', 'blog');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => path.join(dir, f));
}

export function loadArticles() {
  return listArticleJsonPaths().map((filePath) => {
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    return { filePath, data };
  });
}

export function existingPseoSlugs() {
  return new Set(loadArticles().map(({ data }) => data.url_slug));
}

export function loadKeywordMatrix() {
  const matrixPath = path.join(ROOT, 'content', 'seo', 'keyword_matrix.json');
  const raw = fs.readFileSync(matrixPath, 'utf8');
  return JSON.parse(raw);
}

export function markdownWordCount(markdown) {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]+`/g, ' ')
    .replace(/\|[^|\n]+\|/g, ' ')
    .replace(/[#>*_\[\]()!-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return 0;
  return text.split(' ').filter(Boolean).length;
}

export function hasMarkdownTable(markdown) {
  const lines = markdown.split('\n');
  for (let i = 0; i < lines.length - 1; i++) {
    const line = lines[i].trim();
    const next = lines[i + 1].trim();
    if (!line.startsWith('|') || !next.startsWith('|')) continue;
    if (/^\|[\s:|-]+\|$/.test(next) || /^\|[-| :]+\|$/.test(next)) return true;
    if (next.includes('---') && next.includes('|')) return true;
  }
  return false;
}

/** Slug exists as generated pSEO page or legacy blog path. */
export function blogPathExists(slugOrPath) {
  const normalized = slugOrPath.replace(/^\/+|\/+$/g, '');
  const pseoDir = path.join(ROOT, 'blog', normalized.split('/')[0], 'index.html');
  if (normalized.includes('/')) {
    const legacy = path.join(ROOT, 'blog', `${normalized}/index.html`);
    if (fs.existsSync(legacy)) return true;
    const htmlFile = path.join(ROOT, 'blog', `${normalized}.html`);
    return fs.existsSync(htmlFile);
  }
  if (fs.existsSync(path.join(ROOT, 'blog', normalized, 'index.html'))) return true;
  if (fs.existsSync(path.join(ROOT, 'blog', `${normalized}.html`))) return true;
  if (fs.existsSync(path.join(ROOT, 'content', 'blog', `${normalized}.json`))) return true;
  return false;
}

export function collectInternalBlogLinks(markdown) {
  const links = [];
  let m;
  const re = new RegExp(INTERNAL_BLOG_RE.source, 'gi');
  while ((m = re.exec(markdown)) !== null) {
    links.push(m[1].replace(/\/$/, ''));
  }
  return links;
}

export function resolveRelatedLink(matrixRow, publishedSlugs) {
  const category = matrixRow?.produkt_kategorie ?? '';
  const fallback = '/blog/#compliance-ratgeber';
  if (!matrixRow) return { href: fallback, label: 'Weitere Compliance-Artikel' };
  const trySlug = (slug) => {
    if (slug && publishedSlugs.has(slug)) {
      return {
        href: `/blog/${slug}/`,
        label: slug.replace(/-/g, ' '),
      };
    }
    return null;
  };
  const next = trySlug(matrixRow.next_article_slug);
  if (next) return next;
  const prev = trySlug(matrixRow.prev_article_slug);
  if (prev) return prev;
  return {
    href: fallback,
    label: category ? `Alle Artikel: ${category}` : 'Zurück zum Blog',
  };
}

export function matrixRowBySlug(slug) {
  const matrix = loadKeywordMatrix();
  return matrix.rows.find((r) => r.url_slug === slug);
}

export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
