# FAQ-API auf Azure (ohne Container)

Der **Foundry-Projektlink** (`https://dpp-faq-bot.services.ai.azure.com/api/projects/proj-default`) ist **nur** die Modell-API — nicht für den Browser. Diese **Function App** ist die öffentliche URL für dppflash.de; der Key bleibt in Azure.

## 1. Function App anlegen (Portal)

1. [Azure Portal](https://portal.azure.com) → **Function App** → Erstellen  
2. Runtime: **Node.js 20**, Plan: **Consumption** (Serverless, kein Container)  
3. Region z. B. West Europe  

## 2. App-Einstellungen (Configuration → Application settings)

| Name | Wert |
|------|------|
| `AZURE_FOUNDRY_PROJECT_ENDPOINT` | `https://dpp-faq-bot.services.ai.azure.com/api/projects/proj-default` |
| `AZURE_OPENAI_API_KEY` | Ihr Foundry-Key (Key Vault empfohlen) |
| `FAQ_LLM_DEPLOYMENT` | `gpt-5.4-nano` |

## 3. Code deployen

Vom **Repository-Root** (nicht nur `azure/faq-function`), damit `scripts/` und `assets/faq-knowledge.json` mitkommen:

```bash
npm run build:faq-knowledge
cd azure/faq-function && npm install
cd ../..
# Azure Functions Core Tools + func login
func azure functionapp publish <IHR-FUNCTION-APP-NAME> --javascript
```

Alternativ: VS Code Extension „Azure Functions“ → Deploy from repo root mit `azure/faq-function` als Projektordner (Working Directory = Repo-Root in `local.settings` / deploy config prüfen).

Nach Deploy ist die URL:

`https://<app-name>.azurewebsites.net/api/faq`

## 4. Website verbinden

In [`assets/faq-worker-config.js`](../../assets/faq-worker-config.js) auf Produktion:

```javascript
window.DPP_FAQ_API_URL = 'https://<app-name>.azurewebsites.net/api/faq';
```

Dann `npm run build:faq-assistant` und Git push.

## Lokal mit Functions CLI

```bash
cp azure/faq-function/local.settings.json.example azure/faq-function/local.settings.json
# Key eintragen
npm run build:faq-knowledge
cd azure/faq-function && npm install && func start
```

Test: `curl -X POST http://localhost:7071/api/faq -H 'Content-Type: application/json' -d '{"question":"Was kostet DPP-Flash?","lang":"de"}'`
