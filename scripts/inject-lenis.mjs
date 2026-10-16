/**
 * Injects Lenis CSS + script on static marketing pages (idempotent).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const SKIP_DIRS = new Set(['node_modules', 'out', '.next', '_next', 'partials', 'pass', 'workers']);
const SKIP_HTML = new Set(['experience.html']);

const MARKER = '<!-- lenis:assets -->';
const BLOCK_RE = new RegExp(`${MARKER}[\\s\\S]*?<!-- /lenis:assets -->\\s*`, 'g');

const ASSET_BLOCK = `${MARKER}
<link rel="stylesheet" href="/assets/lenis.css?v=1" />
<script src="/assets/lenis-scroll.js" defer></script>
<!-- /lenis:assets -->
`;

function walkHtmlFiles(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walkHtmlFiles(full, acc);
      continue;
    }
    if (!ent.name.endsWith('.html')) continue;
    acc.push(full);
  }
  return acc;
}

let updated = 0;
for (const filePath of walkHtmlFiles(root)) {
  const rel = path.relative(root, filePath);
  let html = fs.readFileSync(filePath, 'utf8');
  if (!html.includes('style.css') || !html.includes('</head>')) continue;

  html = html.replace(BLOCK_RE, '');
  if (!SKIP_HTML.has(rel) && !html.includes(MARKER)) {
    html = html.replace('</head>', `${ASSET_BLOCK}\n</head>`);
  }
  fs.writeFileSync(filePath, html);
  updated += 1;
  console.log(`inject lenis: ${rel}${SKIP_HTML.has(rel) ? ' (skip)' : ''}`);
}

console.log(`done — ${updated} file(s)`);
