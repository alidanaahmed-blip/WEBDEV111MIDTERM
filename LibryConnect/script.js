const defaultBooks = [
  {
    id: "book-1",
    title: "The Christmas Book",
    author: "Child Study Association of America",
    status: "On shelf",
    img: "b1.jpg",
    due: "Available now"
  },
  {
    id: "book-2",
    title: "Charlotte's Web",
    author: "E. B. White",
    status: "On shelf",
    img: "b2.webp",
    due: "Available now"
  },
  {
    id: "book-3",
    title: "Kindness to the Animals",
    author: "Unknown",
    status: "On shelf",
    img: "b3.jpg",
    due: "Available now"
  },
  {
    id: "book-4",
    title: "A Man's Man",
    author: "John Strange Winter",
    status: "On shelf",
    img: "b4.jpg",
    due: "Available now"
  },
  {
    id: "book-5",
    title: "Little Women",
    author: "Louisa May Alcott",
    status: "On shelf",
    img: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=240&q=80",
    due: "Available now"
  },
  {
    id: "book-6",
    title: "Heidi",
    author: "Johanna Spyri",
    status: "On shelf",
    img: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=240&q=80",
    due: "Available now"
  },
  {
    id: "book-7",
    title: "Black Beauty",
    author: "Anna Sewell",
    status: "On shelf",
    img: "https://images.unsplash.com/photo-1511108690759-009324a90311?auto=format&fit=crop&w=240&q=80",
    due: "Available now"
  },
  {
    id: "book-8",
    title: "The Secret Garden",
    author: "Frances Hodgson Burnett",
    status: "On shelf",
    img: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=240&q=80",
    due: "Available now"
  },
  {
    id: "book-9",
    title: "Anne of Green Gables",
    author: "L. M. Montgomery",
    status: "On shelf",
    img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=240&q=80",
    due: "Available now"
  },
  {
    id: "book-10",
    title: "A Little Princess",
    author: "Frances Hodgson Burnett",
    status: "On shelf",
    img: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=240&q=80",
    due: "Available now"
  }
];

const USER_KEY = "lcUsers";
const SESSION_KEY = "lcCurrentUser";
const BOOKS_KEY = "lcBooks";
const RECEIPT_KEY = "lcLatestReceipt";

function safeParse(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function getBooks() {
  const stored = safeParse(BOOKS_KEY, null);
  if (!stored) return defaultBooks;
  return defaultBooks.map((book) => {
    const override = stored.find((item) => item.id === book.id);
    return override ? { ...book, ...override } : book;
  });
}

function saveBooks(list) {
  localStorage.setItem(BOOKS_KEY, JSON.stringify(list));
}

function getUsers() {
  return safeParse(USER_KEY, []);
}

function saveUsers(list) {
  localStorage.setItem(USER_KEY, JSON.stringify(list));
}

function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  renderSessionBadge();
}

function getSession() {
  return safeParse(SESSION_KEY, null);
}

function saveReceipt(receipt) {
  localStorage.setItem(RECEIPT_KEY, JSON.stringify(receipt));
}

