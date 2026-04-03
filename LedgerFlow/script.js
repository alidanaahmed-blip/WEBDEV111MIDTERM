// LedgerFlow - Client-side Finance App
// Vanilla JS: Auth, Mock DB, Modals, PDF Generation

class LedgerFlow {
  constructor() {
    this.db = JSON.parse(localStorage.getItem('ledgerflow_db')) || this.initMockData();
    this.currentUser = JSON.parse(localStorage.getItem('ledgerflow_user') || 'null');
    this.currentStep = 0;
    this.invoiceData = {};
    this.init();
  }

  init() {
    this.bindNavigation();
    this.checkAuth();
    this.bindEvents();
    this.saveDb();
  }

  initMockData() {
    const mock = {
      clients: [
        { id: 1, name: 'Acme Corp', email: 'billing@acme.com', totalInvoiced: 12500 },
        { id: 2, name: 'Beta Ltd', email: 'finance@beta.io', totalInvoiced: 8900 },
        { id: 3, name: 'Gamma Inc', email: 'accounts@gamma.net', totalInvoiced: 23400 }
      ],
      invoices: [
        { id: '#INV001', clientId: 1, clientName: 'Acme Corp', amount: 2500, dueDate: '2024-01-15', status: 'paid', description: 'Platform renewal' },
        { id: '#INV002', clientId: 2, clientName: 'Beta Ltd', amount: 4500, dueDate: '2024-01-20', status: 'pending', description: 'Reporting services' },
        { id: '#INV003', clientId: 1, clientName: 'Acme Corp', amount: 3800, dueDate: '2024-01-10', status: 'overdue', description: 'Maintenance support' },
        { id: '#INV004', clientId: 3, clientName: 'Gamma Inc', amount: 7200, dueDate: '2024-02-01', status: 'pending', description: 'Consulting retainer' }
      ],
      payments: [
        { id: '#INV001', amount: 2500, date: '2024-01-14', method: 'ACH', status: 'completed' },
        { id: '#INV002', amount: 0, date: '', method: '', status: 'pending' }
      ],
      nextId: 5
    };
    localStorage.setItem('ledgerflow_db', JSON.stringify(mock));
    return mock;
  }

  saveDb() {
    localStorage.setItem('ledgerflow_db', JSON.stringify(this.db));
  }

  checkAuth() {
    const nav = document.querySelector('nav');
    const mainNav = document.querySelector('.main-nav');
    const isLoginPage = window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/');

    if (this.currentUser && !isLoginPage) {
      if (nav) nav.classList.remove('hidden');
      if (mainNav) mainNav.classList.remove('hidden');
    } else {
      if (nav) nav.classList.add('hidden');
      if (mainNav) mainNav.classList.add('hidden');
      if (!isLoginPage) {
        window.location.href = 'index.html';
      }
    }
  }

  login(email, password, twoFaEnabled) {
    this.currentUser = { email, twoFaEnabled, passwordLength: password.length };
    localStorage.setItem('ledgerflow_user', JSON.stringify(this.currentUser));
    window.location.href = 'dashboard.html';
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('ledgerflow_user');
    window.location.href = 'index.html';
  }

