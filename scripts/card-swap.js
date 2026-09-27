import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { resolvePageScroller } from './scroll-scroller.js';

gsap.registerPlugin(ScrollTrigger);

let scrollDefaultsApplied = false;

function ensureScrollTriggerScroller() {
  const scroller = resolvePageScroller();
  if (!scrollDefaultsApplied) {
    ScrollTrigger.defaults({ scroller });
    scrollDefaultsApplied = true;
  }
  return scroller;
}

if (typeof window !== 'undefined') {
  window.gsap = gsap;
  window.ScrollTrigger = ScrollTrigger;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureScrollTriggerScroller);
  } else {
    ensureScrollTriggerScroller();
  }
}

function makeSlot(i, distX, distY, total) {
  return {
    x: i * distX,
    y: -i * distY,
    z: -i * distX * 1.5,
    zIndex: total - i,
  };
}

function placeNow(el, slot, skew) {
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: 'center center',
    zIndex: slot.zIndex,
    force3D: true,
  });
}

function getConfig(easing) {
  if (easing === 'elastic') {
    return {
      ease: 'elastic.out(0.6,0.9)',
      durDrop: 2,
      durMove: 2,
      durReturn: 2,
      promoteOverlap: 0.9,
      returnDelay: 0.05,
    };
  }
  return {
    ease: 'power1.inOut',
    durDrop: 0.8,
    durMove: 0.8,
    durReturn: 0.8,
    promoteOverlap: 0.45,
    returnDelay: 0.2,
  };
}

function getScrollSwapConfig() {
  return {
    ease: 'power2.out',
    durDrop: 0.48,
    durMove: 0.42,
    durReturn: 0.48,
    promoteOverlap: 0.55,
    returnDelay: 0.08,
  };
}