function getReceipt() {
  return safeParse(RECEIPT_KEY, null);
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function renderResults(inputId, targetId) {
  const q = (document.getElementById(inputId)?.value || "").toLowerCase().trim();
  const target = document.getElementById(targetId);
  if (!target) return;

  target.innerHTML = "";
  if (!q) {
    target.style.display = "none";
    return;
  }

  const results = getBooks().filter((book) => {
    const haystack = `${book.title} ${book.author || ""}`.toLowerCase();
    return haystack.includes(q);
  });
  results.forEach((book, idx) => {
    const actionLabel = book.status === "On shelf" ? "Place loan" : "Place hold";
    const row = document.createElement("div");
    row.className = "result";
    row.style.animationDelay = `${idx * 40}ms`;
    row.innerHTML = `
      <img class="result-cover" src="${book.img}" alt="${book.title} cover">
      <div class="result-meta">
        <div class="result-title">${book.title}</div>
        <div class="result-sub">${book.author}</div>
        <div class="book-flow">
          <span>Search Book</span>
          <span>Check Status</span>
          <span>${actionLabel}</span>
          <span>Track Due Date</span>
        </div>
      </div>
      <div class="result-actions">
        <div class="result-status">${book.status}</div>
        <div class="result-due">${book.due || "Available now"}</div>
        <div class="result-button-row">
          <button class="btn result-borrow" type="button" data-book-id="${book.id}">${actionLabel}</button>
          <a class="btn ghost result-track" href="loans.html">Track due date</a>
        </div>
      </div>`;
    target.appendChild(row);
  });

  if (results.length === 0) {
    const empty = document.createElement("div");
    empty.className = "result empty";
    empty.textContent = "No matches yet. Try author, title, or ISBN.";
    target.appendChild(empty);
  }

  target.style.display = "grid";
  wireBorrowButtons(target);
}

function wireBorrowButtons(scope = document) {
  scope.querySelectorAll("[data-book-id]").forEach((button) => {
    button.onclick = () => checkoutBook(button.dataset.bookId);
  });
}

function checkoutBook(bookId) {
  const book = getBooks().find((item) => item.id === bookId);
  if (!book) return;

  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setDate(today.getDate() + 14);
  const session = getSession();
  const receipt = {
    title: book.title,
    img: book.img,
    member: session?.fullName || session?.cardNumber || "Guest member",
    checkoutDate: formatDate(today),
    dueDate: formatDate(dueDate),
    pickup: "Main Desk",
    code: `LB-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}-${book.id.toUpperCase()}`
  };

  saveReceipt(receipt);
  const books = getBooks().map((item) => (
    item.id === bookId
      ? { ...item, status: "On loan", due: `Due ${receipt.dueDate}` }
      : item
  ));
  saveBooks(books);
  renderLatestReceipt();
  if (document.getElementById("navSearch")?.value) {
    renderResults("navSearch", "navResults");
  }
  renderBookImageEditor();
  openReceiptModal(receipt);
}

function openReceiptModal(receipt) {
  closeAuthModal();
  document.querySelectorAll(".receipt-backdrop").forEach((el) => el.remove());

  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop receipt-backdrop";
  backdrop.innerHTML = `
    <div class="modal receipt-modal" role="dialog" aria-modal="true" aria-label="Checkout receipt">
      <button class="close-btn" aria-label="Close">x</button>
      <div class="receipt-card">
        <div class="receipt-head">
          <span class="stamp">Checkout receipt</span>
          <span class="receipt-code">${receipt.code}</span>
        </div>
        <div class="receipt-body">
          <img class="receipt-cover" src="${receipt.img}" alt="${receipt.title} cover">
          <div class="receipt-copy">
            <h3>${receipt.title}</h3>
            <p class="small">Issued to ${receipt.member}</p>
            <div class="receipt-grid">
              <div><strong>Checked out</strong><span>${receipt.checkoutDate}</span></div>
              <div><strong>Due date</strong><span>${receipt.dueDate}</span></div>
              <div><strong>Pickup</strong><span>${receipt.pickup}</span></div>
              <div><strong>Status</strong><span>On loan</span></div>
            </div>
          </div>
        </div>
        <p class="small">This receipt is saved and shown again on the Loans page.</p>
      </div>
    </div>`;

  document.body.appendChild(backdrop);
  backdrop.querySelector(".close-btn").onclick = () => backdrop.remove();
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) backdrop.remove();
  });
}

function renderBookImageEditor() {
  const mount = document.getElementById("bookImageEditor");
  if (!mount) return;

  mount.innerHTML = "";
  getBooks().forEach((book) => {
    const row = document.createElement("div");
    row.className = "book-editor-row";
    row.innerHTML = `
      <img class="editor-cover" src="${book.img}" alt="${book.title} cover">
      <div class="book-editor-copy">
        <div class="result-title">${book.title}</div>
        <label class="small" for="title-${book.id}">Book title</label>
        <input id="title-${book.id}" type="text" value="${book.title}" data-book-field="title" data-book-id="${book.id}" placeholder="Enter book title">
        <label class="small" for="author-${book.id}">Author</label>
        <input id="author-${book.id}" type="text" value="${book.author}" data-book-field="author" data-book-id="${book.id}" placeholder="Enter author name">
      </div>`;
    mount.appendChild(row);
  });

  mount.querySelectorAll("[data-book-field]").forEach((input) => {
    input.addEventListener("change", () => updateBookField(input.dataset.bookId, input.dataset.bookField, input.value.trim()));
  });
}

function updateBookField(bookId, field, value) {
  const books = getBooks().map((book) => (
    book.id === bookId ? { ...book, [field]: value || defaultBooks.find((item) => item.id === bookId)?.[field] || book[field] } : book
  ));
  saveBooks(books);
  renderBookImageEditor();
  if (document.getElementById("navSearch")?.value) {
    renderResults("navSearch", "navResults");
  }
}

