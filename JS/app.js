const matches = {
  "csk-mi": {
    label: "Chennai Super Kings vs Mumbai Indians",
    option: "csk-mi",
    startingPrice: 1000
  },
  "rcb-kkr": {
    label: "Royal Challengers Bengaluru vs Kolkata Knight Riders",
    option: "rcb-kkr",
    startingPrice: 800
  }
};

const stands = {
  general: { label: "General", multiplier: 1 },
  premium: { label: "Premium", multiplier: 1.5 },
  vip: { label: "VIP", multiplier: 2 }
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

let toastTimeout;

function showToast(message) {
  let toast = document.getElementById("toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.append(toast);
  }

  toast.textContent = message;
  toast.hidden = false;
  toast.classList.add("show");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => {
    toast.classList.remove("show");
    toast.hidden = true;
  }, 4000);
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("booking-form");

  if (!form) {
    return;
  }

  const matchSelect = form.querySelector("#match");
  const standSelect = form.querySelector("#stand");
  const ticketInput = form.querySelector("#quantity");
  const summaryMatch = document.getElementById("summary-match");
  const summaryStand = document.getElementById("summary-stand");
  const summaryTickets = document.getElementById("summary-quantity");
  const summaryPrice = document.getElementById("summary-price");
  const summaryTotal = document.getElementById("summary-total");

  function updateSummary(notify = false) {
    const selectedMatch = matches[matchSelect.value];
    const selectedStand = stands[standSelect.value];
    const quantity = Number(ticketInput.value);
    const validQuantity = Number.isInteger(quantity) && quantity >= 1 && quantity <= 10;

    summaryMatch.textContent = selectedMatch?.label ?? "Not selected";
    summaryStand.textContent = selectedStand?.label ?? "Not selected";
    summaryTickets.textContent = validQuantity ? String(quantity) : "Not selected";

    if (selectedMatch && selectedStand && validQuantity) {
      const price = selectedMatch.startingPrice * selectedStand.multiplier;
      summaryPrice.textContent = currencyFormatter.format(price);
      summaryTotal.textContent = currencyFormatter.format(price * quantity);
      if (notify) {
        showToast("Booking summary updated.");
      }
      return;
    }

    summaryPrice.textContent = "—";
    summaryTotal.textContent = "Select a match, stand, and quantity";
    if (notify) {
      showToast("Choose a match, stand, and valid quantity to see your total.");
    }
  }

  matchSelect.addEventListener("change", () => updateSummary(true));
  standSelect.addEventListener("change", () => updateSummary(true));
  ticketInput.addEventListener("change", () => updateSummary(true));
  form.addEventListener("reset", () => window.setTimeout(() => updateSummary(), 0));

  const matchId = new URLSearchParams(window.location.search).get("match");
  const match = matchId && Object.hasOwn(matches, matchId) ? matches[matchId] : undefined;

  if (match) {
    matchSelect.value = match.option;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    form.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    showToast(`${match.label} selected. Complete your booking below.`);
  }

  updateSummary();
});