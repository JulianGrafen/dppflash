(function () {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

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
