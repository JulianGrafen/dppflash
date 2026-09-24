import { DIMENSIONS, QUESTIONS, getMaxPointsPerDimension } from './scan-data.js';
import { SCAN_DE, SCAN_EN } from './scan-messages.js';

const TOTAL = QUESTIONS.length;
const maxPerDim = getMaxPointsPerDimension();

function t(key) {
  const lang = window.DppI18n?.getLang?.() ?? 'de';
  const map = lang === 'en' ? SCAN_EN : SCAN_DE;
  return map[key] ?? key;
}

function computeScores(answers) {
  const raw = { awareness: 0, productData: 0, supplierEvidence: 0, governance: 0 };
  QUESTIONS.forEach((q, i) => {
    const optionId = answers[i];
    if (!optionId) return;
    const opt = q.options.find((o) => o.id === optionId);
    if (!opt) return;
    DIMENSIONS.forEach((dim) => {
      raw[dim] += opt.points[dim] ?? 0;
    });
  });

  const dimensions = {};
  let total = 0;
  DIMENSIONS.forEach((dim) => {
    const max = maxPerDim[dim] || 1;
    const scaled = Math.round((raw[dim] / max) * 25);
    dimensions[dim] = scaled;
    total += scaled;
  });

  return { total, dimensions, raw };
}

function getProductTag(answers) {
  const productQ = QUESTIONS.findIndex((q) => q.id === 'product');
  const optionId = answers[productQ];
  const opt = QUESTIONS[productQ]?.options.find((o) => o.id === optionId);
  return opt?.tag ?? 'other';
}

function getDeadlineInfo(productTag) {
  if (productTag === 'battery') {
    return {
      regulationKey: 'scan.result.reg.battery',
      deadlineKey: 'scan.result.deadline.battery',
    };
  }
  if (productTag === 'textile' || productTag === 'electronics' || productTag === 'furniture') {
    return {
      regulationKey: 'scan.result.reg.esprSector',
      deadlineKey: 'scan.result.deadline.esprSector',
    };
  }
  return {
    regulationKey: 'scan.result.reg.espr',
    deadlineKey: 'scan.result.deadline.espr',
  };
}

function getBand(total) {
  if (total >= 70) return { key: 'scan.result.band.high', className: 'is-high' };
  if (total >= 40) return { key: 'scan.result.band.mid', className: 'is-mid' };
  return { key: 'scan.result.band.low', className: 'is-low' };
}

function getNextSteps(dimensions, productTag) {
  const sorted = [...DIMENSIONS].sort((a, b) => dimensions[a] - dimensions[b]);
  const steps = [];
  const weakest = sorted[0];
  const stepKeys = {
    awareness: productTag === 'battery' ? 'scan.step.awarenessBattery' : 'scan.step.awareness',
    productData: 'scan.step.productData',
    supplierEvidence: 'scan.step.supplier',
    governance: 'scan.step.governance',
  };
  steps.push(stepKeys[weakest] ?? 'scan.step.generic');

  if (sorted[1] && dimensions[sorted[1]] < 18) {
    steps.push(stepKeys[sorted[1]] ?? 'scan.step.generic');
  }

  if (productTag === 'battery' && !steps.includes('scan.step.awarenessBattery')) {
    steps.push('scan.step.batteryPilot');
  } else {
    steps.push('scan.step.demo');
  }

  return steps.slice(0, 3);
}

function initScan() {
  const root = document.getElementById('scanApp');
  if (!root) return;

  let step = 0;
  const answers = new Array(TOTAL).fill(null);
  let showingResult = false;

  const el = {
    progress: root.querySelector('[data-scan-progress]'),
    bar: root.querySelector('[data-scan-bar]'),
    section: root.querySelector('[data-scan-section]'),
    title: root.querySelector('[data-scan-title]'),
    hint: root.querySelector('[data-scan-hint]'),
    options: root.querySelector('[data-scan-options]'),
    back: root.querySelector('[data-scan-back]'),
    wizard: root.querySelector('[data-scan-wizard]'),
    result: root.querySelector('[data-scan-result]'),
    pickHint: root.querySelector('[data-scan-pick]'),
  };

  function renderQuestion() {
    showingResult = false;
    el.wizard.hidden = false;
    el.result.hidden = true;

    const q = QUESTIONS[step];
    const n = step + 1;
    if (el.progress) el.progress.textContent = `${n} / ${TOTAL}`;
    if (el.bar) el.bar.style.width = `${(n / TOTAL) * 100}%`;
    if (el.section) el.section.textContent = t(q.sectionKey);
    if (el.title) el.title.textContent = t(q.titleKey);
    if (el.hint) {
      const hintText = t(q.hintKey);
      el.hint.textContent = hintText;
      el.hint.hidden = !hintText.trim();
    }
    if (el.pickHint) el.pickHint.textContent = t('scan.pickHint');
    if (el.back) el.back.disabled = step === 0;

    if (!el.options) return;
    el.options.innerHTML = '';
    q.options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'scan-option';
      btn.innerHTML = `<span class="scan-option__emoji" aria-hidden="true">${opt.emoji}</span><span class="scan-option__text"><strong>${t(opt.titleKey)}</strong><span>${t(opt.subKey)}</span></span>`;
      btn.addEventListener('click', () => {
        answers[step] = opt.id;
        if (step < TOTAL - 1) {
          step += 1;
          renderQuestion();
        } else {
          renderResult();
        }
      });
      el.options.appendChild(btn);
    });
  }

  function renderResult() {
    showingResult = true;
    el.wizard.hidden = true;
    el.result.hidden = false;

    const { total, dimensions } = computeScores(answers);
    const productTag = getProductTag(answers);
    const deadline = getDeadlineInfo(productTag);
    const band = getBand(total);
    const steps = getNextSteps(dimensions, productTag);

    const scoreEl = el.result.querySelector('[data-result-score]');
    const bandEl = el.result.querySelector('[data-result-band]');
    const regEl = el.result.querySelector('[data-result-regulation]');
    const deadEl = el.result.querySelector('[data-result-deadline]');
    const stepsEl = el.result.querySelector('[data-result-steps]');

    if (scoreEl) {
      scoreEl.textContent = String(total);
      scoreEl.className = `scan-score__value ${band.className}`;
    }
    if (bandEl) bandEl.textContent = t(band.key);
    if (regEl) regEl.textContent = t(deadline.regulationKey);
    if (deadEl) deadEl.textContent = t(deadline.deadlineKey);

    DIMENSIONS.forEach((dim) => {
      const bar = el.result.querySelector(`[data-dim-bar="${dim}"]`);
      const val = el.result.querySelector(`[data-dim-val="${dim}"]`);
      const pct = dimensions[dim];
      if (bar) bar.style.width = `${pct}%`;
      if (val) val.textContent = `${pct}`;
    });

    if (stepsEl) {
      stepsEl.innerHTML = '';
      steps.forEach((key) => {
        const li = document.createElement('li');
        li.textContent = t(key);
        stepsEl.appendChild(li);
      });
    }
  }

  function restart() {
    step = 0;
    answers.fill(null);
    renderQuestion();
    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  el.back?.addEventListener('click', () => {
    if (showingResult) return;
    if (step > 0) {
      step -= 1;
      renderQuestion();
    }
  });

  el.result?.querySelector('[data-scan-restart]')?.addEventListener('click', restart);

  window.addEventListener('dppflash:langchange', () => {
    if (showingResult) renderResult();
    else renderQuestion();
  });

  renderQuestion();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScan);
} else {
  initScan();
}
