// =========================================================
// Hotel Doctor website: small interactive features
// =========================================================

// WhatsApp number that receives enquiries (international format, no + or spaces)
const WHATSAPP_NUMBER = "2348035934716";

// ---------- 1. Mobile menu open/close ----------
const menuButton = document.getElementById("menu-toggle");
const nav = document.getElementById("main-nav");

function setMenu(open) {
  nav.classList.toggle("open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  menuButton.querySelector("use").setAttribute("href", open ? "#i-close" : "#i-menu");
}

menuButton.addEventListener("click", () => setMenu(!nav.classList.contains("open")));

// Close the menu after tapping a link, or pressing Escape
nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && nav.classList.contains("open")) {
    setMenu(false);
    menuButton.focus();
  }
});

// ---------- 2. Fade-in sections as you scroll ----------
const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target); // only animate once
        }
      });
    },
    { threshold: 0.12 }
  );
  revealItems.forEach((el) => observer.observe(el));
} else {
  revealItems.forEach((el) => el.classList.add("visible"));
}

// ---------- 3. Highlight the menu link for the section on screen ----------
const navLinks = document.querySelectorAll(".main-nav a:not(.btn)");
const sections = ["about", "services", "team", "contact"].map((id) => document.getElementById(id));

function updateActiveLink() {
  let current = "";
  sections.forEach((section) => {
    if (section.getBoundingClientRect().top < window.innerHeight * 0.4) current = section.id;
  });
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === "#" + current;
    link.classList.toggle("active", isActive);
    if (isActive) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  });
}
window.addEventListener("scroll", updateActiveLink, { passive: true });
updateActiveLink();

// ---------- 4. Contact form: check fields, then open WhatsApp ----------
const form = document.getElementById("contact-form");

// Shows or clears an error message under a field
function showError(input, message) {
  const errorBox = document.getElementById(input.id + "-error");
  errorBox.textContent = message;
  input.setAttribute("aria-invalid", message ? "true" : "false");
}

// Returns an error message for a field, or "" if it is fine
function checkField(input) {
  const value = input.value.trim();
  if (input.id === "name" && value.length < 2) return "Please enter your name.";
  if (input.id === "phone") {
    const digits = value.replace(/\D/g, "");
    if (digits.length < 10) return "Please enter a valid phone number (at least 10 digits).";
  }
  if (input.id === "message" && value.length < 5) return "Please tell us a little about what you need.";
  return "";
}

const requiredFields = ["name", "phone", "message"].map((id) => document.getElementById(id));

// Check each field when the visitor leaves it
requiredFields.forEach((input) => {
  input.addEventListener("blur", () => showError(input, checkField(input)));
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  // Check all required fields
  let firstInvalid = null;
  requiredFields.forEach((input) => {
    const message = checkField(input);
    showError(input, message);
    if (message && !firstInvalid) firstInvalid = input;
  });
  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }

  // Build the WhatsApp message
  const get = (id) => document.getElementById(id).value.trim();
  const lines = [
    "Hello Hotel Doctor, I'd like to book a consultation.",
    "",
    "Name: " + get("name"),
    get("hotel") ? "Hotel/Business: " + get("hotel") : null, // skipped if empty
    "Phone: " + get("phone"),
    "Service: " + get("service"),
    "",
    get("message"),
  ].filter((line) => line !== null);

  const url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(lines.join("\n"));
  window.open(url, "_blank", "noopener");
});

// ---------- 5. Click a picture to see it full size ----------
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxCaption = document.getElementById("lightbox-caption");
let lastClicked = null; // so keyboard focus can return to the picture afterwards

document.querySelectorAll("img.zoomable").forEach((img) => {
  // Make pictures reachable and openable with the keyboard too
  img.setAttribute("tabindex", "0");
  img.setAttribute("role", "button");
  img.setAttribute("aria-label", "View full size: " + img.alt);

  const open = () => {
    lastClicked = img;
    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = img.alt;
    lightbox.showModal(); // the Escape key closes it automatically
  };
  img.addEventListener("click", open);
  img.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
  });
});

document.getElementById("lightbox-close").addEventListener("click", () => lightbox.close());
// Clicking the dark area around the picture also closes it
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) lightbox.close();
});
lightbox.addEventListener("close", () => {
  if (lastClicked) lastClicked.focus();
});

// ---------- 6. Keep the footer year current ----------
document.getElementById("year").textContent = new Date().getFullYear();
