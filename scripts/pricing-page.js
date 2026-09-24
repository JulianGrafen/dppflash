const PLANS = [
  { id: 'micro', name: 'Micro', included: 10, monthly: 79, competitor: 99 },
  { id: 'starter', name: 'Starter', included: 50, monthly: 159, competitor: 199 },
  { id: 'growth', name: 'Growth', included: 250, monthly: 399, competitor: 499 },
  { id: 'scale', name: 'Scale', included: 1000, monthly: 719, competitor: 899 },
];

function planForVolume(count) {
  return PLANS.find((p) => p.included >= count) ?? PLANS[PLANS.length - 1];
}

function formatEuro(amount) {
  return `€${amount}`;
}

function initBillingToggle() {
  const root = document.querySelector('[data-pricing-root]');
  if (!root) return;

  const monthlyBtn = root.querySelector('[data-billing="monthly"]');
  const annualBtn = root.querySelector('[data-billing="annual"]');
  const amounts = root.querySelectorAll('[data-price-monthly]');

  function setBilling(mode) {
    const annual = mode === 'annual';
    monthlyBtn?.classList.toggle('is-active', !annual);
    annualBtn?.classList.toggle('is-active', annual);
    monthlyBtn?.setAttribute('aria-pressed', String(!annual));
    annualBtn?.setAttribute('aria-pressed', String(annual));
    root.dataset.billing = mode;

    amounts.forEach((el) => {
      const monthly = Number(el.getAttribute('data-price-monthly'));
      const value = annual ? Math.round(monthly * 0.8) : monthly;
      el.textContent = String(value);
    });

    refreshSliderSummary();
  }

  monthlyBtn?.addEventListener('click', () => setBilling('monthly'));
  annualBtn?.addEventListener('click', () => setBilling('annual'));
  setBilling('monthly');
}

let refreshSliderSummary = () => {};

function initVolumeSlider() {
  const slider = document.getElementById('pricingVolume');
  const valueEl = document.getElementById('pricingVolumeValue');
  const summaryEl = document.getElementById('pricingSliderSummary');
  const rows = document.querySelectorAll('[data-plan-row]');

  if (!slider || !valueEl) return;

  function updateSlider() {
    const count = Number(slider.value);
    valueEl.textContent = String(count);

    const plan = planForVolume(count);
    const root = document.querySelector('[data-pricing-root]');
    const annual = root?.dataset.billing === 'annual';
    const price = annual ? Math.round(plan.monthly * 0.8) : plan.monthly;
    const savings = plan.competitor - price;
    const savingsPct = Math.round((savings / plan.competitor) * 100);

    rows.forEach((row) => {
      row.classList.toggle('is-recommended', row.getAttribute('data-plan-row') === plan.id);
    });

    if (summaryEl) {
      const lang = window.DppI18n?.getLang?.() === 'en' ? 'en' : 'de';
      if (lang === 'en') {
        summaryEl.innerHTML = `<strong>Your plan · ${plan.name}</strong><p>${formatEuro(price)}/mo · ${plan.included} passports included · flat price, nothing metered<br>Typical competitor at this volume: ${formatEuro(plan.competitor)}/mo — you save about ${savingsPct}%.</p>`;
      } else {
        summaryEl.innerHTML = `<strong>Ihr Plan · ${plan.name}</strong><p>${formatEuro(price)}/Monat · ${plan.included} Pässe inklusive · Pauschalpreis, nichts wird gemessen<br>Typischer Wettbewerber bei diesem Volumen: ${formatEuro(plan.competitor)}/Monat — Sie sparen ca. ${savingsPct} %.</p>`;
      }
    }
  }

  refreshSliderSummary = updateSlider;
  slider.addEventListener('input', updateSlider);
  window.addEventListener('dppflash:langchange', updateSlider);
  updateSlider();
}

function initPricingPage() {
  initBillingToggle();
  initVolumeSlider();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPricingPage);
} else {
  initPricingPage();
}
