const EMAIL_IN_TEXT_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

export function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Fließtext → sicheres HTML mit **fett** und mailto-Links */
export function faqAnswerToHtml(text) {
  let html = escapeHtml(text);
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(EMAIL_IN_TEXT_RE, (email) => {
    const href = `mailto:${email}`;
    return `<a href="${href}" class="faq-answer-mailto">${email}</a>`;
  });
  return html;
}

export function faqAnswerNeedsHtml(text) {
  if (!text) return false;
  return /\*\*[^*]+\*\*/.test(text) || EMAIL_IN_TEXT_RE.test(text);
}
