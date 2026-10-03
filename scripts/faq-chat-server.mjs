/**
 * FAQ KI-API (Node HTTP). Lokal: npm run faq-chat:server
 * Azure ohne Container: Function App (azure/faq-function) oder App Service mit diesem Skript.
 */
import http from 'http';
import { hydrateFaqSecretsFromDevVars, handleFaqHttpRequest } from './faq-api-handler.mjs';
import { llmBackendLabel } from './faq-llm.mjs';

hydrateFaqSecretsFromDevVars();

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function isFaqPath(url) {
  return (
    url === '/' ||
    url === '/api/faq' ||
    url === '/api/faq-chat' ||
    url?.startsWith('/api/faq-chat')
  );
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || '';

  if (!isFaqPath(req.url)) {
    const headers = { 'Content-Type': 'application/json' };
    res.writeHead(404, headers);
    res.end(JSON.stringify({ error: 'not_found' }));
    return;
  }

  let body = {};
  if (req.method === 'POST') {
    try {
      const raw = await readBody(req);
      if (raw) body = JSON.parse(raw);
    } catch {
      const headers = { 'Content-Type': 'application/json' };
      res.writeHead(400, headers);
      res.end(JSON.stringify({ error: 'invalid_json' }));
      return;
    }
  }

  const result = await handleFaqHttpRequest({
    method: req.method,
    origin,
    body: req.method === 'POST' ? body : undefined,
  });

  const headers = { 'Content-Type': 'application/json', ...result.headers };
  res.writeHead(result.status, headers);
  res.end(result.body ? JSON.stringify(result.body) : '');
});

const port = Number(process.env.PORT || 8787);
server.listen(port, '0.0.0.0', () => {
  console.log(`faq-chat-server http://127.0.0.1:${port}`);
  const backend = llmBackendLabel();
  console.log(
    backend === 'none' ? 'LLM: not configured (Azure Foundry or OpenAI)' : `LLM: ${backend}`,
  );
});
