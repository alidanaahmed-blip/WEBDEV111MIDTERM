// Velvet Crust Cakes interactions

document.addEventListener('DOMContentLoaded', () => {
  highlightActiveNav();
  wireOrderForm();
  wireFlavorPills();
  wireDesignShortcuts();
  preloadDesignFromMemory();
  preloadFlavorFromMemory();
  wireLoginForm();
});

function highlightActiveNav() {
  const links = document.querySelectorAll('.nav-links a');
  const path = location.pathname.split('/').pop() || 'index.html';
  links.forEach(link => {
    if (link.getAttribute('href') === path) {
      link.classList.add('active');
    }
  });
}

function wireDesignShortcuts() {
  const tiles = document.querySelectorAll('[data-design]');
  tiles.forEach(tile => {
    tile.addEventListener('click', () => {
      const name = tile.dataset.design;
      try { localStorage.setItem('velvetDesign', name); } catch (_) {}
    });
  });
}

function preloadDesignFromMemory() {
  const designInput = document.querySelector('input[name="design"]');
  if (!designInput) return;
  try {
    const saved = localStorage.getItem('velvetDesign');
    if (saved) {
      designInput.value = saved;
      localStorage.removeItem('velvetDesign');
    }
  } catch (_) {}
}

function wireFlavorPills() {
  const pills = document.querySelectorAll('[data-flavor]');
  const target = document.querySelector('#flavor');
  if (!pills.length) return;
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const flavor = pill.dataset.flavor;
      if (target) {
        target.value = flavor;
        flash(pill);
      } else {
        try { localStorage.setItem('velvetFlavor', flavor); } catch (_) {}
        window.location.href = 'orders.html#flavor';
      }
    });
  });
}

function preloadFlavorFromMemory() {
  const flavorInput = document.querySelector('#flavor');
  if (!flavorInput) return;
  try {
    const saved = localStorage.getItem('velvetFlavor');
    if (saved) {
      flavorInput.value = saved;
      localStorage.removeItem('velvetFlavor');
    }
  } catch (_) {}
}

function wireOrderForm() {
  const form = document.querySelector('#order-form');
  const status = document.querySelector('#order-status');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const summary = `Design: ${data.design || 'TBD'}\nFlavor: ${data.flavor || "Chef's choice"}\nDate: ${data.date || 'Not set'}\nPickup: ${data.slot || 'Choose time'}`;
    if (status) {
      status.textContent = 'Order captured — we will confirm within 15 minutes.';
      status.classList.add('tag');
    }
    alert('Order saved!\n\n' + summary);
  });
}

function wireLoginForm() {
  const loginForm = document.querySelector('#login-form');
  const status = document.querySelector('#login-status');
  const overlay = document.querySelector('.floating-login');
  if (!loginForm) return;

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const { email } = Object.fromEntries(new FormData(loginForm).entries());
    if (status) {
      status.textContent = `Logged in as ${email || 'guest'}`;
      status.hidden = false;
    }
    if (overlay) {
      overlay.classList.add('dismissed');
      setTimeout(() => overlay.style.display = 'none', 400);
    }
    flash(loginForm.querySelector('.btn.primary') || loginForm);
  });
}

function flash(el) {
  if (!el || !el.animate) return;
  el.animate([
    { transform: 'scale(1)', boxShadow: '0 0 0 rgba(0,0,0,0)' },
    { transform: 'scale(1.04)', boxShadow: '0 10px 30px rgba(75,47,37,0.18)' },
    { transform: 'scale(1)', boxShadow: '0 0 0 rgba(0,0,0,0)' },
  ], { duration: 400, easing: 'ease-out' });
}
