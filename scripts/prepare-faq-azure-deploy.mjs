/**
 * Copies FAQ API modules into azure/faq-function/_app for func publish.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const destRoot = path.join(root, 'azure', 'faq-function', '_app');

const copies = [
  ['scripts/faq-api-handler.mjs', 'scripts/faq-api-handler.mjs'],
  ['scripts/faq-retrieval.mjs', 'scripts/faq-retrieval.mjs'],
  ['scripts/faq-compose.mjs', 'scripts/faq-compose.mjs'],
  ['scripts/faq-llm.mjs', 'scripts/faq-llm.mjs'],
  ['data/faq-playbooks.json', 'data/faq-playbooks.json'],
  ['assets/faq-knowledge.json', 'assets/faq-knowledge.json'],
];

function rmrf(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) rmrf(p);
    else fs.unlinkSync(p);
  }
  fs.rmdirSync(dir);
}

rmrf(destRoot);

for (const [fromRel, toRel] of copies) {
  const from = path.join(root, fromRel);
  const to = path.join(destRoot, toRel);
  if (!fs.existsSync(from)) {
    console.error(`Missing ${fromRel} — run npm run build:faq-knowledge`);
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

// faq-api-handler resolves root as parent of scripts/ → _app
console.log(`faq-azure: prepared ${path.relative(root, destRoot)}`);
