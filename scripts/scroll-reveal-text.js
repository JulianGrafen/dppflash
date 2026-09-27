import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ROOT_CLASS = 'scroll-reveal-text';
const WORD_CLASS = 'word';

function parseOpts(el) {
  const num = (attr, fallback) => {
    const v = el.getAttribute(attr);
    if (v === null || v === '') return fallback;
    const x = Number(v);
    return Number.isFinite(x) ? x : fallback;
  };
  const bool = (attr, fallback) => {
    const v = el.getAttribute(attr);
    if (v === null || v === '') return fallback;
    return v === 'true' || v === '1';
  };
  return {
    baseOpacity: num('data-scroll-reveal-base-opacity', 0.1),
    baseRotation: num('data-scroll-reveal-rotation', 3),
    blurStrength: num('data-scroll-reveal-blur', 4),
    enableBlur: bool('data-scroll-reveal-enable-blur', true),
    rotationEnd: el.getAttribute('data-scroll-reveal-rotation-end') || 'bottom bottom',
    wordAnimationEnd: el.getAttribute('data-scroll-reveal-word-end') || 'top 55%',
  };
}

function splitWords(el) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  for (const node of textNodes) {
    const text = node.textContent;
    if (!text) continue;
    const parts = text.split(/(\s+)/);
    const frag = document.createDocumentFragment();
    for (const part of parts) {
      if (/^\s+$/.test(part)) {
        frag.appendChild(document.createTextNode(part));
      } else if (part) {
        const span = document.createElement('span');
        span.className = WORD_CLASS;
        span.textContent = part;
        frag.appendChild(span);
      }
    }
    node.parentNode.replaceChild(frag, node);
  }
}

function unwrapWords(el) {
  el.querySelectorAll(`.${WORD_CLASS}`).forEach((word) => {
    word.replaceWith(document.createTextNode(word.textContent));
  });
  el.normalize();
}

function transformOrigin(el) {
  const custom = el.getAttribute('data-scroll-reveal-transform-origin');
  if (custom) return custom;
  if (el.classList.contains('story-typewriter__follow')) return '50% 50%';
  return '0% 50%';
}

function teardown(el) {
  const triggers = el._scrollRevealTriggers;
  if (triggers) triggers.forEach((st) => st.kill());
  el._scrollRevealTriggers = null;
  const tweens = el._scrollRevealTweens;
  if (tweens) tweens.forEach((tw) => tw.kill());
  el._scrollRevealTweens = null;
}

function initScrollRevealText(el) {
  if (el.dataset.scrollRevealInit === '1') return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const opts = parseOpts(el);

  splitWords(el);
  const words = el.querySelectorAll(`.${WORD_CLASS}`);
  if (!words.length) return;

  el.dataset.scrollRevealInit = '1';
  el.classList.add(ROOT_CLASS);

  if (reducedMotion) {
    gsap.set(el, { rotation: 0, clearProps: 'transform' });
    gsap.set(words, { opacity: 1, filter: 'blur(0px)' });
    return;
  }

  const origin = transformOrigin(el);
  gsap.set(el, { transformOrigin: origin, rotation: opts.baseRotation });
  gsap.set(words, {
    opacity: opts.baseOpacity,
    filter: opts.enableBlur ? `blur(${opts.blurStrength}px)` : 'blur(0px)',
  });

  const tweens = [];
  const triggers = [];

  const rot = gsap.to(el, {
    rotation: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: el,
      start: 'top bottom',
      end: opts.rotationEnd,
      scrub: true,
      invalidateOnRefresh: true,
    },
  });
  tweens.push(rot);
  if (rot.scrollTrigger) triggers.push(rot.scrollTrigger);

  const fade = gsap.to(words, {
    opacity: 1,
    ease: 'none',
    stagger: 0.05,
    scrollTrigger: {
      trigger: el,
      start: 'top bottom-=15%',
      end: opts.wordAnimationEnd,
      scrub: true,
      invalidateOnRefresh: true,
    },
  });
  tweens.push(fade);
  if (fade.scrollTrigger) triggers.push(fade.scrollTrigger);

  if (opts.enableBlur) {
    const blur = gsap.to(words, {
      filter: 'blur(0px)',
      ease: 'none',
      stagger: 0.05,
      scrollTrigger: {
        trigger: el,
        start: 'top bottom-=15%',
        end: opts.wordAnimationEnd,
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
    tweens.push(blur);
    if (blur.scrollTrigger) triggers.push(blur.scrollTrigger);
  }

  el._scrollRevealTweens = tweens;
  el._scrollRevealTriggers = triggers;
  ScrollTrigger.refresh();
}

function reinitAll() {
  document.querySelectorAll('[data-scroll-reveal]').forEach((el) => {
    teardown(el);
    unwrapWords(el);
    el.classList.remove(ROOT_CLASS);
    delete el.dataset.scrollRevealInit;
    gsap.set(el, { clearProps: 'all' });
    initScrollRevealText(el);
  });
  ScrollTrigger.refresh(true);
  window.dispatchEvent(new Event('dpp:scroll-layout'));
}

function boot() {
  document.querySelectorAll('[data-scroll-reveal]').forEach(initScrollRevealText);
  ScrollTrigger.refresh(true);
  window.dispatchEvent(new Event('dpp:scroll-layout'));
}

document.addEventListener('DOMContentLoaded', () => {
  window.setTimeout(boot, 0);
});
window.addEventListener('load', () => {
  boot();
  ScrollTrigger.refresh(true);
  window.dispatchEvent(new Event('dpp:scroll-layout'));
});
window.addEventListener('dppflash:langchange', () => {
  window.setTimeout(reinitAll, 0);
});
