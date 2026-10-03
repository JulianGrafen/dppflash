import {
  retrieveFromKnowledge,
  buildContextBlock,
  LOW_CONFIDENCE_REPLY,
} from './retrieval.js';
import bundledKnowledge from './knowledge.json';

const ALLOWED_ORIGINS = new Set([
  'https://dppflash.de',
  'https://www.dppflash.de',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
]);

const RATE_LIMIT = 40;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const rateMap = new Map();

function corsHeaders(origin) {
  const allow =
    origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://dppflash.de';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW_MS) {
    rateMap.set(ip, { start: now, count: 1 });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count += 1;
  return true;
}

async function loadKnowledge(env, ctx) {
  if (bundledKnowledge?.chunks?.length) {
    return bundledKnowledge;
  }

  const url = env.KNOWLEDGE_URL || 'https://dppflash.de/assets/faq-knowledge.json';
  const cache = caches.default;
  const cacheKey = new Request(url, { method: 'GET' });
  const cached = await cache.match(cacheKey);
  if (cached) return cached.json();

  const res = await fetch(url);
  if (!res.ok) throw new Error('knowledge_fetch');
  const data = await res.json();
  ctx.waitUntil(
    cache.put(
      cacheKey,
      new Response(JSON.stringify(data), {
        headers: { 'Cache-Control': 'max-age=3600' },
      }),
    ),
  );
  return data;
}

async function callWorkersAi(env, system, question) {
  if (!env.AI) return null;
  try {
    const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: question },
      ],
      max_tokens: 450,
    });
    return result?.response?.trim() || null;
  } catch {
    return null;
  }
}

function buildSystemPrompt(lang, context) {
  const base =
    lang === 'en'
      ? `You are the DPP-Flash website assistant. Use ONLY the context below. Answer the user's question directly in plain language (2–5 sentences). For pricing, list tiers with EUR amounts from context. Plain text only — no Markdown, no asterisks. Never invent features or prices. If unsure, say so and give kontakt@dppflash.de. Not legal advice.`
      : `Du bist der DPP-Flash Website-Assistent. Nutze NUR den Kontext unten. Beantworte die Frage des Nutzers direkt in klaren Sätzen (2–5 Sätze). Bei Preisen: Tarife mit EUR-Beträgen aus dem Kontext nennen. Nur Fließtext — kein Markdown, keine Sternchen (**). Keine erfundenen Features oder Preise. Bei Unsicherheit: sagen und kontakt@dppflash.de nennen. Keine Rechtsberatung.`;
  return `${base}\n\n--- Kontext ---\n${context}`;
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '';
    const headers = corsHeaders(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers });
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (!checkRateLimit(ip)) {
      return Response.json({ error: 'rate_limit' }, { status: 429, headers });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: 'invalid_json' }, { status: 400, headers });
    }

    const question = String(body.question ?? '').trim().slice(0, 500);
    const lang = body.lang === 'en' ? 'en' : 'de';
    if (!question) {
      return Response.json({ error: 'missing_question' }, { status: 400, headers });
    }

    let knowledge;
    try {
      knowledge = await loadKnowledge(env, ctx);
    } catch {
      return Response.json({ error: 'knowledge_unavailable' }, { status: 503, headers });
    }

    const { chunks, confidence } = retrieveFromKnowledge(knowledge, question, lang);
    if (confidence === 'low' || !chunks.length) {
      return Response.json({ answer: LOW_CONFIDENCE_REPLY[lang], confidence: 'low' }, { headers });
    }

    const context = buildContextBlock(chunks);
    const system = buildSystemPrompt(lang, context);
    const userPrompt =
      lang === 'en'
        ? `User question: ${question}\n\nAnswer directly in 2–5 sentences.`
        : `Nutzerfrage: ${question}\n\nAntworte direkt in 2–5 Sätzen.`;

    let answer = null;
    let mode = 'ai';
    if (env.AZURE_OPENAI_API_KEY && env.AZURE_FOUNDRY_PROJECT_ENDPOINT) {
      answer = await callAzureFoundry(env, system, userPrompt);
      mode = 'azure_foundry';
    }
    if (!answer && env.OPENAI_API_KEY) {
      answer = await callOpenAiFixed(env, system, userPrompt);
      mode = 'openai';
    }
    if (!answer && (env.USE_WORKERS_AI === '1' || (!env.OPENAI_API_KEY && !env.AZURE_OPENAI_API_KEY))) {
      answer = await callWorkersAi(env, system, userPrompt);
      mode = 'workers_ai';
    }
    if (!answer) {
      return Response.json({ error: 'llm_unavailable' }, { status: 503, headers });
    }

    return Response.json({ answer, confidence: 'high', mode }, { headers });
  },
};

async function callAzureFoundry(env, system, userPrompt) {
  const base = String(env.AZURE_FOUNDRY_PROJECT_ENDPOINT || '').replace(/\/$/, '');
  if (!base) return null;
  const model = env.FAQ_LLM_DEPLOYMENT || 'gpt-5.4-nano';
  const url = `${base}/openai/v1/chat/completions`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'api-key': env.AZURE_OPENAI_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.15,
      max_completion_tokens: 450,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userPrompt },
      ],
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() || null;
}

async function callOpenAiFixed(env, system, userPrompt) {
  const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.15,
      max_tokens: 450,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userPrompt },
      ],
    }),
  });
  if (!openaiRes.ok) return null;
  const data = await openaiRes.json();
  return data?.choices?.[0]?.message?.content?.trim() || null;
}
