// Nexus Events interactions

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const page = body.dataset.page;

  if (page) {
    const activeLink = document.querySelector(`[data-nav="${page}"]`);
    if (activeLink) activeLink.classList.add('active');
  }

  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  wireEventFilters();
  wireEventSelection();
  wireTicketBuilder();
  wirePulse();
});

function wireEventFilters() {
  const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
  const cards = Array.from(document.querySelectorAll('[data-event-card]'));
  const searchInput = document.querySelector('[data-search]');
  let activeFilter = 'all';
  if (!cards.length) return;

  const applyFilters = () => {
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    cards.forEach(card => {
      const tags = (card.dataset.tags || '').toLowerCase();
      const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
      const matchesFilter = activeFilter === 'all' || tags.includes(activeFilter);
      const matchesSearch = !query || title.includes(query) || tags.includes(query);
      card.style.display = (matchesFilter && matchesSearch) ? '' : 'none';
    });
  };

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter || 'all';
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilters();
    });
  });

  if (searchInput) searchInput.addEventListener('input', applyFilters);
}

function wireEventSelection() {
  document.querySelectorAll('[data-event-name]').forEach(card => {
    card.addEventListener('click', () => {
      const eventName = card.dataset.eventName;
      if (!eventName) return;
      try { localStorage.setItem('nexusSelectedEvent', eventName); } catch (_) {}
    });
  });
}

function wireTicketBuilder() {
  const ticketRows = document.querySelectorAll('[data-ticket-row]');
  const totalEl = document.querySelector('[data-total]');
  const eventSelect = document.querySelector('[data-selected-event]');
  const form = document.querySelector('[data-ticket-form]');
  const nameInput = document.querySelector('[data-attendee-name]');
  const canvas = document.querySelector('[data-qr-canvas]');
  const passEvent = document.querySelector('[data-pass-event]');
  const passTier = document.querySelector('[data-pass-tier]');
  const passName = document.querySelector('[data-pass-name]');
  const passCode = document.querySelector('[data-pass-code]');
  const statusEl = document.querySelector('[data-ticket-status]');

  if (eventSelect) {
    try {
      const savedEvent = localStorage.getItem('nexusSelectedEvent');
      if (savedEvent) eventSelect.value = savedEvent;
    } catch (_) {}
  }

  const updateTotal = () => {
    let total = 0;
    let chosenTier = 'No tickets selected';
    ticketRows.forEach(row => {
      const qtyInput = row.querySelector('[data-qty]');
      const price = Number(row.dataset.price || 0);
      const qty = Number(qtyInput ? qtyInput.value : 0);
      total += price * qty;
      if (qty > 0 && chosenTier === 'No tickets selected') chosenTier = `${row.dataset.tier} x${qty}`;
    });
    if (totalEl) totalEl.textContent = total.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    if (passEvent && eventSelect) passEvent.textContent = eventSelect.value;
    if (passTier) passTier.textContent = chosenTier;
    if (passName && nameInput && !nameInput.value.trim()) passName.textContent = 'Waiting for attendee info';
  };

  ticketRows.forEach(row => {
    const minus = row.querySelector('[data-qty-minus]');
    const plus = row.querySelector('[data-qty-plus]');
    const input = row.querySelector('[data-qty]');
    const clamp = () => {
      if (!input) return;
      input.value = String(Math.max(0, Math.min(9, Number(input.value || 0))));
    };
    if (input) input.addEventListener('change', () => { clamp(); updateTotal(); });
    if (minus && input) minus.addEventListener('click', () => { input.value = String(Math.max(0, Number(input.value || 0) - 1)); updateTotal(); });
    if (plus && input) plus.addEventListener('click', () => { input.value = String(Math.min(9, Number(input.value || 0) + 1)); updateTotal(); });
  });

  if (eventSelect) eventSelect.addEventListener('change', updateTotal);
  if (nameInput && passName) nameInput.addEventListener('input', () => { passName.textContent = nameInput.value.trim() || 'Waiting for attendee info'; });
  if (ticketRows.length) updateTotal();

  if (form && canvas) {
    form.addEventListener('submit', event => {
      event.preventDefault();
      updateTotal();
      const code = createPassCode();
      drawFakeQr(canvas, code);
      if (passCode) passCode.textContent = code;
      if (statusEl) statusEl.textContent = 'Entry code generated. Screenshot this preview for the demo.';
    });
  }
}

function createPassCode() {
  return `NX-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}

function drawFakeQr(canvas, code) {
  const ctx = canvas.getContext('2d');
  const size = 22;
  const cell = 10;
  canvas.width = size * cell;
  canvas.height = size * cell;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  let seed = 0;
  for (let i = 0; i < code.length; i += 1) seed += code.charCodeAt(i) * (i + 1);

  const finder = (startX, startY) => {
    for (let y = 0; y < 7; y += 1) {
      for (let x = 0; x < 7; x += 1) {
        const edge = x === 0 || y === 0 || x === 6 || y === 6;
        const center = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        if (edge || center) {
          ctx.fillStyle = '#121212';
          ctx.fillRect((startX + x) * cell, (startY + y) * cell, cell, cell);
        }
      }
    }
  };

  finder(1, 1);
  finder(14, 1);
  finder(1, 14);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const reserved = (x >= 1 && x <= 7 && y >= 1 && y <= 7) || (x >= 14 && x <= 20 && y >= 1 && y <= 7) || (x >= 1 && x <= 7 && y >= 14 && y <= 20);
      if (reserved) continue;
      if (((x * 17 + y * 31 + seed) % 5) < 2) {
        ctx.fillStyle = '#121212';
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }
  }
}

function wirePulse() {
  const pulse = document.querySelector('[data-pulse]');
  if (pulse) setInterval(() => { pulse.classList.toggle('pulse'); }, 1400);
}
