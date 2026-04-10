const WIZARD_STORAGE_KEY = "healthsync-wizard-state";
const APPOINTMENTS_STORAGE_KEY = "healthsync-demo-appointments";
const LATEST_BOOKING_KEY = "healthsync-latest-booking";

const specialties = [
  {
    id: "general-medicine",
    label: "General Medicine",
    badge: "GEN",
    description: "Checkups, mild illness care, prescription follow-ups, and everyday medical concerns."
  },
  {
    id: "dermatology",
    label: "Dermatology",
    badge: "DER",
    description: "Skin, hair, and nail consultations with friendly, professional treatment planning."
  },
  {
    id: "pediatrics",
    label: "Pediatrics",
    badge: "KID",
    description: "Child wellness, vaccines, growth reviews, and same-day support for little patients."
  },
  {
    id: "orthopedics",
    label: "Orthopedics",
    badge: "ORT",
    description: "Bone, joint, posture, and injury care for movement and recovery support."
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
    availability: {
      0: ["09:00 AM", "10:30 AM", "02:00 PM"],
      1: ["11:00 AM", "01:30 PM", "03:30 PM"],
      2: ["09:30 AM", "12:30 PM", "04:00 PM"]
    }
  },
  {
    id: "d2",
    name: "Dr. Ethan Cruz",
    specialtyId: "general-medicine",
    title: "Family Care Specialist",
    experience: 9,
    branch: "North Wing",
    availability: {
      0: ["08:30 AM", "01:00 PM", "03:00 PM"],
      3: ["09:30 AM", "11:30 AM", "02:30 PM"],
      4: ["10:00 AM", "01:30 PM", "04:30 PM"]
    }
  },
  {
    id: "d3",
    name: "Dr. Priya Velasco",
    specialtyId: "dermatology",
    title: "Dermatology Consultant",
    experience: 11,
    branch: "Main Clinic",
    availability: {
      0: ["09:00 AM", "11:00 AM", "03:30 PM"],
      1: ["10:00 AM", "01:00 PM", "04:00 PM"],
      5: ["09:30 AM", "12:00 PM", "02:30 PM"]
    }
  },
  {
    id: "d4",
    name: "Dr. Marco Lim",
    specialtyId: "pediatrics",
    title: "Senior Pediatrician",
    experience: 14,
    branch: "Children's Wing",
    availability: {
      1: ["08:30 AM", "10:30 AM", "01:30 PM"],
      2: ["09:00 AM", "11:30 AM", "03:30 PM"],
      4: ["08:00 AM", "12:00 PM", "04:00 PM"]
    }
  },
  {
    id: "d5",
    name: "Dr. Nora Santos",
    specialtyId: "orthopedics",
    title: "Orthopedic Surgeon",
    experience: 10,
    branch: "Recovery Center",
    availability: {
      0: ["10:00 AM", "01:00 PM", "03:00 PM"],
      2: ["09:00 AM", "12:30 PM", "04:30 PM"],
      6: ["10:30 AM", "01:30 PM", "03:30 PM"]
    }
  },
  {
    id: "d6",
    name: "Dr. Samuel Yu",
    specialtyId: "pediatrics",
    title: "Child Development Specialist",
    experience: 7,
    branch: "North Wing",
    availability: {
      0: ["09:00 AM", "01:00 PM", "04:00 PM"],
      3: ["08:30 AM", "11:00 AM", "02:00 PM"],
      5: ["10:30 AM", "12:30 PM", "03:30 PM"]
    }
  }
];

const seedAppointments = [
  { id: "a1", specialtyId: "dermatology", doctorId: "d3", date: "2026-04-12", time: "11:00 AM", status: "Confirmed" },
  { id: "a2", specialtyId: "pediatrics", doctorId: "d4", date: "2026-04-14", time: "01:30 PM", status: "Pending" },
  { id: "a3", specialtyId: "general-medicine", doctorId: "d1", date: "2026-04-10", time: "09:00 AM", status: "Confirmed" },
  { id: "a4", specialtyId: "orthopedics", doctorId: "d5", date: "2026-04-16", time: "03:00 PM", status: "Pending" }
];

