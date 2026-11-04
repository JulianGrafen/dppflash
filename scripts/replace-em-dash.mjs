#!/usr/bin/env node
/**
 * Replace Unicode em dashes (U+2014) in user-facing site sources.
 * Only replaces em dash runs; does not touch "..." spread syntax.
 */
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const EM = '\u2014';

const SKIP_DIRS = new Set([
  'node_modules',
  'out',
  '.next',
  '_next',
  '.agents',
  '.git',
  '.export-stash',
]);

const EXT = new Set(['.html', '.js', '.mjs', '.ts', '.tsx', '.json']);

const EXCLUDE_FILES = new Set([
  'scripts/replace-em-dash.mjs',
  'PERFORMANCE_ROADMAP.md',
  'docs/FAQ-AZURE-FOUNDRY.md',
  'docs/FAQ-CHAT-OHNE-WORKER.md',
  'workers/faq-chat/README.md',
  'next.config.mjs.bak',
  'next.config.mjs',
  'supabase/migrations/001_initial_schema.sql',
  'workers/faq-chat/.dev.vars.example',
  'azure/faq-function/local.settings.json.example',
  'azure/faq-function/README.md',
  'assets/faq-knowledge.json',
  'workers/faq-chat/knowledge.json',
  'workers/faq-chat/.wrangler',
]);

function replaceEmDash(text) {
  return text.replace(/\s*\u2014\s*/g, ', ');
}

async function walk(dir, acc = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    if (SKIP_DIRS.has(ent.name)) continue;
    const abs = path.join(dir, ent.name);
    if (ent.isDirectory()) await walk(abs, acc);
    else if (EXT.has(path.extname(ent.name))) acc.push(abs);
  }
  return acc;
}

const files = await walk(root);
let changed = 0;

for (const abs of files) {
  const rel = path.relative(root, abs);
  if (EXCLUDE_FILES.has(rel)) continue;
  if (rel.includes(`${path.sep}.wrangler${path.sep}`)) continue;

  const st = await stat(abs);
  if (st.size > 5_000_000) continue;

  const before = await readFile(abs, 'utf8');
  if (!before.includes(EM)) continue;
  const after = replaceEmDash(before);
  if (after !== before) {
    await writeFile(abs, after);
    changed += 1;
    console.log(rel);
  }
}

console.log(`Updated ${changed} file(s).`);
