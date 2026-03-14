/**
 * storage.js — LocalStorage wrapper
 * Handles all persistent browser storage with error safety.
 * Kyun: LocalStorage directly use karna risky hai — errors
 * silently fail karte hain. Yeh wrapper safe aur consistent banata hai.
 */

import { CONFIG } from "../config.js";

const KEYS = {
  API_KEY: "cc_groq_key",
  HISTORY: "cc_interview_history",
};

/**
 * Safe localStorage wrapper
 */
export const storage = {
  /**
   * Get a value from localStorage
   * @param {string} key
   * @returns {string|null}
   */
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch (err) {
      console.error("[storage] get failed:", key, err.message);
      return null;
    }
  },

  /**
   * Set a value in localStorage
   * @param {string} key
   * @param {string} value
   * @returns {boolean}
   */
  set(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (err) {
      console.error("[storage] set failed:", key, err.message);
      return false;
    }
  },

  /**
   * Remove a value from localStorage
   * @param {string} key
   * @returns {boolean}
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (err) {
      console.error("[storage] remove failed:", key, err.message);
      return false;
    }
  },
};

// ── API Key ───────────────────────────────────────────────────────────────────

/** @returns {string} */
export const getApiKey = () => storage.get(KEYS.API_KEY) || "";

/** @param {string} key */
export const setApiKey = (key) => storage.set(KEYS.API_KEY, key);

export const clearApiKey = () => storage.remove(KEYS.API_KEY);

// ── Interview Session History ─────────────────────────────────────────────────

/**
 * Save an interview session to history
 * Limits to CONFIG.MAX_HISTORY_SESSIONS to prevent localStorage overflow
 * @param {object} session
 */
export function saveSession(session) {
  try {
    const raw = storage.get(KEYS.HISTORY);
    const history = raw ? JSON.parse(raw) : [];
    history.unshift(session); // newest first

    // Limit size — prevent localStorage overflow
    if (history.length > CONFIG.MAX_HISTORY_SESSIONS) {
      history.splice(CONFIG.MAX_HISTORY_SESSIONS);
    }

    storage.set(KEYS.HISTORY, JSON.stringify(history));
  } catch (err) {
    console.error("[storage] saveSession failed:", err.message);
  }
}

/**
 * Get all saved interview sessions
 * @returns {object[]}
 */
export function getHistory() {
  try {
    const raw = storage.get(KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("[storage] getHistory parse failed:", err.message);
    return [];
  }
}

/** Clear all interview history */
export const clearHistory = () => storage.remove(KEYS.HISTORY);