function renderLatestReceipt() {
  const mount = document.getElementById("latestReceipt");
  if (!mount) return;

  const receipt = getReceipt();
  if (!receipt) {
    mount.className = "receipt-placeholder";
    mount.textContent = "Borrow a book from search to generate a checkout receipt.";
    return;
  }

  mount.className = "receipt-card inline-receipt";
  mount.innerHTML = `
    <div class="receipt-head">
      <span class="stamp">Latest receipt</span>
      <span class="receipt-code">${receipt.code}</span>
    </div>
    <div class="receipt-body">
      <img class="receipt-cover" src="${receipt.img}" alt="${receipt.title} cover">
      <div class="receipt-copy">
        <h3>${receipt.title}</h3>
        <p class="small">Issued to ${receipt.member}</p>
        <div class="receipt-grid">
          <div><strong>Checked out</strong><span>${receipt.checkoutDate}</span></div>
          <div><strong>Due date</strong><span>${receipt.dueDate}</span></div>
          <div><strong>Pickup</strong><span>${receipt.pickup}</span></div>
          <div><strong>Status</strong><span>On loan</span></div>
        </div>
      </div>
    </div>`;
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("navSearch")) renderResults("navSearch", "navResults");
  renderBookImageEditor();
  renderLatestReceipt();
  wireAuthButtons();
  renderSessionBadge();
});

function wireAuthButtons() {
  document.querySelectorAll("[data-auth-mode]").forEach((btn) => {
    btn.addEventListener("click", () => openAuthModal(btn.dataset.authMode));
  });
}

function openAuthModal(mode) {
  closeAuthModal();
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-label="${mode === "login" ? "Login" : "Register"}">
      <button class="close-btn" aria-label="Close">x</button>
      <h3>${mode === "login" ? "Member Login" : "Get a Library Card"}</h3>
      <p class="form-hint">${mode === "login" ? "Use your card number and PIN to sign in." : "Create a demo card to try the experience."}</p>
      <form id="authForm">
        <label for="cardNumber">Card Number</label>
        <input id="cardNumber" name="cardNumber" required placeholder="e.g. 1048576">
        ${mode === "register" ? `
          <label for="fullName">Full Name</label>
          <input id="fullName" name="fullName" required placeholder="Ada Lovelace">
          <label for="email">Email</label>
          <input id="email" name="email" required type="email" placeholder="you@example.com">` : ""}
        <label for="pin">PIN</label>
        <input id="pin" name="pin" required type="password" placeholder="****">
        <div class="alert" id="authAlert" style="display:none;"></div>
        <div class="modal-actions">
          <button type="button" class="btn ghost" onclick="closeAuthModal()">Cancel</button>
          <button type="submit" class="btn">${mode === "login" ? "Login" : "Register"}</button>
        </div>
      </form>
    </div>`;
  document.body.appendChild(backdrop);

  backdrop.querySelector(".close-btn").onclick = closeAuthModal;
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) closeAuthModal();
  });

  const form = backdrop.querySelector("#authForm");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const cardNumber = form.cardNumber.value.trim();
    const pin = form.pin.value.trim();
    if (mode === "register") {
      handleRegister({
        cardNumber,
        pin,
        fullName: form.fullName.value.trim(),
        email: form.email.value.trim()
      });
      return;
    }
    handleLogin({ cardNumber, pin });
  });
}

function closeAuthModal() {
  document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
}

function handleRegister({ cardNumber, pin, fullName, email }) {
  const users = getUsers();
  if (users.some((user) => user.cardNumber === cardNumber)) {
    showAuthAlert("Card number already registered. Try logging in.");
    return;
  }
  const newUser = { cardNumber, pin, fullName, email };
  users.push(newUser);
  saveUsers(users);
  setSession({ cardNumber, fullName });
  showAuthAlert("Registered! You are now signed in.", true);
  setTimeout(closeAuthModal, 600);
}

function handleLogin({ cardNumber, pin }) {
  const user = getUsers().find((item) => item.cardNumber === cardNumber && item.pin === pin);
  if (!user) {
    showAuthAlert("Card or PIN not found. Try again or register.");
    return;
  }
  setSession({ cardNumber: user.cardNumber, fullName: user.fullName });
  showAuthAlert(`Welcome back, ${user.fullName || "member"}!`, true);
  setTimeout(closeAuthModal, 600);
}

function showAuthAlert(message, success = false) {
  const alertBox = document.getElementById("authAlert");
  if (!alertBox) return;
  alertBox.textContent = message;
  alertBox.style.display = "block";
  alertBox.style.borderColor = success ? "var(--accent)" : "#c9b59b";
}

function renderSessionBadge() {
  const badge = document.getElementById("sessionBadge");
  if (!badge) return;
  const session = getSession();
  badge.textContent = session ? `Signed in: ${session.fullName || session.cardNumber}` : "Guest";
}