const stepMeta = [
  { title: "Step 1 of 4", subtitle: "Select the type of care you need.", question: "Which specialty should we book for you?" },
  { title: "Step 2 of 4", subtitle: "Choose a doctor matched to your specialty.", question: "Who would you like to see?" },
  { title: "Step 3 of 4", subtitle: "Pick an available date and time.", question: "When works best for your appointment?" },
  { title: "Step 4 of 4", subtitle: "Review the appointment before final confirmation.", question: "Everything look right before we book it?" }
];

const defaultWizardState = {
  step: 0,
  specialtyId: "",
  doctorId: "",
  date: "",
  time: "",
  confirmed: false
};

let appointments = loadAppointments();
let wizardState = loadWizardState();

const wizardScreen = document.getElementById("wizardScreen");
const wizardQuestion = document.getElementById("wizardQuestion");
const stepLabel = document.getElementById("stepLabel");
const stepSubtitle = document.getElementById("stepSubtitle");
const progressFill = document.getElementById("progressFill");
const backButton = document.getElementById("backButton");
const nextButton = document.getElementById("nextButton");
const resetWizardButton = document.getElementById("resetWizard");
const resumeNotice = document.getElementById("resumeNotice");
const heroDoctorCount = document.getElementById("heroDoctorCount");
const heroPendingCount = document.getElementById("heroPendingCount");
const summarySpecialty = document.getElementById("summarySpecialty");
const summaryDoctor = document.getElementById("summaryDoctor");
const summaryDate = document.getElementById("summaryDate");
const summaryTime = document.getElementById("summaryTime");

function loadAppointments() {
  try {
    const stored = window.localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
    if (!stored) {
      window.localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(seedAppointments));
      return [...seedAppointments];
    }
    return JSON.parse(stored);
  } catch (error) {
    return [...seedAppointments];
  }
}

function saveAppointments() {
  window.localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));
}

function loadWizardState() {
  try {
    const stored = window.localStorage.getItem(WIZARD_STORAGE_KEY);
    if (!stored) {
      return { ...defaultWizardState };
    }
    return { ...defaultWizardState, ...JSON.parse(stored) };
  } catch (error) {
    return { ...defaultWizardState };
  }
}

function saveWizardState() {
  window.localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(wizardState));
}

function resetWizard() {
  wizardState = { ...defaultWizardState };
  saveWizardState();
  renderWizard();
}

function updateWizardState(patch) {
  wizardState = { ...wizardState, ...patch };
  saveWizardState();
  renderWizard();
}

function getSpecialtyById(id) {
  return specialties.find((specialty) => specialty.id === id);
}

function getDoctorById(id) {
  return doctors.find((doctor) => doctor.id === id);
}

