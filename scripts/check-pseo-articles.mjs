#!/usr/bin/env node
/**
 * Quality gate for pSEO articles (content/blog/*.json) and keyword matrix.
 */
import fs from 'fs';
import path from 'path';
import {
  ROOT,
  BANNED_PHRASES,
  REQUIRED_FIELDS,
  loadArticles,
  loadKeywordMatrix,
  markdownWordCount,
  hasMarkdownTable,
  collectInternalBlogLinks,
  blogPathExists,
} from './pseo-lib.mjs';

const errors = [];

function fail(msg) {
  errors.push(msg);
}

function checkArticle({ filePath, data }) {
  const rel = path.relative(ROOT, filePath);
  for (const field of REQUIRED_FIELDS) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      fail(`${rel}: missing field "${field}"`);
    }
  }
  if (!Array.isArray(data.faq_schema) || data.faq_schema.length !== 3) {
    fail(`${rel}: faq_schema must contain exactly 3 items`);
  }
  if (data.meta_title && data.meta_title.length > 60) {
    fail(`${rel}: meta_title exceeds 60 characters (${data.meta_title.length})`);
  }
  if (data.meta_description && data.meta_description.length > 155) {
    fail(`${rel}: meta_description exceeds 155 characters (${data.meta_description.length})`);
  }
  const words = markdownWordCount(data.content_markdown || '');
  if (words < 900 || words > 1300) {
    fail(`${rel}: word count ${words} outside 900–1,300`);
  }
  if (!hasMarkdownTable(data.content_markdown || '')) {
    fail(`${rel}: content_markdown must include at least one Markdown table`);
  }
  const text = `${data.content_markdown}\n${data.meta_description}\n${data.h1_title}`;
  for (const phrase of BANNED_PHRASES) {
    if (text.includes(phrase)) {
      fail(`${rel}: banned phrase "${phrase}"`);
    }
  }
  if (/rechtssicher/i.test(text)) {
    fail(`${rel}: must not use the word "rechtssicher"`);
  }
  for (const linkPath of collectInternalBlogLinks(data.content_markdown || '')) {
    if (!blogPathExists(linkPath)) {
      fail(`${rel}: broken internal blog link "/blog/${linkPath}/"`);
    }
  }
  if (data.url_slug && !/^[a-z0-9-]+$/.test(data.url_slug)) {
    fail(`${rel}: url_slug must be lowercase kebab-case`);
  }
}

function checkMatrixAndArticles() {
  const matrix = loadKeywordMatrix();
  const articles = loadArticles();
  const slugCounts = new Map();
  const keywordCounts = new Map();

  for (const row of matrix.rows) {
    const status = row.status;
    if (!['planned', 'draft', 'published'].includes(status)) {
      fail(`keyword_matrix: row ${row.url_slug} has invalid status "${status}"`);
    }
    slugCounts.set(row.url_slug, (slugCounts.get(row.url_slug) || 0) + 1);
    const kw = (row.fokus_keyword || '').toLowerCase();
    keywordCounts.set(kw, (keywordCounts.get(kw) || 0) + 1);
  }

  for (const [slug, count] of slugCounts) {
    if (count > 1) fail(`keyword_matrix: duplicate url_slug "${slug}"`);
  }
  for (const [kw, count] of keywordCounts) {
    if (kw && count > 1) fail(`keyword_matrix: duplicate fokus_keyword "${kw}"`);
  }

  const articleSlugs = new Set();
  for (const entry of articles) {
    if (articleSlugs.has(entry.data.url_slug)) {
      fail(`content/blog: duplicate url_slug "${entry.data.url_slug}"`);
    }
    articleSlugs.add(entry.data.url_slug);
    checkArticle(entry);

    const row = matrix.rows.find((r) => r.url_slug === entry.data.url_slug);
    if (row?.status === 'published' && !fs.existsSync(path.join(ROOT, 'blog', entry.data.url_slug, 'index.html'))) {
      fail(
        `${entry.data.url_slug}: matrix status published but blog/${entry.data.url_slug}/index.html missing — run npm run build:pseo`,
      );
    }
  }
}

function main() {
  try {
    checkMatrixAndArticles();
  } catch (e) {
    fail(e.message);
  }
  if (errors.length) {
    console.error('pSEO quality check failed:\n');
    for (const err of errors) console.error(`  - ${err}`);
    process.exit(1);
  }
  console.log(`pSEO quality check passed (${loadArticles().length} article(s)).`);
}

main();
