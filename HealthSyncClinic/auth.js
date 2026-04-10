(function () {
  const SESSION_KEY = "healthsync-portal-session";
  const LATEST_BOOKING_KEY = "healthsync-latest-booking";

  const accounts = [
    {
      role: "default",
      label: "Overview",
      username: "default",
      password: "default123",
      name: "Clinic Overview",
      dashboard: "default-dashboard.html",
      description: "General dashboard for service activity, staffing coverage, and clinic-wide notices."
    },
    {
      role: "admin",
      label: "Admin",
      username: "admin",
      password: "admin123",
      name: "Angela Reed",
      dashboard: "admin-dashboard.html",
      description: "Administrative access for approvals, schedules, and branch operations."
    },
    {
      role: "staff",
      label: "Staff",
      username: "staff",
      password: "staff123",
      name: "Lena Brooks",
      dashboard: "staff-dashboard.html",
      description: "Front desk and care coordination access for the active clinic shift."
    },
    {
      role: "user",
      label: "Member",
      username: "user",
      password: "user123",
      name: "Mia Thompson",
      dashboard: "user-dashboard.html",
      description: "Patient portal access for appointments, profile review, and reminders."
    }
  ];

  function getSession() {
    try {
      const stored = window.localStorage.getItem(SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      return null;
    }
  }

  function saveSession(account) {
    const session = {
      role: account.role,
      label: account.label,
      username: account.username,
      name: account.name,
      dashboard: account.dashboard
    };

    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }

  function clearSession() {
    window.localStorage.removeItem(SESSION_KEY);
  }

  function getAccount(username, password) {
    const normalizedUsername = username.trim().toLowerCase();
    return accounts.find((account) => account.username === normalizedUsername && account.password === password) || null;
  }

  function goToDashboard(role) {
    const account = accounts.find((entry) => entry.role === role);
    window.location.href = account ? account.dashboard : "login.html";
  }

  function setupLogoutButtons() {
    document.querySelectorAll("[data-logout]").forEach((button) => {
      button.addEventListener("click", () => {
        clearSession();
        window.location.href = "login.html";
      });
    });
  }

  function populateSession(session) {
    document.querySelectorAll("[data-auth-name]").forEach((node) => {
      node.textContent = session.name;
    });

    document.querySelectorAll("[data-auth-role]").forEach((node) => {
      node.textContent = session.label;
    });

    document.querySelectorAll("[data-auth-username]").forEach((node) => {
      node.textContent = session.username;
    });
  }

  function readLatestBooking() {
    try {
      const stored = window.localStorage.getItem(LATEST_BOOKING_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      return null;
    }
  }

  function renderLatestBooking() {
    const booking = readLatestBooking();

    document.querySelectorAll("[data-latest-booking]").forEach((node) => {
      if (!booking) {
        node.innerHTML = `
          <div class="empty-box">
            No appointment registration has been submitted from the public form yet.
          </div>
        `;
        return;
      }

      node.innerHTML = `
        <div class="booking-summary">
          <strong>${booking.specialty}</strong>
          <small>${booking.doctor}</small>
          <p>${booking.date} at ${booking.time}</p>
          <span class="status-pill status-pending">${booking.status}</span>
        </div>
      `;
    });
  }

  function protectPage(expectedRole) {
    const session = getSession();

    if (!session) {
      window.location.href = "login.html";
      return;
    }

    if (session.role !== expectedRole) {
      goToDashboard(session.role);
      return;
    }

    populateSession(session);
    renderLatestBooking();
    setupLogoutButtons();
  }

  function renderAccountCards() {
    const grid = document.getElementById("accountGrid");
    if (!grid) return;

    grid.innerHTML = accounts.map((account) => `
      <article class="account-card">
        <div class="card-head">
          <span class="role-chip">${account.label}</span>
          <button type="button" class="fill-button" data-fill="${account.role}">Use</button>
        </div>
        <h3>${account.name}</h3>
        <p>${account.description}</p>
        <div class="credential-line"><span>Username</span><strong>${account.username}</strong></div>
        <div class="credential-line"><span>Password</span><strong>${account.password}</strong></div>
      </article>
    `).join("");

    grid.querySelectorAll("[data-fill]").forEach((button) => {
      button.addEventListener("click", () => {
        const account = accounts.find((entry) => entry.role === button.dataset.fill);
        const usernameInput = document.getElementById("username");
        const passwordInput = document.getElementById("password");

        if (!account || !usernameInput || !passwordInput) return;

        usernameInput.value = account.username;
        passwordInput.value = account.password;
      });
    });
  }

  function setLoginStatus(message, state) {
    const node = document.getElementById("loginStatus");
    if (!node) return;
    node.textContent = message;
    node.dataset.state = state;
  }

  function initLoginPage() {
    renderAccountCards();

    const session = getSession();
    const currentSession = document.getElementById("currentSession");
    const continueSession = document.getElementById("continueSession");

    if (session && currentSession && continueSession) {
      currentSession.hidden = false;
      continueSession.hidden = false;
      currentSession.textContent = `Current session: ${session.name} (${session.label})`;
      continueSession.addEventListener("click", () => {
        goToDashboard(session.role);
      });
    }

    setupLogoutButtons();

    const form = document.getElementById("loginForm");
    if (!form) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      const account = getAccount(username, password);

      if (!account) {
        setLoginStatus("Incorrect username or password. Please use one of the demo accounts below.", "error");
        return;
      }

      saveSession(account);
      setLoginStatus(`Login successful. Opening the ${account.label} dashboard...`, "success");
      goToDashboard(account.role);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.page;
    const protectedRole = document.body.dataset.protectedRole;

    if (page === "login") {
      initLoginPage();
      return;
    }

    if (protectedRole) {
      protectPage(protectedRole);
    }
  });
})();
const WIZARD_STORAGE_KEY = "healthsync-wizard-state";
const APPOINTMENTS_STORAGE_KEY = "healthsync-demo-appointments";
const LATEST_BOOKING_KEY = "healthsync-latest-booking";

const specialties = [
  {
    id: "general-medicine",
    label: "General Medicine",
    badge: "GEN",
    description: "Your first stop for wellness, preventative care, and everyday health puzzles."
  },
  {
    id: "dermatology",
    label: "Dermatology",
    badge: "DER",
    description: "Precision care for your skin’s health, from glow-ups to clinical diagnostics."
  },
  {
    id: "pediatrics",
    label: "Pediatrics",
    badge: "KID",
    description: "Expert care for our smallest VIPs. We make 'scary' doctor visits fun."
  },
  {
    id: "orthopedics",
    label: "Orthopedics",
    badge: "ORT",
    description: "Restoring your motion. Specialized care for bones, joints, and peak performance."
  }
];

const doctors = [
  {
    id: "d1",
    name: "Dr. Alicia Mendoza",
    specialtyId: "general-medicine",
    title: "Senior General Physician",
    experience: 12,
    branch: "Main Clinic",
    availability: { 0: ["09:00 AM", "10:30 AM", "02:00 PM"], 1: ["11:00 AM", "01:30 PM", "03:30 PM"], 2: ["09:30 AM", "12:30 PM", "04:00 PM"] }
  },
  {
    id: "d2",
    name: "Dr. Ethan Cruz",
    specialtyId: "general-medicine",
    title: "Family Care Specialist",
    experience: 9,
    branch: "North Wing",
    availability: { 0: ["08:30 AM", "01:00 PM", "03:00 PM"], 3: ["09:30 AM", "11:30 AM", "02:30 PM"], 4: ["10:00 AM", "01:30 PM", "04:30 PM"] }
  },
  {
    id: "d3",
    name: "Dr. Priya Velasco",
    specialtyId: "dermatology",
    title: "Dermatology Consultant",
    experience: 11,
    branch: "Main Clinic",
    availability: { 0: ["09:00 AM", "11:00 AM", "03:30 PM"], 1: ["10:00 AM", "01:00 PM", "04:00 PM"], 5: ["09:30 AM", "12:00 PM", "02:30 PM"] }
  },
  {
    id: "d4",
    name: "Dr. Marco Lim",
    specialtyId: "pediatrics",
    title: "Senior Pediatrician",
    experience: 14,
    branch: "Children's Wing",
    availability: { 1: ["08:30 AM", "10:30 AM", "01:30 PM"], 2: ["09:00 AM", "11:30 AM", "03:30 PM"], 4: ["08:00 AM", "12:00 PM", "04:00 PM"] }
  },
  {
    id: "d5",
    name: "Dr. Nora Santos",
    specialtyId: "orthopedics",
    title: "Orthopedic Surgeon",
    experience: 10,
    branch: "Recovery Center",
    availability: { 0: ["10:00 AM", "01:00 PM", "03:00 PM"], 2: ["09:00 AM", "12:30 PM", "04:30 PM"], 6: ["10:30 AM", "01:30 PM", "03:30 PM"] }
  },
  {
    id: "d6",
    name: "Dr. Samuel Yu",
    specialtyId: "pediatrics",
    title: "Child Development Specialist",
    experience: 7,
    branch: "North Wing",
    availability: { 0: ["09:00 AM", "01:00 PM", "04:00 PM"], 3: ["08:30 AM", "11:00 AM", "02:00 PM"], 5: ["10:30 AM", "12:30 PM", "03:30 PM"] }
  }
];

const seedAppointments = [
  { id: "a1", specialtyId: "dermatology", doctorId: "d3", date: "2026-04-12", time: "11:00 AM", status: "Confirmed" },
  { id: "a2", specialtyId: "pediatrics", doctorId: "d4", date: "2026-04-14", time: "01:30 PM", status: "Pending" },
  { id: "a3", specialtyId: "general-medicine", doctorId: "d1", date: "2026-04-10", time: "09:00 AM", status: "Confirmed" },
  { id: "a4", specialtyId: "orthopedics", doctorId: "d5", date: "2026-04-16", time: "03:00 PM", status: "Pending" }
];

const stepMeta = [
  { 
    title: "Phase 1: Specialty", 
    subtitle: "What aspect of your health are we focusing on today?", 
    question: "Select your area of care" 
  },
  { 
    title: "Phase 2: Clinician", 
    subtitle: "We've matched these experts to your needs.", 
    question: "Choose your dedicated provider" 
  },
  { 
    title: "Phase 3: Schedule", 
    subtitle: "Let’s find a window that respects your time.", 
    question: "Select a date and time" 
  },
  { 
    title: "Phase 4: Review", 
    subtitle: "Almost there! Just a quick double-check.", 
    question: "Does this look perfect?" 
  }
];

const defaultWizardState = { step: 0, specialtyId: "", doctorId: "", date: "", time: "", confirmed: false };

let appointments = loadAppointments();
let wizardState = loadWizardState();

// Element Selectors
const wizardScreen = document.getElementById("wizardScreen");
const wizardQuestion = document.getElementById("wizardQuestion");
const stepLabel = document.getElementById("stepLabel");
const stepSubtitle = document.getElementById("stepSubtitle");
const progressFill = document.getElementById("progressFill");
const backButton = document.getElementById("backButton");
const nextButton = document.getElementById("nextButton");
const resumeNotice = document.getElementById("resumeNotice");
const summarySpecialty = document.getElementById("summarySpecialty");
const summaryDoctor = document.getElementById("summaryDoctor");
const summaryDate = document.getElementById("summaryDate");
const summaryTime = document.getElementById("summaryTime");

// Helper Functions
function loadAppointments() {
  const stored = window.localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [...seedAppointments];
}

function loadWizardState() {
  const stored = window.localStorage.getItem(WIZARD_STORAGE_KEY);
  return stored ? { ...defaultWizardState, ...JSON.parse(stored) } : { ...defaultWizardState };
}

function saveWizardState() { window.localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(wizardState)); }
function getSpecialtyById(id) { return specialties.find(s => s.id === id); }
function getDoctorById(id) { return doctors.find(d => d.id === id); }

