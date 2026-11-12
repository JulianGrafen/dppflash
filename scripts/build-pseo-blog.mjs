/**
 * Renders content/blog/*.json to blog/<slug>/index.html, updates sitemap + blog index list.
 */
import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import {
  ROOT,
  loadArticles,
  loadKeywordMatrix,
  existingPseoSlugs,
  resolveRelatedLink,
  matrixRowBySlug,
  escapeHtml,
} from './pseo-lib.mjs';

const SITE = 'https://dppflash.de';
const BLOG_INDEX = path.join(ROOT, 'blog', 'index.html');
const SITEMAP = path.join(ROOT, 'sitemap.xml');
const LIST_START = '<!-- pseo:article-list -->';
const LIST_END = '<!-- /pseo:article-list -->';

marked.setOptions({ gfm: true, headerIds: false, mangle: false });

function markdownToHtml(markdown) {
  const html = marked.parse(markdown);
  return html.replace(/<table>/g, '<table class="compliance-table">');
}

function formatGermanDate(iso) {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function articleJsonLd(article, canonical, published) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.h1_title,
    description: article.meta_description,
    datePublished: published,
    dateModified: published,
    author: {
      '@type': 'Organization',
      name: 'DPP-Flash',
      url: SITE,
    },
    publisher: {
      '@type': 'Organization',
      name: 'DPP-Flash',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE}/favico.jpg`,
      },
    },
    mainEntityOfPage: canonical,
    articleSection: article.category,
    inLanguage: 'de-DE',
  };
}

function faqJsonLd(faqSchema) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqSchema.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

function breadcrumbJsonLd(article, canonical) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${SITE}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${SITE}/blog/`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.h1_title,
        item: canonical,
      },
    ],
  };
}

function siteHeaderHtml() {
  return `  <script src="/assets/site-header.js" defer></script>
  <header class="site-header" id="siteHeader">
    <div class="site-header__inner">
      <div class="site-header__start">
        <a class="logo" href="/" aria-label="DPP-Flash"><img class="logo__img" src="/assets/logo-dpp-flash.png?v=4" alt="" height="72" decoding="async"></a>
      </div>
      <nav class="nav-desktop site-header__center" aria-label="Hauptnavigation">
        <div class="nav-dropdown">
          <a class="nav-link nav-dropdown__trigger" href="/plattform/ingestion/">Plattform</a>
          <div class="nav-dropdown__menu" role="menu">
            <a class="nav-link" href="/#vorteile" role="menuitem">Vorteile</a>
            <a class="nav-link" href="/experience.html" role="menuitem">Demo</a>
            <a class="nav-link" href="/scan.html" role="menuitem">Readiness-Check</a>
          </div>
        </div>
        <a class="nav-link" href="/ueber-uns/">Über uns</a>
        <div class="nav-dropdown">
          <a class="nav-link nav-dropdown__trigger" href="/#faq">Häufige Fragen</a>
          <div class="nav-dropdown__menu" role="menu">
            <a class="nav-link active" href="/blog/" role="menuitem">Blog</a>
            <a class="nav-link" href="/#kontakt" role="menuitem">Kontakt</a>
          </div>
        </div>
        <a class="nav-link" href="/pricing">Preise</a>
      </nav>
      <div class="site-header__end">
        <button id="navOpenBtn" class="nav-toggle site-header__menu-btn" type="button" aria-expanded="false" aria-controls="mobileMenu" aria-label="Menü öffnen"><span class="nav-toggle-icon" aria-hidden="true"></span></button>
      </div>
    </div>
    <div class="nav-mobile" id="mobileMenu" role="dialog" aria-modal="true" aria-hidden="true">
      <div class="nav-mobile-inner">
        <button id="navCloseBtn" class="nav-close" aria-label="Schließen">Schließen</button>
        <nav class="mobile-links mobile-menu">
          <div class="mobile-nav-group">
            <span class="mobile-nav-label">Plattform</span>
            <a class="nav-link nav-link--sub" href="/#vorteile">Vorteile</a>
            <a class="nav-link nav-link--sub" href="/experience.html">Demo</a>
            <a class="nav-link nav-link--sub" href="/scan.html">Readiness-Check</a>
          </div>
          <a class="nav-link" href="/ueber-uns/">Über uns</a>
          <div class="mobile-nav-group">
            <a class="nav-link" href="/#faq">Häufige Fragen</a>
            <a class="nav-link nav-link--sub active" href="/blog/">Blog</a>
            <a class="nav-link nav-link--sub" href="/#kontakt">Kontakt</a>
          </div>
          <a class="nav-link" href="/pricing">Preise</a>
        </nav>
      </div>
    </div>
  </header>`;
}

