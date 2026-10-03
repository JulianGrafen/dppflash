/**
 * LLM calls for optional FAQ API: OpenAI.com or Microsoft Foundry (project endpoint).
 */

function deploymentName() {
  const fromEnv = process.env.FAQ_LLM_DEPLOYMENT?.trim();
  if (fromEnv) return fromEnv;
  if (process.env.AZURE_FOUNDRY_PROJECT_ENDPOINT?.trim()) return 'gpt-5.4-nano';
  return 'gpt-4o-mini';
}

function foundryEndpoint() {
  const raw = process.env.AZURE_FOUNDRY_PROJECT_ENDPOINT?.trim();
  if (!raw) return '';
  return raw.replace(/\/$/, '');
}

function loadAzureKey() {
  return (
    process.env.AZURE_OPENAI_API_KEY?.trim() ||
    process.env.AZURE_API_KEY?.trim() ||
    ''
  );
}

function loadOpenAiKey() {
  if (process.env.OPENAI_API_KEY?.trim()) return process.env.OPENAI_API_KEY.trim();
  return '';
}

export function llmBackendLabel() {
  if (foundryEndpoint() && loadAzureKey()) return `azure-foundry:${deploymentName()}`;
  if (loadOpenAiKey()) return `openai:${deploymentName()}`;
  return 'none';
}

/**
 * @param {{ system: string, user: string, logError?: (msg: string) => void }} opts
 * @returns {Promise<string | null>}
 */
export async function callFaqLlm({ system, user, logError = () => {} }) {
  const model = deploymentName();
  const messages = [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];

  const project = foundryEndpoint();
  const azureKey = loadAzureKey();
  if (project && azureKey) {
    const body = JSON.stringify({
      model,
      temperature: 0.15,
      max_completion_tokens: 450,
      messages,
    });
    const url = `${project}/openai/v1/chat/completions`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'api-key': azureKey,
        'Content-Type': 'application/json',
      },
      body,
    });
    if (!res.ok) {
      logError(`Azure Foundry ${res.status}: ${await res.text().catch(() => '')}`);
      return null;
    }
    const data = await res.json();
    return data?.choices?.[0]?.message?.content?.trim() || null;
  }

  const openAiKey = loadOpenAiKey();
  if (!openAiKey) return null;

  const body = JSON.stringify({
    model,
    temperature: 0.15,
    max_tokens: 450,
    messages,
  });

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openAiKey}`,
      'Content-Type': 'application/json',
    },
    body,
  });
  if (!res.ok) {
    logError(`OpenAI ${res.status}: ${await res.text().catch(() => '')}`);
    return null;
  }
  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() || null;
}
