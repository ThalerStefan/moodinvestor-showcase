
// Base URL configuration
// - Can be overridden via localStorage key "MI_API_BASE"

// Production: use same-origin (https://moodinvestor.com)
// Local dev: talk to backend directly

import { authFetch } from "./authFetch.js";

// const DEFAULT_API_BASE =
//   window.location.hostname === "localhost"
//     ? "http://localhost:8080"
//     : window.location.origin;

const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const DEFAULT_API_BASE = isLocal
  ? "http://localhost:8080"
  : window.location.origin;

// Optional override for debugging, but guard against mixed content on HTTPS
const stored = localStorage.getItem("MI_API_BASE");
const API_BASE =
  (stored && !(window.location.protocol === "https:" && stored.startsWith("http://")))
    ? stored
    : DEFAULT_API_BASE;



// Low-level HTTP helper
// - Builds URLs with query params
// - Sends JSON bodies by default
// - Returns JSON when possible, otherwise raw text
// - Throws a detailed error on non-2xx responses
async function apiRequest(path, { method = "GET", params, body, headers } = {}) {
  // Logic abstracted for showcase purposes.
}


/**
 * Health check endpoint.
 * Useful for smoke tests and UI "backend reachable" indicators.
 */
export async function getHealth() {
  // Logic abstracted for showcase purposes.
}


/**
 * Retrieves all assets.
 * Backend returns the canonical list (no client-side enrichment required).
 */
export async function getAssets() {
  // Logic abstracted for showcase purposes.
}

/**
 * Creates a new asset.
 * @param {Object} payload
 * @param {string} payload.symbol
 * @param {string} payload.name
 * @param {string} payload.assetType - e.g. CRYPTO, STOCK, ...
 */
export async function createAsset({ symbol, name, assetType }) {
  // Logic abstracted for showcase purposes.
}

/**
 * Top 5 positions for the dashboard.
 * IMPORTANT: Price is intentionally omitted; the client receives:
 * { symbol, name, quantity, value }
 */
export async function getDashboardTop5() {
  // Logic abstracted for showcase purposes.
}

/**
 * Complete asset list for the dashboard table.
 * Backend returns ready-to-render rows and sorts by marketcap descending:
 * { assetId, symbol, name, price, change24h, change7d, marketcap }
 */
export async function getAssetsMarketcap() {
  // Logic abstracted for showcase purposes.
}

/**
 * Aggregated portfolio performance series and total.
 * Backend returns:
 * { timestamps: [ISO-8601], values: [BigDecimal], total: BigDecimal }
 *
 * @param {string} range - One of: "1D", "1W", "1M", "1Y", "ALL"
 */
export async function getPortfolioPerformance(range) {
  // Logic abstracted for showcase purposes.
}

/**
 * Portfolio summary (if used by other views/widgets).
 * Backend returns a precomputed summary object.
 */
export async function getPortfolioSummary() {
  // Logic abstracted for showcase purposes.
}

/**
 * Retrieves transactions.
 * Optional filter: { assetId }
 */
export async function getTxns(params = {}) {
  // Logic abstracted for showcase purposes.
}

/**
 * Creates a transaction + PFG answers.
 * Matches backend CreateTxnWithPfgRequest:
 * { symbol, timestamp, side, quantity, price, note?, pfg: [q1..q5] }
 */
export async function postTxn(createTxnWithPfgRequest) {
  // Logic abstracted for showcase purposes.
}

/**
 * Aggregated transaction statistics per asset.
 * Backend returns:
 * { assetId, symbol, currentPrice, weightedPfg, currentQuantity, averageBuyPrice }
 */
export async function getTxnStats() {
  // Logic abstracted for showcase purposes.
}


/**
 * Returns a normalized PFG total object:
 * { value: number, sampleSize: number }
 */
export async function getPfgTotal() {
  // Logic abstracted for showcase purposes.
}


/**
 * Retrieves all emotion log entries (raw).
 */
export async function getEmotions() {
  // Logic abstracted for showcase purposes.
}

/**
 * Upserts an emotion log entry by day.
 * Matches backend EmotionDto: { day: "YYYY-MM-DD", mood: 1..5, note?: string }
 */
export async function upsertEmotion(dto) {
  // Logic abstracted for showcase purposes.
}

/**
 * Deletes an emotion log entry by its ID.
 */
export async function deleteEmotion(id) {
  // Logic abstracted for showcase purposes.
}

/**
 * Aggregated emotion log summary for chart + insights.
 * Backend returns:
 * {
 *   labels, moods,
 *   todayMood, todayMoodDescription,
 *   averageLast7,
 *   countCurrentMonth,
 *   averageMonthMood,
 *   mostFrequentMood, mostFrequentMoodDescription,
 *   percentageBelowNeutral,
 *   mostFrequentDay
 * }
 *
 * @param {number} days - Optional: backend may use it to limit the chart window
 */
export async function getEmotionSummary(days) {
  // Logic abstracted for showcase purposes.
}


/**
 * Persists a custom backend base URL in localStorage.
 */
export function setApiBase(url) {
  // Logic abstracted for showcase purposes.
}

/**
 * Reads the custom backend base URL from localStorage.
 * Falls back to the initial API_BASE constant.
 */
export function getApiBase() {
  // Logic abstracted for showcase purposes.
}

export async function getPriceLatest(assetId) {
  // Logic abstracted for showcase purposes.
}

export async function getPriceHistory(symbol, { from, limit } = {}) {
  // Logic abstracted for showcase purposes.
}


export async function updateEmotion(id, dto) {
  // Logic abstracted for showcase purposes.
}

export async function getCmcUrl(symbol) {
  // Logic abstracted for showcase purposes.
}

// Image-URL
export async function getAssetImageUrl(symbol) {
  // Logic abstracted for showcase purposes.
}
