(function () {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  const inner = header.querySelector('.site-header__inner');

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

  updateCompact();
  window.addEventListener('scroll', updateCompact, { passive: true, capture: true });
  document.addEventListener('scroll', updateCompact, { passive: true, capture: true });
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
