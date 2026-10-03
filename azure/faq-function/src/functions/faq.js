import { app } from '@azure/functions';
import { handleFaqHttpRequest } from '../../_app/scripts/faq-api-handler.mjs';

app.http('faq', {
  methods: ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'faq',
  handler: async (request) => {
    let body = {};
    if (request.method === 'POST') {
      try {
        body = await request.json();
      } catch {
        body = {};
      }
    }

    const result = await handleFaqHttpRequest({
      method: request.method,
      origin: request.headers.get('origin') || '',
      body,
    });

    const headers = { ...result.headers, 'Content-Type': 'application/json' };
    return {
      status: result.status,
      headers,
      jsonBody: result.body ?? undefined,
    };
  },
});