  bindNavigation() {
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      });
    });
  }

  bindEvents() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const twoFa = document.getElementById('twofa').checked;
        this.login(email, password, twoFa);
      });
    }

    document.getElementById('create-invoice')?.addEventListener('click', () => this.showInvoiceModal());
    document.getElementById('add-client')?.addEventListener('click', () => this.showClientModal());
    document.getElementById('record-payment')?.addEventListener('click', () => alert('Payment recording flow can be added next.'));
    document.getElementById('add-client-btn')?.addEventListener('click', () => this.addClient());
    document.getElementById('logout')?.addEventListener('click', () => this.logout());

    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal');
        if (modal) this.hideModal(modal.id);
      });
    });

    document.querySelectorAll('.step-next').forEach(btn => {
      btn.addEventListener('click', () => this.nextStep());
    });

    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.hideModal(e.target.id);
      }
    });
  }

  showModal(id) {
    document.getElementById(id)?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  hideModal(id) {
    document.getElementById(id)?.classList.add('hidden');
    document.body.style.overflow = '';
  }

  showInvoiceModal() {
    this.currentStep = 0;
    this.invoiceData = {};
    this.updateStepper();
    this.showModal('invoice-modal');
  }

  showClientModal() {
    this.showModal('client-modal');
  }

  nextStep() {
    if (this.validateStep(this.currentStep)) {
      this.currentStep++;
      if (this.currentStep >= 3) {
        this.generateInvoice();
      } else {
        this.updateStepper();
      }
    }
  }

  validateStep(step) {
    switch (step) {
      case 0: {
        const clientId = document.getElementById('client-select')?.value;
        if (!clientId) return false;
        this.invoiceData.clientId = parseInt(clientId, 10);
        const client = this.db.clients.find(c => c.id === this.invoiceData.clientId);
        this.invoiceData.clientName = client.name;
        return true;
      }
      case 1: {
        const amount = parseFloat(document.getElementById('amount')?.value);
        if (isNaN(amount) || amount <= 0) return false;
        this.invoiceData.amount = amount;
        this.invoiceData.description = document.getElementById('description')?.value || 'Services rendered';
        return true;
      }
      case 2: {
        const dueDate = document.getElementById('due-date')?.value;
        this.invoiceData.dueDate = dueDate;
        return !!dueDate;
      }
      default:
        return false;
    }
  }

  updateStepper() {
    document.querySelectorAll('.step').forEach((stepEl, idx) => {
      stepEl.classList.toggle('active', idx === this.currentStep);
      stepEl.classList.toggle('completed', idx < this.currentStep);
    });

    document.querySelectorAll('.step-content').forEach((content, idx) => {
      content.classList.toggle('hidden', idx !== this.currentStep);
    });
  }

  generateInvoice() {
    const invoice = {
      id: `#INV${String(this.db.nextId++).padStart(3, '0')}`,
      ...this.invoiceData,
      status: 'pending'
    };
    this.db.invoices.unshift(invoice);
    this.saveDb();
    this.downloadPDF(invoice);
    this.hideModal('invoice-modal');
    this.refreshTables();
    navigator.clipboard?.writeText(`${window.location.origin}${window.location.pathname}#${invoice.id}`).catch(() => {});
    this.showConfetti();
    setTimeout(() => {
      alert(`Invoice ${invoice.id} created. PDF ready and share link copied.`);
    }, 400);
  }

  downloadPDF(invoice) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('LedgerFlow Invoice', 20, 30);
    doc.setFontSize(12);
    doc.text(`Invoice: ${invoice.id}`, 20, 50);
    doc.text(`Client: ${invoice.clientName}`, 20, 60);
    doc.text(`Amount: $${invoice.amount.toLocaleString()}`, 20, 70);
    doc.text(`Due: ${new Date(invoice.dueDate).toLocaleDateString()}`, 20, 80);
    doc.text(`Status: ${invoice.status.toUpperCase()}`, 20, 90);
    doc.text(`Description: ${invoice.description || 'Services rendered'}`, 20, 100);
    doc.save(`${invoice.id}.pdf`);
  }

  addClient() {
    const name = document.getElementById('client-name').value;
    const email = document.getElementById('client-email').value;
    if (name && email) {
      const newClient = {
        id: this.db.nextId++,
        name,
        email,
        totalInvoiced: 0
      };
      this.db.clients.unshift(newClient);
      this.saveDb();
      this.refreshTables();
      document.getElementById('client-form').reset();
      this.hideModal('client-modal');
    }
  }

  showConfetti() {
    const canvas = document.createElement('canvas');
    canvas.className = 'success-confetti';
    document.body.appendChild(canvas);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    const colors = ['#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#3b82f6'];

    for (let i = 0; i < 100; i++) {
      setTimeout(() => {
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillRect(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          Math.random() * 12 + 6,
          Math.random() * 12 + 6
        );
      }, i * 20);
    }

    setTimeout(() => canvas.remove(), 2500);
  }

  refreshTables() {
    if (window.refreshInvoices) window.refreshInvoices();
    if (window.refreshClients) window.refreshClients();
  }
}

const app = new LedgerFlow();

function initPage() {
  app.checkAuth();
  app.bindNavigation();
}

function handleAction(action, invoiceId) {
  if (action === 'pdf') {
    const invoice = app.db.invoices.find(inv => inv.id === invoiceId);
    app.downloadPDF(invoice);
  } else if (action === 'view') {
    alert(`Viewing ${invoiceId}`);
  } else if (action === 'send') {
    alert(`Sharing ${invoiceId}`);
  }
}
