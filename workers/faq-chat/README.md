# DPP-Flash FAQ Chat Worker

Smart FAQ assistant backend: loads `faq-knowledge.json`, retrieves relevant chunks, answers via **Microsoft Foundry** (gpt-5.4-nano), OpenAI, or Workers AI.

## Microsoft Foundry (ohne Azure Function App)

Endpoint und Modell stehen in `wrangler.toml`. Nur den Key als Secret setzen:

```bash
cd workers/faq-chat
npx wrangler login
npx wrangler secret put AZURE_OPENAI_API_KEY
```

Lokal: gleicher Key in `workers/faq-chat/.dev.vars` als `AZURE_OPENAI_API_KEY=...`

Alternativ OpenAI.com: `wrangler secret put OPENAI_API_KEY`  
Ohne Keys: optional Workers AI (`USE_WORKERS_AI=1`).

## Deploy (Cloudflare Dashboard / CLI)

Im Dashboard: **Build** → **Compute** → **Workers & Pages** → **Create** → **Create Worker**  
oder vom Repo (empfohlen):

```bash
# Repo-Root
npm run build:faq-worker
cd workers/faq-chat
npx wrangler login          # öffnet Browser → Konto kontakt@dppflash.de
npx wrangler secret put AZURE_OPENAI_API_KEY
npx wrangler deploy
```

Nach dem Deploy zeigt die CLI eine URL, z. B.  
`https://dppflash-faq-chat.<subdomain>.workers.dev`

In [`assets/faq-worker-config.js`](../../assets/faq-worker-config.js) (Produktion):

```javascript
window.DPP_FAQ_API_URL = 'https://dppflash-faq-chat.<subdomain>.workers.dev';
```

Dann `npm run build:faq-assistant` und Website pushen. **dppflash.de** kann weiter auf GitHub Pages liegen — nur die FAQ-API läuft auf Cloudflare.

### GitHub Actions (optional)

Repository secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `AZURE_OPENAI_API_KEY`  
→ Workflow „Deploy FAQ Chat Worker“ (manuell oder bei Push auf `workers/faq-chat/`).

## Local dev

```bash
# repo root
npm run build:faq-knowledge
npm run build:faq-retrieval
cd workers/faq-chat
wrangler dev
```

Static site: `npm run dev` → open `http://localhost:8080/?faqApi=http://127.0.0.1:8787`

## Environment

| Variable | Description |
|----------|-------------|
| `KNOWLEDGE_URL` | JSON corpus (default: production `assets/faq-knowledge.json`) |
| `OPENAI_API_KEY` | Secret — gpt-4o-mini |
| `AI` | Workers AI binding (fallback Llama 3.1 8B) |