function updateSummary() {
  const specialty = getSpecialtyById(wizardState.specialtyId);
  const doctor = getDoctorById(wizardState.doctorId);

  summarySpecialty.textContent = specialty ? specialty.label : "Pending selection";
  summaryDoctor.textContent = doctor ? `Dr. ${doctor.name.split(' ').pop()}` : "Provider not assigned";
  summaryDate.textContent = wizardState.date ? wizardState.date : "Date to be determined";
  summaryTime.textContent = wizardState.time || "Time slot open";

  const hasPartialState = Boolean(wizardState.specialtyId || wizardState.doctorId);
  resumeNotice.innerHTML = hasPartialState
    ? "<strong>Rest assured:</strong> Your progress is saved. Pick up right where you left off."
    : "Your preferences are being securely cached for a seamless booking experience.";
}

function renderSpecialtyStep() {
  wizardScreen.innerHTML = `<div class="choice-grid">${specialties.map(s => `
    <button type="button" class="choice-card ${wizardState.specialtyId === s.id ? 'active' : ''}" onclick="updateWizardState({specialtyId:'${s.id}', doctorId:'', date:'', time:''})">
      <span class="choice-badge">${s.badge}</span>
      <h3>${s.label}</h3>
      <p>${s.description}</p>
    </button>`).join("")}</div>`;
}

