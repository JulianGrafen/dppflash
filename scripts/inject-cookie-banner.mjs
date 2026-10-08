/**
 * Injects inline cookie-banner bundle before </body> on static HTML pages (idempotent).
 * Inline avoids a separate /assets request (404 if asset deploy lags behind HTML).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const SKIP_DIRS = new Set(['node_modules', 'out', '.next', '_next', 'partials', 'pass', 'workers']);

const BUNDLE_PATH = path.join(root, 'assets', 'cookie-banner.js');
const EXTERNAL_RE = /<script src="\/assets\/cookie-banner\.js" defer><\/script>\s*/gi;
const MARKER_START = '<!-- cookie-banner:inline -->';
const MARKER_END = '<!-- /cookie-banner:inline -->';
const INLINE_RE = new RegExp(`${MARKER_START}[\\s\\S]*?${MARKER_END}\\s*`, 'g');

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

if (!fs.existsSync(BUNDLE_PATH)) {
  console.error('missing assets/cookie-banner.js — run: npm run build:cookie-banner');
  process.exit(1);
}

const js = fs.readFileSync(BUNDLE_PATH, 'utf8').trim();
const inlineBlock = `${MARKER_START}\n<script>\n${js}\n</script>\n${MARKER_END}\n`;

let updated = 0;
for (const filePath of walkHtmlFiles(root)) {
  const rel = path.relative(root, filePath);
  let html = fs.readFileSync(filePath, 'utf8');
  if (!html.includes('</body>') || !html.includes('style.css')) continue;

  const hadBanner =
    EXTERNAL_RE.test(html) || html.includes(MARKER_START) || html.includes('cookie-banner.js');
  html = html.replace(EXTERNAL_RE, '').replace(INLINE_RE, '');
  html = html.replace('</body>', `${inlineBlock}</body>`);
  fs.writeFileSync(filePath, html);
  updated += 1;
  console.log(`inject cookie-banner: ${rel}${hadBanner ? ' (updated)' : ''}`);
}

console.log(`done — ${updated} file(s)`);
