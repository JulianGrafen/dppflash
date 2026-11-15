/**
 * Re-sorts the pSEO block on blog/index.html by date_published (newest first).
 * Use when full build-pseo-blog.mjs is not needed.
 */
import fs from 'fs';
import path from 'path';
import { ROOT, loadArticles, escapeHtml } from './pseo-lib.mjs';

const LIST_START = '<!-- pseo:article-list -->';
const LIST_END = '<!-- /pseo:article-list -->';

function formatGermanDate(iso) {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function renderBlogListItem(article) {
  const published = article.date_published || '2026-11-12';
  const excerpt = (article.meta_description || '').slice(0, 160);
  return `            <article style="margin-bottom:1.5rem;padding-bottom:1.5rem;border-bottom:1px solid rgba(255,255,255,0.08)">
              <h3 style="margin:0 0 0.5rem;font-size:1.15rem;font-weight:800">
                <a href="/blog/${article.url_slug}/">${escapeHtml(article.h1_title)}</a>
              </h3>
              <p style="margin:0 0 0.35rem;color:#9AA6B9;font-size:0.9rem;font-weight:600">${formatGermanDate(published)} · ${escapeHtml(article.category)}</p>
              <p style="margin:0;color:var(--muted);font-weight:600;line-height:1.55">${escapeHtml(excerpt)}</p>
            </article>`;
}

function patchBlogIndexList(filePath, articles) {
  if (!fs.existsSync(filePath)) return;
  let html = fs.readFileSync(filePath, 'utf8');
  const sorted = [...articles].sort((a, b) =>
    (b.data.date_published || '').localeCompare(a.data.date_published || ''),
  );
  const listHtml = sorted.map(({ data }) => renderBlogListItem(data)).join('\n');
  const block = `${LIST_START}\n${listHtml}\n          ${LIST_END}`;
  const re = new RegExp(
    `${LIST_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${LIST_END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
  );
  if (!re.test(html)) {
    console.warn(`pSEO markers not found in ${filePath}`);
    return;
  }
  html = html.replace(re, block);
  fs.writeFileSync(filePath, html);
  console.log(`patched ${filePath}`);
}

const articles = loadArticles();
patchBlogIndexList(path.join(ROOT, 'blog', 'index.html'), articles);
patchBlogIndexList(path.join(ROOT, 'out', 'blog', 'index.html'), articles);