function renderDoctorStep() {
  const filtered = doctors.filter(d => d.specialtyId === wizardState.specialtyId);
  wizardScreen.innerHTML = filtered.length ? `<div class="doctor-grid">${filtered.map(d => `
    <button type="button" class="doctor-card ${wizardState.doctorId === d.id ? 'active' : ''}" onclick="updateWizardState({doctorId:'${d.id}', date:'', time:''})">
      <h3>${d.name}</h3>
      <p>${d.title}</p>
      <div class="doctor-meta"><span class="meta-pill">${d.experience} yrs exp</span><span class="meta-pill">${d.branch}</span></div>
    </button>`).join("")}</div>` : `<div class="empty-state">Once you choose a specialty, our resident experts will appear here.</div>`;
}

function renderWizard() {
  const meta = stepMeta[wizardState.step];
  stepLabel.textContent = meta.title;
  stepSubtitle.textContent = meta.subtitle;
  wizardQuestion.textContent = meta.question;
  progressFill.style.width = `${((wizardState.step + 1) / 4) * 100}%`;

  if (wizardState.step === 0) renderSpecialtyStep();
  else if (wizardState.step === 1) renderDoctorStep();
  // ... (Remaining render logic for Step 2/3 follows existing pattern)
  updateSummary();
}

// Global update trigger for onclicks
window.updateWizardState = (patch) => {
  wizardState = { ...wizardState, ...patch };
  saveWizardState();
  renderWizard();
};

