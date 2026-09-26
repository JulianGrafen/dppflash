function typeText(element, text, options) {
  const { charDelay = 42, onComplete } = options;
  let index = 0;
  element.textContent = '';

  function tick() {
    if (index >= text.length) {
      onComplete?.();
      return;
    }
    element.textContent += text[index];
    index += 1;
    window.setTimeout(tick, charDelay);
  }

  tick();
}

function initTypewriter(root) {
  const targets = Array.from(root.querySelectorAll('[data-typewriter]'));
  if (!targets.length) return;

  const cursor = root.querySelector('.story-typewriter__cursor');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let started = false;
  let timeoutId = null;
  let linePauseId = null;

  function getText(target) {
    return target.getAttribute('data-typewriter-source')?.trim() || target.textContent.trim();
  }

  targets.forEach((target) => {
    const initial = target.textContent.trim();
    target.setAttribute('data-typewriter-source', initial);
    target.textContent = '';
  });

  function placeCursorAfter(target) {
    if (!cursor || !target.parentNode) return;
    target.after(cursor);
  }

  function revealFollowLine(target) {
    const follow = target.closest('.story-typewriter__follow');
    if (follow) follow.classList.add('is-active');
  }

  function finishInstant() {
    targets.forEach((target) => {
      target.textContent = getText(target);
      revealFollowLine(target);
    });
    root.classList.add('is-done');
  }

  function playLine(index) {
    if (index >= targets.length) {
      root.classList.add('is-done');
      return;
    }

    const target = targets[index];
    const text = getText(target);
    const lineDelay = index === 0 ? 0 : 520;

    root.classList.remove('is-done');
    revealFollowLine(target);
    placeCursorAfter(target);

    const startTyping = () => {
      if (reducedMotion) {
        target.textContent = text;
        playLine(index + 1);
        return;
      }

      typeText(target, text, {
        onComplete: () => {
          if (index < targets.length - 1) {
            linePauseId = window.setTimeout(() => playLine(index + 1), 380);
          } else {
            root.classList.add('is-done');
          }
        },
      });
    };

    if (lineDelay) {
      linePauseId = window.setTimeout(startTyping, lineDelay);
    } else {
      startTyping();
    }
  }

  function play() {
    if (started) return;
    started = true;

    root.classList.remove('is-done');
    root.querySelectorAll('.story-typewriter__follow').forEach((el) => {
      el.classList.remove('is-active');
    });

    if (reducedMotion) {
      finishInstant();
      return;
    }

    playLine(0);
  }

  function resetAndPlay() {
    started = false;
    if (timeoutId) window.clearTimeout(timeoutId);
    if (linePauseId) window.clearTimeout(linePauseId);
    targets.forEach((target) => {
      const text = target.textContent.trim() || getText(target);
      target.setAttribute('data-typewriter-source', text);
      target.textContent = '';
    });
    play();
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        play();
      }
    },
    { threshold: 0.35 },
  );
  observer.observe(root);

  window.addEventListener('dppflash:langchange', () => {
    window.setTimeout(() => {
      targets.forEach((target) => {
        const text = target.textContent.trim();
        if (text) target.setAttribute('data-typewriter-source', text);
        target.textContent = '';
      });
      resetAndPlay();
    }, 0);
  });
}

function initAll() {
  document.querySelectorAll('[data-typewriter-root]').forEach(initTypewriter);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}
