/**
 * Copies assets/faq-knowledge.json into the Worker bundle.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const src = path.join(root, 'assets', 'faq-knowledge.json');
const dest = path.join(root, 'workers', 'faq-chat', 'knowledge.json');

if (!fs.existsSync(src)) {
  console.error('Missing assets/faq-knowledge.json — run npm run build:faq-knowledge first');
  process.exit(1);
}

fs.copyFileSync(src, dest);
console.log(`faq-worker-knowledge: → ${path.relative(root, dest)}`);