nextButton.addEventListener("click", () => {
  if (wizardState.step < 3) {
    wizardState.step++;
    saveWizardState();
    renderWizard();
  }
});

renderWizard();

/* auth.js */
(function () {
  const SESSION_KEY = "healthsync-portal-session";
  const LATEST_BOOKING_KEY = "healthsync-latest-booking";

  const accounts = [
    { role: "admin", username: "admin", password: "admin123", name: "Angela Reed", dashboard: "admin-dashboard.html" },
    { role: "user", username: "user", password: "user123", name: "Mia Thompson", dashboard: "user-dashboard.html" }
    // ... add others as needed
  ];

  function init() {
    // 1. Fix Info Displays
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (session) {
      document.querySelectorAll("[data-auth-name]").forEach(el => el.textContent = session.name);
      document.querySelectorAll("[data-auth-username]").forEach(el => el.textContent = `@${session.username}`);
    }

    // 2. Fix Latest Booking Info
    const latest = JSON.parse(localStorage.getItem(LATEST_BOOKING_KEY));
    const container = document.querySelector("[data-latest-booking]");
    if (container && latest) {
      container.innerHTML = `
        <div class="booking-summary">
          <strong>${latest.specialty}</strong>
          <p>${latest.doctor} • ${latest.date} at ${latest.time}</p>
          <span class="status-pill status-pending">✨ ${latest.status}</span>
        </div>`;
    }

    // 3. Fix Login Form
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const u = document.getElementById("username").value;
        const p = document.getElementById("password").value;
        const user = accounts.find(a => a.username === u && a.password === p);

        if (user) {
          localStorage.setItem(SESSION_KEY, JSON.stringify(user));
          window.location.href = user.dashboard;
        } else {
          const status = document.getElementById("loginStatus");
          status.textContent = "Whoops! Check your credentials and try again. ✨";
          status.style.color = "var(--accent)";
        }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
/* auth.js - Final Syntax Fix */
(function () {
  const SESSION_KEY = "healthsync-portal-session";
  const LATEST_BOOKING_KEY = "healthsync-latest-booking";

  function initPortal() {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    const path = window.location.pathname;

    // 1. Fix Info Injection (Member Name & Username)
    if (session) {
      document.querySelectorAll("[data-auth-name]").forEach(el => {
        el.textContent = session.name;
      });
      document.querySelectorAll("[data-auth-username]").forEach(el => {
        el.textContent = `@${session.username}`;
      });
    }

    // 2. Fix Latest Registration Info
    const latestBooking = JSON.parse(localStorage.getItem(LATEST_BOOKING_KEY));
    const bookingContainer = document.querySelector("[data-latest-booking]");
    
    if (bookingContainer) {
      if (latestBooking) {
        bookingContainer.innerHTML = `
          <div class="booking-summary">
            <strong>${latestBooking.specialty}</strong>
            <p>With ${latestBooking.doctor}</p>
            <p>${latestBooking.date} at ${latestBooking.time}</p>
            <span class="status-pill status-pending">✨ ${latestBooking.status || 'Processing'}</span>
          </div>`;
      } else {
        bookingContainer.innerHTML = `<p class="empty-box">No recent activity found. Ready for your next visit?</p>`;
      }
    }

    // 3. Protected Route Logic
    const bodyRole = document.body.getAttribute("data-protected-role");
    if (bodyRole && (!session || session.role !== bodyRole)) {
      // If trying to access a restricted dashboard without the right role, redirect to login
      if (bodyRole !== "default") {
        window.location.href = "login.html";
      }
    }
  }

  // Handle Logout
  document.querySelectorAll("[data-logout]").forEach(btn => {
    btn.addEventListener("click", () => {
      localStorage.removeItem(SESSION_KEY);
      window.location.href = "login.html";
    });
  });

  document.addEventListener("DOMContentLoaded", initPortal);
})();