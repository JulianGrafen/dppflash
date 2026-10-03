/**
 * Shared FAQ API logic (Node server + Azure Function).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  retrieveFromKnowledge,
  buildContextBlock,
  LOW_CONFIDENCE_REPLY,
} from './faq-retrieval.mjs';
import { callFaqLlm, llmBackendLabel } from './faq-llm.mjs';
import { composeSmartAnswer } from './faq-compose.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = fs.existsSync(path.join(__dirname, '..', 'assets', 'faq-knowledge.json'))
  ? path.join(__dirname, '..')
  : path.join(__dirname, '..', '..');

export const ALLOWED_ORIGINS = new Set([
  'https://dppflash.de',
  'https://www.dppflash.de',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

export function hydrateFaqSecretsFromDevVars() {
  const devVars = path.join(root, 'workers/faq-chat/.dev.vars');
  if (!fs.existsSync(devVars)) return;
  const raw = fs.readFileSync(devVars, 'utf8');
  const apply = (key) => {
    const val = raw.match(new RegExp(`^${key}=(.+)$`, 'm'))?.[1]?.trim();
    if (val && !process.env[key]) process.env[key] = val;
  };
  apply('OPENAI_API_KEY');
  apply('AZURE_OPENAI_API_KEY');
  apply('AZURE_FOUNDRY_PROJECT_ENDPOINT');
  apply('FAQ_LLM_DEPLOYMENT');
}

let knowledgeCache = null;

export function loadFaqKnowledge() {
  if (knowledgeCache) return knowledgeCache;
  const file = path.join(root, 'assets', 'faq-knowledge.json');
  knowledgeCache = JSON.parse(fs.readFileSync(file, 'utf8'));
  return knowledgeCache;
}

export function faqCorsHeaders(origin) {
  const allow =
    origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://dppflash.de';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function buildSystemPrompt(lang, context) {
  const base =
    lang === 'en'
      ? `You are the DPP-Flash website assistant. Use ONLY the context below. Answer directly in 2–5 sentences. Exact EUR prices from context. Plain text only — no Markdown, no asterisks for emphasis. If unsure: kontakt@dppflash.de. Not legal advice.`
      : `Du bist der DPP-Flash Website-Assistent. Nutze NUR den Kontext unten. Antworte direkt in 2–5 Sätzen. EUR-Preise exakt aus dem Kontext. Nur Fließtext — kein Markdown, keine Sternchen (**). Bei Unsicherheit: kontakt@dppflash.de. Keine Rechtsberatung.`;
  return `${base}\n\n--- Kontext ---\n${context}`;
}

export async function handleFaqChat(question, lang, knowledge = loadFaqKnowledge()) {
  const { chunks, confidence } = retrieveFromKnowledge(knowledge, question, lang);
  const hasLlm = llmBackendLabel() !== 'none';

  if (hasLlm && chunks.length && confidence !== 'low') {
    const context = buildContextBlock(chunks);
    const system = buildSystemPrompt(lang, context);
    const userPrompt =
      lang === 'en'
        ? `User question: ${question}\n\nAnswer directly in 2–5 sentences.`
        : `Nutzerfrage: ${question}\n\nAntworte direkt in 2–5 Sätzen.`;

    const answer = await callFaqLlm({
      system,
      user: userPrompt,
      logError: (msg) => console.error(msg),
    });
    if (answer) {
      return { answer, confidence: 'high', mode: 'ai' };
    }
  }

  const composed = composeSmartAnswer(question, knowledge, lang);
  const isDecline = composed === LOW_CONFIDENCE_REPLY[lang];
  return {
    answer: composed,
    confidence: isDecline ? 'low' : 'high',
    mode: hasLlm ? 'compose_fallback' : 'compose',
  };
}

/**
 * @param {{ method: string, origin?: string, body?: { question?: string, lang?: string } }} req
 */
export async function handleFaqHttpRequest(req) {
  const origin = req.origin || '';
  const headers = faqCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return { status: 204, headers, body: null };
  }

  if (req.method !== 'POST') {
    return { status: 404, headers, body: { error: 'not_found' } };
  }

  const question = String(req.body?.question ?? '').trim().slice(0, 500);
  const lang = req.body?.lang === 'en' ? 'en' : 'de';
  if (!question) {
    return { status: 400, headers, body: { error: 'missing_question' } };
  }

  try {
    const result = await handleFaqChat(question, lang);
    return { status: 200, headers, body: result };
  } catch (err) {
    console.error(err);
    return { status: 500, headers, body: { error: 'server_error' } };
  }
}
