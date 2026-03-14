/**
 * feedback.js — Floating Feedback Widget
 * Uses Web3Forms to send feedback to careercopilot04@gmail.com
 * Kyun Web3Forms: Free 250/month, no backend needed, public-safe key by design.
 */

import { CONFIG } from "../config.js";

/** @type {number|null} Last submission timestamp for rate limiting */
let lastSubmitTime = null;

/**
 * Initialize the floating feedback button and modal
 * @returns {void}
 */
export function initFeedbackWidget() {
  // ── Create floating button ──────────────────────────────
  const btn = document.createElement("button");
  btn.id = "feedback-float-btn";
  btn.innerHTML = "💬 Feedback";
  btn.setAttribute("aria-label", "Send Feedback");
  document.body.appendChild(btn);

  // ── Create modal overlay ────────────────────────────────
  const overlay = document.createElement("div");
  overlay.id = "feedback-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Send Feedback");
  overlay.innerHTML = `
    <div class="feedback-modal">
      <div class="feedback-modal__header">
        <span class="feedback-modal__title">💬 Send Feedback</span>
        <button class="feedback-modal__close" id="feedback-close-btn" aria-label="Close feedback">✕</button>
      </div>
      <p class="feedback-modal__desc">
        Kuch missing hai? Koi suggestion hai? Seedha batao — 
        hum improve karte rahenge.
      </p>
      <form id="feedback-form" novalidate>
        <div class="feedback-field">
          <label class="feedback-label" for="feedback-name">
            Name <span aria-hidden="true" style="color:var(--color-red)">*</span>
          </label>
          <input
            class="feedback-input"
            id="feedback-name"
            type="text"
            name="name"
            placeholder="Tumhara naam"
            maxlength="${CONFIG.MAX_NAME_LENGTH}"
            autocomplete="name"
            required
          />
        </div>
        <div class="feedback-field">
          <label class="feedback-label" for="feedback-email">
            Email <span style="color:var(--color-text-muted);font-weight:400;">(optional)</span>
          </label>
          <input
            class="feedback-input"
            id="feedback-email"
            type="email"
            name="email"
            placeholder="reply@email.com"
            autocomplete="email"
          />
        </div>
        <div class="feedback-field">
          <label class="feedback-label" for="feedback-message">
            Message <span aria-hidden="true" style="color:var(--color-red)">*</span>
          </label>
          <textarea
            class="feedback-textarea"
            id="feedback-message"
            name="message"
            placeholder="Kya chahiye tumhe? Kya improve ho sakta hai?"
            maxlength="${CONFIG.MAX_MESSAGE_LENGTH}"
            required
          ></textarea>
        </div>
        <button class="feedback-submit btn btn--primary btn--full" type="submit" id="feedback-submit-btn">
          🚀 Send Feedback
        </button>
        <div class="feedback-success hidden" id="feedback-success" role="status" aria-live="polite"></div>
      </form>
    </div>
  `;
  document.body.appendChild(overlay);

  // ── Event listeners ─────────────────────────────────────
  btn.addEventListener("click", () => {
    overlay.classList.add("feedback-overlay--visible");
    document.getElementById("feedback-name")?.focus();
  });

  document.getElementById("feedback-close-btn").addEventListener("click", () => {
    _closeModal(overlay);
  });

  // Close on outside click
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) _closeModal(overlay);
  });

  // Close on Escape key — accessibility
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("feedback-overlay--visible")) {
      _closeModal(overlay);
    }
  });

  // ── Form submit ─────────────────────────────────────────
  document.getElementById("feedback-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById("feedback-submit-btn");
    const successMsg = document.getElementById("feedback-success");
    const form = e.target;

    // ── Rate limiting — 30s cooldown ──
    if (lastSubmitTime && Date.now() - lastSubmitTime < CONFIG.FEEDBACK_COOLDOWN_MS) {
      const remaining = Math.ceil((CONFIG.FEEDBACK_COOLDOWN_MS - (Date.now() - lastSubmitTime)) / 1000);
      _showMsg(successMsg, `⏳ ${remaining}s baad try karo.`, "warning");
      return;
    }

    // ── Input validation + sanitization ──
    const nameVal    = form.querySelector('[name="name"]').value.trim().slice(0, CONFIG.MAX_NAME_LENGTH);
    const emailVal   = form.querySelector('[name="email"]').value.trim().slice(0, 254);
    const messageVal = form.querySelector('[name="message"]').value.trim().slice(0, CONFIG.MAX_MESSAGE_LENGTH);

    if (!nameVal) {
      _showMsg(successMsg, "⚠️ Name required hai.", "warning");
      form.querySelector('[name="name"]')?.focus();
      return;
    }
    if (!messageVal) {
      _showMsg(successMsg, "⚠️ Message required hai.", "warning");
      form.querySelector('[name="message"]')?.focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";
    successMsg.classList.add("hidden");

    try {
      const res = await fetch(CONFIG.WEB3FORMS_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_key: CONFIG.WEB3FORMS_KEY,
          name: nameVal,
          email: emailVal,
          message: messageVal,
        }),
      });

      const data = await res.json();

      if (data.success) {
        lastSubmitTime = Date.now();
        form.reset();
        _showMsg(successMsg, "✅ Feedback mil gaya! Shukriya — hum zaroor improve karenge.", "success");
        submitBtn.style.display = "none";

        // Auto close after 3s
        setTimeout(() => {
          _closeModal(overlay);
          successMsg.classList.add("hidden");
          submitBtn.style.display = "block";
          submitBtn.disabled = false;
          submitBtn.textContent = "🚀 Send Feedback";
        }, 3000);
      } else {
        throw new Error(data.message || "Submit failed");
      }
    } catch (err) {
      console.error("[FeedbackWidget] Submit error:", err.message);
      _showMsg(successMsg, "⚠️ Error aaya — careercopilot04@gmail.com pe mail karo.", "warning");
      submitBtn.disabled = false;
      submitBtn.textContent = "🚀 Send Feedback";
    }
  });
}

/**
 * Close the feedback modal
 * @param {HTMLElement} overlay
 */
function _closeModal(overlay) {
  overlay.classList.remove("feedback-overlay--visible");
}

/**
 * Show status message inside feedback form
 * @param {HTMLElement} el
 * @param {string} text
 * @param {"success"|"warning"} type
 */
function _showMsg(el, text, type) {
  el.textContent = text;
  el.className = `feedback-success ${type === "warning" ? "feedback-warning" : ""}`;
}
