/**
 * Client-side validation and success-state handling for the contact form.
 * There is no backend in this static scaffold — on valid submit we show a
 * success state and fire a CustomEvent so a real endpoint (Formspree,
 * Netlify Forms, a serverless function, etc.) can be wired in later without
 * touching this validation logic. See README → "Contact form backend".
 */
import { qs, qsa } from "./utils.js";

const RULES = {
  name: (v) => v.trim().length >= 2 || "Please enter your name.",
  email: (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || "Enter a valid email address.",
  projectType: (v) => v !== "" || "Select a project type.",
  message: (v) => v.trim().length >= 10 || "Tell us a little more about your project.",
};

function validateField(field) {
  const rule = RULES[field.name];
  const group = field.closest(".form-group");
  if (!rule || !group) return true;

  const result = rule(field.value);
  const isValid = result === true;

  group.classList.toggle("is-invalid", !isValid);
  field.setAttribute("aria-invalid", String(!isValid));

  const errorEl = qs(".form-error", group);
  if (errorEl) errorEl.textContent = isValid ? "" : result;

  return isValid;
}

function showSuccess(form) {
  const success = qs("[data-form-success]", form.parentElement);
  form.classList.add("is-submitted");
  if (success) {
    success.classList.add("is-visible");
    success.setAttribute("tabindex", "-1");
    success.focus();
  }
}

export function initContactForm() {
  const form = qs("[data-contact-form]");
  if (!form) return;

  const fields = qsa("input[name], select[name], textarea[name]", form).filter(
    (f) => f.name in RULES
  );

  fields.forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.closest(".form-group").classList.contains("is-invalid")) {
        validateField(field);
      }
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const allValid = fields.map(validateField).every(Boolean);

    if (!allValid) {
      const firstInvalid = qs(".form-group.is-invalid input, .form-group.is-invalid select, .form-group.is-invalid textarea", form);
      firstInvalid?.focus();
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    window.dispatchEvent(new CustomEvent("swipe:contact-submit", { detail: data }));

    showSuccess(form);
  });
}
