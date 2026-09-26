const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';

function revealOrder(length, direction) {
  const idx = Array.from({ length }, (_, i) => i);
  if (direction === 'center') {
    const mid = (length - 1) / 2;
    idx.sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid));
  } else if (direction === 'end') {
    idx.reverse();
  }
  return idx;
}

function targetText(el) {
  const key = el.getAttribute('data-i18n');
  if (key && window.DppI18n?.t) {
    const t = window.DppI18n.t(key);
    if (t && t !== key) return t;
  }
  return el.getAttribute('data-decrypted-fallback') || '';
}

class DecryptedText {
  constructor(el) {
    this.el = el;
    this.inner = el.querySelector('.decrypted-text__inner') || el;
    this.speed = Number(el.dataset.speed) || 26;
    this.maxIterations = Number(el.dataset.maxIterations) || 6;
    this.animateOn = el.dataset.animateOn || 'view';
    this.revealDirection = el.dataset.revealDirection || 'center';
    this.clickMode = el.dataset.clickMode || 'default';
    this.running = false;
    this.done = false;
    this.timer = 0;
    this.order = [];
    this.iterations = [];
    this.text = '';

    el.classList.add('decrypted-text');
    if (!el.querySelector('.decrypted-text__inner')) {
      const span = document.createElement('span');
      span.className = 'decrypted-text__inner';
      span.textContent = el.textContent.trim();
      el.textContent = '';
      el.appendChild(span);
      this.inner = span;
    }

    this.bind();
    this.resetScramble();
  }

  resetScramble() {
    this.text = targetText(this.el);
    const n = this.text.length;
    this.order = revealOrder(n, this.revealDirection);
    this.iterations = new Array(n).fill(0);
    this.done = false;
    this.render();
  }

  randomChar() {
    return CHARSET[Math.floor(Math.random() * CHARSET.length)];
  }

  render() {
    let out = '';
    const revealed = new Set();
    for (let k = 0; k < this.order.length; k++) {
      const i = this.order[k];
      if (this.iterations[i] >= this.maxIterations) revealed.add(i);
    }
    for (let i = 0; i < this.text.length; i++) {
      const ch = this.text[i];
      if (ch === ' ' || ch === '\n') {
        out += ch;
        continue;
      }
      if (revealed.has(i) || this.iterations[i] >= this.maxIterations) out += ch;
      else out += this.randomChar();
    }
    this.inner.textContent = out;
    return revealed.size >= this.text.replace(/\s/g, '').length || this.order.every((i) => this.iterations[i] >= this.maxIterations);
  }

  tick() {
    if (this.done) return;
    let allDone = true;
    for (let k = 0; k < this.order.length; k++) {
      const i = this.order[k];
      if (this.text[i] === ' ' || this.text[i] === '\n') continue;
      if (this.iterations[i] < this.maxIterations) {
        this.iterations[i] += 1;
        allDone = false;
      }
    }
    const finished = this.render();
    if (allDone && finished) {
      this.done = true;
      this.el.classList.add('is-decrypted');
      window.clearInterval(this.timer);
      this.timer = 0;
      this.running = false;
    }
  }

  play() {
    if (this.running || (this.done && this.clickMode !== 'toggle')) return;
    if (this.done && this.clickMode === 'toggle') {
      this.resetScramble();
    }
    this.running = true;
    this.el.classList.remove('is-decrypted');
    window.clearInterval(this.timer);
    this.timer = window.setInterval(() => this.tick(), this.speed);
  }

  bind() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      this.text = targetText(this.el);
      this.inner.textContent = this.text;
      this.el.classList.add('is-decrypted');
      this.done = true;
      return;
    }

    if (this.animateOn === 'hover') {
      this.el.addEventListener('pointerenter', () => this.play());
    } else if (this.animateOn === 'click') {
      this.el.addEventListener('click', () => {
        if (this.clickMode === 'toggle' && this.done) {
          this.resetScramble();
          this.play();
        } else {
          this.play();
        }
      });
      this.el.setAttribute('role', 'button');
      this.el.tabIndex = 0;
    } else if (this.animateOn === 'view') {
      const einwand = this.el.closest('.produktdaten-einwand');
      const einwandThreshold = Number(this.el.dataset.decryptedViewThreshold) || 0.38;

      if (einwand) {
        const maybePlay = (progress) => {
          if (progress >= einwandThreshold) {
            this.play();
            return true;
          }
          return false;
        };
        const onReveal = (e) => {
          maybePlay(e.detail?.progress ?? 0);
        };
        einwand.addEventListener('dpp:einwand-reveal', onReveal);
        this._einwandRevealHandler = onReveal;

        const headline = einwand.querySelector('[data-scroll-reveal], #produktdaten-einwand-heading');
        const readProgress = () =>
          parseFloat(
            headline?.style.getPropertyValue('--einwand-reveal') ||
              einwand.style.getPropertyValue('--einwand-reveal') ||
              '0',
          );

        if (!maybePlay(readProgress())) {
          const io = new IntersectionObserver(
            (entries) => {
              if (!entries.some((e) => e.isIntersecting)) return;
              if (maybePlay(readProgress()) || readProgress() >= einwandThreshold) return;
              if (entries[0].intersectionRatio >= 0.72) {
                this.play();
                io.disconnect();
              }
            },
            { threshold: [0.5, 0.72], rootMargin: '-12% 0px -18% 0px' },
          );
          io.observe(this.el);
          this._viewIo = io;
        }
      } else {
        const io = new IntersectionObserver(
          (entries) => {
            if (entries.some((e) => e.isIntersecting)) {
              this.play();
              io.disconnect();
            }
          },
          { threshold: 0.35 },
        );
        io.observe(this.el);
        this._viewIo = io;
      }
    }

    window.addEventListener('dppflash:langchange', () => {
      window.clearInterval(this.timer);
      this.running = false;
      this.done = false;
      this.el.classList.remove('is-decrypted');
      this.resetScramble();
      this._viewIo?.disconnect();
      this._viewIo = null;

      if (this.animateOn === 'view') {
        const einwand = this.el.closest('.produktdaten-einwand');
        if (einwand && this._einwandRevealHandler) {
          const onReveal = this._einwandRevealHandler;
          const threshold = Number(this.el.dataset.decryptedViewThreshold) || 0.38;
          const headline = einwand.querySelector('[data-scroll-reveal], #produktdaten-einwand-heading');
          const readProgress = () =>
            parseFloat(
              headline?.style.getPropertyValue('--einwand-reveal') ||
                einwand.style.getPropertyValue('--einwand-reveal') ||
                '0',
            );
          if (readProgress() < threshold) {
            einwand.addEventListener('dpp:einwand-reveal', onReveal);
          } else {
            this.play();
          }
        } else {
          const io = new IntersectionObserver(
            (entries) => {
              if (entries.some((e) => e.isIntersecting)) {
                this.play();
                io.disconnect();
              }
            },
            { threshold: 0.2 },
          );
          io.observe(this.el);
          this._viewIo = io;
        }
      }
    });
  }
}

function initAll() {
  document.querySelectorAll('[data-decrypted-text]').forEach((el) => {
    if (el.dataset.decryptedInit === '1') return;
    el.dataset.decryptedInit = '1';
    new DecryptedText(el);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}
