# FAQ-Assistent (ohne Server)

Der Chat versucht **zuerst** die FAQ-API ([`assets/faq-worker-config.js`](../assets/faq-worker-config.js), Foundry/Node). Ohne erreichbare API antwortet er **im Browser** aus [`assets/faq-knowledge.json`](../assets/faq-knowledge.json) (Intent, FAQ-Paare, Playbooks).

## Lokal testen

```bash
npm run build:faq-knowledge   # nach Inhaltsänderungen
npm run build:faq-assistant
npm run test:faq-compose      # Golden-Fragen
npm run dev                   # http://localhost:8080/
```

## Optional: KI-Backend

Falls Sie später **LLM-Antworten** wollen (nicht für die Standard-Website nötig):

- **Node:** `npm run faq-chat:server` — siehe [`scripts/faq-chat-server.mjs`](../scripts/faq-chat-server.mjs)
- **Cloudflare Worker:** [`workers/faq-chat/README.md`](../workers/faq-chat/README.md)

Diese Pfade sind vom öffentlichen User-Flow getrennt; die Live-Site nutzt nur das gebündelte `faq-assistant.js`.