function siteFooterHtml() {
  return `  <footer class="site-footer">
    <div class="container">
      <div class="footer-inner">
        <div class="footer-legal" id="impressum" itemscope itemtype="https://schema.org/LocalBusiness">
          <p itemprop="name">DPP-Flash i.G.</p>
          <div itemprop="address" itemscope itemtype="https://schema.org/PostalAddress">
            <p itemprop="streetAddress">Pfarrer-Reinartz-Str. 11</p>
            <p><span itemprop="postalCode">53925</span> <span itemprop="addressLocality">Kall</span></p>
          </div>
          <p>E-Mail: <a href="mailto:kontakt@dppflash.de" itemprop="email">kontakt@dppflash.de</a></p>
        </div>
        <nav class="footer-nav" aria-label="Rechtliches">
          <a href="/impressum.html">Impressum</a>
          <a href="/datenschutz.html">Datenschutzerklärung</a>
          <a href="/agb.html">Allgemeine Geschäftsbedingungen (AGB)</a>
          <a href="/partner/">Partnerprogramm (Affiliate)</a>
        </nav>
        <div class="footer-actions">
          <a href="/blog/">← Zurück zum Blog</a>
        </div>
      </div>
      <p class="footer-copyright">© 2026 DPP-Flash i.G | Alle Rechte vorbehalten</p>
    </div>
  </footer>`;
}

