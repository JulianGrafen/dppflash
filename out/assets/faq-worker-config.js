/**
 * FAQ-API (Cloudflare Worker). Foundry-Key nur als Worker-Secret.
 * Worker-URL nach deploy: https://dppflash-faq-chat.kontakt-e16.workers.dev
 */
(function () {
  var host = window.location.hostname;
  var workerUrl = 'https://dppflash-faq-chat.kontakt-e16.workers.dev';
  if (host === 'localhost' || host === '127.0.0.1') {
    window.DPP_FAQ_API_URL = 'http://127.0.0.1:8787';
    return;
  }
  window.DPP_FAQ_API_URL = workerUrl;
})();
