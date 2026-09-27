import gsap from 'gsap';

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

function initScrollSwaps(scrollHost, state) {
  const { maxSwaps, swap, resetStack } = state;
  const runway = scrollHost.querySelector('.story-news-swap__scroller');
  const sticky = scrollHost.querySelector('.story-news-swap__sticky');
  const stage = scrollHost.querySelector('.story-news-swap__stage');
  if (!runway || !sticky) return () => {};

  let currentStep = 0;
  let busy = false;
  let lastGestureAt = 0;

  const segmentCount = () => Math.max(1, maxSwaps);

  const viewportHeight = () => window.visualViewport?.height ?? window.innerHeight;

  const stickyTop = () => {
    const top = getComputedStyle(sticky).top;
    const value = parseFloat(top);
    return Number.isFinite(value) ? value : 88;
  };

  const stepPerSlide = () => {
    const vh = viewportHeight();
    return Math.max(112, vh * 0.17);
  };

  let runwayScrollPx = 0;

  const updateRunway = () => {
    runwayScrollPx = segmentCount() * stepPerSlide();
    const stageH = stage?.offsetHeight ?? sticky.offsetHeight;
    const stickyPad = parseFloat(getComputedStyle(sticky).paddingBottom) || 0;
    const exitPad = Math.round(viewportHeight() * 0.12);
    runway.style.minHeight = `${Math.round(runwayScrollPx + stageH + stickyPad + exitPad)}px`;
  };

  const isInZone = () => {
    const rect = runway.getBoundingClientRect();
    const top = stickyTop();
    return rect.top <= top + 8 && rect.bottom > top + 80;
  };

  const runwayProgress = () => {
    const top = stickyTop();
    const scrolled = top - runway.getBoundingClientRect().top;
    if (scrolled <= 0 || runwayScrollPx <= 0) return 0;
    return Math.min(1, scrolled / runwayScrollPx);
  };

  const requestAdvance = () => {
    if (busy || currentStep >= maxSwaps) return false;
    const now = Date.now();
    if (now - lastGestureAt < 420) return false;
    lastGestureAt = now;
    busy = true;
    swap(() => {
      currentStep += 1;
      busy = false;
    });
    return true;
  };

  const resetIfAbove = () => {
    const rect = scrollHost.getBoundingClientRect();
    if (rect.top > stickyTop() + viewportHeight() * 0.35 && currentStep > 0) {
      currentStep = 0;
      lastGestureAt = 0;
      resetStack?.();
    }
  };

  const onScroll = () => {
    resetIfAbove();
    if (!isInZone() || busy || currentStep >= maxSwaps) return;
    const nextThreshold = (currentStep + 1) / segmentCount();
    if (runwayProgress() >= nextThreshold * 0.82) {
      requestAdvance();
    }
  };

  const onWheel = (e) => {
    if (!isInZone() || busy) return;
    if (currentStep >= maxSwaps) return;
    if (e.deltaY <= 8) return;
    e.preventDefault();
    requestAdvance();
  };

  const onStageClick = () => {
    if (!isInZone() || busy || currentStep >= maxSwaps) return;
    requestAdvance();
  };

  if (stage) {
    stage.style.cursor = 'pointer';
    stage.addEventListener('click', onStageClick);
  }

  updateRunway();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('resize', updateRunway, { passive: true });
  window.visualViewport?.addEventListener('resize', updateRunway, { passive: true });
  window.addEventListener('load', updateRunway, { once: true });

  return () => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('resize', updateRunway);
    window.visualViewport?.removeEventListener('resize', updateRunway);
    stage?.removeEventListener('click', onStageClick);
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

    const resetStack = () => {
      order.splice(0, order.length, ...Array.from({ length: cards.length }, (_, i) => i));
      cards.forEach((el, i) => {
        placeNow(el, makeSlot(i, cardDistance, verticalDistance, cards.length), skewAmount);
      });
    };

    cleanups.push(
      initScrollSwaps(scrollHost, {
        swap,
        resetStack,
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
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}
