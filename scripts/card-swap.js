import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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

function initScrollSwaps(scrollHost, state) {
  const { swap, maxSwaps, slideCount } = state;
  const sticky = scrollHost.querySelector('.story-news-swap__sticky');
  if (!sticky) return () => {};

  const stickyTop = () => {
    const top = getComputedStyle(sticky).top;
    const value = parseFloat(top);
    return Number.isFinite(value) ? value : 88;
  };

  const stepPerSlide = () => Math.max(420, window.innerHeight * 0.92);
  let performed = 0;
  let busy = false;
  let goal = 0;

  const pump = () => {
    if (busy || performed >= goal) return;
    busy = true;
    swap(() => {
      performed += 1;
      busy = false;
      pump();
    });
  };

  const applyProgress = (progress) => {
    const target = Math.min(maxSwaps, Math.round(progress * maxSwaps));
    if (target > goal) {
      goal = target;
      pump();
    }
  };

  scrollHost.style.position = 'relative';
  scrollHost.style.height = '';
  scrollHost.style.minHeight = '';

  const trigger = ScrollTrigger.create({
    trigger: scrollHost,
    start: () => `top top+=${stickyTop()}`,
    end: () => `+=${slideCount * stepPerSlide()}`,
    pin: sticky,
    pinSpacing: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    snap: {
      snapTo: (value) => Math.round(value * maxSwaps) / maxSwaps,
      duration: { min: 0.18, max: 0.5 },
      delay: 0.02,
      ease: 'power2.inOut',
    },
    onUpdate: (self) => {
      applyProgress(self.progress);
    },
  });

  const refresh = () => {
    ScrollTrigger.refresh();
    applyProgress(trigger.progress);
  };

  requestAnimationFrame(refresh);
  window.addEventListener('load', refresh, { once: true });
  window.addEventListener('resize', refresh, { passive: true });

  return () => {
    trigger.kill();
    window.removeEventListener('load', refresh);
    window.removeEventListener('resize', refresh);
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

    const front = order[0];
    const rest = order.slice(1);
    const elFront = cards[front];
    const tl = gsap.timeline({
      onComplete: () => {
        animating = false;
        onComplete?.();
      },
    });
    tlRef = tl;

    const dropY = Number(gsap.getProperty(elFront, 'y')) + 420;
    tl.to(elFront, {
      y: dropY,
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

    tl.call(() => {
      order.splice(0, order.length, ...rest, front);
    });
  }

  cards.forEach((el, i) => {
    placeNow(el, makeSlot(i, cardDistance, verticalDistance, cards.length), skewAmount);
  });

  if (reduced) return () => {};

  const cleanups = [];

  if (scrollDriven && scrollHost) {
    scrollHost.style.setProperty('--card-swap-steps', String(cards.length));
    cleanups.push(
      initScrollSwaps(scrollHost, {
        cards,
        swap,
        slideCount: cards.length,
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

function initAll() {
  document.querySelectorAll('[data-card-swap]').forEach(initCardSwap);
  requestAnimationFrame(() => ScrollTrigger.refresh());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}

window.addEventListener('load', () => ScrollTrigger.refresh());
