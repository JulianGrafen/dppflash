/**
 * Injects sitewide + page-specific JSON-LD from partials/ld-json/ into static HTML.
 * Idempotent: replaces <!-- ld-json:bundle --> ... <!-- /ld-json:bundle -->
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const partialsDir = path.join(root, 'partials', 'ld-json');

const SKIP_DIRS = new Set(['node_modules', 'out', '.next', '_next']);

function readPartial(name) {
  return fs.readFileSync(path.join(partialsDir, name), 'utf8');
}

const globalBlock = readPartial('global.html');

const EXTRA_BY_REL = new Map([
  ['index.html', ['home-extra.html']],
  ['investoren/index.html', ['investoren.html']],
  ['blog/index.html', ['blog-index.html']],
  ['ueber-uns/index.html', ['about.html']],
  ['experience.html', ['experience.html']],
  ['scan.html', ['scan.html']],
  ['pricing/index.html', ['pricing.html']],
]);

/** Pages where legacy ld+json is removed entirely before inject (replaced by new bundles). */
const STRIP_ALL_LD_JSON = new Set([
  'index.html',
  'ueber-uns/index.html',
  'investoren/index.html',
]);

function walkHtmlFiles(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walkHtmlFiles(full, acc);
      continue;
    }
    if (!ent.name.endsWith('.html')) continue;
    if (full.includes(`${path.sep}partials${path.sep}`)) continue;
    acc.push(full);
  }
  return acc;
}

const LD_JSON_RE = /<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi;

const BUNDLE_START = '<!-- ld-json:bundle -->';
const BUNDLE_END = '<!-- /ld-json:bundle -->';
const BUNDLE_RE = new RegExp(
  `${BUNDLE_START}[\\s\\S]*?${BUNDLE_END}\\s*`,
  'g',
);

function buildBundle(relPath) {
  const extras = EXTRA_BY_REL.get(relPath) ?? [];
  const parts = [globalBlock, ...extras.map((f) => readPartial(f))];
  return `${BUNDLE_START}\n${parts.join('\n')}${BUNDLE_END}\n`;
}

function processFile(filePath) {
  const rel = path.relative(root, filePath).split(path.sep).join('/');
  let html = fs.readFileSync(filePath, 'utf8');
  if (!html.includes('</head>')) {
    console.warn(`skip (no </head>): ${rel}`);
    return false;
  }

  if (STRIP_ALL_LD_JSON.has(rel)) {
    html = html.replace(LD_JSON_RE, '');
  }

  html = html.replace(BUNDLE_RE, '');
  const bundle = buildBundle(rel);
  html = html.replace('</head>', `${bundle}</head>`);

  fs.writeFileSync(filePath, html, 'utf8');
  return true;
}

const files = walkHtmlFiles(root);
let updated = 0;
for (const f of files) {
  if (processFile(f)) updated += 1;
}
console.log(`inject-ld-json: updated ${updated} HTML files`);
