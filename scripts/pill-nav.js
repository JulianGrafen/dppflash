import { gsap } from 'gsap';

function isExternalLink(href) {
  return (
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('//') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:')
  );
}

function createPillLink(item, index, activeHref, handlers) {
  const a = document.createElement('a');
  a.href = item.href;
  a.className = `pill${activeHref === item.href ? ' is-active' : ''}`;
  a.setAttribute('role', 'menuitem');
  a.setAttribute('aria-label', item.ariaLabel || item.label);
  if (item.i18n) a.setAttribute('data-i18n', item.i18n);

  const circle = document.createElement('span');
  circle.className = 'hover-circle';
  circle.setAttribute('aria-hidden', 'true');

  const stack = document.createElement('span');
  stack.className = 'label-stack';
  const label = document.createElement('span');
  label.className = 'pill-label';
  label.textContent = item.label;
  const labelHover = document.createElement('span');
  labelHover.className = 'pill-label-hover';
  labelHover.setAttribute('aria-hidden', 'true');
  labelHover.textContent = item.label;
  stack.append(label, labelHover);
  a.append(circle, stack);

  a.addEventListener('mouseenter', () => handlers.onEnter(index));
  a.addEventListener('mouseleave', () => handlers.onLeave(index));

  return { a, circle };
}

/**
 * Vanilla port of @react-bits/PillNav-JS-CSS (no React Router).
 */
