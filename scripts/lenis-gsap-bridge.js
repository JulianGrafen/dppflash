/** Wire Lenis smooth scroll to GSAP ScrollTrigger (idempotent). */
export function wireLenisToScrollTrigger(gsap, ScrollTrigger) {
  const lenis = window.DppLenis;
  if (!lenis || window.__dppLenisGsapWired) return false;
  window.__dppLenisGsapWired = true;

  lenis.on('scroll', ScrollTrigger.update);

  if (gsap?.ticker) {
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  requestAnimationFrame(() => ScrollTrigger.refresh(true));
  return true;
}
