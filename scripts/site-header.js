(function () {
  const header = document.getElementById('siteHeader') || document.querySelector('header.site-header');
  if (!header) return;
  header.id = 'siteHeader';

  const inner = header.querySelector('.site-header__inner, .header-inner');
  if (inner) {
    inner.classList.remove('container', 'header-inner');
    inner.classList.add('site-header__inner');
  }
  header.querySelector('.nav-desktop')?.classList.add('site-header__center');
  header.querySelector('.mobile-links')?.classList.add('mobile-menu');

  function scrollTop() {
    return (
      window.scrollY ||
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0
    );
  }

  function setCompact(compact) {
    header.classList.toggle('is-scrolled', compact);
    if (inner) inner.classList.toggle('is-compact', compact);
  }

  function updateCompact() {
    setCompact(scrollTop() > 20);
  }

  const navigationItems = [
    {
      label: 'nav.platform',
      children: [
        { label: 'nav.scan', href: '/scan.html' },
        { label: 'nav.demo', href: '/experience.html' },
        { label: 'nav.benefits', href: '/#vorteile' },
      ],
    },
    { label: 'nav.pricing', href: '/pricing' },
    {
      label: 'nav.wissen',
      children: [
        { label: 'nav.blog', href: '/blog/' },
        { label: 'nav.faq', href: '/#faq' },
      ],
    },
    {
      label: 'nav.about',
      children: [
        { label: 'nav.team', href: '/ueber-uns/' },
        { label: 'nav.investors', href: '/investoren/' },
      ],
    },
  ];
  const mobileNavigationItems = [
    ...navigationItems.filter((item) => item.label === 'nav.pricing'),
    ...navigationItems.filter((item) => item.label !== 'nav.pricing'),
  ];

  const navigationLabels = {
    de: {
      'nav.platform': 'Plattform',
      'nav.scan': 'Readiness Check',
      'nav.demo': 'Demo',
      'nav.benefits': 'Vorteile',
      'nav.pricing': 'Preise',
      'nav.wissen': 'Wissen',
      'nav.blog': 'Blog',
      'nav.faq': 'FAQ',
      'nav.about': 'Über uns',
      'nav.team': 'Team',
      'nav.investors': 'Für Investoren',
      'nav.contact': 'Kontakt',
    },
    en: {
      'nav.platform': 'Platform',
      'nav.scan': 'Readiness Check',
      'nav.demo': 'Demo',
      'nav.benefits': 'Benefits',
      'nav.pricing': 'Pricing',
      'nav.wissen': 'Knowledge',
      'nav.blog': 'Blog',
      'nav.faq': 'FAQ',
      'nav.about': 'About us',
      'nav.team': 'Team',
      'nav.investors': 'For investors',
      'nav.contact': 'Contact',
    },
    fr: {
      'nav.platform': 'Plateforme',
      'nav.scan': 'Test de préparation',
      'nav.demo': 'Démo',
      'nav.benefits': 'Avantages',
      'nav.pricing': 'Tarifs',
      'nav.wissen': 'Ressources',
      'nav.blog': 'Blog',
      'nav.faq': 'FAQ',
      'nav.about': 'À propos',
      'nav.team': 'Équipe',
      'nav.investors': 'Investisseurs',
      'nav.contact': 'Contact',
    },
  };

  function currentLanguage() {
    const documentLanguage = document.documentElement.lang;
    const language = documentLanguage !== 'de'
      ? documentLanguage
      : localStorage.getItem('dppflash-lang') || documentLanguage;
    return navigationLabels[language] ? language : 'de';
  }

  function isCurrentPage(href) {
    const target = new URL(href, window.location.origin);
    const currentPath = window.location.pathname.replace(/\/+$/, '/') || '/';
    const targetPath = target.pathname.replace(/\/+$/, '/') || '/';

    if (target.hash) {
      return currentPath === targetPath && window.location.hash === target.hash;
    }
    if (targetPath === '/blog/') {
      return currentPath.startsWith('/blog/');
    }
    return currentPath === targetPath;
  }

  function createLink(item, labels, menuItem = false) {
    const link = document.createElement('a');
    link.className = 'nav-link';
    link.href = item.href;
    link.textContent = labels[item.label];
    if (menuItem) link.setAttribute('role', 'menuitem');
    if (isCurrentPage(item.href)) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
    return link;
  }

  function createDropdown(item, labels) {
    const dropdown = document.createElement('div');
    dropdown.className = 'nav-dropdown';

    const trigger = document.createElement('span');
    trigger.className = 'nav-link nav-dropdown__trigger';
    trigger.tabIndex = 0;
    trigger.setAttribute('role', 'button');
    trigger.textContent = labels[item.label];
    if (item.children.some((child) => isCurrentPage(child.href))) {
      trigger.classList.add('active');
    }
    dropdown.appendChild(trigger);

    const menu = document.createElement('div');
    menu.className = 'nav-dropdown__menu';
    menu.setAttribute('role', 'menu');
    item.children.forEach((child) => menu.appendChild(createLink(child, labels, true)));
    dropdown.appendChild(menu);
    return dropdown;
  }

  function renderNavigation() {
    const labels = navigationLabels[currentLanguage()];
    const desktopNavigation = header.querySelector('.nav-desktop.site-header__center');
    const mobileNavigation = header.querySelector('.mobile-links.mobile-menu');

    if (desktopNavigation) {
      desktopNavigation.replaceChildren(...navigationItems.map((item) =>
        item.children ? createDropdown(item, labels) : createLink(item, labels),
      ));
    }

    if (mobileNavigation) {
      mobileNavigation.replaceChildren(...mobileNavigationItems.map((item) => {
        if (!item.children) return createLink(item, labels);

        const group = document.createElement('div');
        group.className = 'mobile-nav-group';
        const label = document.createElement('span');
        label.className = 'mobile-nav-label';
        label.textContent = labels[item.label];
        group.appendChild(label);
        item.children.forEach((child) => {
          const link = createLink(child, labels);
          link.classList.add('nav-link--sub');
          group.appendChild(link);
        });
        return group;
      }));
    }
  }

  const end = header.querySelector('.site-header__end') || (() => {
    const wrapper = document.createElement('div');
    wrapper.className = 'site-header__end';
    if (inner) inner.appendChild(wrapper);
    return wrapper;
  })();
  const menuButton = header.querySelector('#navOpenBtn');
  if (menuButton && !end.contains(menuButton)) {
    menuButton.classList.add('site-header__menu-btn');
    end.appendChild(menuButton);
  }
  const mobileMenu = header.querySelector('.nav-mobile');
  if (mobileMenu && mobileMenu.parentElement !== header) header.appendChild(mobileMenu);

  const ensureHeaderEnd = () => {
    if (!end.querySelector('.lang-switch')) {
      const langSwitch = document.createElement('div');
      langSwitch.className = 'lang-switch';
      langSwitch.setAttribute('role', 'group');
      langSwitch.setAttribute('aria-label', 'Sprache');
      langSwitch.innerHTML = [
        '<button type="button" class="lang-switch-btn is-active" data-lang="de" aria-pressed="true">DE</button>',
        '<button type="button" class="lang-switch-btn" data-lang="en" aria-pressed="false">EN</button>',
      ].join('');
      end.insertBefore(langSwitch, end.firstChild);
    }

    let cta = end.querySelector('.site-header__cta');
    if (!cta) {
      cta = document.createElement('a');
      cta.className = 'btn btn-primary site-header__cta';
      end.appendChild(cta);
    }
    cta.href = '/#kontakt';
    cta.textContent = 'Pilotkunde werden';
    cta.setAttribute('data-i18n', 'nav.cta');

    const storedLang = localStorage.getItem('dppflash-lang');
    const current = storedLang === 'en' || storedLang === 'fr' ? storedLang : 'de';
    end.querySelectorAll('[data-lang]').forEach((button) => {
      const active = button.getAttribute('data-lang') === current;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    end.querySelectorAll('[data-lang]').forEach((button) => {
      if (button.dataset.bound === 'true') return;
      button.addEventListener('click', () => {
        const nextLang = button.getAttribute('data-lang') || 'de';
        localStorage.setItem('dppflash-lang', nextLang);
        end.querySelectorAll('[data-lang]').forEach((item) => {
          const active = item.getAttribute('data-lang') === nextLang;
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        renderNavigation();
      });
      button.dataset.bound = 'true';
    });
  };

  ensureHeaderEnd();
  renderNavigation();
  window.addEventListener('dppflash:langchange', renderNavigation);
  updateCompact();
  window.addEventListener('scroll', updateCompact, { passive: true, capture: true });
  document.addEventListener('scroll', updateCompact, { passive: true, capture: true });
  window.addEventListener('dpp:lenis-scroll', updateCompact, { passive: true });
  window.addEventListener('resize', updateCompact, { passive: true });

  const hero = document.getElementById('hero');
  if (hero && typeof IntersectionObserver !== 'undefined') {
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (!entry.isIntersecting) {
          setCompact(true);
          return;
        }
        setCompact(entry.intersectionRatio < 0.42 || scrollTop() > 20);
      },
      { root: null, threshold: [0, 0.25, 0.42, 0.65, 1] },
    );
    io.observe(hero);
  }

  const openBtn = document.getElementById('navOpenBtn');
  const closeBtn = document.getElementById('navCloseBtn');
  const mobile = document.getElementById('mobileMenu');
  if (!openBtn || !mobile) return;

  function open() {
    document.body.classList.add('nav-open');
    mobile.setAttribute('aria-hidden', 'false');
    openBtn.setAttribute('aria-expanded', 'true');
    closeBtn?.focus();
  }

  function close() {
    document.body.classList.remove('nav-open');
    mobile.setAttribute('aria-hidden', 'true');
    openBtn.setAttribute('aria-expanded', 'false');
    openBtn.focus();
  }

  openBtn.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  mobile.querySelectorAll('.nav-link').forEach((a) => a.addEventListener('click', close));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
})();
