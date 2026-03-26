const STORAGE_KEYS = {
  semester: 'scholar_semester',
  student: 'scholar_student',
  feesPaid: 'scholar_fees_paid'
};

let semesterCourses = JSON.parse(localStorage.getItem(STORAGE_KEYS.semester) || '[]');

function saveSemester() {
  localStorage.setItem(STORAGE_KEYS.semester, JSON.stringify(semesterCourses));
}

function getStudentId() {
  return localStorage.getItem(STORAGE_KEYS.student) || 'Not logged in';
}

function feesPaid() {
  return localStorage.getItem(STORAGE_KEYS.feesPaid) === 'true';
}

function courseFeeTotal() {
  return semesterCourses.length * 425;
}

function login() {
  const id = document.getElementById('studentID')?.value.trim();
  if (!id) {
    alert('Please enter your Student ID.');
    return;
  }

  localStorage.setItem(STORAGE_KEYS.student, id);
  syncStudentIdentity();
  alert(`Welcome, ${id}. You can now manage your semester.`);
}

function addCourse(course) {
  if (semesterCourses.includes(course)) {
    alert(`${course} is already in your semester list.`);
    return;
  }

  semesterCourses.push(course);
  saveSemester();
  localStorage.setItem(STORAGE_KEYS.feesPaid, 'false');
  renderSemesterList();
  renderBillingSummary();
  renderTranscriptSummary();
  alert(`${course} added to your semester queue.`);
}

function renderSemesterList() {
  const list = document.getElementById('semesterList');
  if (!list) {
    return;
  }

  list.innerHTML = '';

  if (!semesterCourses.length) {
    list.innerHTML = '<li>No courses added yet. Start in the Course Catalog.</li>';
    return;
  }

  semesterCourses.forEach((course, index) => {
    const item = document.createElement('li');
    item.textContent = `${index + 1}. ${course}`;
    list.appendChild(item);
  });
}

function renderBillingSummary() {
  const count = document.getElementById('semesterCount');
  const amount = document.getElementById('feeAmount');
  const status = document.getElementById('paymentStatus');

  if (count) {
    count.textContent = String(semesterCourses.length);
  }

  if (amount) {
    amount.textContent = `$${courseFeeTotal()}`;
  }

  if (status) {
    status.textContent = feesPaid() ? 'Paid' : 'Pending';
  }
}

function renderTranscriptSummary() {
  const list = document.getElementById('currentCourses');
  const banner = document.getElementById('paymentBanner');
  const state = document.getElementById('transcriptFeeState');

  if (list) {
    list.innerHTML = '';

    if (!semesterCourses.length) {
      list.innerHTML = '<li>No current semester courses yet.</li>';
    } else {
      semesterCourses.forEach((course) => {
        const item = document.createElement('li');
        item.textContent = course;
        list.appendChild(item);
      });
    }
  }

  const paymentText = feesPaid() ? 'Fees Cleared' : 'Fees Pending';

  if (banner) {
    banner.textContent = paymentText;
  }

  if (state) {
    state.textContent = feesPaid() ? 'Cleared' : 'Pending';
  }
}

function syncStudentIdentity() {
  const studentId = getStudentId();
  document.querySelectorAll('[data-student-id]').forEach((node) => {
    node.textContent = studentId;
  });

  const input = document.getElementById('studentID');
  if (input && studentId !== 'Not logged in') {
    input.value = studentId;
  }
}

function payFees() {
  if (!semesterCourses.length) {
    alert('Add at least one course before paying fees.');
    return;
  }

  localStorage.setItem(STORAGE_KEYS.feesPaid, 'true');
  renderBillingSummary();
  renderTranscriptSummary();
  alert(`Payment recorded for ${semesterCourses.length} course(s). Transcript status updated.`);
}

document.addEventListener('DOMContentLoaded', () => {
  syncStudentIdentity();
  renderSemesterList();
  renderBillingSummary();
  renderTranscriptSummary();
});
