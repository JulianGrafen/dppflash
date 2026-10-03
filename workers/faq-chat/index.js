/**
 * Optional Cloudflare Worker: POST { question, context, lang } → { answer }
 * Set secret OPENAI_API_KEY and deploy; then add to index.html:
 * <meta name="dpp-faq-chat-api" content="https://faq-chat.<your-worker>.workers.dev">
 */
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: CORS });
    }
    if (!env.OPENAI_API_KEY) {
      return Response.json({ error: 'not_configured' }, { status: 503, headers: CORS });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: 'invalid_json' }, { status: 400, headers: CORS });
    }

    const question = String(body.question ?? '').trim().slice(0, 500);
    const context = String(body.context ?? '').trim().slice(0, 12_000);
    const lang = body.lang === 'en' ? 'en' : 'de';
    if (!question) {
      return Response.json({ error: 'missing_question' }, { status: 400, headers: CORS });
    }

    const system =
      lang === 'en'
        ? 'You are the DPP-Flash website assistant. Answer only from the provided context about DPP-Flash, Digital Product Passports, and ESPR. If the context is insufficient, say so and suggest kontakt@dppflash.de. Be concise (max 120 words). No legal guarantees.'
        : 'Du bist der DPP-Flash Website-Assistent. Antworte nur aus dem gelieferten Kontext zu DPP-Flash, Digitalem Produktpass und ESPR. Wenn der Kontext nicht reicht, sage das und verweise auf kontakt@dppflash.de. Kurz (max. 120 Wörter). Keine Rechtsgarantien.';

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        max_tokens: 350,
        messages: [
          { role: 'system', content: `${system}\n\n--- Kontext ---\n${context}` },
          { role: 'user', content: question },
        ],
      }),
    });

    if (!openaiRes.ok) {
      return Response.json({ error: 'upstream' }, { status: 502, headers: CORS });
    }

    const data = await openaiRes.json();
    const answer = data?.choices?.[0]?.message?.content?.trim() ?? '';
    return Response.json({ answer }, { headers: CORS });
  },
};
