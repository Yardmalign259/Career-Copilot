/**
 * config.js — App-wide constants
 * Non-secret values only — safe to commit.
 * Kyun: Hardcoded values multiple files mein scattered the.
 * Ek jagah se sab control hoga — change once, update everywhere.
 *
 * ⚠️  NEVER put Groq API key here — BYOK model, user provides it.
 * ⚠️  Web3Forms key is public-safe by design (frontend-only service).
 */

export const CONFIG = {
  // ── Groq API ──────────────────────────────────────────────
  GROQ_ENDPOINT: "https://api.groq.com/openai/v1/chat/completions",
  GROQ_MODEL:    "llama-3.3-70b-versatile",
  GROQ_MAX_TOKENS: 3000,
  GROQ_TEMPERATURE: 0.7,

  // ── Web3Forms ─────────────────────────────────────────────
  // Public-safe key — Web3Forms is designed for frontend use.
  // Contributors: create your own free key at web3forms.com
  WEB3FORMS_URL: "https://api.web3forms.com/submit",
  WEB3FORMS_KEY: "44523102-ccbe-4318-b3f5-46e8268173c8",

  // ── Input Limits ──────────────────────────────────────────
  MAX_RESUME_LENGTH:  4000,  // chars sent to AI
  MAX_JD_LENGTH:      2500,
  MAX_ANSWER_LENGTH:  2000,
  MIN_RESUME_LENGTH:  80,    // below this = invalid resume
  MAX_NAME_LENGTH:    100,   // feedback form
  MAX_MESSAGE_LENGTH: 1000,  // feedback form

  // ── History ───────────────────────────────────────────────
  MAX_HISTORY_SESSIONS: 50,  // localStorage overflow prevent

  // ── Feedback Widget ───────────────────────────────────────
  FEEDBACK_COOLDOWN_MS: 30000, // 30s between submissions

  // ── File Upload ───────────────────────────────────────────
  MAX_FILE_SIZE_MB: 5,

  // ── PDF.js CDN ────────────────────────────────────────────
  PDFJS_CDN:    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
  PDFJS_WORKER: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",
};
