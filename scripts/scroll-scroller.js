/** Shared page scroll root for GSAP ScrollTrigger (html vs body). */
export function resolvePageScroller() {
  const html = document.documentElement;
  const body = document.body;
  if (!body) return html;
  if (body.scrollTop > 0 && html.scrollTop === 0) return body;
  const bodyY = getComputedStyle(body).overflowY;
  if (
    (bodyY === 'auto' || bodyY === 'scroll') &&
    body.scrollHeight > body.clientHeight + 1 &&
    html.scrollHeight <= html.clientHeight + 1
  ) {
    return body;
  }
  return document.scrollingElement || html;
}
