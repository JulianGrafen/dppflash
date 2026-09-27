import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { resolvePageScroller } from './scroll-scroller.js';

gsap.registerPlugin(ScrollTrigger);

function ensureScrollTriggerScroller() {
  const scroller = resolvePageScroller();
  ScrollTrigger.defaults({ scroller });
  return scroller;
}

function initHiw3(root, scrollOpts) {
  const steps = [...root.querySelectorAll('.hiw3-step')];
  const panels = [...root.querySelectorAll('.hiw3-panel')];
  if (!steps.length || !panels.length) return () => {};

  const reducedMotionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reducedMotion = () => reducedMotionMq.matches;
  let active = 0;
  let timer = null;
  let pinTrigger = null;
  let scrollLocked = false;

  function setStep(index) {
    active = ((index % steps.length) + steps.length) % steps.length;

    steps.forEach((btn, i) => {
      const isActive = i === active;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      btn.tabIndex = isActive ? 0 : -1;
    });

    panels.forEach((panel, i) => {
      panel.classList.remove('is-active', 'is-before', 'is-after');
      if (i === active) panel.classList.add('is-active');
      else if (i < active) panel.classList.add('is-before');
      else panel.classList.add('is-after');
    });
  }

  function clearAuto() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  function resetAuto() {
    clearAuto();
    if (scrollLocked || reducedMotion() || steps.length < 2) return;
    timer = setInterval(() => setStep(active + 1), 6500);
  }

  function stepFromProgress(progress) {
    const p = Math.min(1, Math.max(0, progress));
    return Math.min(steps.length - 1, Math.floor(p * steps.length + 0.02));
  }

  steps.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      setStep(i);
      if (pinTrigger?.isActive) {
        const target = (i + 0.5) / steps.length;
        const start = pinTrigger.start;
        const end = pinTrigger.end;
        const y = start + (end - start) * target;
        const scroller = resolvePageScroller();
        if (scroller === window) {
          window.scrollTo({ top: y, behavior: 'smooth' });
        } else {
          scroller.scrollTo({ top: y, behavior: 'smooth' });
        }
      } else {
        resetAuto();
      }
    });

    btn.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      event.preventDefault();
      const next =
        event.key === 'ArrowDown' ? (i + 1) % steps.length : (i - 1 + steps.length) % steps.length;
      steps[next].focus();
      setStep(next);
      resetAuto();
    });
  });

  root.addEventListener('mouseenter', clearAuto);
  root.addEventListener('mouseleave', resetAuto);
  reducedMotionMq.addEventListener('change', resetAuto);

  setStep(0);

  if (!scrollOpts || reducedMotion()) {
    resetAuto();
    return () => clearAuto();
  }

  const { scrollHost, sticky } = scrollOpts;
  const scroller = ensureScrollTriggerScroller();
  const viewportHeight = () => window.visualViewport?.height ?? window.innerHeight;
  const isNarrow = () => window.matchMedia('(max-width: 899px)').matches;

  const pinStartOffset = () => {
    const hostVar = parseFloat(getComputedStyle(scrollHost).getPropertyValue('--compliance-sticky-top'));
    return Number.isFinite(hostVar) ? hostVar : 88;
  };

  const stepPerSlide = () => {
    const vh = viewportHeight();
    if (isNarrow()) return Math.max(180, vh * 0.36);
    return Math.max(120, vh * 0.2);
  };

  const scrollDistance = () => steps.length * stepPerSlide();

  clearAuto();
  scrollLocked = true;
  scrollHost.classList.add('compliance-container--scroll-driven');

  pinTrigger = ScrollTrigger.create({
    trigger: scrollHost,
    start: () => `top top+=${pinStartOffset()}`,
    end: () => `+=${scrollDistance()}`,
    pin: sticky,
    pinSpacing: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    scroller,
    onUpdate(self) {
      const idx = stepFromProgress(self.progress);
      if (idx !== active) setStep(idx);
    },
    onLeaveBack() {
      setStep(0);
    },
  });

  const refreshPin = () => pinTrigger?.refresh();
  window.addEventListener('resize', refreshPin, { passive: true });
  window.visualViewport?.addEventListener('resize', refreshPin, { passive: true });
  window.addEventListener('dpp:scroll-layout', refreshPin);
  window.addEventListener('load', refreshPin, { once: true });

  return () => {
    scrollLocked = false;
    scrollHost.classList.remove('compliance-container--scroll-driven');
    clearAuto();
    window.removeEventListener('resize', refreshPin);
    window.visualViewport?.removeEventListener('resize', refreshPin);
    window.removeEventListener('dpp:scroll-layout', refreshPin);
    pinTrigger?.kill();
    pinTrigger = null;
  };
}

function boot() {
  document.querySelectorAll('[data-compliance-scroll]').forEach((scrollHost) => {
    const sticky = scrollHost.querySelector('.compliance-scroll__sticky');
    const root = scrollHost.querySelector('[data-hiw3]');
    if (!sticky || !root) return;
    initHiw3(root, { scrollHost, sticky });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

window.addEventListener('load', () => {
  requestAnimationFrame(() => ScrollTrigger.refresh(true));
});
