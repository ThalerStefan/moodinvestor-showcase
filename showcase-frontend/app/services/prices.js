/* frontend/app/services/prices.js
Price service matching project plan V1 (mock prices via backend, crypto-only)
Available universe comes from the DB (asset table) via /api/assets
"Latest" prices are loaded per assetId via /api/prices/{assetId}/latest
*/

import { getAssets, getPriceLatest } from "./api.js";

const _cache = { assets: null, assetsTtlMs: 60_000, };

/**
 * Reads available tickers (symbols) from the DB via /api/assets 
 * and returns them as an array of symbol strings.
 */
export async function getTickerSymbols() {
  // Logic abstracted for showcase purposes.
}


/**
 * - Helper function: returns a map symbol -> assetId from the (cached) asset inventory.
 * - Used by fetchLatestPrices because /api/prices/{assetId}/latest expects an assetId.
 */
async function getAssetsMap() {
  // Logic abstracted for showcase purposes.
}

/**
 * Fetches the latest price per symbol (via assetId) in parallel from the backend.
 * Return: Array of objects (one entry per symbol), robust against failures.
 * @param {string[]=} symbols If empty, symbols are read from the DB.
 * @returns {Promise<Array<{symbol:string, assetId:number, price:number, timestamp:string, source?:string}>>}
 */
export async function fetchLatestPrices(symbols) {
  // Logic abstracted for showcase purposes.
}

export function invalidateAssetsCache() {
  // Logic abstracted for showcase purposes.
}
