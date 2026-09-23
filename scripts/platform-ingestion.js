function initPlatformIngestionMock() {
  const mock = document.getElementById('piMock');
  if (!mock) return;

  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  if (reduced) {
    mock.classList.add('is-animated');
    return;
  }

  window.requestAnimationFrame(() => {
    mock.classList.add('is-animated');
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPlatformIngestionMock);
} else {
  initPlatformIngestionMock();
}
