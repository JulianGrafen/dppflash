/**
 * Symlink root marketing static files into public/ so `next dev` can serve them.
 * GitHub Pages serves from repo root — public/ is dev-only (gitignored).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');

const LINKS = [
  'experience.html',
  'experience.css',
  'style.css',
  'index.html',
  'scan.html',
  'assets',
  'ueber-uns',
  'investoren',
  'pricing',
  'plattform',
  'blog',
  'partner',
  'datenschutz.html',
  'impressum.html',
  'agb.html',
];

function ensureLink(name) {
  const src = path.join(root, name);
  if (!fs.existsSync(src)) {
    console.warn(`link-static-public: skip missing ${name}`);
    return;
  }
  const dest = path.join(publicDir, name);
  if (fs.existsSync(dest)) {
    try {
      const st = fs.lstatSync(dest);
      if (st.isSymbolicLink()) {
        const target = fs.readlinkSync(dest);
        const resolved = path.resolve(publicDir, target);
        if (resolved === path.resolve(src)) return;
      }
    } catch {
      /* replace broken link */
    }
    fs.rmSync(dest, { recursive: true, force: true });
  }
  const rel = path.relative(publicDir, src);
  fs.symlinkSync(rel, dest);
  console.log(`link-static-public: ${name} -> ${rel}`);
}

fs.mkdirSync(publicDir, { recursive: true });
for (const name of LINKS) ensureLink(name);
console.log('link-static-public: done');
