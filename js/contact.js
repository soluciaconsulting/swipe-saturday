/**
 * Client-side validation and submission for the contact form. The form is
 * posted to Formspree via fetch (instead of a native browser POST) so we can
 * stay on the page, show our own `.form-success` panel, and clear the
 * fields — rather than redirecting to Formspree's hosted thank-you page.
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

function clearFieldStates(form) {
  qsa(".form-group", form).forEach((group) => {
    group.classList.remove("is-invalid");
    const errorEl = qs(".form-error", group);
    if (errorEl) errorEl.textContent = "";
  });
}

function setStatus(form, message) {
  const status = qs("[data-form-status]", form);
  if (!status) return;
  status.textContent = message;
  status.style.display = message ? "block" : "none";
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
  const submitButton = qs('button[type="submit"]', form);

  fields.forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.closest(".form-group").classList.contains("is-invalid")) {
        validateField(field);
      }
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const allValid = fields.map(validateField).every(Boolean);
    if (!allValid) {
      const firstInvalid = qs(".form-group.is-invalid input, .form-group.is-invalid select, .form-group.is-invalid textarea", form);
      firstInvalid?.focus();
      return;
    }

    setStatus(form, "");
    submitButton?.setAttribute("disabled", "true");

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      if (!response.ok) throw new Error("Submission failed");

      form.reset();
      clearFieldStates(form);
      showSuccess(form);
    } catch {
      setStatus(form, "Something went wrong sending your message. Please try again.");
    } finally {
      submitButton?.removeAttribute("disabled");
    }
  });
}
