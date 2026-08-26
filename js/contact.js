/**
 * Client-side validation for the contact form. The form posts natively to
 * FormSubmit (see the `action` attribute in index.html); on success
 * FormSubmit redirects back to `_next`, which points at this same page with
 * a `?sent=1` marker so we can show the success panel after the redirect.
 */
import { qs, qsa } from "./utils.js";

const SENT_PARAM = "sent";

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
    const allValid = fields.map(validateField).every(Boolean);

    if (!allValid) {
      e.preventDefault();
      const firstInvalid = qs(".form-group.is-invalid input, .form-group.is-invalid select, .form-group.is-invalid textarea", form);
      firstInvalid?.focus();
      return;
    }

    // Let the browser POST natively to FormSubmit; point _next back at this
    // page with a marker so the redirect lands on the success panel below.
    const nextField = qs("[data-next-field]", form);
    if (nextField) {
      const url = new URL(window.location.href);
      url.hash = "contact";
      url.searchParams.set(SENT_PARAM, "1");
      nextField.value = url.toString();
    }
  });

  if (new URLSearchParams(window.location.search).get(SENT_PARAM) === "1") {
    showSuccess(form);
    const url = new URL(window.location.href);
    url.searchParams.delete(SENT_PARAM);
    history.replaceState(null, "", url.pathname + url.search + url.hash);
  }
}
