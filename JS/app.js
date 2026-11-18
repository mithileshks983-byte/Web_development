const matches = [
  {
    id: "csk-mi",
    name: "Chennai Super Kings vs Mumbai Indians",
    prices: { general: 1000, premium: 1800, vip: 5000 }
  },
  {
    id: "rcb-kkr",
    name: "Royal Challengers Bengaluru vs Kolkata Knight Riders",
    prices: { general: 800, premium: 1500, vip: 4200 }
  },
  {
    id: "mi-kkr",
    name: "Mumbai Indians vs Kolkata Knight Riders",
    prices: { general: 900, premium: 1700, vip: 4600 }
  }
];

const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.getElementById("primary-nav");
const teamFilter = document.getElementById("team-filter");
const matchList = document.getElementById("match-list");
const matchCards = [...document.querySelectorAll(".match-card")];
const matchCount = document.getElementById("match-count");
const noMatches = document.getElementById("no-matches");
const viewButtons = [...document.querySelectorAll(".view-button")];
const matchSelect = document.getElementById("match-select");
const standSelect = document.getElementById("stand-select");
const quantityInput = document.getElementById("quantity");
const bookingForm = document.getElementById("booking-form");
const toast = document.getElementById("toast");
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.hidden = true;
  }, 2500);
}

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  primaryNav.classList.toggle("is-open", !isOpen);
});

primaryNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    menuToggle.setAttribute("aria-expanded", "false");
    primaryNav.classList.remove("is-open");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    menuToggle.setAttribute("aria-expanded", "false");
    primaryNav.classList.remove("is-open");
  }
});

function filterMatches() {
  const team = teamFilter.value;
  let visibleCount = 0;

  matchCards.forEach((card) => {
    const isVisible = team === "all" || card.dataset.teams.split(" ").includes(team);
    card.hidden = !isVisible;
    visibleCount += Number(isVisible);
  });

  matchCount.textContent = `${visibleCount} ${visibleCount === 1 ? "fixture" : "fixtures"}`;
  noMatches.hidden = visibleCount > 0;
}

teamFilter.addEventListener("change", filterMatches);

viewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const isList = button.dataset.view === "list";
    matchList.classList.toggle("is-list", isList);
    viewButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });
  });
});

matches.forEach((match) => {
  const option = document.createElement("option");
  option.value = match.id;
  option.textContent = match.name;
  matchSelect.append(option);
});

function formatPrice(amount) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function calculateBooking() {
  const match = matches.find((item) => item.id === matchSelect.value);
  const stand = standSelect.value;
  const quantity = Number(quantityInput.value);
  const quantityIsValid = quantityInput.value !== ""
    && Number.isInteger(quantity)
    && quantity >= 1
    && quantity <= Number(quantityInput.max);
  const standIsValid = Boolean(match && Object.hasOwn(match.prices, stand));
  const valid = Boolean(match && standIsValid && quantityIsValid);
  const price = standIsValid ? match.prices[stand] : 0;

  quantityInput.setCustomValidity(
    quantityIsValid ? "" : `Enter a whole number from 1 to ${quantityInput.max}.`
  );

  return { match, standIsValid, quantityIsValid, valid, price, quantity };
}

function updateBookingSummary(showNotification = false) {
  const booking = calculateBooking();
  document.getElementById("summary-match").textContent = booking.match ? booking.match.name : "—";
  document.getElementById("summary-stand").textContent = booking.standIsValid
    ? standSelect.selectedOptions[0].textContent
    : "—";
  document.getElementById("summary-quantity").textContent = booking.quantityIsValid
    ? String(booking.quantity)
    : "—";
  document.getElementById("summary-price").textContent = formatPrice(booking.price);
  document.getElementById("summary-total").textContent = formatPrice(
    booking.valid ? booking.price * booking.quantity : 0
  );

  if (showNotification && booking.valid) {
    showToast("Ticket estimate updated.");
  }
}

matchCards.forEach((card) => {
  card.querySelector(".select-match").addEventListener("click", () => {
    matchSelect.value = card.dataset.match;
    updateBookingSummary();
    document.getElementById("tickets").scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
    });
    standSelect.focus({ preventScroll: true });
  });
});

matchSelect.addEventListener("change", () => updateBookingSummary(true));
standSelect.addEventListener("change", () => updateBookingSummary(true));
quantityInput.addEventListener("input", () => updateBookingSummary(true));
bookingForm.addEventListener("submit", (event) => event.preventDefault());

filterMatches();
updateBookingSummary();