function formatDate(dateString) {
  if (!dateString) {
    return "Not selected";
  }

  const date = new Date(`${dateString}T12:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function getDateChoices() {
  return Array.from({ length: 7 }, (_, offset) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + offset);
    return {
      offset,
      iso: date.toISOString().split("T")[0],
      day: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date),
      label: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date)
    };
  });
}

function getAvailableTimes(doctor) {
  if (!doctor) {
    return [];
  }

  const match = getDateChoices().find((item) => item.iso === wizardState.date);
  if (!match) {
    return [];
  }

  return doctor.availability[match.offset] || [];
}

function updateHeroStats() {
  if (heroDoctorCount) {
    heroDoctorCount.textContent = String(doctors.length);
  }

  if (heroPendingCount) {
    const pendingCount = appointments.filter((appointment) => appointment.status === "Pending").length;
    heroPendingCount.textContent = String(pendingCount);
  }
}

function updateSummary() {
  const specialty = getSpecialtyById(wizardState.specialtyId);
  const doctor = getDoctorById(wizardState.doctorId);

  summarySpecialty.textContent = specialty ? specialty.label : "Not selected";
  summaryDoctor.textContent = doctor ? doctor.name : "Not selected";
  summaryDate.textContent = wizardState.date ? formatDate(wizardState.date) : "Not selected";
  summaryTime.textContent = wizardState.time || "Not selected";

  const hasPartialState = Boolean(
    wizardState.specialtyId || wizardState.doctorId || wizardState.date || wizardState.time
  );
  resumeNotice.textContent = hasPartialState
    ? "Progress detected. Your booking details are still here whenever you are ready to finish."
    : "Your booking progress is safely stored in this browser so you can return later.";
}

function renderSpecialtyStep() {
  wizardScreen.innerHTML = `
    <div class="choice-grid">
      ${specialties.map((specialty) => {
        const active = wizardState.specialtyId === specialty.id ? "active" : "";
        return `
          <button type="button" class="choice-card ${active}" data-specialty-id="${specialty.id}">
            <span class="choice-badge">${specialty.badge}</span>
            <h3>${specialty.label}</h3>
            <p>${specialty.description}</p>
          </button>
        `;
      }).join("")}
    </div>
  `;

  wizardScreen.querySelectorAll("[data-specialty-id]").forEach((button) => {
    button.addEventListener("click", () => {
      updateWizardState({
        specialtyId: button.dataset.specialtyId,
        doctorId: "",
        date: "",
        time: "",
        confirmed: false
      });
    });
  });
}

function renderDoctorStep() {
  const filteredDoctors = doctors.filter((doctor) => doctor.specialtyId === wizardState.specialtyId);

  if (!filteredDoctors.length) {
    wizardScreen.innerHTML = `<div class="empty-state">Pick a specialty first so we can show the right doctors.</div>`;
    return;
  }

  wizardScreen.innerHTML = `
    <div class="doctor-grid">
      ${filteredDoctors.map((doctor) => {
        const active = wizardState.doctorId === doctor.id ? "active" : "";
        return `
          <button type="button" class="doctor-card ${active}" data-doctor-id="${doctor.id}">
            <h3>${doctor.name}</h3>
            <p>${doctor.title}</p>
            <div class="doctor-meta">
              <span class="meta-pill">${doctor.experience} yrs exp</span>
              <span class="meta-pill">${doctor.branch}</span>
            </div>
          </button>
        `;
      }).join("")}
    </div>
  `;

  wizardScreen.querySelectorAll("[data-doctor-id]").forEach((button) => {
    button.addEventListener("click", () => {
      updateWizardState({
        doctorId: button.dataset.doctorId,
        date: "",
        time: "",
        confirmed: false
      });
    });
  });
}

function renderTimeStep() {
  const doctor = getDoctorById(wizardState.doctorId);
  const dateChoices = getDateChoices();
  const availableTimes = getAvailableTimes(doctor);

  wizardScreen.innerHTML = `
    <div>
      <p class="slot-heading">Choose a day</p>
      <div class="date-grid">
        ${dateChoices.map((dateChoice) => {
          const active = wizardState.date === dateChoice.iso ? "active" : "";
          const availableCount = ((doctor && doctor.availability[dateChoice.offset]) || []).length;
          return `
            <button type="button" class="date-card ${active}" data-date="${dateChoice.iso}">
              <h3>${dateChoice.day}</h3>
              <p>${dateChoice.label}</p>
              <p>${availableCount} slots</p>
            </button>
          `;
        }).join("")}
      </div>
    </div>
    <div>
      <p class="slot-heading">Choose a time</p>
      ${
        wizardState.date
          ? availableTimes.length
            ? `
              <div class="time-grid">
                ${availableTimes.map((time) => {
                  const active = wizardState.time === time ? "active" : "";
                  return `
                    <button type="button" class="time-card ${active}" data-time="${time}">
                      <h3>${time}</h3>
                      <p>Available with ${doctor.name}</p>
                    </button>
                  `;
                }).join("")}
              </div>
            `
            : `<div class="empty-state">No open slots for this doctor on the selected day. Choose another date.</div>`
          : `<div class="empty-state">Select a date to reveal open time slots.</div>`
      }
    </div>
  `;

  wizardScreen.querySelectorAll("[data-date]").forEach((button) => {
    button.addEventListener("click", () => {
      updateWizardState({
        date: button.dataset.date,
        time: "",
        confirmed: false
      });
    });
  });

  wizardScreen.querySelectorAll("[data-time]").forEach((button) => {
    button.addEventListener("click", () => {
      updateWizardState({
        time: button.dataset.time,
        confirmed: false
      });
    });
  });
}

function renderConfirmStep() {
  const specialty = getSpecialtyById(wizardState.specialtyId);
  const doctor = getDoctorById(wizardState.doctorId);

  wizardScreen.innerHTML = `
    ${wizardState.confirmed ? `<div class="confirmation-banner">Appointment request submitted. You can now log in and open the matching dashboard.</div>` : ""}
    <div class="summary-card">
      <h3>Appointment Summary</h3>
      <p><strong>Specialty:</strong> ${specialty ? specialty.label : "Not selected"}</p>
      <p><strong>Doctor:</strong> ${doctor ? doctor.name : "Not selected"}</p>
      <p><strong>Date:</strong> ${wizardState.date ? formatDate(wizardState.date) : "Not selected"}</p>
      <p><strong>Time:</strong> ${wizardState.time || "Not selected"}</p>
    </div>
    <div class="helper-copy">
      Selecting Book Now saves a pending appointment request and makes the latest booking available in the demo dashboards.
    </div>
  `;
}

function canContinue() {
  if (wizardState.step === 0) {
    return Boolean(wizardState.specialtyId);
  }
  if (wizardState.step === 1) {
    return Boolean(wizardState.doctorId);
  }
  if (wizardState.step === 2) {
    return Boolean(wizardState.date && wizardState.time);
  }
  return Boolean(wizardState.specialtyId && wizardState.doctorId && wizardState.date && wizardState.time);
}

function saveLatestBooking() {
  const specialty = getSpecialtyById(wizardState.specialtyId);
  const doctor = getDoctorById(wizardState.doctorId);

  const latestBooking = {
    specialty: specialty ? specialty.label : "Not selected",
    doctor: doctor ? doctor.name : "Not selected",
    date: formatDate(wizardState.date),
    time: wizardState.time || "Not selected",
    status: "Pending"
  };

  window.localStorage.setItem(LATEST_BOOKING_KEY, JSON.stringify(latestBooking));
}

function goToNextStep() {
  if (!canContinue()) {
    return;
  }

  if (wizardState.step < 3) {
    updateWizardState({ step: wizardState.step + 1 });
    return;
  }

  if (!wizardState.confirmed) {
    appointments = [
      {
        id: `a${appointments.length + 1}`,
        specialtyId: wizardState.specialtyId,
        doctorId: wizardState.doctorId,
        date: wizardState.date,
        time: wizardState.time,
        status: "Pending"
      },
      ...appointments
    ];
    saveAppointments();
    saveLatestBooking();
  }

  wizardState = { ...wizardState, confirmed: true };
  saveWizardState();
  renderWizard();
}

function goToPreviousStep() {
  if (wizardState.step === 0) {
    return;
  }

  updateWizardState({
    step: wizardState.step - 1,
    confirmed: false
  });
}

function renderWizard() {
  const meta = stepMeta[wizardState.step];
  const progress = ((wizardState.step + 1) / stepMeta.length) * 100;

  stepLabel.textContent = meta.title;
  stepSubtitle.textContent = meta.subtitle;
  wizardQuestion.textContent = meta.question;
  progressFill.style.width = `${progress}%`;

  backButton.disabled = wizardState.step === 0;
  nextButton.textContent = wizardState.step === 3
    ? (wizardState.confirmed ? "Booked" : "Book Now")
    : "Continue";
  nextButton.disabled = !canContinue() || (wizardState.step === 3 && wizardState.confirmed);

  if (wizardState.step === 0) {
    renderSpecialtyStep();
  } else if (wizardState.step === 1) {
    renderDoctorStep();
  } else if (wizardState.step === 2) {
    renderTimeStep();
  } else {
    renderConfirmStep();
  }

  updateSummary();
  updateHeroStats();
}

backButton.addEventListener("click", goToPreviousStep);
nextButton.addEventListener("click", goToNextStep);
resetWizardButton.addEventListener("click", resetWizard);

renderWizard();