export function mountPillNav(container, options) {
  const {
    logo,
    logoAlt = 'Logo',
    items = [],
    activeHref,
    className = '',
    ease = 'power3.easeOut',
    baseColor = '#fff',
    pillColor = '#120F17',
    hoveredPillTextColor = '#120F17',
    pillTextColor,
    onMobileMenuClick,
    initialLoadAnimation = false,
    skipFirstInDesktopList = false,
    logoWordmark = false,
    ariaLabel = 'Hauptnavigation',
  } = options;

  const resolvedPillTextColor = pillTextColor ?? baseColor;
  const desktopItems = skipFirstInDesktopList && items.length > 1 ? items.slice(1) : items;

  const state = {
    isMobileMenuOpen: false,
    circleRefs: [],
    tlRefs: [],
    activeTweenRefs: [],
    logoTweenRef: null,
  };

  const root = document.createElement('div');
  root.className = 'pill-nav-container';

  const nav = document.createElement('nav');
  nav.className = `pill-nav ${className}`.trim();
  nav.setAttribute('aria-label', ariaLabel);
  nav.style.setProperty('--base', baseColor);
  nav.style.setProperty('--pill-bg', pillColor);
  nav.style.setProperty('--hover-text', hoveredPillTextColor);
  nav.style.setProperty('--pill-text', resolvedPillTextColor);

  const homeHref = items[0]?.href || '/';
  const logoLink = document.createElement('a');
  logoLink.className = `pill-logo${logoWordmark ? ' pill-logo--wordmark' : ''}`;
  logoLink.href = homeHref;
  logoLink.setAttribute('aria-label', 'Home');
  const logoImg = document.createElement('img');
  logoImg.src = logo;
  logoImg.alt = logoAlt;
  logoLink.append(logoImg);

  const navItemsWrap = document.createElement('div');
  navItemsWrap.className = 'pill-nav-items desktop-only';
  const pillList = document.createElement('ul');
  pillList.className = 'pill-list';
  pillList.setAttribute('role', 'menubar');

  const handlers = {
    onEnter(i) {
      const tl = state.tlRefs[i];
      if (!tl) return;
      state.activeTweenRefs[i]?.kill();
      state.activeTweenRefs[i] = tl.tweenTo(tl.duration(), {
        duration: 0.3,
        ease,
        overwrite: 'auto',
      });
    },
    onLeave(i) {
      const tl = state.tlRefs[i];
      if (!tl) return;
      state.activeTweenRefs[i]?.kill();
      state.activeTweenRefs[i] = tl.tweenTo(0, {
        duration: 0.2,
        ease,
        overwrite: 'auto',
      });
    },
  };

  desktopItems.forEach((item, i) => {
    const li = document.createElement('li');
    li.setAttribute('role', 'none');
    const { a, circle } = createPillLink(item, i, activeHref, handlers);
    state.circleRefs[i] = circle;
    li.append(a);
    pillList.append(li);
  });

  navItemsWrap.append(pillList);

  const hamburger = document.createElement('button');
  hamburger.type = 'button';
  hamburger.className = 'mobile-menu-button mobile-only';
  hamburger.setAttribute('aria-label', 'Menü öffnen');
  hamburger.setAttribute('data-i18n-aria', 'nav.menuOpen');
  hamburger.innerHTML = '<span class="hamburger-line"></span><span class="hamburger-line"></span>';

  nav.append(logoLink, navItemsWrap, hamburger);

  const mobileMenu = document.createElement('div');
  mobileMenu.className = 'mobile-menu-popover mobile-only';
  mobileMenu.style.setProperty('--base', baseColor);
  mobileMenu.style.setProperty('--pill-bg', pillColor);
  mobileMenu.style.setProperty('--hover-text', hoveredPillTextColor);
  mobileMenu.style.setProperty('--pill-text', resolvedPillTextColor);

  const mobileList = document.createElement('ul');
  mobileList.className = 'mobile-menu-list';
  items.forEach((item) => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = item.href;
    link.className = `mobile-menu-link${activeHref === item.href ? ' is-active' : ''}`;
    link.textContent = item.label;
    if (item.i18n) link.setAttribute('data-i18n', item.i18n);
    link.addEventListener('click', () => closeMobileMenu());
    li.append(link);
    mobileList.append(li);
  });
  mobileMenu.append(mobileList);

  root.append(nav, mobileMenu);
  container.append(root);

  function layout() {
    state.circleRefs.forEach((circle) => {
      if (!circle?.parentElement) return;
      const pill = circle.parentElement;
      const rect = pill.getBoundingClientRect();
      const { width: w, height: h } = rect;
      const R = ((w * w) / 4 + h * h) / (2 * h);
      const D = Math.ceil(2 * R) + 2;
      const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
      const originY = D - delta;

      circle.style.width = `${D}px`;
      circle.style.height = `${D}px`;
      circle.style.bottom = `-${delta}px`;

      gsap.set(circle, {
        xPercent: -50,
        scale: 0,
        transformOrigin: `50% ${originY}px`,
      });

      const label = pill.querySelector('.pill-label');
      const white = pill.querySelector('.pill-label-hover');

      if (label) gsap.set(label, { y: 0 });
      if (white) gsap.set(white, { y: h + 12, opacity: 0 });

      const index = state.circleRefs.indexOf(circle);
      if (index === -1) return;

      state.tlRefs[index]?.kill();
      const tl = gsap.timeline({ paused: true });
      tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: 'auto' }, 0);
      if (label) {
        tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: 'auto' }, 0);
      }
      if (white) {
        gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
        tl.to(white, { y: 0, opacity: 1, duration: 2, ease, overwrite: 'auto' }, 0);
      }
      state.tlRefs[index] = tl;
    });
  }

  function onResize() {
    layout();
  }

  function closeMobileMenu() {
    if (!state.isMobileMenuOpen) return;
    state.isMobileMenuOpen = false;
    const lines = hamburger.querySelectorAll('.hamburger-line');
    gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease });
    gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease });
    gsap.to(mobileMenu, {
      opacity: 0,
      y: 10,
      scaleY: 1,
      duration: 0.2,
      ease,
      transformOrigin: 'top center',
      onComplete: () => {
        gsap.set(mobileMenu, { visibility: 'hidden' });
      },
    });
    document.body.classList.remove('pill-nav-open');
  }

  function openMobileMenu() {
    state.isMobileMenuOpen = true;
    const lines = hamburger.querySelectorAll('.hamburger-line');
    gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease });
    gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease });
    gsap.set(mobileMenu, { visibility: 'visible' });
    gsap.fromTo(
      mobileMenu,
      { opacity: 0, y: 10, scaleY: 1 },
      {
        opacity: 1,
        y: 0,
        scaleY: 1,
        duration: 0.3,
        ease,
        transformOrigin: 'top center',
      }
    );
    document.body.classList.add('pill-nav-open');
    onMobileMenuClick?.();
  }

  function toggleMobileMenu() {
    if (state.isMobileMenuOpen) closeMobileMenu();
    else openMobileMenu();
  }

  if (!logoWordmark) {
    logoLink.addEventListener('mouseenter', () => {
      state.logoTweenRef?.kill();
      gsap.set(logoImg, { rotate: 0 });
      state.logoTweenRef = gsap.to(logoImg, {
        rotate: 360,
        duration: 0.2,
        ease,
        overwrite: 'auto',
      });
    });
  }

  hamburger.addEventListener('click', toggleMobileMenu);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileMenu();
  });

  layout();
  window.addEventListener('resize', onResize);
  if (document.fonts?.ready) {
    document.fonts.ready.then(layout).catch(() => {});
  }

  gsap.set(mobileMenu, { visibility: 'hidden', opacity: 0, scaleY: 1 });

  if (initialLoadAnimation) {
    gsap.set(logoLink, { scale: 0 });
    gsap.to(logoLink, { scale: 1, duration: 0.6, ease });
    gsap.set(navItemsWrap, { width: 0, overflow: 'hidden' });
    gsap.to(navItemsWrap, { width: 'auto', duration: 0.6, ease });
  }

  return {
    destroy() {
      window.removeEventListener('resize', onResize);
      state.tlRefs.forEach((tl) => tl?.kill());
      root.remove();
    },
    relayout: layout,
  };
}
