(function () {
  const root = document.body;
  const roleBtns = document.querySelectorAll('[data-dpp-role-btn]');
  const blocks = document.querySelectorAll('.bp-block[data-tier]');

  function setRole(role) {
    root.dataset.dppRole = role;
    roleBtns.forEach((btn) => {
      const active = btn.dataset.dppRoleBtn === role;
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    blocks.forEach((block) => {
      const tiers = (block.dataset.tier || 'public').split(/\s+/);
      const show = tiers.includes(role) || tiers.includes('public');
      block.dataset.hidden = show ? 'false' : 'true';
    });
  }

  roleBtns.forEach((btn) => {
    btn.addEventListener('click', () => setRole(btn.dataset.dppRoleBtn));
  });

  setRole('public');
})();
