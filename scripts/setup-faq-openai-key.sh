#!/usr/bin/env bash
# Writes OpenAI key to workers/faq-chat/.dev.vars (gitignored) for wrangler dev.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/workers/faq-chat/.dev.vars"

if [[ "${1:-}" == "" ]]; then
  echo "Usage: ./scripts/setup-faq-openai-key.sh <OPENAI_API_KEY>"
  echo "Or:    OPENAI_API_KEY=sk-... ./scripts/setup-faq-openai-key.sh"
  exit 1
fi

KEY="${1:-$OPENAI_API_KEY}"
if [[ ! "$KEY" =~ ^sk- ]]; then
  echo "Expected an OpenAI key starting with sk-"
  exit 1
fi

printf 'OPENAI_API_KEY=%s\n' "$KEY" > "$OUT"
echo "Wrote $OUT (gitignored)."
echo "Local worker: cd workers/faq-chat && npx wrangler dev"
echo "Production:   cd workers/faq-chat && npx wrangler secret put OPENAI_API_KEY"
