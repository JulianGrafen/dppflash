# FAQ mit Microsoft Foundry (ohne Function App)

Mit **nur** einem Foundry-Projekt habt ihr **keinen** öffentlichen Endpunkt für den Browser. Der Projekt-Link

`https://dpp-faq-bot.services.ai.azure.com/api/projects/proj-default`

wird **nur serverseitig** mit API-Key aufgerufen.

## Was geht ohne Azure Function App / ohne Container?

| Variante | Aufwand | KI auf Live-Site |
|----------|---------|------------------|
| **Nur Browser** (Standard) | nichts | Nein — smarte Offline-Antworten aus `faq-knowledge.json` |
| **Cloudflare Worker** (im Repo) | `wrangler deploy` + Secret | Ja — Foundry von Cloudflare aus |
| **Lokal** `npm run faq-chat:server` | nur Dev | Ja auf localhost:8080 |
| Azure Function App | optional, falls verfügbar | siehe `azure/faq-function/` |

## Empfohlen: Cloudflare Worker + Foundry

Kein Azure-Compute nötig — Foundry-Abo + Cloudflare-Konto (z. B. kontakt@dppflash.de).

**Dashboard:** Build → Compute → **Workers & Pages** (nicht „Ship something new“ für die ganze Site — das ist Pages; der FAQ-Chat ist ein **Worker**).

**Terminal (vom Repo):**

```bash
npm run build:faq-worker
cd workers/faq-chat
npx wrangler login
npx wrangler secret put AZURE_OPENAI_API_KEY
npx wrangler deploy
```

Die Worker-URL (z. B. `https://dppflash-faq-chat.<account>.workers.dev`) in [`assets/faq-worker-config.js`](../assets/faq-worker-config.js):

```javascript
window.DPP_FAQ_API_URL = 'https://dppflash-faq-chat.<account>.workers.dev';
```

Foundry-Endpoint und Deployment stehen bereits in [`workers/faq-chat/wrangler.toml`](../workers/faq-chat/wrangler.toml) (`gpt-5.4-nano`).

Lokal testen:

```bash
npm run build:faq-worker
cd workers/faq-chat && wrangler dev --local
# faq-worker-config auf http://127.0.0.1:8787 oder ?faqApi=...
```

## Ablauf

```
Browser (dppflash.de)
  → POST DPP_FAQ_API_URL
  → Cloudflare Worker (Key als Secret)
  → Foundry …/openai/v1/chat/completions
  → Antwort JSON { answer }
```

Wissen: gebündeltes `knowledge.json` + Retrieval (wie bisher). Bei API-Fehler antwortet der Browser weiterhin offline (`composeSmartAnswer`).

## Foundry-Einstellungen (Referenz)

| Variable | Wo |
|----------|-----|
| `AZURE_FOUNDRY_PROJECT_ENDPOINT` | `wrangler.toml` [vars] |
| `FAQ_LLM_DEPLOYMENT` | `wrangler.toml` — z. B. `gpt-5.4-nano` |
| `AZURE_OPENAI_API_KEY` | `wrangler secret` — **nie** ins Repo |

## Modell

**gpt-5.4-nano** reicht für kurze FAQ-Antworten mit Kontext im System-Prompt.
