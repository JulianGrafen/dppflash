/**
 * Injects cookie banner script before </body> on static HTML pages (idempotent).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const SKIP_DIRS = new Set(['node_modules', 'out', '.next', '_next', 'partials', 'pass', 'workers']);

const SCRIPT_TAG = '<script src="/assets/cookie-banner.js" defer></script>\n';

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
  if (!html.includes('</body>')) continue;
  if (html.includes('cookie-banner.js')) continue;
  if (!html.includes('style.css')) continue;

  html = html.replace('</body>', `${SCRIPT_TAG}</body>`);
  fs.writeFileSync(filePath, html);
  updated += 1;
  console.log(`inject cookie-banner: ${rel}`);
}

console.log(`done — ${updated} file(s)`);