function renderArticlePage(article, related) {
  const slug = article.url_slug;
  const published = article.date_published || new Date().toISOString().slice(0, 10);
  const canonical = `${SITE}/blog/${slug}/`;
  const bodyHtml = markdownToHtml(article.content_markdown);
  const intro =
    article.content_markdown.split('\n').find((l) => l.trim() && !l.startsWith('#')) || '';

  const ldScripts = [
    articleJsonLd(article, canonical, published),
    faqJsonLd(article.faq_schema),
    breadcrumbJsonLd(article, canonical),
  ]
    .map(
      (obj) =>
        `  <script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n  </script>`,
    )
    .join('\n');

  return `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
  <link rel="shortcut icon" type="image/x-icon" href="/favico.jpg" />
  <title>${escapeHtml(article.meta_title)}</title>
  <meta name="description" content="${escapeHtml(article.meta_description)}" />
  <link rel="canonical" href="${canonical}" />
  <meta property="og:title" content="${escapeHtml(article.meta_title)}" />
  <meta property="og:description" content="${escapeHtml(article.meta_description)}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${SITE}/favico.jpg" />
  <meta property="article:published_time" content="${published}" />
  <meta property="article:modified_time" content="${published}" />
  <meta property="article:section" content="${escapeHtml(article.category)}" />
  <meta name="author" content="DPP-Flash" />
  <link rel="stylesheet" href="/style.css">
  <link rel="stylesheet" href="/blog/ratgeber/ratgeber.css">
  <link rel="preload" href="/assets/bg-scene.js" as="script">
  <style>.pseo-markdown .article-section, .pseo-markdown section { margin-bottom: 2rem; } .pseo-markdown h2 { margin-top: 2.25rem; } .article-category { color: var(--accent-b); font-weight: 700; font-size: 0.9rem; margin-bottom: 0.5rem; }</style>
${ldScripts}
<!-- lenis:assets -->
<link rel="stylesheet" href="/assets/lenis.css?v=1" />
<script src="/assets/lenis-scroll.js" defer></script>
<!-- /lenis:assets -->

<!-- ld-json:bundle -->
<!-- /ld-json:bundle -->
</head>
<body>
  <div id="bgCanvas" class="color-bends-container bg-canvas" aria-hidden="true"></div>
  <script src="/assets/bg-scene.js" defer></script>
${siteHeaderHtml()}

  <main>
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <ol>
        <li><a href="/">Home</a></li>
        <li><a href="/blog/">Blog</a></li>
        <li aria-current="page">${escapeHtml(article.h1_title)}</li>
      </ol>
    </nav>

    <article class="ratgeber-article">
      <header class="article-header">
        <p class="article-category">${escapeHtml(article.category)}</p>
        <h1>${escapeHtml(article.h1_title)}</h1>
        <div class="article-meta">
          <span class="published">Veröffentlicht: ${formatGermanDate(published)}</span>
          <span class="reading-time">Lesezeit: ${article.reading_time_minutes} Min.</span>
        </div>
        <p class="article-intro">${escapeHtml(intro)}</p>
      </header>

      <div class="article-body pseo-markdown">
${bodyHtml}
      </div>

      <section class="article-cta-section">
        <div class="conversion-card">
          <div class="conversion-header">
            <h3>Batteriepass mit Lieferanten-PDFs vorbereiten</h3>
            <p>DPP-Flash extrahiert Pflichtfelder aus Prüfberichten und SDB — Sie geben jeden Wert vor dem QR-Code frei.</p>
          </div>
          <div class="conversion-actions">
            <a href="https://dppflash.de/register" class="btn btn-primary btn-large">Jetzt kostenlos registrieren</a>
            <a href="${related.href}" class="btn btn-secondary">Weiterlesen: ${escapeHtml(related.label)}</a>
          </div>
        </div>
      </section>

      <footer class="article-footer">
        <div class="article-tags">
          <span class="tag">${escapeHtml(article.category)}</span>
          <span class="tag">Batterieverordnung</span>
          <span class="tag">Compliance</span>
        </div>
      </footer>
    </article>
  </main>

${siteFooterHtml()}
<!-- cookie-banner:inline -->
<script src="/assets/cookie-banner.js" defer></script>
<!-- /cookie-banner:inline -->
</body>
</html>
`;
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

function updateBlogIndex(articles) {
  if (!fs.existsSync(BLOG_INDEX)) return;
  let html = fs.readFileSync(BLOG_INDEX, 'utf8');
  const sorted = [...articles].sort((a, b) =>
    (b.date_published || '').localeCompare(a.date_published || ''),
  );
  const listHtml = sorted.map((a) => renderBlogListItem(a.data)).join('\n');
  const block = `${LIST_START}\n${listHtml}\n          ${LIST_END}`;
  const re = new RegExp(
    `${LIST_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${LIST_END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
  );
  if (re.test(html)) {
    html = html.replace(re, block);
  } else {
    html = html.replace(
      '<div id="posts" class="post-list" style="margin-top: 1rem;">',
      `<div id="posts" class="post-list" style="margin-top: 1rem;">\n${block}\n`,
    );
  }
  fs.writeFileSync(BLOG_INDEX, html);
}

function updateSitemap(articles) {
  const today = new Date().toISOString().slice(0, 10);
  const staticUrls = [
    { loc: `${SITE}/`, lastmod: today, changefreq: 'monthly', priority: '1.0' },
    { loc: `${SITE}/blog/`, lastmod: today, changefreq: 'weekly', priority: '0.8' },
    { loc: `${SITE}/pricing/`, lastmod: today, changefreq: 'monthly', priority: '0.7' },
    { loc: `${SITE}/docs/`, lastmod: today, changefreq: 'monthly', priority: '0.6' },
  ];
  const articleUrls = articles.map(({ data }) => ({
    loc: `${SITE}/blog/${data.url_slug}/`,
    lastmod: data.date_published || today,
    changefreq: 'monthly',
    priority: '0.75',
  }));
  const all = [...staticUrls, ...articleUrls];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;
  fs.writeFileSync(SITEMAP, xml);
}

function main() {
  const articles = loadArticles();
  const publishedSlugs = existingPseoSlugs();
  for (const { data: article } of articles) {
    const outDir = path.join(ROOT, 'blog', article.url_slug);
    fs.mkdirSync(outDir, { recursive: true });
    const matrixRow = matrixRowBySlug(article.url_slug);
    const related = resolveRelatedLink(matrixRow, publishedSlugs);
    const html = renderArticlePage(article, related);
    fs.writeFileSync(path.join(outDir, 'index.html'), html);
    console.log(`wrote blog/${article.url_slug}/index.html`);
  }
  updateBlogIndex(articles);
  updateSitemap(articles);
  console.log(`Updated sitemap with ${articles.length} pSEO article URL(s).`);
}

main();