function appendSwapToTimeline(tl, order, cards, config, cardDistance, verticalDistance) {
  if (order.length < 2) return;

  const front = order[0];
  const rest = order.slice(1);
  const elFront = cards[front];

  tl.to(elFront, {
    y: '+=420',
    duration: config.durDrop,
    ease: config.ease,
  });

  tl.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`);
  rest.forEach((idx, i) => {
    const el = cards[idx];
    const slot = makeSlot(i, cardDistance, verticalDistance, cards.length);
    tl.set(el, { zIndex: slot.zIndex }, 'promote');
    tl.to(
      el,
      {
        x: slot.x,
        y: slot.y,
        z: slot.z,
        duration: config.durMove,
        ease: config.ease,
      },
      `promote+=${i * 0.12}`,
    );
  });

  const backSlot = makeSlot(cards.length - 1, cardDistance, verticalDistance, cards.length);
  tl.addLabel('return', `promote+=${config.durMove * config.returnDelay}`);
  tl.call(() => {
    gsap.set(elFront, { zIndex: backSlot.zIndex });
  }, undefined, 'return');
  tl.to(
    elFront,
    {
      x: backSlot.x,
      y: backSlot.y,
      z: backSlot.z,
      duration: config.durReturn,
      ease: config.ease,
    },
    'return',
  );

  order.splice(0, order.length, ...rest, front);
}

function initScrollSwaps(scrollHost, opts) {
  const {
    cards,
    config,
    cardDistance,
    verticalDistance,
    skewAmount,
    maxSwaps,
  } = opts;

  const runway = scrollHost.querySelector('.story-news-swap__scroller');
  const sticky = scrollHost.querySelector('.story-news-swap__sticky');
  const stage = scrollHost.querySelector('.story-news-swap__stage');
  if (!runway || !sticky || maxSwaps < 1) return () => {};

  ensureScrollTriggerScroller();
  const scroller = resolvePageScroller();

  const viewportHeight = () => window.visualViewport?.height ?? window.innerHeight;
  const isNarrow = () => window.matchMedia('(max-width: 768px)').matches;

  const pinStartOffset = () => {
    const hostVar = parseFloat(getComputedStyle(scrollHost).getPropertyValue('--story-sticky-top'));
    if (Number.isFinite(hostVar)) return hostVar;
    const stickyTop = parseFloat(getComputedStyle(sticky).top);
    return Number.isFinite(stickyTop) ? stickyTop : 88;
  };

  const stepPerSlide = () => {
    const vh = viewportHeight();
    if (isNarrow()) return Math.max(200, vh * 0.46);
    return Math.max(140, vh * 0.24);
  };

  const scrollDistance = () => Math.max(1, maxSwaps) * stepPerSlide();

  const order = Array.from({ length: cards.length }, (_, i) => i);
  const masterTl = gsap.timeline({ paused: true });
  for (let i = 0; i < maxSwaps; i++) {
    appendSwapToTimeline(masterTl, order, cards, config, cardDistance, verticalDistance);
  }

  const resetStack = () => {
    order.splice(0, order.length, ...Array.from({ length: cards.length }, (_, i) => i));
    cards.forEach((el, i) => {
      placeNow(el, makeSlot(i, cardDistance, verticalDistance, cards.length), skewAmount);
    });
    masterTl.pause(0);
  };

  let pinTrigger = null;
  let lastTapAt = 0;

  const onStageClick = () => {
    if (!pinTrigger?.isActive) return;
    const now = Date.now();
    if (now - lastTapAt < 380) return;
    lastTapAt = now;
    const step = 1 / maxSwaps;
    const next = Math.min(1, masterTl.progress() + step);
    gsap.to(masterTl, { progress: next, duration: 0.35, ease: 'power2.out', overwrite: true });
  };

  if (stage) {
    stage.style.cursor = 'pointer';
    stage.addEventListener('click', onStageClick);
  }

  scrollHost.classList.add('story-pin--scroll-driven');

  pinTrigger = ScrollTrigger.create({
    trigger: scrollHost,
    start: () => `top top+=${pinStartOffset()}`,
    end: () => `+=${scrollDistance()}`,
    pin: sticky,
    pinSpacing: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    scrub: 0.45,
    animation: masterTl,
    scroller,
    onLeaveBack() {
      resetStack();
    },
  });

  const refreshPin = () => {
    pinTrigger?.refresh();
  };

  window.addEventListener('resize', refreshPin, { passive: true });
  window.visualViewport?.addEventListener('resize', refreshPin, { passive: true });

  return () => {
    scrollHost.classList.remove('story-pin--scroll-driven');
    window.removeEventListener('resize', refreshPin);
    window.visualViewport?.removeEventListener('resize', refreshPin);
    pinTrigger?.kill();
    pinTrigger = null;
    stage?.removeEventListener('click', onStageClick);
    masterTl.kill();
  };
}

function initCardSwap(root) {
  const cards = [...root.querySelectorAll(':scope > .card')];
  if (!cards.length) return () => {};

  const cardDistance = Number(root.dataset.cardDistance) || 60;
  const verticalDistance = Number(root.dataset.verticalDistance) || 70;
  const delay = Number(root.dataset.delay) || 5000;
  const pauseOnHover = root.dataset.pauseOnHover === 'true';
  const skewAmount = Number(root.dataset.skewAmount) || 6;
  const easing = root.dataset.easing || 'elastic';
  const width = Number(root.dataset.width) || 500;
  const height = Number(root.dataset.height) || 400;
  const scrollHost = root.closest('[data-card-swap-scroll]');
  const scrollDriven = Boolean(scrollHost || root.dataset.scrollDriven === 'true');

  root.style.width = `${width}px`;
  root.style.height = `${height}px`;
  cards.forEach((card) => {
    card.style.width = `${width}px`;
    card.style.height = `${height}px`;
  });

  const config = scrollDriven ? getScrollSwapConfig() : getConfig(easing);
  const order = Array.from({ length: cards.length }, (_, i) => i);
  let tlRef = null;
  let intervalRef = null;
  let animating = false;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function swap(onComplete) {
    if (order.length < 2) {
      onComplete?.();
      return;
    }
    if (animating) {
      gsap.delayedCall(0.04, () => swap(onComplete));
      return;
    }
    animating = true;

    const tl = gsap.timeline({
      onComplete: () => {
        animating = false;
        onComplete?.();
      },
    });
    tlRef = tl;
    appendSwapToTimeline(tl, order, cards, config, cardDistance, verticalDistance);
  }

  cards.forEach((el, i) => {
    placeNow(el, makeSlot(i, cardDistance, verticalDistance, cards.length), skewAmount);
  });

  if (reduced) return () => {};

  const cleanups = [];

  if (scrollDriven && scrollHost) {
    const scroller = scrollHost.querySelector('.story-news-swap__scroller');
    scroller?.style.setProperty('--card-swap-steps', String(cards.length));

    cleanups.push(
      initScrollSwaps(scrollHost, {
        cards,
        config,
        cardDistance,
        verticalDistance,
        skewAmount,
        maxSwaps: cards.length - 1,
      }),
    );
    return () => cleanups.forEach((fn) => fn());
  }

  let started = false;

  function start() {
    if (started) return;
    started = true;
    swap();
    intervalRef = window.setInterval(() => swap(), delay);
  }

  const pause = () => {
    tlRef?.pause();
    if (intervalRef) window.clearInterval(intervalRef);
    intervalRef = null;
  };

  const resume = () => {
    if (!started) return;
    tlRef?.play();
    if (!intervalRef) intervalRef = window.setInterval(() => swap(), delay);
  };

  if (pauseOnHover) {
    root.addEventListener('mouseenter', pause);
    root.addEventListener('mouseleave', resume);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      observer.disconnect();
      start();
    },
    { threshold: 0.2 },
  );
  observer.observe(root);

  return () => {
    if (intervalRef) window.clearInterval(intervalRef);
    observer.disconnect();
    if (pauseOnHover) {
      root.removeEventListener('mouseenter', pause);
      root.removeEventListener('mouseleave', resume);
    }
  };
}

function refreshCardSwapScroll() {
  ensureScrollTriggerScroller();
  ScrollTrigger.refresh(true);
}

function initAll() {
  document.querySelectorAll('[data-card-swap]').forEach(initCardSwap);
  requestAnimationFrame(refreshCardSwapScroll);
}

function boot() {
  initAll();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

window.addEventListener('load', () => {
  window.setTimeout(refreshCardSwapScroll, 100);
});
window.addEventListener('dpp:scroll-layout', refreshCardSwapScroll);
