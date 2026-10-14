import Lenis from 'lenis';

function shouldSkipLenis() {
  if (document.documentElement.dataset.lenis === 'off') return true;
  if (/\/experience\.html$/i.test(window.location.pathname)) return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function markNestedScrollTargets() {
  document
    .querySelectorAll('.faq-assistant__log, #mobileMenu, .nav-mobile, [data-lenis-prevent]')
    .forEach((el) => {
      if (!el.hasAttribute('data-lenis-prevent')) el.setAttribute('data-lenis-prevent', '');
    });
}

function anchorOffsetPx() {
  const header = document.getElementById('siteHeader');
  if (!header) return 72;
  return Math.ceil(header.getBoundingClientRect().height) + 8;
}

function initLenis() {
  if (shouldSkipLenis() || window.DppLenis) return;

  markNestedScrollTargets();

  const lenis = new Lenis({
    autoRaf: false,
    autoToggle: true,
    allowNestedScroll: true,
    anchors: {
      offset: anchorOffsetPx(),
    },
  });

  window.DppLenis = lenis;

  function raf(time) {
    lenis.raf(time);
    if (!window.__dppLenisGsapWired) requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  lenis.on('scroll', () => {
    window.dispatchEvent(
      new CustomEvent('dpp:lenis-scroll', {
        detail: { scroll: lenis.scroll, velocity: lenis.velocity },
      }),
    );
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLenis, { once: true });
} else {
  initLenis();
}
