import { firebaseConfig } from "./firebase-config.js";

const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector("#primary-nav");
const menuScrim = document.querySelector(".menu-scrim");
const mobileMenu = window.matchMedia("(max-width: 720px)");
const menuBackground = document.querySelectorAll(".skip-link, .brand, main, .site-footer");
const enquiryForm = document.querySelector("#enquiry-form");
const formStatus = document.querySelector("#form-status");
const submitButton = enquiryForm.querySelector('button[type="submit"]');

document.querySelector("#current-year").textContent = new Date().getFullYear();

function setMenuOpen(isOpen, returnFocus = false) {
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  menuToggle.querySelector(".menu-label").textContent = isOpen ? "Close" : "Menu";
  primaryNav.classList.toggle("is-open", isOpen);
  menuScrim.classList.toggle("is-open", isOpen);
  document.documentElement.classList.toggle("menu-open", isOpen);
  primaryNav.inert = mobileMenu.matches && !isOpen;
  menuBackground.forEach((element) => { element.inert = isOpen; });

  if (isOpen) {
    primaryNav.querySelector("a").focus({ preventScroll: true });
  } else if (returnFocus) {
    menuToggle.focus({ preventScroll: true });
  }
}

setMenuOpen(false);

menuToggle.addEventListener("click", () => {
  setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true", true);
});

menuScrim.addEventListener("click", () => setMenuOpen(false, true));

primaryNav.addEventListener("click", (event) => {
  if (mobileMenu.matches && event.target.closest("a")) {
    setMenuOpen(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (menuToggle.getAttribute("aria-expanded") !== "true") return;

  if (event.key === "Escape") {
    event.preventDefault();
    setMenuOpen(false, true);
  } else if (event.key === "Tab") {
    const lastLink = primaryNav.querySelector("a:last-of-type");
    if (event.shiftKey && document.activeElement === menuToggle) {
      event.preventDefault();
      lastLink.focus();
    } else if (!event.shiftKey && document.activeElement === lastLink) {
      event.preventDefault();
      menuToggle.focus();
    }
  }
});

mobileMenu.addEventListener("change", () => setMenuOpen(false));

const serviceSelect = enquiryForm.querySelector("#service");
document.querySelector(".service-list").addEventListener("click", (event) => {
  const serviceLink = event.target.closest("a[data-service]");
  if (serviceLink && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
    serviceSelect.value = serviceLink.dataset.service;
  }
});

const revealTargets = document.querySelectorAll("[data-reveal]");
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -24px 0px" });

  revealTargets.forEach((element) => {
    element.classList.add("reveal-pending");
    revealObserver.observe(element);
  });
}

const firebaseIsConfigured = Object.values(firebaseConfig).every(
  (value) => typeof value === "string" && value.length > 0 && !value.startsWith("YOUR_"),
);

enquiryForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!enquiryForm.reportValidity()) return;

  const formData = new FormData(enquiryForm);
  const enquiry = {
    fullName: formData.get("name").trim(),
    email: formData.get("email").trim(),
    phone: formData.get("phone").trim(),
    service: formData.get("service"),
    message: formData.get("message").trim(),
  };

  submitButton.disabled = true;
  formStatus.textContent = "";
  delete formStatus.dataset.state;

  if (!firebaseIsConfigured) {
    const subject = encodeURIComponent(`Plumbing enquiry: ${enquiry.service || "New enquiry"}`);
    const body = encodeURIComponent(
      `Name: ${enquiry.fullName}\nEmail: ${enquiry.email}\nPhone: ${enquiry.phone || "Not provided"}\nService: ${enquiry.service || "Not specified"}\n\n${enquiry.message}`,
    );
    formStatus.textContent = "Opening your email app with your enquiry. Please send the email to complete your request.";
    window.location.href = `mailto:Lushplumbing@outlook.com?subject=${subject}&body=${body}`;
    submitButton.disabled = false;
    return;
  }

  try {
    const [{ initializeApp }, { getFirestore, collection, addDoc, serverTimestamp }] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js"),
    ]);
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    await addDoc(collection(db, "serviceEnquiries"), {
      ...enquiry,
      createdAt: serverTimestamp(),
    });
    enquiryForm.reset();
    formStatus.textContent = "Thanks for getting in touch. Your enquiry has been sent.";
  } catch (error) {
    console.error("Could not send plumbing enquiry:", error);
    formStatus.dataset.state = "error";
    formStatus.textContent = "We couldn’t send your enquiry just now. Please call 0467 284 559 or email Lushplumbing@outlook.com.";
  } finally {
    submitButton.disabled = false;
  }
});
