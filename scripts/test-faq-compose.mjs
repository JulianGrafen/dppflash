/**
 * Golden questions for offline FAQ compose (no server).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { composeSmartAnswer } from './faq-compose.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const knowledgePath = path.join(root, 'assets', 'faq-knowledge.json');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function runCase(label, question, lang, expect) {
  const knowledge = JSON.parse(fs.readFileSync(knowledgePath, 'utf8'));
  const answer = composeSmartAnswer(question, knowledge, lang);
  assert(answer && answer.length > 20, `${label}: answer too short`);
  for (const needle of expect.includes) {
    assert(
      answer.toLowerCase().includes(needle.toLowerCase()),
      `${label}: expected "${needle}" in:\n${answer}`,
    );
  }
  if (expect.excludes) {
    for (const bad of expect.excludes) {
      assert(
        !answer.toLowerCase().includes(bad.toLowerCase()),
        `${label}: should not include "${bad}"`,
      );
    }
  }
  console.log(`ok — ${label}`);
}

assert(fs.existsSync(knowledgePath), 'Run npm run build:faq-knowledge first');
const meta = JSON.parse(fs.readFileSync(knowledgePath, 'utf8'));
assert(meta.version >= 4, `Expected knowledge v4, got ${meta.version}`);
assert((meta.faqPairs?.length ?? 0) >= 6, 'Expected faqPairs in knowledge');

runCase('pricing', 'Was kostet DPP-Flash?', 'de', {
  includes: ['Micro', '79', 'Pilot'],
});
runCase('it', 'Brauche ich IT?', 'de', {
  includes: ['Nein', 'IT'],
});
runCase('deadline', 'Ab wann ist der DPP Pflicht?', 'de', {
  includes: ['2027', 'Batterie'],
});
runCase('ki', 'Wie funktioniert die KI-Extraktion?', 'de', {
  includes: ['PDF', 'Review'],
});
runCase('partner', 'Gibt es ein Partnerprogramm?', 'de', {
  includes: ['15', 'Provision'],
});
runCase('contact', 'Wie erreiche ich euch?', 'de', {
  includes: ['kontakt@dppflash.de'],
});
runCase('founders', 'Wer sind die Gründer?', 'de', {
  includes: ['Julian', 'Nico', 'Nick'],
});
runCase('awards', 'Womit wurde dpp flash ausgezeichnet?', 'de', {
  includes: ['Entrepreneur Award', 'Global Recognition'],
});
runCase('features', 'Welche Features hat DPP-Flash?', 'de', {
  includes: ['Lieferantenportal', 'QR'],
  excludes: ['rechtssicher'],
});
runCase('features-enthalten', 'Was ist alles enthalten?', 'de', {
  includes: ['Pass-Erstellung', 'KI'],
});
runCase('features-short', 'Features', 'de', {
  includes: ['Lieferantenportal', 'GS1'],
});
runCase('offtopic', 'Wie wird das Wetter morgen in Berlin?', 'de', {
  includes: ['kontakt@dppflash.de'],
  excludes: ['sonnig'],
});

console.log('All faq-compose tests passed.');
