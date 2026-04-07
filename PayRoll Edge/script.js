// --- CONFIG & STATE ---
let currentHours = 84.5;
const HOURLY_RATE = 25.00;
const TAX_RATE = 0.20;

// --- DOM ELEMENTS ---
const displayHours = document.getElementById('display-hours');
const displayTax = document.getElementById('display-tax');
const logForm = document.getElementById('logHoursForm');
const hoursInput = document.getElementById('hoursInput');
const dateInput = document.getElementById('dateInput');

// --- INITIALIZATION ---
window.onload = () => {
    dateInput.valueAsDate = new Date();
    setupEventListeners();
};

// --- EVENT LISTENERS ---
function setupEventListeners() {
    logForm.addEventListener('submit', handleLogHours);
    
    document.getElementById('calcBtn').addEventListener('click', () => {
        updateTaxDisplay();
        alert(`Calculated tax for ${currentHours} hours.`);
    });

    document.getElementById('payslipBtn').addEventListener('click', () => {
        alert("Generating encrypted PDF preview...");
    });

    document.getElementById('exportBtn').addEventListener('click', exportData);
}

// --- LOGIC FUNCTIONS ---
function handleLogHours(e) {
    e.preventDefault();
    const addedHours = parseFloat(hoursInput.value);
    
    if (addedHours > 0) {
        currentHours += addedHours;
        updateUI();
        triggerSuccessFeedback();
        hoursInput.value = '';
    }
}

function updateUI() {
    displayHours.innerHTML = `${currentHours.toFixed(1)} <span class="unit">hrs</span>`;
    updateTaxDisplay();
}

function updateTaxDisplay() {
    const taxValue = (currentHours * HOURLY_RATE) * TAX_RATE;
    displayTax.innerText = `$${taxValue.toFixed(2)}`;
}

function focusHours() {
    hoursInput.focus();
}

function triggerSuccessFeedback() {
    const btn = document.getElementById('submitBtn');
    const originalText = btn.innerText;
    btn.innerText = "Success!";
    btn.style.backgroundColor = "#2ecc71";
    setTimeout(() => {
        btn.innerText = originalText;
        btn.style.backgroundColor = "#4da6ff";
    }, 2000);
}

function exportData() {
    const tax = (currentHours * HOURLY_RATE) * TAX_RATE;
    const csvContent = "data:text/csv;charset=utf-8,Date,Hours,Tax\n" 
                     + `${new Date().toLocaleDateString()},${currentHours},${tax.toFixed(2)}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "payroll_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
// Add to script.js

// Simulate a realistic data refresh
function refreshDashboardData() {
    console.log("Syncing with PayRoll Edge Servers...");
    // Show a loading state on the values
    const values = document.querySelectorAll('.box-value');
    values.forEach(v => v.style.opacity = '0.5');
    
    setTimeout(() => {
        values.forEach(v => v.style.opacity = '1');
        console.log("Data Synchronized via Secure Biometric Tunnel.");
    }, 800);
}

// Automatically refresh data every 5 minutes
setInterval(refreshDashboardData, 300000);

// Initialize tooltips or specific corporate alerts
function showTaxAlert() {
    const taxNotice = "Based on your 2026 declarations, your withholding is optimized for the PH region.";
    alert(taxNotice);
}